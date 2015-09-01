/**
 * Base class for conversions.  Right now there is only LinearConversion;
 * in the future there could also be LogConversion.
 */
export default class Conversion {
  /**
   * Creates a Conversion.  The arguments are exactly the same
   * as those for set().
   */
  constructor(...args) {
      this.set(...args);
  }

  /**
   * @param d some value.
   * @returns the display position for d, in pixels.
   */
  convert(d) {
    return NaN;
  }
  /**
   * @param d a display position, in px.
   * @returns the value at d
   */
  invert(d) {
    return NaN;
  }

  /**
   * @returns a copy of this conversion.
   */
  clone() {
    return new Conversion();
  }

  /**
   * Offsets the conversion so that convert(a) === b.  If c and d are also given,
   * scales the conversion so that convert(c) === d also.
   * @return this conversion
   * @throws Error if the operation would set any internal values to NaN or turn this
   * conversion into a non-monotonic function
   */
  set(a, b, c, d) {
    return this;
  }

  /**
   * Zooms while keeping a given point fixed.
   * @param{center} the point to keep fixed, in domain coordinates (what you pass into
   * convert()).  convert(center) before zoom() will equal convert(center) after zoom.
   * @param{factor} the zoom factor.  If convert() converts from data coordinates to
   * screen coordinates, < 1 means zoom in, > 1 means zoom out.
   */
  zoom( center , factor ) {
    return this;
  }

  /**
   * @return a nice increment (in the domain) that produces ticks at least
   * minTickSpacingPixels apart, and is divisible by subIncrement, if given.
   */
  chooseNiceIncrement(minTickSpacingPixels, subIncrement) {
    return NaN;
  }
}
