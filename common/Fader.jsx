import React, {Component, PropTypes, Children, cloneElement} from 'react';
import {findDOMNode} from 'react-dom';
import classNames from 'classnames';

import {getTimeout} from '../transition/callOnTransitionEnd';

import './Fader.sass';

export default class Fader extends Component {
  static propTypes = {
    children: PropTypes.any,
  }
  static defaultProps = {
    children: <span/>,
  }

  constructor(props) {
    super(props);
    let curChild = Children.only(props.children);
    this.state = {
      curChild,
      wrappedChildren: [<div className="fade in" key={curChild.key}>{curChild}</div>],
    };
  }

  componentWillMount() {
    this._mounted = true;
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      this.doTransition(nextProps);
    }
  }
  componentWillUnmount() {
    this._mounted = false;
  }

  doTransition = (props = this.props) => {
    let {state: {height, curChild: prevChild}} = this;
    let nextChild = Children.only(props.children);

    if (nextChild.key === prevChild.key) {
      if (nextChild !== prevChild) {
        this.setState({
          curChild: nextChild,
          wrappedChildren: this.state.wrappedChildren.map(child => {
            if (child.key !== nextChild.key) return child;
            return <div {...child.props} key={nextChild.key}>{nextChild}</div>;
          }),
        });
      }
      return;
    }
    else if (height !== undefined) {
      return;
    }

    const getNextChild = () => {
      let result = Children.only(this.props.children);
      return result.key === nextChild.key ? result : nextChild;
    };

    let heightTransitionEnd;

    let sequence = [
      callback => this.setState({
        transitioning:    true,
        height:           this._root.scrollHeight,
        curChild:         nextChild,
        wrappedChildren:  [
          <div key={prevChild.key} className="fade in">{prevChild}</div>,
          <div key={nextChild.key} className="next-child fade">
            {cloneElement(nextChild, {ref: c => this._nextChildContent = findDOMNode(c)})}
          </div>,
        ],
      }, callback),
      callback => {
        heightTransitionEnd = Date.now() + getTimeout(this._root) || 0;
        let nextChild = getNextChild();
        this.setState({
          height:           this._nextChildContent.scrollHeight,
          curChild:         nextChild,
          wrappedChildren:  [
            <div key={prevChild.key} className="fade leaving" 
                 ref={c => this._prevChild = c}>{prevChild}</div>,
            <div key={nextChild.key} className="fade">{nextChild}</div>,
          ],
        }, callback);
      },
      callback => setTimeout(callback, getTimeout(this._prevChild) || 0),
      callback => {
        let nextChild = getNextChild();
        this.setState({
          curChild:         nextChild,
          wrappedChildren:  [
            <div key={nextChild.key} className="fade in entering" 
                 ref={c => this._nextChild = c}>{nextChild}</div>,
          ],
        }, callback);
      },
      callback => setTimeout(callback, 
        Math.max(heightTransitionEnd - Date.now(), getTimeout(this._nextChild) || 0)),
      callback => {
        let nextChild = getNextChild();
        this.setState({
          transitioning:    false,
          height:           undefined,
          wrappedChildren:  [
            <div key={nextChild.key} className="fade in">{nextChild}</div>,
          ],
        }, callback);
      },
    ];

    sequence.reduceRight((cb, fn) => () => this._mounted && fn(cb), this.doTransition)();
  }

  render() {
    let {transitioning, height, wrappedChildren} = this.state;
    let className = classNames(this.props.className, 'mf-fader', {transitioning});

    return <div {...this.props} ref={c => this._root = c} className={className} 
            style={transitioning ? {height} : {}}>
      {wrappedChildren}
    </div>;
  }
}
