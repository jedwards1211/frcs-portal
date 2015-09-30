import React, {Component} from 'react';

export default class DragHandle extends Component {
  static contextTypes = {
    blockKey:     React.PropTypes.string.isRequired,
    onDragStart:  React.PropTypes.func.isRequired,
    onDragMove:   React.PropTypes.func.isRequired,
    onDragEnd:    React.PropTypes.func.isRequired,
  }
  onMouseDown = e => {
    if (e.button === 0) {
      e.preventDefault();
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup'  , this.onMouseUp);

      let {blockKey, onDragStart} = this.context;
      onDragStart(blockKey, {x: e.clientX, y: e.clientY});
    }
  }
  onMouseMove = e => {
    e.preventDefault();
    let {blockKey, onDragMove} = this.context;
    onDragMove(blockKey, {x: e.clientX, y: e.clientY});
  }
  onMouseUp = e => {
    e.preventDefault();
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup'  , this.onMouseUp);

    let {blockKey, onDragEnd} = this.context;
    onDragEnd(blockKey);
  }
  render() {
    let {onMouseDown} = this;
    return React.cloneElement(this.props.children, {onMouseDown});
  }
}