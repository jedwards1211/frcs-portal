import React from 'react';

import {Layer} from './Canvas';

import * as andyplot from './andyplot';
import {Axis, xAxis, yAxis} from '../orient';

export default class Trace extends Layer {
  static propTypes = {
    dataSource:       React.PropTypes.shape({
      get:              React.PropTypes.func.isRequired,
    }).isRequired,
    lineColor:        React.PropTypes.string,
    fillColor:        React.PropTypes.string,
    domainConversion: React.PropTypes.instanceOf(andyplot.Conversion).isRequired,
    valueConversion:  React.PropTypes.instanceOf(andyplot.Conversion).isRequired,
    plotter:          React.PropTypes.func,
    domainAxis:       React.PropTypes.instanceOf(Axis),
  }
  static defaultProps = {
    lineColor:        '#00f',
    fillColor:        'rgba(0,0,255,0.5)',
    plotter:          andyplot.AutoFatTracePlotter,
    domainAxis:       xAxis,
  }
  paint(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.save();

    var {dataSource, lineColor, fillColor, domainConversion, valueConversion, plotter, domainAxis} = this.props;

    if (domainAxis === yAxis) {
      // swap x and y
      ctx.setTransform(0,1,1,0,0,0);
    }

    var renderer    = new andyplot.CanvasTraceRenderer(ctx);

    ctx.strokeStyle = lineColor;
    ctx.fillStyle   = fillColor;

    var plotter     = new plotter(domainConversion, valueConversion, renderer);

    var leftDomain  = domainConversion.invert(0);
    var rightDomain = domainConversion.invert(canvas[domainAxis.span]);

    // pass plotter.addPoint as the consumer
    dataSource.get(leftDomain, rightDomain, true, (x, y) => plotter.addPoint(x, y));

    // don't forget to flush, otherwise some of the plotted data might not get drawn.
    plotter.flush();

    ctx.restore();
  } 
}