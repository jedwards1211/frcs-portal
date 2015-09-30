import React, {Component} from 'react';

export default class ResizeHandle extends Component {
  static contextTypes = {
    blockKey:     React.PropTypes.string.isRequired,
    onResizeStart:  React.PropTypes.func.isRequired,
    onResizeMove:   React.PropTypes.func.isRequired,
    onResizeEnd:    React.PropTypes.func.isRequired,
  }
  onMouseDown = e => {
    if (e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup'  , this.onMouseUp);

      let {blockKey, onResizeStart} = this.context;
      onResizeStart(blockKey, {x: e.clientX, y: e.clientY});
    }
  }
  onMouseMove = e => {
    e.preventDefault();
    e.stopPropagation();
    let {blockKey, onResizeMove} = this.context;
    onResizeMove(blockKey, {x: e.clientX, y: e.clientY});
  }
  onMouseUp = e => {
    e.preventDefault();
    e.stopPropagation();
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup'  , this.onMouseUp);

    let {blockKey, onResizeEnd} = this.context;
    onResizeEnd(blockKey);
  }
  render() {
    let {onMouseDown} = this;
    return React.cloneElement(this.props.children, {onMouseDown});
  }
}