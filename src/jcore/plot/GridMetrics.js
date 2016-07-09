/* eslint no-unused-vars: [1, {"args": "none"}] */

import * as GridMath from './GridMath'

export class GridMetrics {
  constructor(conversion, startPx, endPx, options = {}) {
    this.conversion = conversion

    this.startPx = Math.min(startPx, endPx)
    this.endPx = Math.max(startPx, endPx)

    this.startValue = conversion.invert(startPx)
    this.endValue = conversion.invert(endPx)

    this.minorTickSize = options.minorTickSize || 2
    this.majorTickSize = options.majorTickSize || this.minorTickSize * 2

    this.maxTickSize = this.majorTickSize

    this.majorTickColor = options.majorTickColor || '#aaa'
    this.minorTickColor = options.minorTickColor || '#ccc'

    this.majorGridlineColor = options.majorGridlineColor || '#ccc'
    this.minorGridlineColor = options.minorGridlineColor || '#eee'

    this.majorLabelColor = options.majorLabelColor || '#999'
    this.minorLabelColor = options.minorLabelColor || '#bbb'

    this.font = options.font || '10px sans-serif'
  }

  isMajorTick(value) {
    return false
  }

  getTickSize(value) {
    return this.isMajorTick(value) ? this.majorTickSize : this.minorTickSize
  }

  getTickColor(value) {
    return this.isMajorTick(value) ? this.majorTickColor : this.minorTickColor
  }

  getGridlineColor(value) {
    return this.isMajorTick(value) ? this.majorGridlineColor : this.minorGridlineColor
  }

  getLabelColor(value) {
    return this.isMajorTick(value) ? this.majorLabelColor : this.minorLabelColor
  }

  getFont(value) {
    return this.font
  }

  /**
   * @return {number[]} values for which labels should be painted, in the order returned,
   * before any major tick labels.
   */
  getPriorityLabelValues() {
    return undefined
  }
}

export class ValueMetrics extends GridMetrics {
  constructor(conversion, startPx, endPx, options = {}) {
    super(conversion, startPx, endPx, options)

    var {minMajorSpacing = 75, minMinorSpacing = 15} = options

    this.minorIncrement = conversion.chooseNiceIncrement(minMinorSpacing)
    this.majorIncrement = conversion.chooseNiceIncrement(minMajorSpacing, this.minorIncrement)

    this.firstMajor = GridMath.modCeiling(this.startValue, this.majorIncrement)
    this.firstMinor = GridMath.modCeiling(this.startValue, this.minorIncrement)

    this.precision = Math.max(0, -Math.floor(Math.log10(Math.abs(this.majorIncrement))))
    this.majorTickThreshold = Math.pow(10, -this.precision - 6)
  }

  formatLabel(value) {
    return value.toFixed(this.precision)
  }

  isMajorTick(value) {
    value = Math.abs(value)
    var mod = value % this.majorIncrement
    return Math.min(mod, Math.abs(this.majorIncrement) - mod) < this.majorTickThreshold
  }
}

export class TimeMetrics extends GridMetrics {
  constructor(conversion, startPx, endPx, options = {}) {
    super(conversion, startPx, endPx, options)
    var {minMajorSpacing = 75, minMinorSpacing = 15} = options || {}

    this.minorIncrement = conversion.chooseNiceTimeIncrement(minMinorSpacing)
    this.majorIncrement = conversion.chooseNiceTimeIncrement(minMajorSpacing, this.minorIncrement)

    this.firstMajor = GridMath.modCeiling(this.startValue, this.majorIncrement)
    this.firstMinor = GridMath.modCeiling(this.startValue, this.minorIncrement)

    var maxTime = Math.max(this.startValue, this.endValue)
    this.showHours = Math.abs(maxTime) >= 3600000
    this.showMinutes = true
    this.showSeconds = Math.abs(this.majorIncrement) < 60000 || !this.showHours
    this.showMillis = Math.abs(this.majorIncrement) < 1000
  }

  isMajorTick(time) {
    return time % Math.abs(this.majorIncrement) === 0
  }

  formatLabel(time) {
    function pad(number, places) {
      var s = String(number)
      while (s.length < places) {
        s = '0' + s
      }
      return s
    }

    var items = []
    if (this.showHours) items.push(Math.floor(time / 3600000))
    if (this.showMinutes) items.push(pad(Math.floor((time / 60000) % 60), 2))
    if (this.showSeconds) items.push(pad(Math.floor((time / 1000) % 60), 2))
    if (this.showMillis) items.push(pad(Math.floor(time % 1000), 3))

    return items.join(':')
  }
}

// Date.toLocaleString() would take care of this but isn't supported on Safari
var monthsNarrow = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
var daysNarrow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function isMinuteStart(date) {
  return date.getSeconds() === 0 && date.getMilliseconds() === 0
}

export function isHourStart(date) {
  return isMinuteStart(date) && date.getMinutes() === 0
}

export function isDayStart(date) {
  return isHourStart(date) && date.getHours() === 0
}

export function isMonthStart(date) {
  return isDayStart(date) && date.getDate() === 1
}

export function isYearStart(date) {
  return isMonthStart(date) && date.getMonth() === 0
}

export function ceilingDay(date) {
  if (isDayStart(date)) {
    return date
  }
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return new Date(date.getTime() + 86400000)
}

export class DateMetrics extends TimeMetrics {
  constructor(conversion, startPx, endPx, options = {}) {
    super(conversion, startPx, endPx, options)

    this.dayTickSize = options.dayTickSize || this.majorTickSize * 3 / 2

    this.dayTickColor = options.dayTickColor || '#222'
    this.dayGridlineColor = options.dayGridlineColor || '#333'
    this.dayLabelColor = options.dayLabelColor || '#111'

    this.dayFont = options.dayFont || 'bold 10px sans-serif'

    this.maxTickSize = this.dayTickSize

    this.majorTickColor = options.majorTickColor || '#aaa'

    this.firstDay = ceilingDay(new Date(this.startValue)).getTime()
    if (this.firstDay > this.endValue) this.firstDay = null

    // milliseconds between the epoch and the first day in the current timezone.  This is to correct
    // modFloor() and modCeiling() so that e.g. 4-hour increments line up with the start of each day instead of
    // straddling them by 2 hours
    this.dayAnchor = new Date(2000, 0, 1).getTime() % 86400000

    this.firstMajor = GridMath.modCeiling(this.startValue, this.majorIncrement, this.dayAnchor)
    this.firstMinor = GridMath.modCeiling(this.startValue, this.minorIncrement, this.dayAnchor)

    // this is the time that establishes context for the rest of the axis, its label will be more verbose than
    // all others.
    this.establishingTime = this.firstDay || this.firstMajor
  }

  formatLabel(time) {
    var date = new Date(time)
    if (time === this.establishingTime) {
      return date.toDateString()
    } else if (isYearStart(date)) {
      return daysNarrow[date.getDay()] + ' ' + monthsNarrow[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
    } else if (isDayStart(date)) {
      return daysNarrow[date.getDay()] + ' ' + monthsNarrow[date.getMonth()] + ' ' + date.getDate()
    } else {
      // chop off timezone etc.
      return date.toTimeString().substring(0, 8)
    }
  }

  getTickSize(time) {
    if (isDayStart(new Date(time))) {
      return this.dayTickSize
    }
    return super.getTickSize(time)
  }

  getTickColor(time) {
    if (isDayStart(new Date(time))) {
      return this.dayTickColor
    }
    return super.getTickColor(time)
  }

  getGridlineColor(time) {
    if (isDayStart(new Date(time))) {
      return this.dayGridlineColor
    }
    return super.getGridlineColor(time)
  }

  getLabelColor(time) {
    if (isDayStart(new Date(time))) {
      return this.dayLabelColor
    }
    return super.getLabelColor(time)
  }

  getFont(time) {
    if (isDayStart(new Date(time))) {
      return this.dayFont
    }
    return super.getFont(time)
  }

  getPriorityLabelValues() {
    let result = [this.establishingTime]
    if (this.firstDay !== null && this.firstDay !== undefined) {
      for (let time = this.firstDay; time <= this.endValue; time += 86400000) {
        result.push(time)
      }
    }
    return result
  }
}