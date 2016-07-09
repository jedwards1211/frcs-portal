import React from 'react'

import {Layer} from './Canvas'

import {GridMetrics} from './GridMetrics'
import {Side} from '../utils/orient'
import OverlapPreventer from './OverlapPreventer'

export default class GridAxis extends Layer {
  static propTypes = {
    metrics:                    React.PropTypes.instanceOf(GridMetrics).isRequired,
    tickSide:                   React.PropTypes.instanceOf(Side).isRequired,
    backgroundColor:            React.PropTypes.string,
    transparentBackgroundColor: React.PropTypes.string,
    clip:                       React.PropTypes.bool,
    justifyEndLabels:           React.PropTypes.bool,
    fadeSpan:                   React.PropTypes.number
  };
  static defaultProps = {
    backgroundColor:            'white',
    transparentBackgroundColor: 'rgba(255,255,255,0)',
    clip:                       false,
    justifyEndLabels:           false,
    fadeSpan:                   20
  };
  paint(canvas) {
    let {metrics, tickSide, backgroundColor, transparentBackgroundColor, justifyEndLabels, clip, fadeSpan} = this.props
    let axis = tickSide.axis.opposite
    let {conversion, startPx, endPx} = metrics

    let ctx = canvas.getContext('2d')

    ctx.save()

    let minSide = metrics.startValue < metrics.endValue ? axis.minSide : axis.maxSide
    let maxSide = minSide.opposite

    let length = endPx - startPx
    let thickness = canvas[axis.opposite.span]

    if (clip) {
      // clip to metrics.startPx and metrics.endPx
      ctx.rect(...axis.reorder(startPx - 0.5, 0, length + 1, thickness))
      ctx.clip()
    }

    tickSide.alignText(ctx)

    let tickSidePos = tickSide.positionInCanvas(canvas)
    if (tickSide.direction > 0) tickSidePos -= 1

    let textOffset = tickSidePos - (metrics.maxTickSize + 2) * tickSide.direction

    let labelOverlapPreventer = new OverlapPreventer()

    function paintLabel(label, value) {
      let px = conversion.convert(value)
      let alignedPx = Math.round(px + 0.5) - 0.5
      let font = ctx.font = metrics.getFont(value)
      let labelPx

      let labelMetrics = ctx.measureText(label)
      labelMetrics.height = (parseFloat(font) * 0.8) || 10
      let labelMinPx = alignedPx - labelMetrics[axis.span] / 2
      let labelMaxPx = alignedPx + labelMetrics[axis.span] / 2

      if (alignedPx <= startPx || alignedPx >= endPx) return

      if (justifyEndLabels && labelMinPx < startPx) {
        axis.minSide.alignText(ctx)
        labelPx = labelMinPx = startPx
        labelMaxPx = labelMinPx + labelMetrics[axis.span]
      }
      else if (justifyEndLabels && labelMaxPx > endPx) {
        axis.maxSide.alignText(ctx)
        labelPx = labelMaxPx = endPx
        labelMinPx = labelMaxPx - labelMetrics[axis.span]
      }
      else {
        labelPx = alignedPx
        axis.centerText(ctx)
      }

      if (labelOverlapPreventer.insert(labelMinPx, labelMaxPx, 10)) {
        ctx.strokeStyle = ctx.fillStyle = metrics.getLabelColor(value)
        ctx.fillText(label, ...axis.reorder(labelPx, textOffset))

        if (justifyEndLabels) {
          if (labelMinPx < startPx) {
            let gradient = ctx.createLinearGradient(...axis.reorder(startPx - 0.5, 0, startPx - 0.5 + fadeSpan, 0))
            gradient.addColorStop(0, backgroundColor)
            gradient.addColorStop(1, transparentBackgroundColor)
            ctx.fillStyle = gradient
            ctx.fillRect(...axis.reorder(Math.min(startPx - 0.5, 0), 0, fadeSpan, thickness))
          }

          if (labelMaxPx > endPx) {
            let gradient = ctx.createLinearGradient(...axis.reorder(endPx + 0.5, 0, endPx + 0.5 - fadeSpan, 0))
            gradient.addColorStop(0, backgroundColor)
            gradient.addColorStop(1, transparentBackgroundColor)
            ctx.fillStyle = gradient
            ctx.fillRect(...axis.reorder(endPx + 0.5 - fadeSpan, 0, fadeSpan, thickness))
          }
        }
      }
    }

    let priorityLabelValues = metrics.getPriorityLabelValues()
    if (priorityLabelValues && priorityLabelValues.forEach) {
      priorityLabelValues.forEach(value => paintLabel(metrics.formatLabel(value), value))
    }

    // start on the nearest major tick offscreen to the left in case some of its label extends into view
    let value = metrics.firstMajor - metrics.majorIncrement

    // go up to the nearest major tick offscreen to the right in case some of its label extends into view
    while (maxSide.isInside(value, metrics.endValue + metrics.majorIncrement)) {
      let px = conversion.convert(value)
      let alignedPx = Math.round(px + 0.5) - 0.5

      let tickSize = metrics.getTickSize(value)

      ctx.strokeStyle = metrics.getTickColor(value)

      if (px >= startPx && px <= endPx) {
        // paint the tick
        ctx.beginPath()
        axis.moveTo(ctx, alignedPx, tickSidePos)
        axis.lineTo(ctx, alignedPx, tickSidePos - tickSize * tickSide.direction)
        ctx.stroke()
      }

      // paint a label if we're on a major increment
      if (metrics.isMajorTick(value)) paintLabel(metrics.formatLabel(value), value)

      value += metrics.minorIncrement
    }

    if (!justifyEndLabels) {
      let gradient
      gradient = ctx.createLinearGradient(...axis.reorder(startPx - 0.5, 0, startPx - 0.5 + fadeSpan, 0))
      gradient.addColorStop(0, backgroundColor)
      gradient.addColorStop(1, transparentBackgroundColor)
      ctx.fillStyle = gradient
      ctx.fillRect(...axis.reorder(startPx - 0.5, 0, fadeSpan, thickness))

      gradient = ctx.createLinearGradient(...axis.reorder(endPx + 0.5, 0, endPx + 0.5 - fadeSpan, 0))
      gradient.addColorStop(0, backgroundColor)
      gradient.addColorStop(1, transparentBackgroundColor)
      ctx.fillStyle = gradient
      ctx.fillRect(...axis.reorder(endPx + 0.5 - fadeSpan, 0, fadeSpan, thickness))
    }

    ctx.restore()
  }
}
