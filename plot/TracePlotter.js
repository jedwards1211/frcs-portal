export default class TracePlotter {
  /**
   * Clears all unplotted data.
   */
  reset() {}

  /**
   * Adds a point to be plotted.
   * @param {domain} the domain of the point.
   * @param {value} the value of the point.
   * @param {traceRenderer} a renderer interface (see notes at top)
   * @param {domainConversion} conversion for domain axis (see notes at top)
   * @param {valueConversion} conversion for value axis (see notes at top)
   */
  addPoint(domain, value) {}

  /**
   * Sends all unplotted data to the connected TraceRenderer (or whatever
   * the implementation wants)
   */
  flush() {}
}