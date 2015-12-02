import React, {Component, Children, cloneElement} from 'react';
import {findDOMNode} from 'react-dom';
import Promise from 'bluebird';
import classNames from 'classnames';

import {getTimeout} from '../transition/callOnTransitionEnd';

import './Fader.sass';

export default class Fader extends Component {
  constructor(props) {
    super(props);
    let curChild = Children.toArray(props.children)[0];
    this.state = {
      curChild,
      wrappedChildren: [<div className="mf-fader-child fade in" key={curChild.key}>{curChild}</div>],
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      this.doTransition(nextProps);
    }
  }

  psetState = (updater) => {
    return new Promise((resolve, reject) => {
      this.setState(updater, () => setTimeout(resolve, 4));
    });
  }

  doTransition = (props = this.props) => {
    let {psetState, state: {height, curChild: prevChild}} = this;
    let nextChild = Children.toArray(props.children)[0];

    if (nextChild.key === prevChild.key) {
      if (height === undefined && nextChild !== prevChild) {
        this.setState({
          curChild: nextChild,
          wrappedChildren: [
            <div key={nextChild.key} className="mf-fader-child fade in">{nextChild}</div>,
          ],
        });
      }
      return;
    }
    else if (height !== undefined) {
      return;
    }

    const updateNextChild = () => {
      let result = Children.toArray(this.props.children)[0];
      if (result.key === nextChild.key) nextChild = result;
    };

    psetState({
      height: this._root.scrollHeight,
      curChild: nextChild,
      wrappedChildren: [
        <div key={prevChild.key} className="mf-fader-child fade in">{prevChild}</div>,
        <div key={nextChild.key} className="mf-fader-child next-child fade">
          {cloneElement(nextChild, {ref: c => this._nextChildContent = findDOMNode(c)})}
        </div>,
      ],
    })
    .then(() => {
      updateNextChild();
      return psetState({
        height: this._nextChildContent.scrollHeight,
        curChild: nextChild,
        wrappedChildren: [
          <div key={prevChild.key} className="mf-fader-child fade leaving">{prevChild}</div>,
          <div key={nextChild.key} className="mf-fader-child fade in entering" 
               ref={c => this._nextChild = c}>{nextChild}</div>,
        ],
      });
    })
    .then(() => {
      let timeout = Math.max(getTimeout(this._root) || 0, getTimeout(this._nextChild) || 0);
      return Promise.resolve().delay(timeout);
    })
    .then(() => {
      updateNextChild();
      return psetState({
        height: undefined,
        wrappedChildren: [
          <div key={nextChild.key} className="mf-fader-child fade">{nextChild}</div>,
        ],
      });
    })
    // check if child has changed again
    .then(this.doTransition);
  }

  render() {
    let {className} = this.props;
    let {height, wrappedChildren} = this.state;

    className = classNames(className, 'mf-fader', {transitioning: height !== undefined});

    return <div {...this.props} ref={c => this._root = c} className={className} style={height !== undefined ? {height} : {}}>
      {wrappedChildren}
    </div>;
  }
}
