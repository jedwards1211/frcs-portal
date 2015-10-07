'use strict';

import React from 'react';
import arcPath from '../arcPath';
import ValueFillMixin from './ValueFillMixin';

export default React.createClass({
  mixins: [ValueFillMixin],
  propTypes: {
    minAngle: React.PropTypes.number.isRequired,
    angularSpan: React.PropTypes.number.isRequired,
    center: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    radius: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    thickness: React.PropTypes.number.isRequired,
    min: React.PropTypes.number,
    max: React.PropTypes.number,
  },
  render() {
    function validNumbers() {
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (isNaN(arg) || !isFinite(arg) || arg === null) return false;
      } 
      return true;
    }

    var {min, max, minAngle, angularSpan,
        center, radius, thickness, ...restProps} = this.props;

    var value = this.getTransitionValue();

    if (min === max && value === min && !isNaN(min) && min !== null && isFinite(min)) {
      return <path {...restProps} d={arcPath(center, radius, thickness, minAngle, angularSpan)} />;
    }

    if (min > max) {
      var swap = min;
      min = max;
      max = swap;
      minAngle += angularSpan;
      angularSpan = -angularSpan;
    }

    var zeroToMin =
      0 <= min ? 0 :
      0 >= max ? -angularSpan :
      min * angularSpan / (max - min);

    var zeroToMax =
      0 <= min ? angularSpan :
      0 >= max ? 0 :
      max * angularSpan / (max - min);

    var zeroAngle = minAngle - zeroToMin;

    var valueAngularSpan =
      (value - Math.min(max, Math.max(min, 0))) * angularSpan / (max - min);

    if (angularSpan >= 0) {
      valueAngularSpan = Math.min(zeroToMax, Math.max(zeroToMin, valueAngularSpan));
    }
    else {
      valueAngularSpan = Math.max(zeroToMax, Math.min(zeroToMin, valueAngularSpan));
    }

    if (validNumbers(zeroAngle, valueAngularSpan))
    {
      return <path {...restProps} d={arcPath(center, radius, thickness, zeroAngle, valueAngularSpan)} />;
    }
    return <path />;
  }
});