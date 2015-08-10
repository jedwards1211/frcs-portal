export default class TracePainter {
  constructor(color, conversion, value, axis = 'x') {
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
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      if (axis === 'x') {
        ctx.moveTo(cValue, 0);
        ctx.lineTo(cValue, canvas.height);
      }
      else {
        ctx.moveTo(0, cValue);
        ctx.lineTo(canvas.width, cValue);
      }
      ctx.stroke();
    }
  } 
};