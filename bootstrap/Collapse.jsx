import React from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import callOnTransitionEnd from '../transition/callOnTransitionEnd'
import setStateChain from '../utils/setStateChain'

import {getTimeout} from '../transition/callOnTransitionEnd'

import {TICK} from '../transition/animConstants'

import './Collapse.sass'

export default React.createClass({
  callOnTransitionEnd,
  propTypes: {
    component: React.PropTypes.any,
    open: React.PropTypes.bool,
    keepChildrenMounted: React.PropTypes.bool,
    onTransitionEnd: React.PropTypes.func,
  },
  getDefaultProps() {
    return {
      component: 'div',
      keepChildrenMounted: false,
      onTransitionEnd: function() {},
    }
  },
  getInitialState() {
    return {
      open: !!this.props.open,
      collapsing: false,
      height: undefined,
    }
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.open && !this.props.open) {
      this.doTransition(true)
    }
    if (!nextProps.open && this.props.open) {
      this.doTransition(false)
    }
  },
  doTransition(nextOpen = this._open) {
    let {open} = this.state

    if (this._open === nextOpen) {
      return
    }
    this._open = nextOpen
    this._transitioning = true

    if (this._currentTransition) {
      this._currentTransition.cancel()
    }

    let sequence = [
      callback => {
        this._collapse.offsetHeight // force reflow
        return {height: open ? this._collapse.scrollHeight : 0}
      },
      callback => ({collapsing: true, open: nextOpen}),
      callback => {
        this._collapse.offsetHeight // force reflow
        return {height: nextOpen ? this._collapse.scrollHeight : 0}
      },
      callback => setTimeout(callback, Math.max(TICK, getTimeout(this._collapse) || 0)),
      callback => ({collapsing: false}),
      callback => ({height: undefined}),
    ]

    this._currentTransition = setStateChain(this, sequence, (err) => {
      this._transitioning = false
      this.props.onTransitionEnd()
    })
  },
  show() {
    if (this.props.open === undefined) {
      this.doTransition(true)
    }
  },
  hide() {
    if (this.props.open === undefined) {
      this.doTransition(false)
    }
  },
  toggle() {
    if (this.props.open === undefined) {
      this.doTransition(!this._open)
    }
  },
  render() {
    var {component, className, children, keepChildrenMounted, ...props} = this.props
    var {open, collapsing, height} = this.state
    props.className = classNames(className, {
      collapse: !collapsing,
      'in': open && !collapsing,
      collapsing: collapsing,
      expanding: open && collapsing,
    })
    if (height !== undefined) {
      if (!props.style) props.style = {}
      props.style.height = height
    }
    props.ref = c => this._collapse = c
    props['aria-expanded'] = open

    return React.createElement(component, props, open || height !== undefined || keepChildrenMounted ? children : undefined)
  },
})
