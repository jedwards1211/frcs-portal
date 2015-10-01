import {forEach, size} from 'lodash';

export default class TouchHoldDragRecognizer {
  constructor(holdDelay = 500) {
    this.holdDelay = holdDelay;
    this.touches = {};
  }
  onContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  onTouchStart = (e, startTouchDrag) => {
    forEach(e.changedTouches, t => this.touches[t.identifier] = true);
    clearTimeout(this.timeout);
    if (size(this.touches) === 1) {
      window.addEventListener('contextmenu', this.onContextMenu, true);
      this.timeout = setTimeout(() => {
        startTouchDrag();
      }, this.holdDelay);
    }
  }  
  onTouchMove = (e) => {
    clearTimeout(this.timeout);
  }
  onTouchEnd = (e) => {
    clearTimeout(this.timeout);
    forEach(e.changedTouches, t => delete this.touches[t.identifier]);
    if (!size(this.touches)) {
      window.removeEventListener('contextmenu', this.onContextMenu, true);
    }
  }
  onTouchCancel = (e) => {
    clearTimeout(this.timeout);
    forEach(e.changedTouches, t => delete this.touches[t.identifier]);
    if (!size(this.touches)) {
      window.removeEventListener('contextmenu', this.onContextMenu, true);
    }
  }
}