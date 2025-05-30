export const resizeCanvas = (
  canvas: HTMLCanvasElement
): {
  width: number
  height: number
  displayWidth: number
  displayHeight: number
} => {
  const parent = canvas.parentElement
  if (!parent) {
    throw new Error("Canvas must have a parent element")
  }

  const width = parent.clientWidth
  const height = parent.clientHeight

  const dpr = window.devicePixelRatio

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
  }
}

export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  ctx.clearRect(0, 0, width, height)
}

export const drawPulsingCircle = (
  ctx: CanvasRenderingContext2D,
  dt: number
) => {
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

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void => {
  ctx.beginPath()
  ctx.lineWidth = 2
  ctx.arc(x, y, 40, 0, 2 * Math.PI)
  ctx.stroke()
}
