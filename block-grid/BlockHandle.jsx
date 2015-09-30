import React, {Component} from 'react';

export const horizontalDrag = ({x}) => ({x, y: 0});
export const verticalDrag = ({y}) => ({x: 0, y});

export default class BlockHandle extends Component {
  static propTypes = {
    disabled:          React.PropTypes.bool,
    transformPosition: React.PropTypes.func,
  }
  static defaultProps = {
    transformPosition: p => p,
  }
  static contextTypes = {
    blockKey:     React.PropTypes.string.isRequired,
  }
  onStart = () => {}
  onMove  = () => {}
  onEnd   = () => {}
  onMouseDown = e => {
    if (e.button === 0) {
      e.preventDefault();
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup'  , this.onMouseUp);

      let {blockKey} = this.context;
      this.onStart(blockKey, this.props.transformPosition({x: e.clientX, y: e.clientY}));
    }
  }
  onMouseMove = e => {
    e.preventDefault();
    let {blockKey} = this.context;
    this.onMove(blockKey, this.props.transformPosition({x: e.clientX, y: e.clientY}));
  }
  onMouseUp = e => {
    e.preventDefault();
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup'  , this.onMouseUp);

    let {blockKey} = this.context;
    this.onEnd(blockKey);
  }
  render() {
    if (this.props.disabled) {
      return this.props.children;
    }
    let {onMouseDown} = this;
    return React.cloneElement(this.props.children, {onMouseDown});
  }
}
