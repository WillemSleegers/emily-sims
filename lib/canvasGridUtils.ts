export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  color: string,
  size: number,
  width: number,
  height: number
): void => {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = 2

  const cols = width / size
  const rows = height / size

  // Vertical lines
  for (let i = 1; i < cols; i++) {
    ctx.moveTo(i * size, 0)
    ctx.lineTo(i * size, height)
  }

  // Horizontal lines
  for (let j = 1; j < rows; j++) {
    ctx.moveTo(0, j * size)
    ctx.lineTo(width, j * size)
  }

  ctx.stroke()
}

export const drawCell = (
  ctx: CanvasRenderingContext2D,
  size: number,
  x: number,
  y: number,
  color: string = "#FFA500"
): void => {
  ctx.fillStyle = color
  // Subtract 1 since our cell coordinates are 1-indexed
  ctx.fillRect((x - 1) * size, (y - 1) * size, size, size)
}
