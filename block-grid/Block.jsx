import React, {Component} from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classNames from 'classnames';
import callOnTransitionEnd from '../callOnTransitionEnd';
import shouldPureComponentUpdate from 'react-pure-render/function';

import './Block.sass';

export default class Block extends Component {
  shouldComponentUpdate = shouldPureComponentUpdate
  static propTypes = {
    position:       ImmutablePropTypes.shape({
      x:      React.PropTypes.number,
      y:      React.PropTypes.number,
      width:  React.PropTypes.number,
      height: React.PropTypes.number,
    }),
    blockGridProps: ImmutablePropTypes.shape({
      spacing:        React.PropTypes.number,
      arranging:      React.PropTypes.bool,
    }),
    blockKey:       React.PropTypes.string,
    grabbed:        React.PropTypes.bool,
    resizing:       React.PropTypes.bool,
    children:       React.PropTypes.element.isRequired
  }
  static contextTypes = {
    // (observer: (prevPosition, nextPosition) => undefined) => stopObserving: () => undefined
    observePosition:  React.PropTypes.func.isRequired,
  }
  static childContextTypes = {
    blockKey:         React.PropTypes.string.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      initial:    true,
      entering:   false,
      leaving:    false,
      position:   props.position,
    };
  }
  getChildContext() {
    return {
      blockKey: this.props.blockKey,
    };
  }
  componentWillReceiveProps(newProps) {
    this.setState({position: newProps.position});
  }
  componentWillMount() {
    let {blockKey} = this.props;
    this.stopObserving = this.context.observePosition(blockKey, (prevPosition, nextPosition) => {
      this.setState({position: nextPosition});
    });
  }
  componentDidMount() {
    this.mounted = true;
  }
  componentWillUnmount() {
    this.mounted = false;
    this.stopObserving();
  }
  componentWillAppear(callback) {
    this.componentWillEnter(callback);
  }
  componentWillEnter(callback) {
    let block = this.refs.block;
    callOnTransitionEnd(block, callback, 1000);
    // this doesn't work without the setTimeout, I'm not
    // 100% sure why
    setTimeout(() => {
      if (this.mounted) {
        this.setState({
          initial: false,
          entering: true,
          leaving: false,
        });
      }
    }, 0);
  }
  componentWillLeave(callback) {
    let block = this.refs.block;
    callOnTransitionEnd(block, callback, 1000);

    this.setState({
      initial: false,
      entering: false,
      leaving: true,
    });
  }
  render() {
    let {initial, leaving, position} = this.state;
    let x      = position.get('x') || 0,
        y      = position.get('y') || 0,
        width  = position.get('width') || 0,
        height = position.get('height') || 0;

    let {grabbed, resizing, className, blockGridProps, style} = this.props;
    let arranging = blockGridProps.get('arranging'),
        spacing   = blockGridProps.get('spacing');
    className = classNames('block', className, {grabbed: grabbed, resizing: resizing});

    if (!style) {
      style = {
        width,
        height,
      };
    }
    else {
      style = Object.assign({width, height}, style);
    }

    style.transform = 'translate(' + x + 'px,' + y + 'px)';

    if (initial || leaving) {
      style.transform += ' scale(0.1)';
      style.opacity = 0;
    }
    else if (grabbed) {
      style.opacity = 0.5;
      style.zIndex = 500;
    }
    else if (arranging) {
      style.transform += ' scale(' + (width - spacing) / width + ', ' + (height - spacing) / height + ')';
    }

    style.WebkitTransform = style.transform;

    return <div ref="block" {...this.props} className={className} style={style}>
      {React.cloneElement(this.props.children, {
        width,
        height,
      })}
    </div>
  } 
}