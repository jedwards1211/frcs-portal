import * as andyplot from './andyplot';
import * as PlotGrid from './PlotGrid';

class ParsedHexColor {
  constructor(hexColor) {
    this.red = parseInt('0x' + hexColor.substring(1, 3));
    this.green = parseInt('0x' + hexColor.substring(3, 5));
    this.blue = parseInt('0x' + hexColor.substring(5, 7));
  }

  toRgba(alpha) {
    return 'rgba(' + this.red + ',' + this.green + ',' + this.blue + ',' + alpha + ')';
  }
}

export default class TracePainter {
  constructor(dataSource, color, timeConversion, valueConversion, plotter=andyplot.AutoFatTracePlotter, timeAxis='x') {
    this.dataSource = dataSource;
    this.color = color;
    this.timeConversion = timeConversion;
    this.valueConversion = valueConversion;
    this.plotter = plotter;
    this.timeAxis = timeAxis;
  }
  paint(canvas) {
    var ctx = canvas.getContext('2d');

    // align integer values with the center of pixels
    // NOTE: the translation is different than used for the time axis
    // because plots have different borders.
    ctx.setTransform(...(this.timeAxis === 'y' ? [0,1,1,0,.5,.5] : [1,0,0,1,.5,.5]));

    var renderer = new andyplot.CanvasTraceRenderer(ctx);

    var metrics = new PlotGrid.Metrics(canvas, this.timeConversion);

    ctx.strokeStyle = this.color;
    ctx.fillStyle = new ParsedHexColor(this.color).toRgba(0.5);

    var plotter = new this.plotter(this.timeConversion, this.valueConversion, renderer);

    // pass plotter.addPoint as the consumer
    this.dataSource.get(metrics.startTime, metrics.endTime, true, (x, y) => plotter.addPoint(x, y));

    // don't forget to flush, otherwise some of the plotted data might not get drawn.
    plotter.flush();
  } 
};