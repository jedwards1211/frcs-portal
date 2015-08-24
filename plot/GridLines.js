import React from 'react';

import {Layer} from './Canvas';

import {GridMetrics} from './GridMetrics';
import {Axis} from '../orient';

export default class GridLines extends Layer {
  static propTypes = {
    metrics: React.PropTypes.instanceOf(GridMetrics).isRequired,
    axis:    React.PropTypes.instanceOf(Axis).isRequired,
  }
  paint(canvas) {
    var {metrics, axis} = this.props;
    var {conversion} = metrics;

    var ctx = canvas.getContext('2d');

    var minSide = metrics.startValue < metrics.endValue ? axis.minSide : axis.maxSide;
    var maxSide = minSide.opposite;

    var minPx = metrics.startValue < metrics.endValue ? metrics.startPx : metrics.endPx;
    var maxPx = metrics.startValue < metrics.endValue ? metrics.endPx : metrics.startPx;

    // start on the nearest major tick offscreen to the left in case some of its label extends into view
    var value = metrics.firstMajor - metrics.majorIncrement;

    // go up to the nearest major tick offscreen to the right in case some of its label extends into view
    while (maxSide.isInside(value, metrics.endValue + metrics.majorIncrement)) {
      var px = conversion.convert(value);

      if (minSide.isInside(px, minPx) && maxSide.isInside(px, maxPx)) {
        px = Math.round(px + 0.5) - 0.5;

        ctx.strokeStyle = metrics.getGridlineColor(value);

        ctx.beginPath();
        axis.moveTo(ctx, px, 0);
        axis.lineTo(ctx, px, canvas[axis.opposite.span]);
        ctx.stroke();
      }

      value += metrics.minorIncrement;
    }
  }
}