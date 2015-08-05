'use strict';

import React from 'react';
import {addons} from 'react/addons';
import {addEventListener, removeEventListener} from './prefixedEvent';

require('./PageSlider.sass');

/**
 * A simple page slider.  All of the children you provide to it are laid out horizontally,
 * each wrapped in a div with the same width as the PageSlider, and whenever you change
 * props.activeIndex, it translates with animation to the child at that index.
 */
export default React.createClass({
  mixins: [addons.PureRenderMixin],
  getInitialState() {
    return {
      transitioning: false
    };
  },
  componentDidMount() {
    this.onTransitionStart = () => this.setState({transitioning: true});
    this.onTransitionEnd = () => this.setState({transitioning: false});
    var viewport = React.findDOMNode(this.refs.viewport);
    addEventListener(viewport, 'TransitionStart', this.onTransitionStart);
    addEventListener(viewport, 'TransitionEnd', this.onTransitionEnd);
  },
  componentWillUnmount() {
    var viewport = React.findDOMNode(this.refs.viewport);
    removeEventListener(viewport, 'TransitionStart', this.onTransitionStart);
    removeEventListener(viewport, 'TransitionEnd', this.onTransitionEnd);
  },
  wrapChild(child, index) {
    var maxHeight;
    if (!this.state.transitioning && index !== this.props.activeIndex) {
      maxHeight = 0;
    }
    return (
      <div key={index} ref={'child-' + index} style={{maxHeight: maxHeight}}>{child}</div>
    );
  },
  render() {
    var transform = 'translateX(' + (-this.props.activeIndex * 100) + '%)';

    return (
      <div ref="pageSlider" className="PageSlider" {...this.props}>
        <div 
          className="viewport" 
          ref="viewport" 
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
      </div>
    );
  }
});