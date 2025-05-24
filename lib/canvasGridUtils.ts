export const resizeGrid = (
  canvas: HTMLCanvasElement,
  cellSize: number
): {
  width: number
  height: number
  displayWidth: number
  displayHeight: number
  cellsX: number
  cellsY: number
} => {
  const parent = canvas.parentElement
  if (!parent) {
    throw new Error("Canvas must have a parent element")
  }

  const dpr = window.devicePixelRatio

  // Calculate how many complete cells fit in each dimension
  const cellsX = Math.max(1, Math.floor(parent.clientWidth / cellSize))
  const cellsY = Math.max(1, Math.floor(parent.clientHeight / cellSize))

  // Width and height equal the number of cells that fit in each dimension
  // times the size of each cell
  const width = cellsX * cellSize
  const height = cellsY * cellSize

  canvas.width = width * dpr
  canvas.height = height * dpr

  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Failed to get 2D rendering context")
  }

  ctx.scale(dpr, dpr)

  return {
    width: canvas.width,
    height: canvas.height,
    displayWidth: width,
    displayHeight: height,
    cellsX: cellsX,
    cellsY: cellsY,
  }
}

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

export const drawGridWithImageData = (
  ctx: CanvasRenderingContext2D,
  gridColor: string,
  cellSize: number,
  width: number,
  height: number
) => {
  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 209, g: 213, b: 220 }
  }

  const { r, g, b } = hexToRgb(gridColor)

  // Draw vertical lines
  for (let x = cellSize; x < width; x += cellSize) {
    const imageData = ctx.createImageData(1, height)
    const data = imageData.data

    // Fill the vertical line
    for (let i = 0; i < data.length; i += 4) {
      data[i] = r // Red
      data[i + 1] = g // Green
      data[i + 2] = b // Blue
      data[i + 3] = 255 // Alpha
    }

    ctx.putImageData(imageData, x, 0)
  }

  // Draw horizontal lines
  for (let y = cellSize; y < height; y += cellSize) {
    const imageData = ctx.createImageData(width, 1)
    const data = imageData.data

    // Fill the horizontal line
    for (let i = 0; i < data.length; i += 4) {
      data[i] = r // Red
      data[i + 1] = g // Green
      data[i + 2] = b // Blue
      data[i + 3] = 255 // Alpha
    }

    ctx.putImageData(imageData, 0, y)
  }
}
