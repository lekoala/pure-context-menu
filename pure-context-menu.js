/**
 * @typedef Config
 * @property {String} contextMenuClass Class applied for holder element
 * @property {String} dropdownClass Class applied for dropdown. Accepts space separated classes
 * @property {String} dividerClass Class applied to the divider item
 * @property {String} menuItemClass Class applied to the li in all cases.
 * @property {String} itemClass Class applied to the menu item. Accepts space separated classes
 * @property {String} disabledClass Class applied to the disabled items
 * @property {Number} zIndex z-index assigned to the menu
 * @property {Boolean} preventCloseOnClick Global behaviour for items when clicking
 * @property {Boolean} useLists Enable list groups
 * @property {String} listClass Class applied to the list
 * @property {String} listItemClass Class applied to the list item. Accepts space separated classes
 * @property {Boolean} fastClick Triggers click on touchstart for mobile devices
 * @property {Function} show Whether to show menu based on event
 */
let baseOptions = {
  contextMenuClass: "pure-context-menu",
  dropdownClass: "dropdown-menu",
  dividerClass: "dropdown-divider",
  menuItemClass: "pure-context-menu-item",
  itemClass: "dropdown-item pure-context-menu-item",
  disabledClass: "disabled",
  zIndex: "9999",
  preventCloseOnClick: false,
  useLists: false,
  listClass: "list-group",
  listItemClass: "list-group-item list-group-item-action",
  fastClick: false,
  show: (event, inst) => true,
};

let instances = new Set();

/**
 * @typedef Item
 * @property {String} label
 * @property {Boolean} [html]
 * @property {Array} [classes]
 * @property {Boolean} [preventCloseOnClick]
 * @property {Boolean} [disabled]
 * @property {Function} [callback]
 */

/**
 * Easily manage context menus
 * Works out of the box with bootstrap css
 */
class PureContextMenu {
  _el;
  _contextMenu;
  _items;
  _options;
  _currentEvent;

  /**
   * @param {HTMLElement} el
   * @param {object} items
   * @param {object} opts
   */
  constructor(el, items, opts) {
    /**
     * @type {Item[]}
     */
    this._items = items;

    /**
     * @type {HTMLElement}
     */
    this._el = el;

    /**
     * @type {HTMLElement}
     */
    this._contextMenu = null;

    /**
     * @type {Config}
     */
    this._options = Object.assign({}, baseOptions, opts);

    // bind the menu on context menu
    // add also long press support, this helps with ios browsers
    // include https://cdn.jsdelivr.net/npm/long-press-event@2.4/dist/long-press-event.min.js in your pages
    ["contextmenu", "long-press"].forEach((type) => {
      el.addEventListener(type, this);
    });

    // close if the user clicks outside of the menu
    this._clickEvents().forEach((type) => {
      document.addEventListener(type, this);
    });

    instances.add(this);
  }

  _clickEvents() {
    if (this._options.fastClick) {
      return ["click", "touchstart"];
    }
    return ["click"];
  }

  /**
   * @link https://gist.github.com/WebReflection/ec9f6687842aa385477c4afca625bbf4#handling-events
   * @param {Event} event
   */
  handleEvent = (event) => {
    const aliases = {
      "long-press": "contextmenu",
      touchstart: "click",
    };
    const type = aliases[event.type] || event.type;
    this[`on${type}`](event);
  };

  /**
   * @param {Config} opts
   */
  static updateDefaultOptions(opts) {
    baseOptions = Object.assign(baseOptions, opts);
  }

  /**
   * @returns {Config}
   */
  static getDefaultOptions() {
    return baseOptions;
  }

  /**
   * @returns {Item[]}
   */
  getItems() {
    return this._items;
  }

  /**
   * @param {Item[]} items
   */
  setItems(items) {
    this._items = items;
  }

  /**
   * Create the menu
   * @returns {HTMLElement}
   */
  _buildContextMenu = () => {
    const useLists = this._options.useLists;
    const contextMenu = document.createElement("ul");
    contextMenu.style.minWidth = "120px";
    contextMenu.style.maxWidth = "240px";
    contextMenu.style.display = "block";
    contextMenu.classList.add(this._options.contextMenuClass);
    contextMenu.classList.add(...this._options.dropdownClass.split(" "));
    if (useLists) {
      contextMenu.classList.add(this._options.listClass);
    }

    for (const item of this._items) {
      const child = document.createElement("li");
      child.classList.add(this._options.menuItemClass);

      // With lists, classes are applied on li
      if (useLists) {
        //@link https://getbootstrap.com/docs/5.3/components/list-group/#for-links-and-buttons
        child.classList.add(...this._options.listItemClass.split(" "));
        if (item.disabled) {
          child.classList.add(this._options.disabledClass);
        }
      }
      if (item.classes) {
        child.classList.add(...item.classes);
      }
      if (item === "-") {
        const divider = document.createElement("hr");
        divider.classList.add(this._options.dividerClass);
        child.appendChild(divider);
      } else {
        const link = document.createElement("a");
        if (item.html) {
          link.innerHTML = item.label;
        } else {
          link.innerText = item.label;
        }
        link.style.cursor = "pointer";
        link.style.whiteSpace = "normal";

        // Without lists, classes are applied on child item
        if (!useLists) {
          link.classList.add(...this._options.itemClass.split(" "));
          if (item.disabled) {
            link.classList.add(this._options.disabledClass);
          }
        }
        child.appendChild(link);
      }
      contextMenu.appendChild(child);
    }
    return contextMenu;
  };

  /**
   * Normalize the context menu position so that it won't get out of bounds
   * @param {number} mouseX
   * @param {number} mouseY
   * @param {HTMLElement} contextMenu
   */
  _normalizePosition = (mouseX, mouseY, contextMenu) => {
    const scope = this._el;
    const contextStyles = window.getComputedStyle(contextMenu);
    // clientWidth exclude borders and we add 1px for good measure
    const offset = parseInt(contextStyles.borderWidth) + 1;

    // compute what is the mouse position relative to the container element (scope)
    const bounds = scope.getBoundingClientRect();

    let scopeX = mouseX;
    let scopeY = mouseY;

    if (!["BODY", "HTML"].includes(scope.tagName)) {
      scopeX -= bounds.left;
      scopeY -= bounds.top;
    }

    const menuWidth = parseInt(contextStyles.width);

    // check if the element will go out of bounds
    const outOfBoundsOnX = scopeX + menuWidth > scope.clientWidth;
    const outOfBoundsOnY = scopeY + contextMenu.clientHeight > scope.clientHeight;

    let normalizedX = mouseX;
    let normalizedY = mouseY;

    // normalize on X
    if (outOfBoundsOnX) {
      normalizedX = scope.clientWidth - menuWidth - offset;
      if (!["BODY", "HTML"].includes(scope.tagName)) {
        normalizedX += bounds.left;
      }
    }

    // normalize on Y
    if (outOfBoundsOnY) {
      normalizedY = scope.clientHeight - contextMenu.clientHeight - offset;
      if (!["BODY", "HTML"].includes(scope.tagName)) {
        normalizedY += bounds.top;
      }
    }

    return { normalizedX, normalizedY };
  };

  close = () => {
    this._contextMenu?.remove();
    this._contextMenu = null;
  };

  /**
   * @param {MouseEvent} event
   */
  oncontextmenu = (event) => {
    if (!this._options.show(event, this)) {
      return;
    }

    // Block regular context menu if our menu is shown
    event.preventDefault();
    event.stopPropagation();

    // Close existing menus
    instances.forEach((inst) => {
      inst.close();
    });

    // Don't do anything if clicked on the same menu
    const closestMenu = event.target.closest(`.${this._options.contextMenuClass}`);
    if (closestMenu) {
      return;
    }

    // Store event for callbacks, this allows to know what is the target that triggered the menu
    this._currentEvent = event;

    // the current context menu should disappear when a new one is displayed
    this.close();

    // build and show on ui
    const contextMenu = this._buildContextMenu();
    document.querySelector("body").append(contextMenu);

    // set the position already so that width can be computed
    contextMenu.style.position = "fixed";
    contextMenu.style.zIndex = this._options.zIndex;

    // adjust the position according to mouse position
    const mouseX = event.detail.clientX ?? event.clientX;
    const mouseY = event.detail.clientY ?? event.clientY;
    const { normalizedX, normalizedY } = this._normalizePosition(mouseX, mouseY, contextMenu);
    contextMenu.style.top = `${normalizedY}px`;
    contextMenu.style.left = `${normalizedX}px`;

    // Store reference
    this._contextMenu = contextMenu;
  };

  /**
   * @param {MouseEvent} event
   */
  _isCurrentTarget = (event) => {
    const closestMenu = event.target.closest(`.${this._options.contextMenuClass}`);
    if (closestMenu == this._contextMenu && this._contextMenu) {
      return true;
    }
    return false;
  };

  /**
   * @param {MouseEvent} event
   */
  _handleItemClick = (event) => {
    const t = event.target;
    /**
     * @type {HTMLLIElement}
     */
    const li = t.closest(`li`);
    if (li) {
      const index = [...li.parentElement.childNodes].findIndex((item) => item === li);
      const item = this._items[index];

      if (item.callback) {
        item.callback(this._currentEvent, this);

        // do not close the menu if set
        const preventCloseOnClick = item.preventCloseOnClick ?? this._options.preventCloseOnClick ?? false;
        if (!preventCloseOnClick) {
          this.close();
        }
      }
    }
  };

  /**
   * Used to determine if the user has clicked outside of the context menu and if so, close it
   * Handles delegated events on menu items
   * @param {MouseEvent} event
   */
  onclick = (event) => {
    if (this._isCurrentTarget(event)) {
      this._handleItemClick(event);
      return;
    }
    this.close();
  };

  /**
   * Remove all the event listeners that were registered for this feature
   */
  off = () => {
    instances.delete(this);
    this.close();
    this._clickEvents().forEach((type) => {
      document.removeEventListener(type, this);
    });
    ["contextmenu", "long-press"].forEach((type) => {
      this._el.removeEventListener(type, this);
    });
  };
}

export default PureContextMenu;
