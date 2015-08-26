/**
 * Base class for conversions.  Right now there is only LinearConversion;
 * in the future there could also be LogConversion.
 */
export default class Conversion {
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
}