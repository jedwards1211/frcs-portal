'use strict';

import React from 'react';

function easeOut(f) {
  var r = 1 - f;
  return 1 - r * r;
}

export default {
  propTypes: {
    value: React.PropTypes.number,
    transitionPeriod: React.PropTypes.number,
    transitionDuration: React.PropTypes.number,
  },
  getDefaultProps() {
    return {
      transitionPeriod: 20,
      transitionDuration: 200
    };
  },
  getInitialState() {
    return {
      lastValue: undefined,
      value: this.props.value,
      transitionStartMillis: undefined
    };
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      var lastValue = this.getTransitionValue();
      this.setState({
        lastValue: lastValue,
        nextValue: nextProps.value,
        transitionStartMillis: Date.now()
      }, this.resetTransition);
    }
  },
  resetTransition() {
    if (!this.interval) {
      this.interval = setInterval(this.onInterval, this.props.transitionPeriod); 
    }
  },
  stopTransition() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  },
  onInterval() {
    this.forceUpdate();
  },
  getTransitionValue() {
    if (!this.state.transitionStartMillis) {
      this.stopTransition();
      return this.props.value || 0;
    }

    var lastValue = this.state.lastValue || 0;
    var nextValue = this.state.nextValue || 0;

    var elapsed = Date.now() - this.state.transitionStartMillis;
    if (elapsed >= this.props.transitionDuration) {
      this.stopTransition();
      return nextValue;
    }

    var f = easeOut(elapsed / this.props.transitionDuration);
    return lastValue * (1 - f) + nextValue * f;
  },
  componentWillUnmount() {
    this.stopTransition();
  }  
};