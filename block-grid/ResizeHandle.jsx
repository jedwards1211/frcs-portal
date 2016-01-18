import React, {Component} from 'react';
import BlockHandle from './BlockHandle';

export default class ResizeHandle extends Component {
  static contextTypes = {
    blockKey:     React.PropTypes.string.isRequired,
    onResizeStart:  React.PropTypes.func.isRequired,
    onResizeMove:   React.PropTypes.func.isRequired,
    onResizeEnd:    React.PropTypes.func.isRequired,
  };
  onStart = (key, newPosition) => {this.context.onResizeStart(key, newPosition)};
  onMove = (key, newPosition) => {this.context.onResizeMove (key, newPosition)};
  onEnd = (key)              => {this.context.onResizeEnd  (key)};
  render() {
    let {onStart, onMove, onEnd} = this;
    return <BlockHandle {...this.props} onStart={onStart} onMove={onMove} onEnd={onEnd}>
      {this.props.children}
    </BlockHandle>;
  }
}