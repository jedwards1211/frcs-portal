import React, {Component} from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

export default class DragHandle extends Component {
  static propTypes = {
    blockKey:       React.PropTypes.string,
    blockGridProps: ImmutablePropTypes.shape({
      onDragStart:  React.PropTypes.func.isRequired,
      onDragMove:   React.PropTypes.func.isRequired,
      onDragEnd:    React.PropTypes.func.isRequired,
    }),
  }
  onMouseDown = e => {
    if (e.button === 0) {
      e.preventDefault();
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup'  , this.onMouseUp);

      let {blockKey, blockGridProps} = this.props;
      let onDragStart = blockGridProps.get('onDragStart');
      onDragStart(blockKey, {x: e.clientX, y: e.clientY});
    }
  }
  onMouseMove = e => {
    e.preventDefault();
    let {blockKey, blockGridProps} = this.props;
    let onDragMove = blockGridProps.get('onDragMove');
    onDragMove(blockKey, {x: e.clientX, y: e.clientY});
  }
  onMouseUp = e => {
    e.preventDefault();
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup'  , this.onMouseUp);

    let {blockKey, blockGridProps} = this.props;
    let onDragEnd = blockGridProps.get('onDragEnd');
    onDragEnd(blockKey);
  }
  render() {
    let {onMouseDown, blockKey, blockGridProps} = this;
    return React.cloneElement(this.props.children, {onMouseDown, blockKey, blockGridProps});
  }
}