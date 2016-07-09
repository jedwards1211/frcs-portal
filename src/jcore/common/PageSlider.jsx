import React, {Component, PropTypes} from 'react'
import classNames from 'classnames'
import {shouldComponentUpdate as shouldPureComponentUpdate} from 'react-addons-pure-render-mixin'
import _ from 'lodash'
import TransitionContext from 'react-transition-context'

import propAssign from '../utils/propAssign'
import setStateChain from '../utils/setStateChain'
import paddingHeight from '../utils/paddingHeight'
import {getTimeout} from '../transition/callOnTransitionEnd'

import {TICK} from '../transition/animConstants'

import './PageSlider.sass'

/**
 * A simple page slider.  All of the children you provide to it are laid out horizontally,
 * each wrapped in a div with the same width as the PageSlider, and whenever you change
 * props.activeIndex, it translates with animation to the child at that index.
 */
export default class PageSlider extends Component {
  shouldComponentUpdate = shouldPureComponentUpdate;
  static propTypes = {
    activeIndex:            PropTypes.number.isRequired,
    transitionDuration:     PropTypes.number,
    restrictMaxHeight:      PropTypes.bool,
    useAbsolutePositioning: PropTypes.bool,
    onTransitionEnd:        PropTypes.func,
    transitionHeight:       PropTypes.bool,
  };;
  static defaultProps = {
    onTransitionEnd() {},
    transitionDuration: 200,
    transitionHeight: true,
    restrictMaxHeight: false,
  };;
  constructor(props) {
    super(props)
    this.state = {
      activeIndex: props.activeIndex,
      transitioning: false
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.activeIndex !== nextProps.activeIndex) {
      this.doTransition(nextProps.activeIndex)
    }
  }
  _wrappers = [];
  _childRefs = [];
  componentWillMount() {
    this._mounted = true
  }
  componentWillUnmount() {
    this._mounted = false
  }
  isMounted() {
    return this._mounted
  }
  componentDidMount() {
    this.componentDidAppear()
  }
  componentDidAppear() {
    let {activeIndex} = this.state
    let child = this._childRefs[activeIndex]
    if (child && child.componentDidAppear) child.componentDidAppear()
  }
  componentDidEnter() {
    let {activeIndex} = this.state
    let child = this._childRefs[activeIndex]
    if (child && child.componentDidEnter) child.componentDidEnter()
  }
  componentDidLeave() {
    let {activeIndex} = this.state
    let child = this._childRefs[activeIndex]
    if (child && child.componentDidLeave) child.componentDidLeave()
  }
  doTransition = (nextActiveIndex = this.props.activeIndex) => {
    let {state: {activeIndex}, props: {transitionHeight}} = this

    if (nextActiveIndex === activeIndex || this._transitioning) return false
    this._lastActiveIndex = activeIndex
    this._transitioning = true

    const leavingChild = this._childRefs[activeIndex]

    let sequence = _.compact([
      transitionHeight && (cb => ({height: this._viewport.scrollHeight + paddingHeight(this._root)})),
      cb => ({transitioning: true}),
      cb => {
        let nextState = {activeIndex: nextActiveIndex}
        let wrapper = this._wrappers[nextActiveIndex]
        if (transitionHeight && wrapper) {
          nextState.height = wrapper.scrollHeight + paddingHeight(this._root)
        }
        return nextState
      },
      cb => setTimeout(cb, Math.max(TICK, getTimeout(this._viewport) || 0, getTimeout(this._root) || 0)),
      cb => ({transitioning: false}),
      transitionHeight && (cb => ({height: undefined})),
    ])

    setStateChain(this, sequence, err => {
      this._transitioning = false
      if (!this.doTransition()) {
        if (leavingChild && leavingChild.componentDidLeave) leavingChild.componentDidLeave()
        let child = this._childRefs[nextActiveIndex]
        if (child && child.componentDidEnter) child.componentDidEnter()
        this.props.onTransitionEnd()
      }
    })
    return true
  };
  wrapChild = (child, index) => {
    if (!child) return child
    let {state: {transitioning, activeIndex}, props: {transitionHeight}} = this

    let style = {}
    if (this.props.useAbsolutePositioning) {
      style.left = (index * 100) + '%'
    }

    if (!transitioning && index !== activeIndex) {
      style.visibility = 'hidden'
      if (transitionHeight) {
        style.height = 0
      }
    }

    const origRef = child.ref
    const ref = c => {
      if (origRef instanceof Function) origRef(c)
      this._childRefs[index] = c
    }

    let transitionState
    if (transitioning) {
      if (index === activeIndex) transitionState = 'entering'
      else if (index === this._lastActiveIndex) transitionState = 'leaving'
      else transitionState = 'out'
    }
    else {
      transitionState = index === activeIndex ? 'in' : 'out'
    }

    return (
      <TransitionContext transitionState={transitionState}>
        <div key={index} ref={c => this._wrappers[index] = c} style={style}>
          {React.cloneElement(child, {ref})}
        </div>
      </TransitionContext>
    )
  };
  render() {
    var {className, style} = this.props
    var {height, transitioning, activeIndex} = this.state

    var transform = 'translateX(' + (-activeIndex * 100) + '%)'

    className = classNames(className, 'mf-page-slider', {transitioning})

    style = propAssign(style, {height})

    return <div {...this.props} ref={c => this._root = c} className={className} style={style}>
      <div
          className="viewport"
          ref={c => this._viewport = c}
          style={{
            'WebkitTransform': transform,
            'KhtmlTransform': transform,
            'MozTransform': transform,
            'msTransform': transform,
            'OTransform': transform,
            'transform': transform,
          }}
      >
        {React.Children.map(this.props.children, this.wrapChild)}
      </div>
    </div>
  }
}