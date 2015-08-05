'use strict';

export function removeClass(element, className) {
  if (element.classList) {
    element.classList.remove(className);
  }
  else {
    var classList = element.classNames.split(/\s+/);
    var index = classList.indexOf(className);
    if (index >= 0) {
      classList.splice(index, 1);
      element.className = classList.join(' ');
    }
  }
}

export function addClass(element, className) {
  if (element.classList) {
    element.classList.add(className);
  }
  else {
    var classList = element.classNames.split(/\s+/);
    var index = classList.indexOf(className);
    if (index < 0) {
      classList.push(className);
      element.className = classList.join(' ');
    }
  }
}