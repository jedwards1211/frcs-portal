/* @flow weak */

import Conversion from './Conversion'

import * as GridMath from './GridMath'

function requireFinite(number) {
  if (isNaN(number)) {
    throw new Error("argument must not be NaN")
  }
  if (!isFinite(number)) {
    throw new Error("arugment must be finite")
  }
  return number
}

function requireNotZero(number) {
  if (number === 0) {
    throw new Error("argument must not be zero")
  }
  return number
}

export default class LinearConversion extends Conversion {
  constructor(...args) {
    super(...args)
  }

  convert(d) {
    return d * this.scale + this.offset
  }

  invert(d) {
    return (d - this.offset) / this.scale
  }

  clone() {
    var {scale, offset} = this
    return new LinearConversion({scale, offset})
  }

  set(a, b, c, d) {
    if (c !== undefined) {
      // a * s + o == b
      // c * s + o == d
      // (a - c) * s == b - d
      // s == (b - d) / (a - c)
      // o == b - a * s
      var newScale = requireNotZero(requireFinite((b - d) / (a - c)))
      var newOffset = requireFinite(b - a * newScale)
      this.scale = newScale
      this.offset = newOffset
    }
    else if (b !== undefined) {
      this.offset = requireFinite(b - a * this.scale)
    }
    else if (a !== undefined) {
      this.offset = a.offset
      this.scale = a.scale
    }
    return this
  }

  zoom(center, factor) {
    var scale = requireNotZero(requireFinite(this.scale / factor))
    // c * s1 + o1 == c * s2 + o2
    // o2 = c * s1 + o1 - c * s2
    var offset = requireFinite(center * this.scale + this.offset - center * scale)
    this.scale = scale
    this.offset = offset
    return this
  }

  /**
   * Changes the scale and offset so that Math.abs(invert(r1) - invert(r2)) >= minRange (if given)
   * and <= maxRange (if given), and so that invert(center) is the same value before and after the
   * change.
   * @param{number} r1 - the first control point in range coordinates
   * @param{number} r2 - the second control point in range coordinates
   * @param{number} center - the anchor point in range coordinates
   * @param{number | void} minRange - the minimum range to clamp to in domain coordinates
   * @param{number | void} maxRange - the maximum range to clamp to in domain coordinates
   * @returns {LinearConversion} this, for chaining
   * @throws if any of the input values would produce a conversion with NaN or Infinite scale or
   * offset.
   */
  clampDomain(r1: number, r2: number, center: number, minRange: number | void, maxRange: number | void) {
    // minRange <= |((r1 - o') / s') - ((r2 - o') / s')| <= maxRange
    // minRange <= |(r1 - r2) / s'| <= maxRange
    minRange = minRange ? Math.abs(minRange) : NaN
    maxRange = maxRange ? Math.abs(maxRange) : NaN
    let newScale = this.scale
    let diff = requireNotZero(requireFinite(Math.abs(r1 - r2)))
    if (Math.abs(diff / newScale) < minRange) newScale = Math.sign(this.scale) * diff / minRange
    else if (Math.abs(diff / newScale) > maxRange) newScale = Math.sign(this.scale) * diff / maxRange

    if (newScale !== this.scale) {
      // (center - o) / s  == (center - o') / s'
      // -o' = (center - o) / s * s' - center
      // o' = center - (center - o) / s * s'
      let newOffset = requireFinite(center - (center - this.offset) / this.scale * newScale)
      this.scale = newScale
      this.offset = newOffset
    }
    else {
      requireFinite(center)
    }
    return this
  }

  chooseNiceIncrement(minTickSpacingPixels, subIncrement) {
    return GridMath.chooseNiceIncrement(1 / this.scale, minTickSpacingPixels, subIncrement)
  }

  chooseNiceTimeIncrement(minTickSpacingPixels, subIncrement) {
    return GridMath.chooseNiceTimeIncrement(1 / this.scale, minTickSpacingPixels, subIncrement)
  }
}
