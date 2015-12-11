import {TICK} from './animConstants';

function parseTime(time) {
  if (time && time.substr(-2, -1).toLowerCase() !== 'm') {
    return (parseFloat(time) * 1000) || 0;
  }
  return parseFloat(time) || 0;
}

let getComputedStyle = window.getComputedStyle || () => ({});

export function getTimeout(element) {
  let style = element && getComputedStyle(element);
  return style ? parseTime(style.transitionDelay) + parseTime(style.transitionDuration) : 0;
}

export default function callOnTransitionEnd(element, callback, timeout) {
  timeout = getTimeout(element) || timeout || TICK;
  let timeoutPromise = setTimeout(callback, timeout);

  return {
    cancel() {
      clearTimeout(timeoutPromise);
    }
  };
}  
