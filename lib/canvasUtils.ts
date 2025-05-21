export const clearCanvas = (ctx: CanvasRenderingContext2D): void => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

export const draw = (ctx: CanvasRenderingContext2D, dt: number) => {
  ctx.fillStyle = "red"
  ctx.beginPath()
  ctx.arc(50, 100, 20 * Math.sin(dt * 0.001) ** 2, 0, 2 * Math.PI)
  ctx.fill()
}

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  ctx.beginPath()
  ctx.lineWidth = 20
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

export const drawCircle = (ctx: CanvasRenderingContext2D): void => {
  ctx.beginPath()
  ctx.lineWidth = 2
  ctx.arc(95, 50, 40, 0, 2 * Math.PI)
  ctx.stroke()
}
