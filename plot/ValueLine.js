import React from 'react';

import {Layer} from './Canvas';

import Conversion from './Conversion';
import {Axis, xAxis} from '../utils/orient';

export default class ValueLine extends Layer {
  static propTypes = {
    color:      React.PropTypes.string.isRequired,
    conversion: React.PropTypes.instanceOf(Conversion).isRequired,
    value:      React.PropTypes.number,
    axis:       React.PropTypes.instanceOf(Axis),
  };
  static defaultProps = {
    axis:       xAxis, 
  };
  paint(canvas) {
    var {color, conversion, value, axis} = this.props;
    var cValue = conversion.convert(value);
    if (!isNaN(cValue) && cValue !== null) {
      var ctx = canvas.getContext('2d');
      ctx.strokeStyle = color;
      ctx.beginPath();
      axis.moveTo(ctx, cValue, 0);
      axis.lineTo(ctx, cValue, canvas[axis.opposite.span]);
      ctx.stroke();
    }
  } 
}
