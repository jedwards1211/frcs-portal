import React from 'react';

import {Layer} from './Canvas';

import AutoFatTracePlotter from './AutoFatTracePlotter';
import CanvasTraceRenderer from './CanvasTraceRenderer';

import {Axis, xAxis, yAxis} from '../orient';

import color from 'css-color-converter';

const conversionPropType = React.PropTypes.shape({
  convert: React.PropTypes.func.isRequired,
  invert:  React.PropTypes.func.isRequired,
});

export default class Trace extends Layer {
  static propTypes = {
    // function(from: number, to: number, callback: function(x: number, y: number), {surround: bool})
    forEachPoint:     React.PropTypes.func.isRequired,
    lineColor:        React.PropTypes.string,
    fillColor:        React.PropTypes.string,
    domainConversion: conversionPropType.isRequired,
    valueConversion:  conversionPropType.isRequired,
    // (domainConversion, valueConversion, renderer) => TracePlotter
    plotter:          React.PropTypes.func,
    // (CanvasRenderingContext2D) => TraceRenderer
    renderer:         React.PropTypes.func,
    domainAxis:       React.PropTypes.instanceOf(Axis),
  }
  static defaultProps = {
    lineColor:        '#00f',
    plotter:          (...args) => new AutoFatTracePlotter(...args),
    renderer:         ctx => new CanvasTraceRenderer(ctx),
    domainAxis:       xAxis,
  }
  paint(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.save();

    var {forEachPoint, lineColor, fillColor, domainConversion, valueConversion, 
        plotter, renderer, domainAxis} = this.props;

    if (!fillColor) {
      var rgba = color(lineColor).toRgbaArray();
      rgba[3] = 0.5;
      fillColor = color(rgba).toRgbString();
    }

    if (domainAxis === yAxis) {
      // swap x and y
      ctx.setTransform(0,1,1,0,0,0);
    }

    renderer        = renderer(ctx);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.3;
    ctx.fillStyle   = fillColor;

    plotter         = plotter(domainConversion, valueConversion, renderer);

    var leftDomain  = domainConversion.invert(0);
    var rightDomain = domainConversion.invert(canvas[domainAxis.span]);

    forEachPoint(leftDomain, rightDomain, (x, y) => plotter.addPoint(x, y), {surround: true});

    // don't forget to flush, otherwise some of the plotted data might not get drawn.
    plotter.flush();

    ctx.restore();
  } 
}
