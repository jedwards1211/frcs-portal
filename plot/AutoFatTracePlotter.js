// tracks info about a group of points that are squashed together in a single
// column (or row) of pixels
class Column {
  // whether all points seen in the current column of pixels are
  // monotonic (only increasing or decreasing from left to right)
  monotonic = true

  // number of points
  count = 0

  // the most initial point in the current column
  start = [NaN, NaN]

  // the most final point in the current column
  end = [NaN, NaN]

  // the point with minimum value in the current column
  min = [NaN, NaN]

  // the point with maximum value in the current column
  max = [NaN, NaN]

  clear() {
    this.monotonic = true;
    this.count = 0;
    this.start[0] = this.start[1] = NaN;
    this.end[0] = this.end[1] = NaN;
    this.min[0] = this.min[1] = NaN;
    this.max[0] = this.max[1] = NaN;
  }

  definedStart() {
    return this.min[0] < this.max[0] ? this.min : this.max;
  }

  definedEnd() {
    return this.min[0] > this.max[0] ? this.min : this.max;
  }

  addPoint(domain, value, viewDomain, viewValue) {
    this.count++;

    if (isNaN(this.start[0])) {
      this.start[0] = domain;
      this.start[1] = value;
    }
    this.end[0] = domain;
    this.end[1] = value;

    if (!isNaN(value)) {
      if ((value >= this.max[1]) !== (this.max[1] >= this.min[1])) {
        this.monotonic = false;
      }

      if (isNaN(this.min[1]) || value < this.min[1]) {
        this.min[0] = domain;
        this.min[1] = value; 
      }
      if (isNaN(this.max[1]) || value > this.max[1]) {
        this.max[0] = domain;
        this.max[1] = value;
      }
    }
  }
}

/**
 * Plots a trace from points you provide sequentially.  If zoomed
 * out far enough that more than two data points are in a given
 * column of pixels, a "fat trace" fill will be drawn into that column 
 * (and adjacent columns of the same type).
 *
 * Interfaces used:
 * 
 * domainConversion, valueConversion:
 *     an object with convert and invert methods.  Both methods should
 *     take and return one number, be monotonic, and inverses of each 
 *     other.
 *
 * traceRenderer:
 *     an object with 3 methods:
 *
 *     drawLine(array): draws a line from alternating x/y coordinates
 *                         in the given flat array
 *     drawFill(array): draws a fill bounded by alternating x/y 
 *                         coordinates in the given flat array
 */
export default class AutoFatTracePlotter {
  constructor(domainConversion, valueConversion, traceRenderer) {
    this.domainConversion = domainConversion;
    this.valueConversion = valueConversion;
    this.traceRenderer = traceRenderer;

    // points on a line waiting to be flushed to the renderer
    this.linePoints = [];        

    // points on the bottom side of the fill waiting to be
    // flushed to the renderer
    this.fillMinPoints = [];

    // points on the top side of the fill waiting to be
    // flushed to the renderer
    this.fillMaxPoints = [];

    // stats for the current column
    this.column = new Column();

    // stats for the previous column
    this.prevColumn = new Column();
  }

  reset() {
    this.linePoints.length = 0;
    this.fillMinPoints.length = 0;
    this.fillMaxPoints.length = 0;

    this.column.clear();
    this.prevColumn.clear();
  }

  /**
   * Adds a point to be plotted.
   * @param {domain} the domain of the point.
   * @param {value} the value of the point.
   * @param {traceRenderer} a renderer interface (see notes at top)
   * @param {domainConversion} conversion for domain axis (see notes at top)
   * @param {valueConversion} conversion for value axis (see notes at top)
   */
  addPoint( domain , value ) {
    var columnX = this.domainConversion.convert( this.column.start[0] );
    var viewX = this.domainConversion.convert( domain );
    
    // if the added point is not in the same column, advance the column

    if( !isNaN( this.column.start[0] ) && Math.round( viewX ) > Math.round( columnX ) )
    {
      this._advanceColumn( false );
    }

    this.column.addPoint(domain, value);
  }
    
  /**
   * Flushes any pending lines or fills to the given trace renderer.
   */
  flush( )
  {
    this._advanceColumn( true );
  }

  _advanceColumn( forceFlush )
  {
    let {prevColumn, column} = this;

    console.log('advanceColumn')  ;
    console.log(prevColumn);
    console.log(column);

    function plot(dest, point) {
      if (!isNaN(point[1]) && point[0] !== dest[dest.length - 2]) {
        dest.push(point[0], point[1]);
      }
    }

    if (isNaN(prevColumn.end[1]) || isNaN(column.start[1])) {
      if (!isNaN(prevColumn.end[1])) {
        if (prevColumn.monotonic) {
          plot(this.linePoints, [column.start[0], prevColumn.end[1]]);
        }
        else {
          plot(this.fillMinPoints, [column.start[0], prevColumn.min[1]]);
          plot(this.fillMaxPoints, [column.start[0], prevColumn.max[1]]);
        }
      }
      this._flushLine();
      this._flushFill();
      if (column.monotonic) {
        plot(this.linePoints, column.definedStart());
        if (column.count > 1) plot(this.linePoints, column.definedEnd());
      }
      else {
        plot(this.fillMinPoints, column.min);
        plot(this.fillMaxPoints, column.max);
      }
    }
    else {
      if (prevColumn.monotonic) {
        if (column.monotonic) {
          plot(this.linePoints, column.definedStart());
          plot(this.linePoints, column.definedEnd());
        }
        else {
          this._flushLine();
          plot(this.fillMinPoints, prevColumn.definedEnd());
          plot(this.fillMaxPoints, prevColumn.definedEnd());
          plot(this.fillMinPoints, column.min);
          plot(this.fillMaxPoints, column.max);
        }
      }
      else {
        if (column.monotonic) {
          plot(this.fillMinPoints, column.definedStart());
          plot(this.fillMaxPoints, column.definedStart());
          this._flushFill();
          plot(this.linePoints, column.definedStart());
          plot(this.linePoints, column.definedEnd());
        }
        else {
          plot(this.fillMinPoints, column.min);
          plot(this.fillMaxPoints, column.max);
        }
      }
    }

    if (forceFlush) {
      this._flushLine();
      this._flushFill();
    }

    let swap = this.column;
    this.column = this.prevColumn;
    this.prevColumn = swap;
    this.column.clear();
  }

  _copyAndConvert(points) {
    let {domainConversion, valueConversion} = this;
    let result = [];
    for (let i = 0; i < points.length; i += 2) {
      result.push(domainConversion.convert(points[i]));
      result.push(valueConversion.convert(points[i + 1]));
    }
    return result;
  }
  
  _flushLine( )
  {
    if( this.linePoints.length > 1 )
    {
      this.traceRenderer.drawLine( this._copyAndConvert(this.linePoints) );
    }
    this.linePoints.length = 0;
  }
  
  _flushFill( )
  {
    if( this.fillMinPoints.length > 1 && this.fillMaxPoints.length > 1 )
    {
      var minLine = this._copyAndConvert(this.fillMinPoints);
      var maxLine = this._copyAndConvert(this.fillMaxPoints);

      var fill = minLine.slice( 0 );
      for ( var i = 0 ; i < maxLine.length ; i += 2 )
      {
        fill[ minLine.length + i ] = maxLine[ maxLine.length - i - 2 ];
        fill[ minLine.length + i + 1 ]= maxLine[ maxLine.length - i - 1 ];
      }
    
      this.traceRenderer.drawFill( fill );
      this.traceRenderer.drawLine( maxLine );
      this.traceRenderer.drawLine( minLine );
    }
    
    this.fillMinPoints.length = 0;
    this.fillMaxPoints.length = 0;
  }
}
