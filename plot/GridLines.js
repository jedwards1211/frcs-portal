export default class GridLines {
  constructor(metrics, axis) {
    this.metrics = metrics;
    this.axis = axis;
  }
  paint(canvas) {
    var {metrics, axis} = this;
    var {conversion} = metrics;

    var ctx = canvas.getContext('2d');

    var minSide = metrics.startValue < metrics.endValue ? axis.minSide : axis.maxSide;
    var maxSide = minSide.opposite;

    // make integer values align with the center of pixels
    ctx.setTransform(1, 0, 0, 1, 0.5, 0.5);

    // start on the nearest major tick offscreen to the left in case some of its label extends into view
    var value = metrics.firstMajor - metrics.majorIncrement;

    // go up to the nearest major tick offscreen to the right in case some of its label extends into view
    while (maxSide.isInside(value, metrics.endValue + metrics.majorIncrement)) {
      var px = Math.round(conversion.convert(value));

      ctx.strokeStyle = metrics.getGridlineColor(value);

      ctx.beginPath();
      axis.moveTo(ctx, px, 0);
      axis.lineTo(ctx, px, canvas[axis.span]);
      ctx.stroke();

      value += metrics.minorIncrement;
    }
  }
}