import React from 'react';

import {Layer} from './Canvas';

import AutoFatTracePlotter from './AutoFatTracePlotter';
import CanvasTraceRenderer from './CanvasTraceRenderer';

import Conversion from './Conversion';
import {Axis, xAxis, yAxis} from '../orient';

export default class Trace extends Layer {
  static propTypes = {
    dataSource:       React.PropTypes.shape({
      get:              React.PropTypes.func.isRequired,
    }).isRequired,
    lineColor:        React.PropTypes.string,
    fillColor:        React.PropTypes.string,
    domainConversion: React.PropTypes.instanceOf(Conversion).isRequired,
    valueConversion:  React.PropTypes.instanceOf(Conversion).isRequired,
    plotter:          React.PropTypes.func,
    renderer:         React.PropTypes.func,
    domainAxis:       React.PropTypes.instanceOf(Axis),
  }
  static defaultProps = {
    lineColor:        '#00f',
    fillColor:        'rgba(0,0,255,0.5)',
    plotter:          (...args) => new AutoFatTracePlotter(...args),
    renderer:         ctx => new CanvasTraceRenderer(ctx),
    domainAxis:       xAxis,
  }
  paint(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.save();

    var {dataSource, lineColor, fillColor, domainConversion, valueConversion, 
        plotter, renderer, domainAxis} = this.props;

    if (domainAxis === yAxis) {
      // swap x and y
      ctx.setTransform(0,1,1,0,0,0);
    }

    var renderer    = renderer(ctx);

    ctx.strokeStyle = lineColor;
    ctx.fillStyle   = fillColor;

    var plotter     = plotter(domainConversion, valueConversion, renderer);

    var leftDomain  = domainConversion.invert(0);
    var rightDomain = domainConversion.invert(canvas[domainAxis.span]);

    // pass plotter.addPoint as the consumer
    dataSource.get(leftDomain, rightDomain, true, (x, y) => plotter.addPoint(x, y));

    // don't forget to flush, otherwise some of the plotted data might not get drawn.
    plotter.flush();

    ctx.restore();
  } 
}