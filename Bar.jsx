'use strict';

import React from 'react';
import {addons} from 'react/addons';
import classNames from 'classnames';
import _ from 'lodash';

import {easeOut} from './timingFn';

import {Side, sides} from './orient';

require('./Bar.sass');

export default React.createClass({
  propTypes: {
    // a field from orient.Side
    minSide: React.PropTypes.instanceOf(Side),
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    value: React.PropTypes.number,
    transitionFps: React.PropTypes.number,
    transitionDuration: React.PropTypes.number
  },
  getDefaultProps() {
    return {
      minSide: sides.left,
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
    var {minSide, min, max, children} = this.props,
        value = this.getTransitionValue(),
        opacity = this.getTransitionOpacity();

    var zeroPct = -min * 100 / (max - min);
    var valuePct = (value - min) * 100 / (max - min);

    var minPct = Math.max(0, Math.min(zeroPct, valuePct));
    var maxPct = Math.min(100, Math.max(zeroPct, valuePct));

    return (
      <div {...this.props} className={classNames('bar', this.props.className)}>
        <div className="fill"
          style={{
            opacity: opacity,
            [minSide.name]: minPct + '%',
            [minSide.opposite.name]: (100 - maxPct) + '%',
            [minSide.axis.opposite.loSide.name]: 0,
            [minSide.axis.opposite.hiSide.name]: 0,
          }} />
        {children}
      </div>
    );
  }
});