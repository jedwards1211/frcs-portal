export default class GridAxis {
  constructor(metrics, tickSide) {
    this.metrics = metrics;
    this.tickSide = tickSide;
    this.axis = tickSide.axis.opposite;
  }
  paint(canvas) {
    var {metrics, tickSide, axis} = this;
    var {conversion} = metrics;

    var ctx = canvas.getContext('2d');

    var baseFont = '10px sans-serif';

    ctx.font = baseFont;

    var minSide = metrics.startValue < metrics.endValue ? axis.minSide : axis.maxSide;
    var maxSide = minSide.opposite;

    tickSide.alignText(ctx);

    var tickSidePos = tickSide.positionInCanvas(canvas);
    if (tickSide.direction > 0) tickSidePos -= 2;

    var textOffset = tickSidePos - (metrics.maxTickSize + 2) * tickSide.direction;

    // make integer values align with the center of pixels
    ctx.setTransform(1, 0, 0, 1, 0.5, 0.5);

    // start on the nearest major tick offscreen to the left in case some of its label extends into view
    var value = metrics.firstMajor - metrics.majorIncrement;

    // go up to the nearest major tick offscreen to the right in case some of its label extends into view
    while (maxSide.isInside(value, metrics.endValue + metrics.majorIncrement)) {
      var px = Math.round(conversion.convert(value));

      var tickSize = metrics.getTickSize(value);

      ctx.strokeStyle = metrics.getTickColor(value);

      // paint the tick
      ctx.beginPath();
      axis.moveTo(ctx, px, tickSidePos);
      axis.lineTo(ctx, px, tickSidePos - tickSize * tickSide.direction);
      ctx.stroke();

      var lastLabelMinPx, lastLabelMaxPx;

      // paint a label if we're on a major increment (but the establishing label has already been painted)
      if (metrics.isMajorTick(value)) {
        var label = metrics.formatLabel(value);

        var labelMetrics = ctx.measureText(label);
        labelMetrics.height = 10;
        var labelMinPx = px + labelMetrics[axis.span] / 2 * minSide.direction;
        var labelMaxPx = px + labelMetrics[axis.span] / 2 * maxSide.direction;

        if (!minSide.isInside(labelMinPx, minSide.positionInCanvas(canvas))) {
          minSide.alignText(ctx);
          labelMinPx = px;
          labelMaxPx = px + labelMetrics[axis.span] * maxSide.direction;
        }
        else if (!maxSide.isInside(labelMaxPx, maxSide.positionInCanvas(canvas))) {
          maxSide.alignText(ctx);
          labelMinPx = px + labelMetrics[axis.span] * minSide.direction;
          labelMaxPx = px;
        }
        else {
          axis.centerText(ctx);
        }

        if (Math.min(labelMinPx, labelMaxPx) > Math.max(lastLabelMinPx, lastLabelMaxPx) + 10 ||
            Math.max(labelMinPx, labelMaxPx) < Math.min(lastLabelMinPx, lastLabelMaxPx) - 10) {
          ctx.strokeStyle = ctx.fillStyle = metrics.getLabelColor(value);
          ctx.fillText(label, ...axis.reorder(px, textOffset));
        }

        lastLabelMinPx = labelMinPx;
        lastLabelMaxPx = labelMaxPx;
      }

      value += metrics.minorIncrement;
    }
  }
}