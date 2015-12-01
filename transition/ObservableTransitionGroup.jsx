import React, {Component, PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import InterruptibleTransitionGroup from './InterruptibleTransitionGroup';

import callOnTransitionEnd from '../transition/callOnTransitionEnd';

import EventEmitter from 'events';

export class ChildWrapper extends Component {
  static childContextTypes = {
    transitionEvents: PropTypes.instanceOf(EventEmitter).isRequired,
  }
  transitionEvents = new EventEmitter();
  constructor(props)  {
    super(props);
    this.state = Object.assign({}, this.state, {
      isIn: false,
      isAppearing: false,
      isEntering: false,
      isLeaving: false,
      ref: 'root',
    });
  }
  getChildContext() {
    return {transitionEvents: this.transitionEvents};
  }
  componentWillAppear(callback) {
    setTimeout(() => this.setState({
        isIn: true,
        isAppearing: true,
        isEntering: false,
        isLeaving: false,
      }, () => callOnTransitionEnd(findDOMNode(this.refs.root), callback)
    ),  0);
    this.transitionEvents.emit('componentWillAppear');
  }
  componentDidAppear() {
    this.setState({
      isAppearing: false,
    });
    this.transitionEvents.emit('componentDidAppear');
  }
  componentWillEnter(callback) {
    // we setTimeout so that the component can mount without inClassName first,
    // and then add it a moment later.  Otherwise it may not transition
    setTimeout(() => this.setState({
        isIn: true,
        isAppearing: false,
        isEntering: true,
        isLeaving: false,
      }, () => callOnTransitionEnd(findDOMNode(this.refs.root), callback)
    ),  0);
    this.transitionEvents.emit('componentWillEnter');
  }
  componentDidEnter() {
    this.setState({
      isEntering: false,
    });
    this.transitionEvents.emit('componentDidEnter');
  }
  componentWillLeave(callback) {
    this.setState({
        isIn: false,
        isAppearing: false,
        isEntering: false,
        isLeaving: true,
      }, () => callOnTransitionEnd(findDOMNode(this.refs.root), callback)
    );
    this.transitionEvents.emit('componentWillLeave');
  }
  componentDidLeave() {
    this.transitionEvents.emit('componentDidLeave');
    this.transitionEvents.removeAllListeners();
  }
  render() {
    return React.cloneElement(this.props.children, this.state);
  }
}

export default class ObservableTransitionGroup extends Component {
  wrapChild = (child) => {
    let {childFactory} = this.props;
    if (childFactory) {
      child = childFactory(child);
    }
    return <ChildWrapper key={child.key}>{child}</ChildWrapper>;
  }
  render() {
    return <InterruptibleTransitionGroup {...this.props} childFactory={this.wrapChild}/>;
  }
}
