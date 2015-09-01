import React from 'react';
import _ from 'lodash';

import LinearConversion from './LinearConversion';

function copyTouch(touch, boundingClientRect) {
  return {
    id: touch.identifier,
    elementX: touch.pageX - boundingClientRect.left,
    elementY: touch.pageY - boundingClientRect.top,
  };
}

export default class PlotInteractionController extends React.Component {
  constructor(props) {
    super(props);
    this.touches = [];
  }

  static propTypes = {
    xConversion: React.PropTypes.instanceOf(LinearConversion),
    yConversion: React.PropTypes.instanceOf(LinearConversion),
    onMoveStart: React.PropTypes.func,
    onMove:      React.PropTypes.func,
    onMoveEnd:   React.PropTypes.func,
    children:    React.PropTypes.node.isRequired,
  }

  onMouseDown = (e) => {
    if (e.button === 0) {
      var {xConversion, yConversion, onMoveStart} = this.props;
      e.preventDefault();

      this.target = e.target;
      var rect = e.target.getBoundingClientRect();
      if (xConversion) this.startX = xConversion.invert(e.clientX - rect.left);
      if (yConversion) this.startY = yConversion.invert(e.clientY - rect.top);
      this.startXConversion = xConversion;
      this.startYConversion = yConversion;

      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup'  , this.onMouseUp, true);

      if (onMoveStart) onMoveStart();
    }
  }
  onMouseMove = (e) => {
    e.preventDefault();

    var rect = e.target.getBoundingClientRect();

    var newXConversion, newYConversion;

    if (this.startXConversion) {
      newXConversion = this.startXConversion.clone().set(this.startX, e.clientX - rect.left);
    }
    if (this.startYConversion) {
      newYConversion = this.startYConversion.clone().set(this.startY, e.clientY - rect.top);
    }

    if (this.props.onMove) {
      this.props.onMove(newXConversion, newYConversion);
    }
  }
  onMouseUp = (e) => {
    if (e.button === 0) {
      e.preventDefault();
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup'  , this.onMouseUp, true);

      if (this.props.onMoveEnd) this.props.onMoveEnd();
    }
  }
  onWheel = (e) => {
    e.preventDefault();

    var rect = e.target.getBoundingClientRect();

    var {xConversion, yConversion, onMove, onMoveStart, onMoveEnd} = this.props;
    var wheelDirection = (e.detail < 0 || e.deltaY < 0) ? 1 : -1;

    var zoom = Math.pow(0.9, wheelDirection);
    var newXConversion, newYConversion;

    if (xConversion) {
      newXConversion = new LinearConversion(xConversion);
      newXConversion.zoom(xConversion.invert(e.clientX - rect.left), zoom);
    }
    if (yConversion) {
      newYConversion = new LinearConversion(yConversion);
      newYConversion.zoom(yConversion.invert(e.clientY - rect.top), zoom);
    }
    if (onMoveStart)  onMoveStart();
    if (onMove)       onMove(newXConversion, newYConversion);
    if (onMoveEnd)    onMoveEnd();
  }
  onTouchStart = (e) => {
    var alreadyMoving = Object.keys(this.touches).length;
    if (alreadyMoving) e.preventDefault();

    var {xConversion, yConversion, onMoveStart} = this.props;
    var target = React.findDOMNode(this.refs.target);

    var rect = e.target.getBoundingClientRect();

    _.forEach(e.changedTouches, t => {
      t = copyTouch(t, rect);
      t.startElementX = t.elementX;
      t.startElementY = t.elementY;
      if (xConversion) t.startX = xConversion.invert(t.elementX);
      if (yConversion) t.startY = yConversion.invert(t.elementY);
      this.touches[t.id] = t;
    });

    if (!alreadyMoving && onMoveStart) onMoveStart();
  }
  onTouchMove = (e) => {
    e.preventDefault();
    var {onMove, xConversion, yConversion} = this.props;

    var rect = e.target.getBoundingClientRect();

    var target = React.findDOMNode(this.refs.target);
    _.forEach(e.changedTouches, t => _.assign(this.touches[t.identifier], copyTouch(t, rect)));

    if (onMove) {
      var newXConversion, newYConversion;

      var keys = Object.keys(this.touches);
      var touchCount = keys.length;
      if (touchCount === 1) {
        var t = this.touches[keys[0]];
        if (xConversion) newXConversion = xConversion.clone().set(t.startX, t.elementX);
        if (yConversion) newYConversion = yConversion.clone().set(t.startY, t.elementY);
      }
      else if (touchCount > 1) {
        if (xConversion) {
          var t1, t2;
          // I tried using _.min and _.max for this, and it completely froze Safari on my iPad 2...WTF???
          for (let key of keys) {
            var t = this.touches[key];
            if (!t1 || t.elementX < t1.elementX) t1 = t;
            if (!t2 || t.elementX > t2.elementX) t2 = t;
          }
          if (t1.startX !== t2.startX && t1.elementX !== t2.elementX) {
            var x1, x2;
            if ((t1.startElementX > t2.startElementX) != (t1.elementX > t2.elementX)) {
              x1 = t2.startX;
              x2 = t1.startX;
            }
            else {
              x1 = t1.startX;
              x2 = t2.startX;
            }
            newXConversion = new LinearConversion(x1, t1.elementX, x2, t2.elementX);
          }
        }
        if (yConversion) {
          var t1, t2;
          // I tried using _.min and _.max for this, and it completely froze Safari on my iPad 2...WTF???
          for (let key of keys) {
            var t = this.touches[key];
            if (!t1 || t.elementY < t1.elementY) t1 = t;
            if (!t2 || t.elementY > t2.elementY) t2 = t;
          }
          if (t1.startY !== t2.startY && t1.elementY !== t2.elementY) {
            var y1, y2;
            if ((t1.startElementY > t2.startElementY) != (t1.elementY > t2.elementY)) {
              y1 = t2.startY;
              y2 = t1.startY;
            }
            else {
              y1 = t1.startY;
              y2 = t2.startY;
            }
            newYConversion = new LinearConversion(y1, t1.elementY, y2, t2.elementY);
          }
        }
      }

      onMove(newXConversion, newYConversion);
    }
  }
  onTouchEnd = (e) => {
    _.forEach(e.changedTouches, t => delete this.touches[t.identifier]);
    if (!Object.keys(this.touches).length && this.props.onMoveEnd) {
      this.props.onMoveEnd();
    }
  }
  onTouchCancel = (e) => {
    this.onTouchEnd(e);
  }
  render() {
    return React.cloneElement(this.props.children, {
      ref: 'target',
      onMouseDown: this.onMouseDown,
      onWheel: this.onWheel,
      onTouchStart: this.onTouchStart,
      onTouchMove: this.onTouchMove,
      onTouchEnd: this.onTouchEnd,
      onTouchCancel: this.onTouchCancel,
    });
  }
}