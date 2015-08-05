'use strict';

var prefix = ["webkit", "moz", "MS", "o", ""];
var lowercase = [false, true, false, true, true];

export function addEventListener(element, type, callback) {
  for (var p = 0; p < prefix.length; p++) {
    var prefixed = type;  
    if (lowercase[p]) prefixed = prefixed.toLowerCase();
    prefixed = prefix[p] + prefixed;
    element.addEventListener(prefixed, callback, false);
  }
}

export function removeEventListener(element, type, callback) {
  for (var p = 0; p < prefix.length; p++) {
    var prefixed = type;  
    if (lowercase[p]) prefixed = prefixed.toLowerCase();
    prefixed = prefix[p] + prefixed;
    element.removeEventListener(prefixed, callback, false);
  }
}