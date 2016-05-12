import CanvasTraceRenderer from './CanvasTraceRenderer'

export default class FillToZeroCanvasTraceRenderer extends CanvasTraceRenderer {
  constructor(ctx, zeroY = 0) {
    super(ctx)
    this.zeroY = zeroY
  }

  drawLine(line) {
    var {ctx, zeroY} = this

    if (line.length < 2) {
        return
      }
    else if (line.length === 2) {
        ctx.fillRect(line[0], Math.min(line[1], zeroY), 1, Math.abs(line[1] - zeroY))
      }
        else {
        ctx.beginPath()
        ctx.moveTo(line[0], line[1])
        for (var i = 2; i < line.length - 1; i += 2) {
            ctx.lineTo(line[i], line[i + 1])
          }
        i -= 2
        for (; i >= 0; i -= 2) {
            ctx.lineTo(line[i], zeroY)
          }
        ctx.closePath()
        ctx.fill()
      }
  }

  drawFill(fill) {
    if (fill.length < 2) {
        return
      }

    var {ctx, zeroY} = this

    ctx.beginPath()
    ctx.moveTo(fill[0], fill[1])
    for (var i = 2; i < fill.length - 1; i += 2) {
        ctx.lineTo(fill[i], fill[i] < fill[i - 2] ? zeroY : fill[i + 1])
      }
    ctx.closePath()
    ctx.fill()
  }
}
