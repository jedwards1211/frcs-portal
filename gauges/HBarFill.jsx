'use strict';

import React from 'react';
import ValueFillMixin from './ValueFillMixin';

export default React.createClass({
  mixins: [ValueFillMixin],
  propTypes: {
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    min: React.PropTypes.number,
    max: React.PropTypes.number,
  },
  render() {
    function validNumbers() {
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (!isFinite(arg) || !(arg >= 0)) return false;
      } 
      return true;
    }

    var {min, max, x, y, width, height, ...restProps} = this.props;
    var value = this.getTransitionValue();

    if (min === max && value === min && !isNaN(min) && min !== null && isFinite(min)) {
      return <rect ref="fill" x={x} y={y} width={width} height={height} {...restProps} />; 
    }

    var zeroX = -min * width / (max - min);
    var valueX = (value - min) * width / (max - min);

    var x0 = Math.max(0, Math.min(zeroX, valueX));
    var x1 = Math.min(width, Math.max(zeroX, valueX));

    x += x0;
    width = x1 - x0;

    if (validNumbers(x, width)) {
      return <rect ref="fill" x={x} y={y} width={width} height={height} {...restProps} />;
    }
    return <rect />;
  }
});