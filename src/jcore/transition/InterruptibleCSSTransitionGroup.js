import React, {Component, PropTypes} from 'react'
import {findDOMNode} from 'react-dom'
import InterruptibleTransitionGroup from './InterruptibleTransitionGroup'

import CSSCore from 'fbjs/lib/CSSCore'
import callOnTransitionEnd from '../transition/callOnTransitionEnd'
import setStateChain from '../utils/setStateChain'

import {TICK} from './animConstants'

class ChildWrapper extends Component {
  static propTypes = {
    name: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        enter:        PropTypes.string,
        leave:        PropTypes.string,
        active:       PropTypes.string
      }),
      PropTypes.shape({
        enter:        PropTypes.string,
        enterActive:  PropTypes.string,
        leave:        PropTypes.string,
        leaveActive:  PropTypes.string,
        appear:       PropTypes.string,
        appearActive: PropTypes.string
      })
    ]).isRequired,
    appear: PropTypes.bool,
    enter:  PropTypes.bool,
    leave:  PropTypes.bool,
  };
  doTransition(type, done) {
    if (!this.props[type]) return done()

    if (this._cancelTransition) {
      this._cancelTransition()
    }

    const className = this.props.name[type] || this.props.name + '-' + type
    const activeClassName = this.props.name[type + 'Active'] || className + '-active'

    const sequence = [
      cb => {
        CSSCore.addClass(this._root, className)
        setTimeout(cb, TICK)
      },
      cb => {
        CSSCore.addClass(this._root, activeClassName)
        callOnTransitionEnd(this._root, cb)
      },
      cb => {
        CSSCore.removeClass(this._root, className)
        CSSCore.removeClass(this._root, activeClassName)
        this._cancelTransition = undefined
        cb()
      },
    ]

    const {cancel} = setStateChain(this, sequence, done)

    this._cancelTransition = () => {
      this._cancelTransition = undefined
      CSSCore.removeClass(this._root, className)
      CSSCore.removeClass(this._root, activeClassName)
      cancel()
    }
  }
  isMounted() {
    return this._mounted
  }
  componentWillMount() {
    this._mounted = true
  }
  componentWillUnmount() {
    this._mounted = false
    if (this._cancelTransition) {
      this._cancelTransition()
    }
  }
  componentWillAppear(done) { this.doTransition('appear', done) }
  componentWillEnter (done) { this.doTransition('enter', done) }
  componentWillLeave (done) { this.doTransition('leave', done) }

  render() {
    let child = this.props.children
    let ref = c => {
      if (child.ref instanceof Function) child.ref(c)
      this._root = findDOMNode(c)
    }
    return React.cloneElement(child, {ref})
  }
}

export default class InterruptibleCSSTransitionGroup extends Component {
  static propTypes = {
    transitionName:   ChildWrapper.propTypes.name,
    transitionAppear: PropTypes.bool,
    transitionEnter:  PropTypes.bool,
    transitionLeave:  PropTypes.bool,
  };
  static defaultProps = {
    transitionAppear: false,
    transitionEnter:  true,
    transitionLeave:  true
  };
  wrapChild = child => {
    let {transitionName: name, transitionAppear: appear, transitionEnter: enter,
        transitionLeave: leave} = this.props
    return <ChildWrapper key={child.key} name={child.props.transitionName || name}
        appear={appear} enter={enter} leave={leave}
           >
      {child}
    </ChildWrapper>
  };
  render() {
    return <InterruptibleTransitionGroup {...this.props} childFactory={this.wrapChild} />
  }
}
