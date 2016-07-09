import TracePlotter from './TracePlotter'

/**
 * Wraps a TracePlotter, and inserts extra points to create steps between points that would create
 * diagonal lines.
 */
export default class StepTracePlotter extends TracePlotter {
  lastPoint = [NaN, NaN];

  constructor(wrappedPlotter) {
    super()
    this.wrappedPlotter = wrappedPlotter
  }

  reset() {
    this.lastPoint[0] = this.lastPoint[1] = NaN
    this.wrappedPlotter.reset()
  }

  flush() {
    this.lastPoint[0] = this.lastPoint[1] = NaN
    this.wrappedPlotter.flush()
  }

  addPoint(domain, value) {
    if (!isNaN(this.lastPoint[1]) && domain > this.lastPoint[0] && value !== this.lastPoint[1]) {
      this.wrappedPlotter.addPoint(domain, this.lastPoint[1])
    }
    this.wrappedPlotter.addPoint(domain, value)
    this.lastPoint[0] = domain
    this.lastPoint[1] = value
  }
}
