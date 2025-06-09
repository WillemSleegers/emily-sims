export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  ctx.clearRect(0, 0, width, height)
}

export const drawRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill?: string,
  stroke?: string
) => {
  if (fill) {
    ctx.fillStyle = fill
    ctx.fillRect(x, y, width, height)
  }

  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.strokeRect(x, y, width, height)
  }
}
