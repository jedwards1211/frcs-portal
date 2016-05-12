import React from 'react'

import {Layer} from './Canvas'

import AutoFatTracePlotter from './AutoFatTracePlotter'
import StepTracePlotter from './StepTracePlotter'
import CanvasTraceRenderer from './CanvasTraceRenderer'

import {Axis, xAxis, yAxis} from '../utils/orient'

import color from 'css-color-converter'

const conversionPropType = React.PropTypes.shape({
  convert: React.PropTypes.func.isRequired,
  invert:  React.PropTypes.func.isRequired,
})

export default class Trace extends Layer {
  static propTypes = {
    // function*(from: number, to: number, {surround: bool})
    //    yields {t: number, v: number}, or undefined when done
    pointGenerator:   React.PropTypes.func.isRequired,
    lineColor:        React.PropTypes.string,
    fillColor:        React.PropTypes.string,
    domainConversion: conversionPropType.isRequired,
    valueConversion:  conversionPropType.isRequired,
    // (domainConversion, valueConversion, renderer) => TracePlotter
    plotter:          React.PropTypes.func,
    // (CanvasRenderingContext2D) => TraceRenderer
    renderer:         React.PropTypes.func,
    domainAxis:       React.PropTypes.instanceOf(Axis),
    currentTime:      React.PropTypes.number,
  };
  static defaultProps = {
    lineColor:        '#00f',
    plotter:          (...args) => new StepTracePlotter(new AutoFatTracePlotter(...args)),
    renderer:         ctx => new CanvasTraceRenderer(ctx),
    domainAxis:       xAxis,
  };
  paint(canvas) {
    var ctx = canvas.getContext('2d')
    ctx.save()

    var {pointGenerator, lineColor, fillColor, domainConversion, valueConversion,
        plotter, renderer, domainAxis, currentTime} = this.props

    if (!fillColor) {
      var rgba = color(lineColor).toRgbaArray()
      rgba[3] = 0.5
      fillColor = color(rgba).toRgbString()
    }

    if (domainAxis === yAxis) {
      // swap x and y
      ctx.setTransform(0, 1, 1, 0, 0, 0)
    }

    renderer        = renderer(ctx)

    ctx.strokeStyle = lineColor
    ctx.lineWidth = 1.3
    ctx.fillStyle   = fillColor

    plotter         = plotter(domainConversion, valueConversion, renderer)

    var leftDomain  = domainConversion.invert(0)
    var rightDomain = domainConversion.invert(canvas[domainAxis.span])

    let points = pointGenerator(leftDomain, rightDomain, {surround: true, currentTime})
    let next
    while (!(next = points.next()).done) {
      let {t, v} = next.value
      plotter.addPoint(t, v)
    }

    // don't forget to flush, otherwise some of the plotted data might not get drawn.
    plotter.flush()

    ctx.restore()
  }
}
