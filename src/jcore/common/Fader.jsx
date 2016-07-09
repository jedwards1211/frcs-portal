import React, {Component, PropTypes, Children} from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import TransitionContext from 'react-transition-context'

import setStateChain from '../utils/setStateChain'
import {getTimeout} from '../transition/callOnTransitionEnd'

import {TICK} from '../transition/animConstants'

import './Fader.sass'

export default class Fader extends Component {
  static propTypes = {
    children:         PropTypes.any,
    onTransitionEnd:  PropTypes.func,
    transitionHeight: PropTypes.bool,
  };
  static defaultProps = {
    onTransitionEnd() {},
    children:         <span />,
  };

  constructor(props) {
    super(props)
    let curChild = Children.only(props.children)
    this.state = {
      curChild,
      wrappedChildren: [
        <TransitionContext transitionState="in" key={curChild.key}>
          <div className="fade in">{curChild}</div>
        </TransitionContext>
      ]
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      this.doTransition(nextProps)
    }
  }
  componentWillMount() {
    this._mounted = true
  }
  componentDidMount() {
    let child = Children.only(this.props.children)
    if (child && child.componentDidAppear) {
      child.componentDidAppear()
    }
  }
  componentWillUnmount() {
    this._mounted = false
  }
  isMounted() {
    return this._mounted
  }

  doTransition = (props = this.props) => {
    const {transitionHeight} = props
    let {state: {curChild: prevChild}} = this
    let nextChild = Children.only(props.children)

    if (nextChild.key === prevChild.key) {
      if (nextChild !== prevChild) {
        this.setState({
          curChild: nextChild,
          wrappedChildren: this.state.wrappedChildren.map(child => {
            if (child.key !== nextChild.key) return child
            return <TransitionContext {...child.props} key={nextChild.key}>
              <div {...child.props.children.props}>{nextChild}</div>
            </TransitionContext>
          }),
        })
      }
      return false
    }
    else if (this._transitioning) {
      return false
    }
    this._transitioning = true

    const getNextChild = () => {
      let result = Children.only(this.props.children)
      return result.key === nextChild.key ? result : nextChild
    }

    let heightTransitionEnd

    let sequence = [
      transitionHeight && (cb => ({height: this._root.scrollHeight, curChild: nextChild}),
      cb => {
        let nextChild = getNextChild()
        return {
          transitioning: true,
          curChild: nextChild,
          wrappedChildren:  [
            <TransitionContext transitionState="in" key={prevChild.key}>
              <div className="fade in">{prevChild}</div>
            </TransitionContext>,
            <TransitionContext transitionState="out" key={nextChild.key}>
              <div className="next-child fade" ref={c => this._nextChild = c}>{nextChild}</div>
            </TransitionContext>
          ],
        }
      }),
      cb => {
        let nextChild = getNextChild()
        heightTransitionEnd = Date.now() + Math.max(TICK, getTimeout(this._root) || 0)
        return {
          height:           transitionHeight ? this._nextChild.scrollHeight : undefined,
          curChild:         nextChild,
          wrappedChildren:  [
            <TransitionContext transitionState="leaving" key={prevChild.key}>
              <div className="fade leaving" ref={c => this._prevChild = c}>{prevChild}</div>
            </TransitionContext>,
            <TransitionContext transitionState="out" key={nextChild.key}>
              <div className="fade">{nextChild}</div>
            </TransitionContext>
          ],
        }
      },
      cb => setTimeout(cb, Math.max(TICK, getTimeout(this._prevChild) || 0)),
      cb => {
        let nextChild = getNextChild()
        return {
          curChild:         nextChild,
          wrappedChildren:  [
            <TransitionContext transitionState="entering" key={nextChild.key}>
              <div className="fade in entering" ref={c => this._nextChild = c}>{nextChild}</div>
            </TransitionContext>
          ],
        }
      },
      transitionHeight && (cb => setTimeout(cb,
        Math.max(TICK, heightTransitionEnd - Date.now(), getTimeout(this._nextChild) || 0))),
      cb => {
        let nextChild = getNextChild()
        return {
          transitioning:    false,
          wrappedChildren:  [
            <TransitionContext transitionState="in" key={nextChild.key}>
              <div className="fade in">{nextChild}</div>
            </TransitionContext>
          ],
        }
      },
      transitionHeight && (cb => {
        let nextChild = getNextChild()
        return {
          height:           undefined,
          wrappedChildren:  [
            <TransitionContext transitionState="in" key={nextChild.key}>
              <div className="fade in">{nextChild}</div>
            </TransitionContext>
          ],
        }
      }),
    ]

    setStateChain(this, _.compact(sequence), err => {
      this._transitioning = false
      if (!this.doTransition()) {
        let nextChild = getNextChild()
        if (nextChild && nextChild.componentDidEnter) {
          nextChild.componentDidEnter()
        }
        this.props.onTransitionEnd()
      }
    })
    return true
  };

  render() {
    let Comp = this.props.component || 'div'
    let {style} = this.props
    let {transitioning, height, wrappedChildren} = this.state
    let className = classNames(this.props.className, 'mf-fader', {transitioning})

    if (height) {
      style = Object.assign({}, style, {height})
    }

    return <Comp {...this.props} ref={c => this._root = c} className={className} style={style}>
      {wrappedChildren}
    </Comp>
  }
}
