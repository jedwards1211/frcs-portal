import * as PlotGrid from './PlotGrid';

import {xAxis, yAxis, topSide, bottomSide, leftSide, rightSide} from '../orient';

export default class AxisPainter {
  constructor(options) {
    this.options = options;
    this.conversion = options.conversion;
    this.formatLabel = options.formatLabel;
    this.tickSide = options.tickSide;
    this.axis = options.tickSide.axis.opposite;
  }
  paint(canvas) {
    var {conversion, tickSide, axis} = this;

    var ctx = canvas.getContext('2d');

    var baseFont = '10px sans-serif';

    ctx.font = baseFont;

    var metrics = new PlotGrid.ValueMetrics(canvas[axis.span], conversion, this.options);

    var minSide = metrics.minValue < metrics.maxValue ? axis.minSide : axis.maxSide;
    var maxSide = minSide.opposite;

    var textY;

    tickSide.alignText(ctx);

    var tickSidePos = tickSide.positionInCanvas(canvas);
    if (tickSide.direction > 0) tickSidePos -= 2;

    // make integer values align with the center of pixels
    ctx.setTransform(1, 0, 0, 1, 0.5, 0.5);

    ctx.font = baseFont;

    // start on the nearest major tick offscreen to the left in case some of its label extends into view
    var value = metrics.firstMajor - metrics.majorIncrement;

    var formatLabel = this.formatLabel || (value => metrics.formatLabel(value));

    // go up to the nearest major tick offscreen to the right in case some of its label extends into view
    while (maxSide.isInside(value, metrics.maxValue + metrics.majorIncrement)) {
      var px = Math.round(conversion.convert(value));

      var tickSize = metrics.getTickSize(value);

      ctx.strokeStyle = ctx.fillStyle = metrics.getTickColor(value);

      // paint the tick
      ctx.beginPath();
      axis.moveTo(ctx, px, tickSidePos);
      axis.lineTo(ctx, px, tickSidePos - tickSize * tickSide.direction);
      ctx.stroke();

      // paint a label if we're on a major increment (but the establishing label has already been painted)
      if (metrics.isMajorTick(value)) {
        var label = formatLabel(value);

        var labelMetrics = ctx.measureText(label);
        labelMetrics.height = 10;
        var labelMinPx = px + labelMetrics[axis.span] / 2 * minSide.direction;
        var labelMaxPx = px + labelMetrics[axis.span] / 2 * maxSide.direction;

        if (!minSide.isInside(labelMinPx, minSide.positionInCanvas(canvas))) {
          minSide.alignText(ctx);
        }
        else if (!maxSide.isInside(labelMaxPx, maxSide.positionInCanvas(canvas))) {
          maxSide.alignText(ctx);
        }
        else {
          axis.centerText(ctx);
        }

        var textOffset = tickSidePos - (tickSize + 2) * tickSide.direction;

        var textX = axis === xAxis ? px : textOffset;
        var textY = axis === yAxis ? px : textOffset;

        ctx.fillText(label, textX, textY);
      }

      value += metrics.minorIncrement;
    }
  }
}