/* eslint no-unused-vars: [1, {"args": "none"}] */

import _ from 'lodash'

export function Side(props) {
  _.assign(this, props)
}

export var leftSide = new Side({
  name: 'left',
  capName: 'Left',
  offsetName: 'offsetLeft',
  direction: -1,
  positionInCanvas(canvas) {
    return 0
  },
  alignText(ctx) {
    ctx.textAlign = 'left'
  },
  isInside(x, threshold) {
    return x >= threshold
  },
  setInRect(rect, value) {
    rect.x = value
  },
  getFromRect(rect) {
    return rect.x
  }
})
export var rightSide = new Side({
  name: 'right',
  capName: 'Right',
  offsetName: 'offsetRight',
  direction: 1,
  positionInCanvas(canvas) {
    return canvas.width
  },
  alignText(ctx) {
    ctx.textAlign = 'right'
  },
  isInside(x, threshold) {
    return x <= threshold
  },
  setInRect(rect, value) {
    rect.x = value - rect.width
  },
  getFromRect(rect) {
    return rect.x + rect.width
  }
})
export var topSide = new Side({
  name: 'top',
  capName: 'Top',
  offsetName: 'offsetTop',
  direction: -1,
  positionInCanvas(canvas) {
    return 0
  },
  alignText(ctx) {
    ctx.textBaseline = 'hanging'
  },
  isInside(y, threshold) {
    return y >= threshold
  },
  setInRect(rect, value) {
    rect.y = value
  },
  getFromRect(rect) {
    return rect.y
  }
})
export var bottomSide = new Side({
  name: 'bottom',
  capName: 'Bottom',
  offsetName: 'offsetBottom',
  direction: 1,
  positionInCanvas(canvas) {
    return canvas.height
  },
  alignText(ctx) {
    ctx.textBaseline = 'alphabetic'
  },
  isInside(y, threshold) {
    return y <= threshold
  },
  setInRect(rect, value) {
    rect.y = value - rect.height
  },
  getFromRect(rect) {
    return rect.y + rect.height
  }
})

export var sides = {
  left: leftSide,
  right: rightSide,
  top: topSide,
  bottom: bottomSide
}

export var directionSides = {
  up: topSide,
  down: bottomSide,
  left: leftSide,
  right: rightSide
}

export function Axis(props) {
  _.assign(this, props)
}

export var xAxis = new Axis({
  name: 'x',
  capitalName: 'X',
  clientName: 'clientX',
  pageName: 'pageX',
  screenName: 'screenX',
  span: 'width',
  offsetSpan: 'offsetWidth',
  scrollSpan: 'scrollWidth',
  index: 0,
  select(x, y) {
    return x
  },
  /**
   * Reorders the given arguments to [x, y] or [x, y, width, height]
   * according to which axis this is
   */
  reorder(parallel, perp, parallelSpan, perpSpan) {
    if (parallelSpan !== undefined) {
      return [parallel, perp, parallelSpan, perpSpan]
    }
    return [parallel, perp]
  },
  centerText(ctx) {
    ctx.textAlign = 'center'
  },
  moveTo(ctx, parallel, perp) {
    ctx.moveTo(parallel, perp)
  },
  lineTo(ctx, parallel, perp) {
    ctx.lineTo(parallel, perp)
  }
})
export var yAxis = new Axis({
  name: 'y',
  capitalName: 'Y',
  clientName: 'clientY',
  pageName: 'pageY',
  screenName: 'screenY',
  span: 'height',
  offsetSpan: 'offsetHeight',
  scrollSpan: 'scrollHeight',
  index: 1,
  select(x, y) {
    return y
  },
  /**
   * Reorders the given arguments to [x, y] or [x, y, width, height]
   * according to which axis this is
   */
  reorder(parallel, perp, parallelSpan, perpSpan) {
    if (parallelSpan !== undefined) {
      return [perp, parallel, perpSpan, parallelSpan]
    }
    return [perp, parallel]
  },
  centerText(ctx) {
    ctx.textBaseline = 'middle'
  },
  moveTo(ctx, parallel, perp) {
    ctx.moveTo(perp, parallel)
  },
  lineTo(ctx, parallel, perp) {
    ctx.lineTo(perp, parallel)
  }
})

export var axes = {
  x: xAxis,
  y: yAxis
}

xAxis.opposite = yAxis
yAxis.opposite = xAxis

leftSide.opposite = rightSide
rightSide.opposite = leftSide
topSide.opposite = bottomSide
bottomSide.opposite = topSide

leftSide.axis = rightSide.axis = xAxis
topSide.axis = bottomSide.axis = yAxis

xAxis.loSide = xAxis.lowSide = xAxis.minSide = leftSide
xAxis.hiSide = xAxis.highSide = xAxis.maxSide = rightSide
yAxis.loSide = yAxis.lowSide = yAxis.minSide = topSide
yAxis.hiSide = yAxis.highSide = yAxis.maxSide = bottomSide
