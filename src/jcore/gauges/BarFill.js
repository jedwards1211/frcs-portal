import React from 'react'
import ValueFillMixin from './ValueFillMixin'
import {Side, xAxis} from '../utils/orient'

export default React.createClass({
  mixins: [ValueFillMixin],
  propTypes: {
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    minSide: React.PropTypes.instanceOf(Side).isRequired,
  },
  render() {
    function validNumbers() {
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i]
        if (!isFinite(arg) || !(arg >= 0)) return false
      }
      return true
    }

    var {min, max, x, y, width, height, minSide, ...restProps} = this.props
    var value = this.getTransitionValue()
    var axis = minSide.axis

    if (min === max && value === min && !isNaN(min) && min !== null && isFinite(min)) {
      return <rect ref="fill" x={x} y={y} width={width} height={height} {...restProps} />
    }

    if (minSide.direction > 0) {
      var swap = min
      min = max
      max = swap
    }

    var span = axis.select(width, height)
    var zeroX = -min * span / (max - min)
    var valueX = (value - min) * span / (max - min)

    var x0 = Math.max(0, Math.min(zeroX, valueX))
    var x1 = Math.min(span, Math.max(zeroX, valueX))

    if (axis === xAxis) {
      x += x0
      width = x1 - x0
    }
    else {
      y += x0
      height = x1 - x0
    }

    if (validNumbers(x, width)) {
      return <rect ref="fill" x={x} y={y} width={width} height={height} {...restProps} />
    }
    return <rect />
  }
})
