import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import InterruptibleTransitionGroup from './InterruptibleTransitionGroup';

import callOnTransitionEnd from '../transition/callOnTransitionEnd';

export class ChildWrapper extends Component {
  constructor(props)  {
    super(props);
    let {addTransitionListener, removeTransitionListener} = this;
    this.transitionListeners = [];
    this.state = Object.assign({}, this.state, {
      isIn: false,
      isEntering: false,
      isLeaving: false,
      ref: 'root',
      addTransitionListener,
      removeTransitionListener,
    });
  }
  addTransitionListener = listener => {
    this.transitionListeners.push(listener);
  }
  removeTransitionListener = listener => {
    let index = this.transitionListeners.indexOf(listener);
    if (index >= 0) {
      this.transitionListeners.splice(index, 1);
    }
  }
  notifyTransitionListeners(methodName) {
    this.transitionListeners.forEach(listener => {
      let method = listener[methodName];
      method && method();
    });
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
    this.notifyTransitionListeners('componentWillAppear');
  }
  componentDidAppear() {
    this.setState({
      isAppearing: false,
    });
    this.notifyTransitionListeners('componentDidAppear');
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
    this.notifyTransitionListeners('componentWillEnter');
  }
  componentDidEnter() {
    this.setState({
      isEntering: false,
    });
    this.notifyTransitionListeners('componentDidEnter');
  }
  componentWillLeave(callback) {
    callOnTransitionEnd(ReactDOM.findDOMNode(this.refs.root), callback, this.props.transitionTimeout);
    this.setState({
      isIn: false,
      isAppearing: false,
      isEntering: false,
      isLeaving: true,
    });
    this.notifyTransitionListeners('componentWillLeave');
  }
  componentDidLeave() {
    this.notifyTransitionListeners('componentDidLeave');
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
