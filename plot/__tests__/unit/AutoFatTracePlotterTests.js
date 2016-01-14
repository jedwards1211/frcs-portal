import AutoFatTracePlotter from '../../AutoFatTracePlotter';
import LinearConversion from '../../LinearConversion';
import TraceRenderer from '../../TraceRenderer';

class TestTraceRenderer extends TraceRenderer {
  lines = []
  fills = []

  drawLine(line) { this.lines.push(line) }
  drawFill(fill) { this.fills.push(fill) }
  clear() { this.lines = []; this.fills = [] }
}

function removeRedundantPoints(points) {
  let result = [];
  for (let i = 0; i < points.length; i += 2) {
    if (points[i] !== result[result.length - 2] || points[i + 1] !== result[result.length - 1]) {
      result.push(points[i], points[i + 1]);
    }
  }
  return result;
}

describe('AutoFatTracePlotter', () => {
  it('draws a horizontal line from valid to NA', () => {
    let domainConversion = new LinearConversion(0, 0, 10000, 1000);
    let valueConversion = new LinearConversion(-10, 200, 10, 0);
    let traceRenderer = new TestTraceRenderer();

    let plotter = new AutoFatTracePlotter(domainConversion, valueConversion, traceRenderer);

    plotter.addPoint(1000, 5);
    plotter.addPoint(2000, NaN);
    plotter.addPoint(3000, 5);
    plotter.addPoint(4000, NaN);
    plotter.flush();

    expect(traceRenderer.lines.map(removeRedundantPoints)).toEqual([
      [100, 50, 200, 50],
      [300, 50, 400, 50],
    ]);
    expect(traceRenderer.fills).toEqual([]);
  });
});
