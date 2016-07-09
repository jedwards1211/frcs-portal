require('canvas-text-metrics-polyfill') // monkey-patches measureText
// (old version gets renamed measureTextWidth)

const polyfilledMeasureText = CanvasRenderingContext2D.prototype.measureText
CanvasRenderingContext2D.prototype.measureText = CanvasRenderingContext2D.prototype.measureTextWidth

export default function measureTextPolyfill(ctx, ...args) {
  return polyfilledMeasureText.apply(ctx, args)
}
