import React, {Component, PropTypes, Children} from 'react';
import classNames from 'classnames';

import setStateChain from '../utils/setStateChain';
import {getTimeout} from '../transition/callOnTransitionEnd';

import './Fader.sass';

export default class Fader extends Component {
  static propTypes = {
    children:         PropTypes.any,
    onTransitionEnd:  PropTypes.func,
  }
  static defaultProps = {
    onTransitionEnd() {},
    children:         <span/>,
  }

  constructor(props) {
    super(props);
    let curChild = Children.only(props.children);
    this.state = {
      curChild,
      wrappedChildren: [<div className="fade in" key={curChild.key}>{curChild}</div>],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      this.doTransition(nextProps);
    }
  }
  componentWillMount() {
    this._mounted = true;
  }
  componentDidMount() {
    let child = Children.only(this.props.children);
    if (child && child.componentDidAppear) {
      child.componentDidAppear();
    }
  }
  componentWillUnmount() {
    this._mounted = false;
  }
  isMounted() {
    return this._mounted;
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
      return false;
    }
    else if (this._transitioning) {
      return false;
    }
    this._transitioning = true;

    const getNextChild = () => {
      let result = Children.only(this.props.children);
      return result.key === nextChild.key ? result : nextChild;
    };

    let heightTransitionEnd;

    let sequence = [
      cb => ({height: this._root.scrollHeight, curChild: nextChild}),
      cb => {
        let nextChild = getNextChild();
        return {
          transitioning: true,
          curChild: nextChild,
          wrappedChildren:  [
            <div key={prevChild.key} className="fade in">{prevChild}</div>,
            <div key={nextChild.key} className="next-child fade" ref={c => this._nextChild = c}>
              {nextChild}
            </div>,
          ],
        };
      },
      cb => {
        let nextChild = getNextChild();
        heightTransitionEnd = Date.now() + getTimeout(this._root) || 0;
        return {
          height:           this._nextChild.scrollHeight,
          curChild:         nextChild,
          wrappedChildren:  [
            <div key={prevChild.key} className="fade leaving" 
                 ref={c => this._prevChild = c}>{prevChild}</div>,
            <div key={nextChild.key} className="fade">{nextChild}</div>,
          ],
        };
      },
      cb => setTimeout(cb, getTimeout(this._prevChild) || 0),
      cb => {
        let nextChild = getNextChild();
        return {
          curChild:         nextChild,
          wrappedChildren:  [
            <div key={nextChild.key} className="fade in entering" 
                 ref={c => this._nextChild = c}>{nextChild}</div>,
          ],
        };
      },
      cb => setTimeout(cb, 
        Math.max(heightTransitionEnd - Date.now(), getTimeout(this._nextChild) || 0)),
      cb => {
        let nextChild = getNextChild();
        return {
          transitioning:    false,
          wrappedChildren:  [
            <div key={nextChild.key} className="fade in">{nextChild}</div>,
          ],
        };
      },
      cb => {
        let nextChild = getNextChild();
        return {
          height:           undefined,
          wrappedChildren:  [
            <div key={nextChild.key} className="fade in">{nextChild}</div>,
          ],
        };
      },
    ];

    setStateChain(this, sequence, err => {
      this._transitioning = false;
      if (!this.doTransition()) {
        let nextChild = getNextChild();
        if (nextChild && nextChild.componentDidEnter) {
          nextChild.componentDidEnter();
        }
        this.props.onTransitionEnd();
      }
    });
    return true;
  }

  render() {
    let {transitioning, height, wrappedChildren} = this.state;
    let className = classNames(this.props.className, 'mf-fader', {transitioning});

    return <div {...this.props} ref={c => this._root = c} className={className} 
            style={height ? {height} : {}}>
      {wrappedChildren}
    </div>;
  }
}
