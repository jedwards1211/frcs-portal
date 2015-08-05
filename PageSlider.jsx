'use strict';

import React from 'react';
import {addons} from 'react/addons';
import {addEventListener, removeEventListener} from './prefixedEvent';
import _ from 'lodash';

require('./PageSlider.sass');

/**
 * A simple page slider.  All of the children you provide to it are laid out horizontally,
 * each wrapped in a div with the same width as the PageSlider, and whenever you change
 * props.activeIndex, it translates with animation to the child at that index.
 */
export default React.createClass({
  mixins: [addons.PureRenderMixin],
  propTypes: {
    transitionDuration: React.PropTypes.number,
  },
  getDefaultProps() {
    return {
      transitionDuration: 200,
    };
  },
  getInitialState() {
    return {
      transitioning: false
    };
  },
  componentWillReceiveProps(nextProps) {
    if (this.props.activeIndex !== nextProps.activeIndex) {
      clearTimeout(this.timeout);
      this.setState({transitioning: true});
      this.timeout = setTimeout(() => this.setState({transitioning: false}), nextProps.transitionDuration);
    }
  },
  componentDidMount() {
    this.componentDidUpdate();
  },
  componentDidUpdate() {
    if (this.isMounted()) {
      var activeElement = React.findDOMNode(this.refs['child-' + this.props.activeIndex]);
      if (activeElement && this.state.height !== activeElement.scrollHeight) {
        this.setState({height: activeElement.scrollHeight});
      }
    }
  },
  wrapChild(child, index) {
    return (
      <div key={index} ref={'child-' + index}>{child}</div>
    );
  },
  render() {
    var {activeIndex, transitionDuration, style} = this.props;
    var {height} = this.state;

    var transform = 'translateX(' + (-this.props.activeIndex * 100) + '%)';

    var transition = 'all ease-out ' + (transitionDuration / 1000) + 's';

    var style = _.assign({}, style, {
      maxHeight: height,
    });

    return (
      <div ref="pageSlider" className="PageSlider" {...this.props} style={style}>
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
            'WebkitTransition': transition,
            'KhtmlTransition': transition,
            'MozTransition': transition,
            'msTransition': transition,
            'OTransition': transition,
            'transition': transition,
          }}>
          {React.Children.map(this.props.children, this.wrapChild)}
        </div>
      </div>
    );
  }
});