"use strict";

let globalListenerSet = false;
let baseOptions = {
  contextMenuClass: "bootstrap-context-menu",
  dropdownClass: "dropdown-menu",
  dividerClass: "dropdown-divider",
  itemClass: "dropdown-item",
  zIndex: "9999",
  preventCloseOnClick: false,
};

/**
 * Easily manage context menus
 * Works out of the box with bootstrap css
 */
class BootstrapContextMenu {
  _el;
  _items;
  _options;
  _currentEvent;

  /**
   * @param {HTMLElement} el
   * @param {object} items
   * @param {object} opts
   */
  constructor(el, items, opts) {
    this._items = items;
    this._el = el;

    this._options = Object.assign(baseOptions, opts);

    // bind the menu
    el.oncontextmenu = this._onShowContextMenu;

    // close if the user clicks outside of the menu
    if (!globalListenerSet) {
      document.addEventListener("click", this._onDocumentClick);
      globalListenerSet = true;
    }
  }

  /**
   * @param {object} opts
   */
  static updateDefaultOptions(opts) {
    baseOptions = Object.assign(baseOptions, opts);
  }

  /**
   * @returns {object}
   */
  static getDefaultOptions() {
    return baseOptions;
  }

  /**
   * Create the menu
   * @returns {HTMLElement}
   */
  _buildContextMenu = () => {
    const contextMenu = document.createElement("ul");
    contextMenu.style.minWidth = "120px";
    contextMenu.style.maxWidth = "240px";
    contextMenu.style.display = "block";
    contextMenu.classList.add(this._options.contextMenuClass);
    contextMenu.classList.add(this._options.dropdownClass);

    for (const item of this._items) {
      const child = document.createElement("li");
      if (item === "-") {
        const divider = document.createElement("hr");
        divider.classList.add(this._options.dividerClass);
        child.appendChild(divider);
      } else {
        const link = document.createElement("a");
        link.innerText = item.label;
        link.style.cursor = "pointer";
        link.style.whiteSpace = "normal";
        link.classList.add(this._options.itemClass);
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
  _normalizePozition = (mouseX, mouseY, contextMenu) => {
    const scope = this._el;
    const offset = 5;

    // compute what is the mouse position relative to the container element (scope)
    const bounds = scope.getBoundingClientRect();

    const scopeX = mouseX - bounds.left;
    const scopeY = mouseY - bounds.top;

    // check if the element will go out of bounds
    const outOfBoundsOnX = scopeX + contextMenu.clientWidth > scope.clientWidth;
    const outOfBoundsOnY = scopeY + contextMenu.clientHeight > scope.clientHeight;

    let normalizedX = mouseX;
    let normalizedY = mouseY;

    // normalize on X
    if (outOfBoundsOnX) {
      normalizedX = bounds.left + scope.clientWidth - contextMenu.clientWidth - offset;
    }

    // normalize on Y
    if (outOfBoundsOnY) {
      normalizedY = bounds.top + scope.clientHeight - contextMenu.clientHeight - offset;
    }

    return { normalizedX, normalizedY };
  };

  _removeExistingContextMenu = () => {
    document.querySelector(`.${this._options.contextMenuClass}`)?.remove();
  };

  _bindCallbacks = (contextMenu) => {
    this._items.forEach((menuItem, index) => {
      if (menuItem === "-") {
        return;
      }

      const htmlEl = contextMenu.children[index];

      htmlEl.onclick = () => {
        menuItem.callback(this._currentEvent);

        // do not close the menu if set
        const preventCloseOnClick = menuItem.preventCloseOnClick ?? this._options.preventCloseOnClick ?? false;
        if (!preventCloseOnClick) {
          this._removeExistingContextMenu();
        }
      };
    });
  };

  /**
   * @param {MouseEvent} event
   */
  _onShowContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Store event for callbakcs
    this._currentEvent = event;

    // the current context menu should disappear when a new one is displayed
    this._removeExistingContextMenu();

    // build and show on ui
    const contextMenu = this._buildContextMenu();
    document.querySelector("body").append(contextMenu);

    // set the position
    const { clientX: mouseX, clientY: mouseY } = event;
    const { normalizedX, normalizedY } = this._normalizePozition(mouseX, mouseY, contextMenu);
    contextMenu.style.position = "absolute";
    contextMenu.style.zIndex = this._options.zIndex;
    contextMenu.style.top = `${normalizedY}px`;
    contextMenu.style.left = `${normalizedX}px`;

    // disable context menu for it
    contextMenu.oncontextmenu = (e) => e.preventDefault();

    // bind the callbacks on each option
    this._bindCallbacks(contextMenu);
  };

  /**
   * Used to determine if the user has clicked outside of the context menu and if so to close it
   * @param {MouseEvent} event
   */
  _onDocumentClick = (event) => {
    const clickedTarget = event.target;
    if (clickedTarget.closest(`.${this._options.contextMenuClass}`)) {
      return;
    }
    this._removeExistingContextMenu();
  };

  /**
   * Remove all the event listeners that were registered for this feature
   */
  off() {
    this._removeExistingContextMenu();
    document.removeEventListener("click", this._onDocumentClick);
    globalListenerSet = false;
    this._el.oncontextmenu = null;
  }
}

export default BootstrapContextMenu;
