import * as PlotGrid from './PlotGrid';

import {topSide} from '../orient';

export default class AxisPainter {
  constructor(options) {
    this.timeConversion = options.timeConversion;
    this.printEstablishingLabel = options.printEstablishingLabel;
    this.formatLabel = options.formatLabel;
    this.tickSide = options.tickSide;
  }
  paint(canvas) {
    var {timeConversion} = this;

    var ctx = canvas.getContext('2d');

    var baseFont = '10px sans-serif';

    ctx.font = baseFont;

    var metrics = new PlotGrid.Metrics(canvas, timeConversion);

    var textY;

    if (this.tickSide === topSide) {
      textY = 7;
      ctx.textBaseline = 'hanging';
    } 
    else {
      textY = canvas.height - 10;
      ctx.textBaseline = 'alphabetic';
    }

    // make integer values align with the center of pixels
    ctx.setTransform(1, 0, 0, 1, -0.5, 0.5);

    if (this.printEstablishingLabel) {
      var establishingX = timeConversion.convert(metrics.establishingTime);
      var establishingDate = new Date(metrics.establishingTime);

      var establishingLabel = metrics.formatLabel(establishingDate);
      var establishingMetrics = ctx.measureText(establishingLabel);

      // decide where to place the establishing label.  It should be centered on its tick mark if possible...
      var establishingMinX = establishingX - establishingMetrics.width / 2;
      var establishingMaxX = establishingX + establishingMetrics.width / 2;

      // ...but not extend outside of the visible area of the time axis
      if (establishingMinX < 0) {
        establishingMinX = 0;
        establishingMaxX = establishingMetrics.width;
      } else if (establishingMaxX > canvas.width) {
        establishingMaxX = canvas.width;
        establishingMinX = establishingMaxX - establishingMetrics.width;
      }

      ctx.font = 'bold ' + baseFont;

      ctx.strokeStyle = ctx.fillStyle = metrics.getTickColor(establishingDate);
      ctx.textAlign = 'left';

      ctx.fillText(establishingLabel, establishingMinX, textY);
    }

    ctx.textAlign = 'center';
    ctx.font = baseFont;

    // start on the nearest major tick offscreen to the left in case some of its label extends into view
    var time = metrics.firstMajor - metrics.majorIncrement;

    var formatLabel = this.formatLabel || (date => metrics.formatLabel(date));

    // go up to the nearest major tick offscreen to the right in case some of its label extends into view
    while (time < metrics.endTime + metrics.majorIncrement) {
      var x = Math.round(timeConversion.convert(time));
      var date = new Date(time);

      var tickSize = metrics.getTickSize(date);

      ctx.strokeStyle = ctx.fillStyle = metrics.getTickColor(date);

      if (PlotGrid.isDayStart(date)) {
        ctx.font = 'bold ' + baseFont;
      } else {
        ctx.font = baseFont;
      }

      // paint the tick
      ctx.beginPath();
      if (this.tickSide === topSide) {
        ctx.moveTo(x, -0.5);
        ctx.lineTo(x, tickSize);
      }
      else {
        ctx.moveTo(x, canvas.height - tickSize);
        ctx.lineTo(x, canvas.height - 0.5);
      }
      ctx.stroke();

      // paint a label if we're on a major increment (but the establishing label has already been painted)
      if ((time - metrics.firstMajor) % metrics.majorIncrement === 0 && 
        (!this.printEstablishingLabel || time !== metrics.establishingTime)) {
        var date = new Date(time);

        var label = formatLabel(date);

        var labelMetrics = ctx.measureText(label);
        var labelMinX = x - labelMetrics.width / 2;
        var labelMaxX = x + labelMetrics.width / 2;

        var labelMinTime = timeConversion.invert(labelMinX);
        var labelMaxTime = timeConversion.invert(labelMaxX);

        if (labelMinTime < metrics.startTime && labelMaxTime >= metrics.startTime) {
          ctx.textAlign = 'left';
        }
        else if (labelMaxTime > metrics.endTime && labelMinTime <= metrics.endTime) {
          ctx.textAlign = 'right';
        }
        else {
          ctx.textAlign = 'center';
        }

        // make sure not to overlap the big establishing label
        if (!this.printEstablishingLabel || labelMaxX < establishingMinX - 30 || labelMinX > establishingMaxX + 30) {
          ctx.fillText(label, x, textY);
        }
      }

      time += metrics.minorIncrement;
    }

    // paint fadeouts at the left and right edges of the axis unless the establishing label is there
    // if (!this.printEstablishingLabel || establishingMinX > 20) {
    //   var gradient = ctx.createLinearGradient(0, 0, 20, 0);
    //   gradient.addColorStop(0, "white");
    //   gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    //   ctx.fillStyle = gradient;
    //   ctx.fillRect(0, 0, 20, canvas.height - 0.5);
    // }
    // if (!this.printEstablishingLabel || establishingMaxX < canvas.width - 20) {
    //   var gradient = ctx.createLinearGradient(canvas.width, 0, canvas.width - 20, 0);
    //   gradient.addColorStop(0, "white");
    //   gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    //   ctx.fillStyle = gradient;
    //   ctx.fillRect(canvas.width - 20, 0, 20, canvas.height - 0.5);
    // }
  }
}