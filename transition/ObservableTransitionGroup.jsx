import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
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
      isEntering: false,
      isLeaving: false,
      ref: 'root',
    });
  }
  getChildContext() {
    return {transitionEvents: this.transitionEvents};
  }
  componentWillAppear(callback) {
    callOnTransitionEnd(ReactDOM.findDOMNode(this.refs.root), callback, this.props.transitionTimeout);
    // we setTimeout so that the component can mount without inClassName first,
    // and then add it a moment later.  Otherwise it may not transition
    setTimeout(() => this.setState({
      isIn: true,
      isAppearing: true,
      isEntering: false,
      isLeaving: false,
    }),  0);
    this.transitionEvents.emit('componentWillAppear');
  }
  componentDidAppear() {
    this.setState({
      isAppearing: false,
    });
    this.transitionEvents.emit('componentDidAppear');
  }
  componentWillEnter(callback) {
    callOnTransitionEnd(ReactDOM.findDOMNode(this.refs.root), callback, this.props.transitionTimeout);
    // we setTimeout so that the component can mount without inClassName first,
    // and then add it a moment later.  Otherwise it may not transition
    setTimeout(() => this.setState({
      isIn: true,
      isAppearing: false,
      isEntering: true,
      isLeaving: false,
    }),  0);
    this.transitionEvents.emit('componentWillEnter');
  }
  componentDidEnter() {
    this.setState({
      isEntering: false,
    });
    this.transitionEvents.emit('componentDidEnter');
  }
  componentWillLeave(callback) {
    callOnTransitionEnd(ReactDOM.findDOMNode(this.refs.root), callback, this.props.transitionTimeout);
    this.setState({
      isIn: false,
      isAppearing: false,
      isEntering: false,
      isLeaving: true,
    });
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
  render() {
    let children = React.Children.toArray(this.props.children);

    return <InterruptibleTransitionGroup {...this.props}>
      {children.map(child => {
        if (!child) return child;
        return <ChildWrapper key={child.key}>
          {child}
        </ChildWrapper>;
      })}
    </InterruptibleTransitionGroup>;
  }
}
