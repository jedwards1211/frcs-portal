import TracePlotter from './TracePlotter'

// accumulates info about a group of points that are squashed together in a single
// column (or row) of pixels, so that (basically) a single line or fill polygon can
// be drawn to approximate those points
class Column {
  // whether all points seen in the current column of pixels are
  // monotonic (values are strictly increasing or decreasing along domain axis)
  // in other words, if monotonic is false, the trace should be fat
  // within the column.
  monotonic = true;

  // the first point in the current column
  start = [NaN, NaN];

  // the last point in the current column
  end = [NaN, NaN];

  // the first valid point in the current column
  validStart = [NaN, NaN];

  // the last valid point in the current column
  validEnd = [NaN, NaN];

  // the point with minimum value in the current column
  min = [NaN, NaN];

  // the point with maximum value in the current column
  max = [NaN, NaN];

  clear() {
    this.monotonic = true
    this.start[0] = this.start[1] = NaN
    this.end[0] = this.end[1] = NaN
    this.validStart[0] = this.validStart[1] = NaN
    this.validEnd[0] = this.validEnd[1] = NaN
    this.min[0] = this.min[1] = NaN
    this.max[0] = this.max[1] = NaN
  }

  addPoint(domain, value, viewDomain, viewValue) {
    if (isNaN(this.start[0])) {
      this.start[0] = domain
      this.start[1] = value
    }
    this.end[0] = domain
    this.end[1] = value

    if (!isNaN(value)) {
      if (isNaN(this.validStart[0])) {
        this.validStart[0] = domain
        this.validStart[1] = value
      }
      this.validEnd[0] = domain
      this.validEnd[1] = value

      if ((value > this.max[1] && this.max[1] < this.min[1]) ||
          (value < this.max[1] && this.max[1] > this.min[1])) {
        this.monotonic = false
      }

      if (isNaN(this.min[1]) || value < this.min[1]) {
        this.min[0] = domain
        this.min[1] = value
      }
      if (isNaN(this.max[1]) || value > this.max[1]) {
        this.max[0] = domain
        this.max[1] = value
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
 * To use it, pass in points with increasing domain to addPoint(),
 * and then call flush() after all points to plot have been added.
 * Call reset() before plotting again with this instance.
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
export default class AutoFatTracePlotter extends TracePlotter {
  constructor(domainConversion, valueConversion, traceRenderer) {
    super()
    this.domainConversion = domainConversion
    this.valueConversion = valueConversion
    this.traceRenderer = traceRenderer

    // points on a line waiting to be flushed to the renderer
    this.linePoints = []

    // points on the min side of the fill waiting to be
    // flushed to the renderer
    this.fillMinPoints = []

    // points on the max side of the fill waiting to be
    // flushed to the renderer
    this.fillMaxPoints = []

    // accumulator for the current column
    this.column = new Column()

    // accumulator for the previous column
    this.prevColumn = new Column()
  }

  reset() {
    this.linePoints.length = 0
    this.fillMinPoints.length = 0
    this.fillMaxPoints.length = 0

    this.column.clear()
    this.prevColumn.clear()
  }

  /**
   * Adds a point to be plotted.
   * @param {domain} the domain of the point.
   * @param {value} the value of the point.
   */
  addPoint( domain, value ) {
    // coerce null, undefined, or other non-number types to NaN
    if (isNaN(value) || value === null) value = NaN

    var columnX = this.domainConversion.convert( this.column.start[0] )
    var viewX = this.domainConversion.convert( domain )

    // if the added point is not in the same column of pixels as the last, plot the data
    // between the columns.  This way if there are a lot of points crammed into this small
    // space they can be plotted with (basically) one fill (fat trace) or line (if the points
    // are monotonic)
    if ( !isNaN( this.column.start[0] ) && Math.round( viewX ) > Math.round( columnX ) )
    {
      this._advanceColumn( false )
    }

    // accumulate information about what to plot until a call to _advanceColumn plots
    // and clears it.
    this.column.addPoint(domain, value)
  }

  /**
   * Flushes any pending lines or fills to the given trace renderer.
   */
  flush( )
  {
    this._advanceColumn( true )
  }

  /**
   * Plots the data between the previous and current columns, and then begins a new column.
   * This is where the magic happens, there's a lot of tedious logic to decide when to plot
   * a fat trace and when to plot a line, and when to transition between them.
   */
  _advanceColumn( forceFlush )
  {
    let {prevColumn, column} = this

    // are prevColumn and column adjacent columns of pixels?  If not, we should connect
    // them with a line, even if the trace is fat in the columns themselves
    let nonadjacent = Math.round(this.domainConversion.convert(column.start[0])) >
      Math.round(this.domainConversion.convert(prevColumn.start[0])) + 1

    let push = Array.prototype.push

    if (isNaN(prevColumn.end[1]) || isNaN(column.start[1])) {
      // data is discontiguous; prevColumn and column shouldn't be joined by
      // line or fill
      if (!isNaN(prevColumn.end[1])) {
        if (!prevColumn.monotonic) {
          // collapse from fill to a line
          push.apply(this.fillMinPoints, prevColumn.end)
          push.apply(this.fillMaxPoints, prevColumn.end)
          push.apply(this.linePoints, prevColumn.end)
        }
        // draw horizontal line from last defined point to time of NaN value
        this.linePoints.push(column.start[0], prevColumn.end[1])
      }
      // end previous trace segment...
      this._flushLine()
      this._flushFill()
      // ...so that next trace segment isn't connected
      if (!isNaN(column.min[0])) {
        if (column.monotonic) {
          push.apply(this.linePoints, column.validStart)
          push.apply(this.linePoints, column.validEnd)
        }
        else { // !column.monotonic
          // expand from line...
          push.apply(this.fillMinPoints, column.validStart)
          push.apply(this.fillMaxPoints, column.validStart)
          // ...to fill
          push.apply(this.fillMinPoints, column.min)
          push.apply(this.fillMaxPoints, column.max)
        }
      }
    }
    else { // !isNaN(prevColumn.end[1]) && !isNaN(column.start[1])
      // data is contiguous; prevColumn and column should be joined by
      // a line or fill
      if (prevColumn.monotonic) {
        if (column.monotonic) {
          // extend line
          push.apply(this.linePoints, column.start)
          push.apply(this.linePoints, column.end)
        }
        else { // !column.monotonic
          // expand from line...
          if (nonadjacent) {
            // continue line up to this column before expanding to fill
            push.apply(this.linePoints, column.start)
            this._flushLine()
            push.apply(this.fillMinPoints, column.start)
            push.apply(this.fillMaxPoints, column.start)
          }
          else { // adjacent
            this._flushLine()
            push.apply(this.fillMinPoints, prevColumn.end)
            push.apply(this.fillMaxPoints, prevColumn.end)
          }
          // ...to fill
          push.apply(this.fillMinPoints, column.min)
          push.apply(this.fillMaxPoints, column.max)
        }
      }
      else { // !prevColumn.monotonic
        if (column.monotonic) {
          // collapse from fill...
          if (nonadjacent) {
            push.apply(this.fillMinPoints, prevColumn.end)
            push.apply(this.fillMaxPoints, prevColumn.end)
            this._flushFill()
            push.apply(this.linePoints, prevColumn.end)
          }
          else { // adjacent
            push.apply(this.fillMinPoints, column.start)
            push.apply(this.fillMaxPoints, column.start)
            this._flushFill()
          }
          // ...to line
          push.apply(this.linePoints, column.start)
          push.apply(this.linePoints, column.end)
        }
        else { // !column.monotonic
          if (nonadjacent) {
            // trace is filled (fat) in both columns but they're not adjacent,
            // so collapse from fill...
            push.apply(this.fillMinPoints, prevColumn.end)
            push.apply(this.fillMaxPoints, prevColumn.end)
            this._flushFill()
            // ...down to a line between the columns...
            push.apply(this.linePoints, prevColumn.end)
            push.apply(this.linePoints, column.start)
            this._flushLine()
            // ...then expand back to a fill
            push.apply(this.fillMinPoints, column.start)
            push.apply(this.fillMaxPoints, column.start)
          }
          // extend filled region
          push.apply(this.fillMinPoints, column.min)
          push.apply(this.fillMaxPoints, column.max)
        }
      }
    }

    if (forceFlush) {
      this._flushLine()
      this._flushFill()
    }

    // begin a new column
    let swap = this.column
    this.column = this.prevColumn
    this.prevColumn = swap
    this.column.clear()
  }

  /**
   * Copies an array of alternating domain/value pairs and converts
   * them from raw data to output coordinates.
   */
  _copyAndConvert(points) {
    let {domainConversion, valueConversion} = this
    let result = []
    for (let i = 0; i < points.length; i += 2) {
      result.push(domainConversion.convert(points[i]))
      result.push(valueConversion.convert(points[i + 1]))
    }
    return result
  }

  /**
   * Sends the accumulated line data to the TraceRenderer and clears it.
   */
  _flushLine( )
  {
    if ( this.linePoints.length > 1 )
    {
      this.traceRenderer.drawLine( this._copyAndConvert(this.linePoints) )
    }
    this.linePoints.length = 0
  }

  /**
   * Sends the accumulated fill data to the TraceRenderer and clears it.
   */
  _flushFill( )
  {
    if ( this.fillMinPoints.length > 1 && this.fillMaxPoints.length > 1 )
    {
      var minLine = this._copyAndConvert(this.fillMinPoints)
      var maxLine = this._copyAndConvert(this.fillMaxPoints)

      var fill = minLine.slice( 0 )
      for ( var i = 0 ; i < maxLine.length ; i += 2 )
      {
        fill[ minLine.length + i ] = maxLine[ maxLine.length - i - 2 ]
        fill[ minLine.length + i + 1 ]= maxLine[ maxLine.length - i - 1 ]
      }

      this.traceRenderer.drawFill( fill )
      this.traceRenderer.drawLine( maxLine )
      this.traceRenderer.drawLine( minLine )
    }

    this.fillMinPoints.length = 0
    this.fillMaxPoints.length = 0
  }
}
