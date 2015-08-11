import {xAxis} from '../orient';

export default class ValueLine {
  constructor(color, conversion, value, axis = xAxis) {
    this.color = color;
    this.conversion = conversion;
    this.value = value;
    this.axis = axis;
  }
  paint(canvas) {
    var {color, conversion, value, axis} = this;
    var cValue = conversion.convert(value);
    if (!isNaN(cValue) && cValue !== null) {
      var ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0.5, 0.5);
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      axis.moveTo(ctx, cValue, 0);
      axis.lineTo(ctx, cValue, canvas[axis.opposite.span]);
      ctx.stroke();
    }
  } 
};