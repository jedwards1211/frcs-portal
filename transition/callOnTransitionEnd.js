import ReactTransitionEvents from './ReactTransitionEvents';

let {addEndEventListener, removeEndEventListener} = ReactTransitionEvents;

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
  timeout = getTimeout(element) || timeout || 0;
  let timeoutPromise;
  let transitionEndListener = () => {
    if (timeoutPromise) clearTimeout(timeoutPromise);
    removeEndEventListener(element, transitionEndListener);
    callback();
  };
  addEndEventListener(element, transitionEndListener);
  if (timeout) timeoutPromise = setTimeout(transitionEndListener, timeout);
}  
