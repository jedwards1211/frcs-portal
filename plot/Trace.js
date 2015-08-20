import * as andyplot from './andyplot';
import {xAxis, yAxis} from '../orient';

export default class Trace {
  /**
   * @param {function}      options.dataSource        - a function(from, to, surround, callback)
   * @param {string}        options.lineColor
   * @param {string}        options.fillColor
   * @param {Conversion}    options.domainConversion  - a conversion from domain to screen position
   * @param {Conversion}    options.valueConversion   - a conversion from value to screen position
   * @param {TracePlotter}  options.plotter           - determines how to plot the trace
   * @param {Axis}          options.domainAxis        - the domain axis
   */
  constructor(options) {
    this.dataSource = options.dataSource;
    this.lineColor = options.lineColor || '#00f';
    this.fillColor = options.fillColor || 'rgba(0,0,255,0.5)';
    this.domainConversion = options.domainConversion;
    this.valueConversion = options.valueConversion;
    this.plotter = options.plotter;
    this.domainAxis = options.domainAxis || xAxis;
  }
  paint(canvas) {
    var ctx = canvas.getContext('2d');

    var {domainConversion, valueConversion, transform, domainAxis} = this;

    var renderer = new andyplot.CanvasTraceRenderer(ctx);

    ctx.strokeStyle = this.lineColor;
    ctx.fillStyle = this.fillColor;

    var plotter = new this.plotter(domainConversion, valueConversion, renderer);

    var leftDomain = domainConversion.invert(0);
    var rightDomain = domainConversion.invert(canvas[domainAxis.span]);

    // pass plotter.addPoint as the consumer
    this.dataSource.get(leftDomain, rightDomain, true, (x, y) => plotter.addPoint(x, y));

    // don't forget to flush, otherwise some of the plotted data might not get drawn.
    plotter.flush();
  } 
};