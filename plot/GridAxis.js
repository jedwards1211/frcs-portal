export default class GridAxis {
  constructor(metrics, tickSide, options = {}) {
    this.metrics = metrics;
    this.tickSide = tickSide;
    this.axis = tickSide.axis.opposite;
    this.backgroundColor = options.backgroundColor || 'white';
    this.transparentBackgroundColor = options.transparentBackgroundColor || 'rgba(255,255,255,0)';
    this.clip = !!options.clip || true;
    this.justifyEndLabels = !!options.justifyEndLabels || false;
    this.fadeSpan = options.fadeSpan || 20;
  }
  paint(canvas) {
    var {metrics, tickSide, axis, backgroundColor, transparentBackgroundColor, justifyEndLabels, clip, fadeSpan} = this;
    var {conversion, startPx, endPx} = metrics;

    var ctx = canvas.getContext('2d');

    var minSide = metrics.startValue < metrics.endValue ? axis.minSide : axis.maxSide;
    var maxSide = minSide.opposite;

    var length = endPx - startPx;
    var thickness = canvas[axis.opposite.span];

    if (clip) {
      // clip to metrics.startPx and metrics.endPx
      ctx.rect(...axis.reorder(startPx - 0.5, 0), ...axis.reorder(length + 1, thickness));
      ctx.clip();
    }

    tickSide.alignText(ctx);

    var tickSidePos = tickSide.positionInCanvas(canvas);
    if (tickSide.direction > 0) tickSidePos -= 2;

    var textOffset = tickSidePos - (metrics.maxTickSize + 2) * tickSide.direction;

    // start on the nearest major tick offscreen to the left in case some of its label extends into view
    var value = metrics.firstMajor - metrics.majorIncrement;

    // go up to the nearest major tick offscreen to the right in case some of its label extends into view
    while (maxSide.isInside(value, metrics.endValue + metrics.majorIncrement)) {
      var px = conversion.convert(value);
      var alignedPx = Math.round(px + 0.5) - 0.5;

      var tickSize = metrics.getTickSize(value);

      ctx.strokeStyle = metrics.getTickColor(value);

      if (px >= startPx && px <= endPx) {
        // paint the tick
        ctx.beginPath();
        axis.moveTo(ctx, alignedPx, tickSidePos);
        axis.lineTo(ctx, alignedPx, tickSidePos - tickSize * tickSide.direction);
        ctx.stroke();
      }

      var lastLabelMinPx, lastLabelMaxPx;

      // paint a label if we're on a major increment
      if (metrics.isMajorTick(value)) {
        var label = metrics.formatLabel(value);
        var font = ctx.font = metrics.getFont(value);
        var labelPx;

        var labelMetrics = ctx.measureText(label);
        labelMetrics.height = (parseFloat(font) * 0.8) || 10;
        var labelMinPx = alignedPx - labelMetrics[axis.span] / 2;
        var labelMaxPx = alignedPx + labelMetrics[axis.span] / 2;

        if (justifyEndLabels && labelMinPx < startPx) {
          axis.minSide.alignText(ctx);
          labelPx = labelMinPx = Math.min(startPx, alignedPx);
          labelMaxPx = labelMinPx + labelMetrics[axis.span];
        }
        else if (justifyEndLabels && labelMaxPx > endPx) {
          axis.maxSide.alignText(ctx);
          labelPx = labelMaxPx = Math.max(endPx, alignedPx);
          labelMinPx = labelMaxPx - labelMetrics[axis.span];
        }
        else {
          labelPx = alignedPx;
          axis.centerText(ctx);
        }

        if (labelMaxPx >= startPx && labelMinPx <= endPx &&
            (lastLabelMinPx === undefined ||
            labelMinPx > lastLabelMaxPx + 10  || labelMaxPx < lastLabelMinPx - 10)) {

          ctx.strokeStyle = ctx.fillStyle = metrics.getLabelColor(value);
          ctx.fillText(label, ...axis.reorder(labelPx, textOffset));

          if (justifyEndLabels) {
            if (labelMinPx < startPx) {
              var gradient = ctx.createLinearGradient(...axis.reorder(startPx - 0.5, 0), ...axis.reorder(startPx - 0.5 + fadeSpan, 0));
              gradient.addColorStop(0, backgroundColor);
              gradient.addColorStop(1, transparentBackgroundColor);
              ctx.fillStyle = gradient;
              ctx.fillRect(...axis.reorder(Math.min(startPx - 0.5, 0), 0), ...axis.reorder(fadeSpan, thickness));
            }

            if (labelMaxPx > endPx) {
              var gradient = ctx.createLinearGradient(...axis.reorder(endPx + 0.5, 0), ...axis.reorder(endPx + 0.5 - fadeSpan, 0));
              gradient.addColorStop(0, backgroundColor);
              gradient.addColorStop(1, transparentBackgroundColor);
              ctx.fillStyle = gradient;
              ctx.fillRect(...axis.reorder(endPx + 0.5 - fadeSpan, 0), ...axis.reorder(fadeSpan, thickness));
            }
          }
        }
    
        lastLabelMinPx = labelMinPx;
        lastLabelMaxPx = labelMaxPx;
      }

      value += metrics.minorIncrement;
    }

    if (!justifyEndLabels) {
      var gradient = ctx.createLinearGradient(...axis.reorder(startPx - 0.5, 0), ...axis.reorder(startPx - 0.5 + fadeSpan, 0));
      gradient.addColorStop(0, backgroundColor);
      gradient.addColorStop(1, transparentBackgroundColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(...axis.reorder(startPx - 0.5, 0), ...axis.reorder(fadeSpan, thickness));

      var gradient = ctx.createLinearGradient(...axis.reorder(endPx + 0.5, 0), ...axis.reorder(endPx + 0.5 - fadeSpan, 0));
      gradient.addColorStop(0, backgroundColor);
      gradient.addColorStop(1, transparentBackgroundColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(...axis.reorder(endPx + 0.5 - fadeSpan, 0), ...axis.reorder(fadeSpan, thickness));
    }
  }
}