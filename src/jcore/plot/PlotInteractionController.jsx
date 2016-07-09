import React from 'react'
import _ from 'lodash'

import LinearConversion from './LinearConversion'

const WHEEL_DELAY = 25

function copyTouch(touch, boundingClientRect) {
  return {
    id: touch.identifier,
    elementX: touch.pageX - boundingClientRect.left,
    elementY: touch.pageY - boundingClientRect.top,
  }
}

export default class PlotInteractionController extends React.Component {
  constructor(props) {
    super(props)
    this.touches = []
    this._lastWheelAnim = 0
    this._wheelMotion = 0
  }

  static propTypes = {
    xConversion: React.PropTypes.instanceOf(LinearConversion),
    yConversion: React.PropTypes.instanceOf(LinearConversion),
    minXRange:   React.PropTypes.number,
    maxXRange:   React.PropTypes.number,
    minYRange:   React.PropTypes.number,
    maxYRange:   React.PropTypes.number,
    onMoveStart: React.PropTypes.func,
    onMove:      React.PropTypes.func,
    onMoveEnd:   React.PropTypes.func,
    children:    React.PropTypes.node.isRequired,
  };

  onMouseDown = (e) => {
    if (e.button === 0) {
      let {xConversion, yConversion, onMoveStart} = this.props
      e.preventDefault()
      this.target = e.target

      let rect = e.target.getBoundingClientRect()
      if (xConversion) this.startX = xConversion.invert(e.clientX - rect.left)
      if (yConversion) this.startY = yConversion.invert(e.clientY - rect.top)
      this.startXConversion = xConversion
      this.startYConversion = yConversion

      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp, true)

      if (onMoveStart) onMoveStart()
    }
  };
  onMouseMove = (e) => {
    e.preventDefault()

    let rect = this.target.getBoundingClientRect()

    let newXConversion, newYConversion

    if (this.startXConversion) {
      newXConversion = this.startXConversion.clone().set(this.startX, e.clientX - rect.left)
    }
    if (this.startYConversion) {
      newYConversion = this.startYConversion.clone().set(this.startY, e.clientY - rect.top)
    }

    if (this.props.onMove) {
      this.props.onMove(newXConversion, newYConversion)
    }
  };
  onMouseUp = (e) => {
    if (e.button === 0) {
      e.preventDefault()
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp, true)

      this.target = undefined
      if (this.props.onMoveEnd) this.props.onMoveEnd()
    }
  };

  onWheel = (e) => {
    function wheelDirection(e) {
      if (e.hasOwnProperty('deltaY')) {
        return -e.deltaY
      }
      else if (e.detail) {
        return e.detail < 0 ? 1 : -1
      }
      else {
        return 0
      }
    }

    const animate = () => {
      this._lastWheelAnim = Date.now()

      let rect = e.target.getBoundingClientRect()

      let {xConversion, yConversion, onMove, onMoveStart, onMoveEnd,
        minXRange, maxXRange, minYRange, maxYRange} = this.props

      let zoom = Math.pow(0.999, this._wheelMotion)
      this._wheelMotion = 0
      let newXConversion, newYConversion

      if (xConversion) {
        newXConversion = new LinearConversion(xConversion)
        let anchorX = e.clientX - rect.left
        newXConversion.zoom(xConversion.invert(anchorX), zoom)
                      .clampDomain(0, rect.width, anchorX, minXRange, maxXRange)
      }
      if (yConversion) {
        newYConversion = new LinearConversion(yConversion)
        let anchorY = e.clientY - rect.top
        newYConversion.zoom(yConversion.invert(anchorY), zoom)
                      .clampDomain(0, rect.height, anchorY, minYRange, maxYRange)
      }
      if (onMoveStart)  onMoveStart()
      if (onMove)       onMove(newXConversion, newYConversion)
      if (onMoveEnd)    onMoveEnd()
    }

    e.preventDefault()

    this._wheelMotion += wheelDirection(e)

    const now = Date.now()
    const delay = this._lastWheelAnim + WHEEL_DELAY - now

    if (delay <= 0) {
      animate()
    }
    else {
      setTimeout(() => {
        if (this._mounted) animate()
      }, delay)
    }
  };
  onTouchStart = (e) => {
    let alreadyMoving = Object.keys(this.touches).length
    if (alreadyMoving) e.preventDefault()

    let {xConversion, yConversion, onMoveStart} = this.props

    let rect = e.target.getBoundingClientRect()

    _.forEach(e.changedTouches, t => {
      t = copyTouch(t, rect)
      t.startElementX = t.elementX
      t.startElementY = t.elementY
      if (xConversion) t.startX = xConversion.invert(t.elementX)
      if (yConversion) t.startY = yConversion.invert(t.elementY)
      this.touches[t.id] = t
    })

    if (!alreadyMoving && onMoveStart) onMoveStart()
  };
  onTouchMove = (e) => {
    e.preventDefault()
    let {onMove, xConversion, yConversion,
      minXRange, maxXRange, minYRange, maxYRange} = this.props

    let rect = e.target.getBoundingClientRect()

    _.forEach(e.changedTouches, t => _.assign(this.touches[t.identifier], copyTouch(t, rect)))

    if (onMove) {
      let newXConversion, newYConversion

      let keys = Object.keys(this.touches)
      let touchCount = keys.length
      if (touchCount === 1) {
        let t = this.touches[keys[0]]
        if (xConversion) newXConversion = xConversion.clone().set(t.startX, t.elementX)
        if (yConversion) newYConversion = yConversion.clone().set(t.startY, t.elementY)
      }
      else if (touchCount > 1) {
        if (xConversion) {
          let t1, t2
          // I tried using _.min and _.max for this, and it completely froze Safari on my iPad 2...WTF???
          for (let key of keys) {
            let t = this.touches[key]
            if (!t1 || t.elementX < t1.elementX) t1 = t
            if (!t2 || t.elementX > t2.elementX) t2 = t
          }
          if (t1.startX !== t2.startX && t1.elementX !== t2.elementX) {
            let x1, x2
            if ((t1.startElementX > t2.startElementX) != (t1.elementX > t2.elementX)) {
              x1 = t2.startX
              x2 = t1.startX
            }
            else {
              x1 = t1.startX
              x2 = t2.startX
            }
            newXConversion = new LinearConversion(x1, t1.elementX, x2, t2.elementX)
              .clampDomain(0, rect.width, (t1.elementX + t2.elementX) * 0.5, minXRange, maxXRange)
          }
        }
        if (yConversion) {
          let t1, t2
          // I tried using _.min and _.max for this, and it completely froze Safari on my iPad 2...WTF???
          for (let key of keys) {
            let t = this.touches[key]
            if (!t1 || t.elementY < t1.elementY) t1 = t
            if (!t2 || t.elementY > t2.elementY) t2 = t
          }
          if (t1.startY !== t2.startY && t1.elementY !== t2.elementY) {
            let y1, y2
            if ((t1.startElementY > t2.startElementY) != (t1.elementY > t2.elementY)) {
              y1 = t2.startY
              y2 = t1.startY
            }
            else {
              y1 = t1.startY
              y2 = t2.startY
            }
            newYConversion = new LinearConversion(y1, t1.elementY, y2, t2.elementY)
              .clampDomain(0, rect.height, (t1.elementY + t2.elementY) * 0.5, minYRange, maxYRange)
          }
        }
      }

      onMove(newXConversion, newYConversion)
    }
  };
  onTouchEnd = (e) => {
    _.forEach(e.changedTouches, t => delete this.touches[t.identifier])
    if (!Object.keys(this.touches).length && this.props.onMoveEnd) {
      this.props.onMoveEnd()
    }
  };
  onTouchCancel = (e) => {
    this.onTouchEnd(e)
  };
  render() {
    return React.cloneElement(this.props.children, {
      ref: 'target',
      onMouseDown: this.onMouseDown,
      onWheel: this.onWheel,
      onTouchStart: this.onTouchStart,
      onTouchMove: this.onTouchMove,
      onTouchEnd: this.onTouchEnd,
      onTouchCancel: this.onTouchCancel,
    })
  }
}