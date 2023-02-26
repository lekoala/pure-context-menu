# Pure Context Menu

[![NPM](https://nodei.co/npm/pure-context-menu.png?mini=true)](https://nodei.co/npm/pure-context-menu/)
[![Downloads](https://img.shields.io/npm/dt/pure-context-menu.svg)](https://www.npmjs.com/package/pure-context-menu)

## How to use

Easily manage the right click context menu.

No additional CSS needed if you are using Bootstrap!

```js
import PureContextMenu from "./pure-context-menu.js";

const items = [
  {
    label: "Click here",
    callback: () => {
      alert("You clicked here");
    },
  },
  "-",
  {
    label: "Target click",
    callback: (e) => {
      if (e.target.id) {
        alert("You clicked on target " + e.target.id);
      } else {
        alert("You didn't click on a target");
      }
    },
  },
  {
    label: "This is a long menu item that spans on two line",
    callback: () => {
      alert("You clicked on a long line");
    },
  },
  {
    label: "This will not close",
    preventCloseOnClick: true,
    callback: () => {
      alert("It didn't close");
    },
  },
];
// bind to html if body does not have 100% height
let bodyMenu = new PureContextMenu(document.querySelector("html"), items);
```

## Features

### Built-in styles for Bootstrap

Easy context menu use default Bootstrap styles so you don't need extra css. Otherwise, look at `styles.scss` to see some default styles you can use.

### Prevent close on click

By default, clicking on an item will close the menu. You can control this with `preventCloseOnClick`

### Determining target

The callback receive the event that originally opened the context menu. This allow determing the target under the context menu.

### Dividers

Simply pass "-" in the list of elements to mark dividers.

### Mobile support

Surprisingly, modern mobile browsers translate long press to a contextmenu event that it works out of the box :-)

If it's not working, `long-press` is supported, simply add it to your pages

```html
<script src="https://cdn.jsdelivr.net/npm/long-press-event@2.4.6/dist/long-press-event.min.js" type="module"></script>
```

## Options

Options can be either passed to the constructor (eg: optionName) or globally updated using `PureContextMenu.updateGlobalOptions`

| Name                | Default             | Description                              |
| ------------------- | ------------------- | ---------------------------------------- |
| contextMenuClass    | "pure-context-menu" | The class used for selecting the menu    |
| dropdownClass       | "dropdown-menu"     | Another class to style the menu          |
| dividerClass        | "dropdown-divider"  | Class for dividers                       |
| itemClass           | "dropdown-item"     | Class for items                          |
| zIndex              | 9999                | z-index assigned to the menu             |
| preventCloseOnClick | false               | Global behaviour for items when clicking |
| show                | event => true       | Whether to show menu based on event      |

## Browser supports

Modern browsers (edge, chrome, firefox, safari... not IE11). [Add a warning if necessary](https://github.com/lekoala/nomodule-browser-warning.js/).
