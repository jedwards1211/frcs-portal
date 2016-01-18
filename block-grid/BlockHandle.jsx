import React, {Component, PropTypes} from 'react';
import {forEach, noop} from 'lodash';

export const horizontalDrag = ({x}) => ({x, y: 0});
export const verticalDrag = ({y}) => ({x: 0, y});

export default class BlockHandle extends Component {
  static propTypes = {
    disabled:             PropTypes.bool,
    transformPosition:    PropTypes.func,
    touchDragRecognizer:  PropTypes.func,
    onStart:              PropTypes.func,
    onMove:               PropTypes.func,
    onEnd:                PropTypes.func,
  };
  static defaultProps = {
    transformPosition: p => p,
    onStart: noop,
    onMove: noop,
    onEnd: noop,
  };
  static contextTypes = {
    blockKey:     React.PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.touchDragging = false;
    this.touchOrder = [];
    this.touches = {};
    if (props.touchDragRecognizer) this.recognizer = new props.touchDragRecognizer();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.touchDragRecognizer !== this.props.touchDragRecognizer) {
      this.recognizer = nextProps.touchDragRecognizer ? 
        new nextProps.touchDragRecognizer() : undefined;
    }
  }
  onMouseDown = e => {
    if (e.button === 0) {
      e.preventDefault();
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup'  , this.onMouseUp);
      document.addEventListener('click', this.onClickCapture, true);
      this.allowClick = true;
      clearTimeout(this.removeClickCaptureTimeout);
      let {blockKey} = this.context;
      this.props.onStart(blockKey, this.props.transformPosition(getPosition(e)));
    }
  };
  onMouseMove = e => {
    e.preventDefault();
    let {blockKey} = this.context;
    this.allowClick = false;
    this.props.onMove(blockKey, this.props.transformPosition(getPosition(e)));
  };
  onMouseUp = e => {
    e.preventDefault();
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup'  , this.onMouseUp);

    this.removeClickCaptureTimeout = setTimeout(() => document.removeEventListener(
      'click', this.onClickCapture, true), 4);

    let {blockKey} = this.context;
    this.props.onEnd(blockKey);
  };
  onClickCapture = e => {
    if (e.button !== 0 || !this.allowClick) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  startTouchDrag = () => {
    if (this.touchOrder.length) {
      this.touchDragging = true;
      this.touchOffset = {x: 0, y: 0};
      let {blockKey} = this.context;
      this.props.onStart(blockKey, this.props.transformPosition(
        addPoints(getPosition(this.touches[this.touchOrder[0]]), this.touchOffset)));
    }
  };
  onTouchStart = e => {
    let recognizer = this.recognizer;
    if (recognizer && recognizer.onTouchStart) {
      recognizer.onTouchStart(e, this.startTouchDrag);
    }

    forEach(e.changedTouches, t => {
      if (!this.touches[t.identifier]) {
        this.touchOrder.push(t.identifier);
      }
      this.touches[t.identifier] = copyTouch(t);
    });

    if (!recognizer && this.touchOrder.length === 1) {
      e.preventDefault();
      this.startTouchDrag();
    }
  };
  onTouchMove = e => {
    let recognizer = this.recognizer;
    if (recognizer && recognizer.onTouchMove) {
      recognizer.onTouchMove(e, this.startTouchDrag);
    }

    forEach(e.changedTouches, t => {
      this.touches[t.identifier] = copyTouch(t);
    });

    if (this.touchDragging) {
      e.preventDefault();
      let {blockKey} = this.context;
      this.props.onMove(blockKey, this.props.transformPosition(
        addPoints(getPosition(this.touches[this.touchOrder[0]]), this.touchOffset)));
    }
  };
  onTouchEnd = e => {
    let recognizer = this.recognizer;
    if (recognizer && recognizer.onTouchEnd) {
      recognizer.onTouchEnd(e);
    }

    this.removeTouches(e); 
  };
  onTouchCancel = e => {
    let recognizer = this.recognizer;
    if (recognizer && recognizer.onTouchCancel) {
      recognizer.onTouchCancel(e);
    }

    this.removeTouches(e);
  };
  removeTouches = e => {
    forEach(e.changedTouches, t => {
      let index = this.touchOrder.indexOf(t.identifier);
      if (index === 0 && this.touchOrder.length > 1) {
        // this prevents the component from jumping if the
        // user starts dragging, touches it in another place,
        // and then releases the first touch
        this.touchOffset = addPoints(
          this.touchOffset, 
          subPoints(
            getPosition(this.touches[this.touchOrder[0]]),
            getPosition(this.touches[this.touchOrder[1]])));
      }
      if (index >= 0) {
        this.touchOrder.splice(index, 1);
      }
      delete this.touches[t.identifier];
    });

    if (this.touchDragging) {
      e.preventDefault();

      if (!this.touchOrder.length) {
        this.touchDragging = false;
        let {blockKey} = this.context;
        this.props.onEnd(blockKey);
      }
    }
  };
  render() {
    if (this.props.disabled) {
      return this.props.children;
    }
    let {onMouseDown, onTouchStart, onTouchMove, onTouchEnd, onTouchCancel} = this;
    return React.cloneElement(this.props.children, {
      onMouseDown,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
    });
  }
}

function getPosition(e) {
  if ('pageX' in e) {
    return {x: e.pageX, y: e.pageY};
  }
  return {x: e.clientX, y: e.clientY};
}

function copyTouch(touch) {
  return {
    id: touch.identifier,
    pageX: touch.pageX,
    pageY: touch.pageY,
  };
}

function addPoints(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

function subPoints(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}