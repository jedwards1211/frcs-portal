import * as andyplot from './andyplot';

// Date.toLocaleString() would take care of this but isn't supported on Safari
var monthsNarrow = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var daysNarrow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function isMinuteStart(date) {
  return date.getSeconds() === 0 && date.getMilliseconds() === 0;
}

export function isHourStart(date) {
  return isMinuteStart(date) && date.getMinutes() === 0;
}

export function isDayStart(date) {
  return isHourStart(date) && date.getHours() === 0;
}

export function isMonthStart(date) {
  return isDayStart(date) && date.getDate() === 1;
}   

export function isYearStart(date) {
  return isMonthStart(date) && date.getMonth() === 0;
}

export function ceilingDay(date) {
  if (isDayStart(date)) {
    return date;
  }
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return new Date(date.getTime() + 86400000);
}

export class ValueMetrics {
  constructor(span, conversion, options) {
    this.minValue = conversion.invert(0);
    this.maxValue = conversion.invert(span);
    var {minMajorSpacing = 75, minMinorSpacing = 15} = options || {};

    this.minorIncrement = conversion.chooseNiceIncrement(minMinorSpacing);
    this.majorIncrement = conversion.chooseNiceMajorIncrement(minMajorSpacing, this.minorIncrement);

    this.firstMajor = andyplot.modCeiling(this.minValue, this.majorIncrement);
    this.firstMinor = andyplot.modCeiling(this.minValue, this.minorIncrement);

    this.precision = Math.max(0, -Math.floor(Math.log10(Math.abs(this.majorIncrement))));
    this.expPrecision = Math.pow(10, this.precision);
  } 

  formatLabel(value) {
    return value.toFixed(this.precision);
  }

  isMajorTick(value) {
    return (value % Math.abs(this.majorIncrement)) * this.expPrecision <= 0;
  }

  getTickSize(value) {
    return this.isMajorTick(value) ? 4 : 2;
  }

  /**
   * Gets the color the tick mark at the given date should be drawn with.
   * @param{date} the tick mark date.
   * @param{metrics} an object gotten from {@linkcode getTimeMetrics}.
   * @returns a canvas rendering color string
   */
  getTickColor(value) {
    return this.isMajorTick(value) ? '#aaa' : '#ccc';
  }

  getGridlineColor(value) {
    return this.isMajorTick(value) ? '#aaa' : '#ccc';
  }
}

/**
 * Creates grid metrics for the time axis.
 * Has the following properties:
 * <ul>
 * <li><code>startTime</code>: the time at the left side of the plot</li>
 * <li><code>endTime</code>: the time at the right side of the plot</li>
 * <li><code>majorIncrement</code>: the increment between major (labeled) tick marks</li>
 * <li><code>minorIncrement</code>: the increment between minor (unlabeled) tick marks</li>
 * <li><code>firstDay</code>: the start time of the first day beginning between <code>startTime</code> and
 * <code>endTime</code>, or <code>null</code> if midnight does not occur in that range.</li>
 * <li><code>firstMajor</code>: the time of the first major tick mark at or after <code>startTime</code></li>
 * <li><code>firstMinor</code>: the time of the first minor tick mark at or after <code>startTime</code></li>
 * <li><code>establishingTime</code>: the time of the tick mark that should be labeled verbosely to establish
 * context for the other tick mark labels</li>
 * </ul>
 *
 * @param{canvas} the canvas upon which the grid will be drawn.
 * @param{timeConversion} the {@linkcode andyplot.LinearConversion} for the time axis.
 */
export class Metrics {
  constructor(canvas, timeConversion, options) {
    this.startTime = timeConversion.invert(0);
    this.endTime = timeConversion.invert(canvas.width);
    var {minMajorSpacing = 75, minMinorSpacing = 15} = options || {};

    this.majorIncrement = andyplot.chooseNiceTimeIncrement(timeConversion.scale, minMajorSpacing);
    this.minorIncrement = andyplot.chooseNiceTimeSubIncrement(timeConversion.scale, minMinorSpacing, this.majorIncrement);
    this.firstDay = ceilingDay(new Date(this.startTime)).getTime();
    if (this.firstDay > this.endTime) this.firstDay = null;

    // milliseconds between the epoch and the first day in the current timezone.  This is to correct
    // modFloor() and modCeiling() so that e.g. 4-hour increments line up with the start of each day instead of
    // straddling them by 2 hours
    this.dayAnchor = new Date(2000, 0, 1).getTime() % 86400000;

    this.firstMajor = andyplot.modCeiling(this.startTime, this.majorIncrement, this.dayAnchor);
    this.firstMinor = andyplot.modCeiling(this.startTime, this.minorIncrement, this.dayAnchor);

    // this is the time that establishes context for the rest of the axis, its label will be more verbose than
    // all others.
    this.establishingTime = this.firstDay || this.firstMajor;
  }

  /**
   * Formats a date for display on the time axis.
   * @param{date} the date to format.
   * @param{metrics} an object gotten from {@linkcode getTimeMetrics}.
   */
  formatLabel(date) {
    if (date.getTime() === this.establishingTime) {
      return date.toString();
    } else if (isYearStart(date)) {
      return daysNarrow[date.getDay()] + ' ' + monthsNarrow[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    } else if (isDayStart(date)) {
      return daysNarrow[date.getDay()] + ' ' + monthsNarrow[date.getMonth()] + ' ' + date.getDate();
    } else {
      // chop off timezone etc.
      return date.toTimeString().substring(0, 8);
    }
  }

  /**
   * Gets the size the tick mark at the given date should be drawn with.
   * @param{date} the tick mark date.
   * @param{metrics} an object gotten from {@linkcode getTimeMetrics}.
   */
  getTickSize(date) {
    var tickSize;

    if (isMonthStart(date)) {
      tickSize = 8;
    } else if (isDayStart(date)) {
      tickSize = 6;
    } else if (isHourStart(date)) {
      tickSize = 4;
    } else if (isMinuteStart(date)) {
      tickSize = 2;
    } else {
      tickSize = 1;
    }

    if ((date.getTime() - this.firstMajor) % this.majorIncrement === 0) {
      tickSize += 2;
    }

    tickSize = Math.min(8, tickSize);

    return tickSize;
  }

  /**
   * Gets the color the tick mark at the given date should be drawn with.
   * @param{date} the tick mark date.
   * @param{metrics} an object gotten from {@linkcode getTimeMetrics}.
   * @returns a canvas rendering color string
   */
  getTickColor(date) {
    if (date.getTime() === this.establishingTime) {
      return 'black';
    }

    var v = 200 - this.getTickSize(date) * 15;
    return 'rgb(' + v + ',' + v + ',' + v + ')';
  }

  getGridlineColor(date) {
    if (date.getTime() === this.establishingTime) {
      return 'black'; 
    } else if ((date.getTime() - this.dayAnchor) % this.majorIncrement === 0) {
      return '#ccc';
    } else {
      return '#eee';
    }
  }
}

export default class PlotGridPainter {
  constructor(timeConversion, axis='x') {
    this.timeConversion = timeConversion;
    this.axis = axis;
  }
  paint(canvas) {
    var {timeConversion, axis} = this;
    var ctx = canvas.getContext('2d');

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // align integer values with the center of pixels
    // NOTE: the translation is different than used for the time axis
    // because plots have different borders.
    ctx.setTransform(1, 0, 0, 1, -0.5, 0.5);

    var metrics = new Metrics(canvas, timeConversion);

    // draw gridlines

    for (var time = metrics.firstMinor; time <= metrics.endTime; time += metrics.minorIncrement) {
      var x = Math.round(timeConversion.convert(time));
      var date = new Date(time);
      ctx.strokeStyle = metrics.getGridlineColor(date);
      ctx.beginPath();
      if (axis === 'y') {
        ctx.moveTo(0, x);
        ctx.lineTo(canvas.width - 0.5, x);
      }
      else {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height - 0.5);
      }
      ctx.stroke();
    }
  }
}