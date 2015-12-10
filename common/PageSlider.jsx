import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import {shouldComponentUpdate as shouldPureComponentUpdate} from 'react-addons-pure-render-mixin';
import _ from 'lodash';

import propAssign from '../utils/propAssign';
import setStateChain from '../utils/setStateChain';
import {getTimeout} from '../transition/callOnTransitionEnd';

import './PageSlider.sass';

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
  }
  static defaultProps = {
    onTransitionEnd() {},
    transitionDuration: 200,
    transitionHeight: true,
    restrictMaxHeight: false,
  }
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: props.activeIndex,
      transitioning: false
    };
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.activeIndex !== nextProps.activeIndex) {
      this.doTransition(nextProps.activeIndex);
    }
  }
  componentWillMount() {
    this._mounted = true;
    this._wrappers = [];
    this._childRefs = [];
  }
  componentWillUnmount() {
    this._mounted = false;
  }
  isMounted() {
    return this._mounted;
  }
  componentDidMount() {
    let child = this._childRefs[this.props.activeIndex];
    if (child && child.componentDidAppear) child.componentDidAppear();
  }
  doTransition = (nextActiveIndex = this.props.activeIndex) => {
    let {state: {activeIndex, transitioning}, props: {transitionHeight}} = this;

    if (nextActiveIndex === activeIndex || transitioning) return false;

    let sequence = _.compact([
      transitionHeight && (cb => ({height: this._viewport.scrollHeight})),
      cb => ({transitioning: true}),
      cb => {
        let nextState = {activeIndex: nextActiveIndex};
        let wrapper = this._wrappers[nextActiveIndex];
        if (transitionHeight && wrapper) {
          nextState.height = wrapper.scrollHeight;
        }
        return nextState;
      },
      cb => setTimeout(cb, Math.max(getTimeout(this._viewport) || 0, getTimeout(this._root) || 0)),
      cb => ({transitioning: false}),
      transitionHeight && (cb => ({height: undefined})),
      cb => {
        if (!this.doTransition()) {
          let child = this._childRefs[nextActiveIndex];
          if (child && child.componentDidEnter) child.componentDidEnter();
          this.props.onTransitionEnd();
        }
      },
    ]);

    setStateChain(this, ...sequence);
    return true;
  }
  wrapChild = (child, index) => {
    if (!child) return child;
    let {state: {transitioning, activeIndex}, props: {transitionHeight}} = this;

    var style = child.props.style;
    if (this.props.useAbsolutePositioning) {
      style = propAssign(style, {left: (index * 100) + '%'});
    }

    if (!transitioning && index !== activeIndex) {
      style = propAssign(style, {visibility: 'hidden'});
      if (transitionHeight) {
        style.height = 0;
      }
    }

    return <div key={index} ref={c => this._wrappers[index] = c} style={style}>
      {React.cloneElement(child, {ref: c => this._childRefs[index] = c})}
    </div>;
  }
  render() {
    var {className, style} = this.props;
    var {height, transitioning, activeIndex} = this.state;

    var transform = 'translateX(' + (-activeIndex * 100) + '%)';

    className = classNames(className, 'mf-page-slider', {transitioning});

    style = propAssign(style, {height});

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
        }}>
        {React.Children.map(this.props.children, this.wrapChild)}
      </div>
    </div>;
  }
}
