'use strict';

import React from 'react';
import {addons} from 'react/addons';
import classNames from 'classnames';
import _ from 'lodash';

require('./HBar.sass');

function easeOut(f) {
  var r = 1 - f;
  return 1 - r * r;
}

export default React.createClass({
  propTypes: {
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    value: React.PropTypes.number,
    transitionFps: React.PropTypes.number,
    transitionDuration: React.PropTypes.number
  },
  getDefaultProps() {
    return {
      transitionPeriod: 15,
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
    if (this.isMounted()) {
      this.forceUpdate();
    }
  },
  getTransitionValue() {
    if (!this.state.transitionStartMillis) {
      this.stopTransition();
      return this.props.value;
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
  getTransitionOpacity() {
    if (!this.state.transitionStartMillis) {
      this.stopTransition();
      return isNaN(this.props.value) ? 0 : 1;
    }

    var lastOpacity = isNaN(this.state.lastValue) ? 0 : 1;
    var nextOpacity = isNaN(this.state.nextValue) ? 0 : 1;

    var elapsed = Date.now() - this.state.transitionStartMillis;
    if (elapsed >= this.props.transitionDuration) {
      this.stopTransition();
      return nextOpacity;
    }

    var f = elapsed / this.props.transitionDuration;
    return lastOpacity * (1 - f) + nextOpacity * f;
  },
  componentWillUnmount() {
    this.stopTransition();
  },
  render() {
    var props = _.clone(this.props);
    var min = props.min,
        max = props.max,
        value = this.getTransitionValue(),
        opacity = this.getTransitionOpacity();

    props.className = classNames('hbar', props.className);
    for (let prop in this.propTypes) {
      delete props[prop];
    }

    var zeroX = -min * 100 / (max - min);
    var valueX = (value - min) * 100 / (max - min);

    var left = Math.max(0, Math.min(zeroX, valueX));
    var right = Math.min(100, Math.max(zeroX, valueX));

    return (
      <div {...props}>
        <div key="alarm-overlay" className="alarm-overlay" />
        <div key="fill" className="fill"
          style={{
            opacity: opacity,
            left: left + '%',
            right: (100 - right) + '%'
          }} />
      </div>
    );
  }
});