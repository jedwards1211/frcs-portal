import React, {Component} from 'react'
import BlockHandle from './BlockHandle'

export default class DragHandle extends Component {
  static contextTypes = {
    blockKey:     React.PropTypes.string.isRequired,
    onDragStart:  React.PropTypes.func.isRequired,
    onDragMove:   React.PropTypes.func.isRequired,
    onDragEnd:    React.PropTypes.func.isRequired,
  };
  onStart = (key, newPosition) => {this.context.onDragStart(key, newPosition)};
  onMove = (key, newPosition) => {this.context.onDragMove (key, newPosition)};
  onEnd = (key)              => {this.context.onDragEnd  (key)};
  render() {
    let {onStart, onMove, onEnd} = this
    return <BlockHandle {...this.props} onStart={onStart} onMove={onMove} onEnd={onEnd}>
      {this.props.children}
    </BlockHandle>
  }
}
