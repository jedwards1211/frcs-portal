import React from 'react';
import BlockHandle from './BlockHandle';

export default class DragHandle extends BlockHandle {
  static contextTypes = {
    blockKey:     React.PropTypes.string.isRequired,
    onDragStart:  React.PropTypes.func.isRequired,
    onDragMove:   React.PropTypes.func.isRequired,
    onDragEnd:    React.PropTypes.func.isRequired,
  }
  onStart = (key, newPosition) => {this.context.onDragStart(key, newPosition)}
  onMove  = (key, newPosition) => {this.context.onDragMove (key, newPosition)}
  onEnd   = (key)              => {this.context.onDragEnd  (key)}
}