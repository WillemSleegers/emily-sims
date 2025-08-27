export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  color: string,
  cellSize: number,
  width: number,
  height: number
): void => {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = 1

  const cols = width / cellSize
  const rows = height / cellSize

  // Vertical lines
  for (let i = 1; i < cols; i++) {
    const x = i * cellSize
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
  }

  // Horizontal lines
  for (let j = 1; j < rows; j++) {
    const y = j * cellSize
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
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
