import React from 'react';
import BlockHandle from './BlockHandle';

export default class ResizeHandle extends BlockHandle {
  static contextTypes = {
    blockKey:     React.PropTypes.string.isRequired,
    onResizeStart:  React.PropTypes.func.isRequired,
    onResizeMove:   React.PropTypes.func.isRequired,
    onResizeEnd:    React.PropTypes.func.isRequired,
  }
  onStart = (key, newPosition) => {this.context.onResizeStart(key, newPosition)}
  onMove  = (key, newPosition) => {this.context.onResizeMove (key, newPosition)}
  onEnd   = (key)              => {this.context.onResizeEnd  (key)}
}