import PureContextMenu from "../pure-context-menu.js";
import test from "ava";

// Somehow new Event syntax is not working
Event = window.Event;

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

test("it can create", (t) => {
  let inst = new PureContextMenu(document.querySelector("body"), items);
  t.is(inst.constructor.name, "PureContextMenu");
  inst.off();
});

test("it can update options", (t) => {
  t.assert(PureContextMenu.getDefaultOptions().preventCloseOnClick === false);
  PureContextMenu.updateDefaultOptions({
    preventCloseOnClick: true,
  });
  t.assert(PureContextMenu.getDefaultOptions().preventCloseOnClick === true);
});

test("it is built on right click", (t) => {
  let body = document.querySelector("body");
  let inst = new PureContextMenu(body, items);
  t.is(document.querySelector(".pure-context-menu"), null);
  body.dispatchEvent(new Event("contextmenu"));
  let menu = document.querySelector(".pure-context-menu");
  t.assert(menu?.constructor?.name === "HTMLUListElement", menu ? "It was " + menu.constructor.name : "No menu");
  inst.off();
  t.is(document.querySelector(".pure-context-menu"), null);
});
