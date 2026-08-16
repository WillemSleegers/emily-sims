import { useRef } from "react"
import { useResponsiveCanvas } from "@/hooks/useResponsiveCanvas"

export type Cell = {
  x: number
  y: number
  color: string
}

export type GridInfo = {
  cellSize: number
  rows: number
  cols: number
  canvasWidth: number
  canvasHeight: number
}

type UseResponsiveGridCanvasOptions = {
  // Called after the canvas has been resized and prepared for high-DPI drawing.
  onResize?: (ctx: CanvasRenderingContext2D, gridInfo: GridInfo) => void
}

export const useResponsiveGridCanvas = (
  cellSize: number,
  options: UseResponsiveGridCanvasOptions = {},
) => {
  // GridInfo mirrors canvas size but adds row/col counts. We update it in
  // computeSize (called during resize) and read it from the helpers below.
  const gridInfo = useRef<GridInfo>({
    cellSize,
    rows: 0,
    cols: 0,
    canvasWidth: 0,
    canvasHeight: 0,
  })

  const onResizeRef = useRef(options.onResize)
  onResizeRef.current = options.onResize

  const responsive = useResponsiveCanvas({
    // Snap canvas dimensions to multiples of cellSize so cells always fit
    // exactly — otherwise a partial cell at the right/bottom edge would need
    // special-case handling in draw and hit-testing code.
    computeSize: ({ width: containerWidth, height: containerHeight }) => {
      const cols = Math.floor(containerWidth / cellSize)
      const rows = Math.floor(containerHeight / cellSize)
      const canvasWidth = cols * cellSize
      const canvasHeight = rows * cellSize

      gridInfo.current = { cellSize, rows, cols, canvasWidth, canvasHeight }

      return { width: canvasWidth, height: canvasHeight }
    },
    onResize: (ctx) => onResizeRef.current?.(ctx, gridInfo.current),
  })

  const getGridInfo = () => gridInfo.current

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    strokeStyle = "white",
    lineWidth = 1,
  ) => {
    const { canvasWidth, canvasHeight, rows, cols } = gridInfo.current

    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = lineWidth

    // Vertical lines at every column boundary
    for (let i = 0; i <= cols; i++) {
      const x = i * cellSize
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
      ctx.stroke()
    }

    // Horizontal lines at every row boundary
    for (let i = 0; i <= rows; i++) {
      const y = i * cellSize
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
      ctx.stroke()
    }
  }

  const drawCell = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    fillStyle = "red",
  ) => {
    ctx.beginPath()
    ctx.fillStyle = fillStyle
    ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize)
    ctx.fill()
  }

  // Convert a pixel coordinate to a row/col, clamped to the grid bounds.
  const getCellFromPixel = (x: number, y: number) => {
    const row = Math.floor(y / cellSize)
    const col = Math.floor(x / cellSize)
    const { rows, cols } = gridInfo.current

    return {
      row: Math.max(0, Math.min(row, rows - 1)),
      col: Math.max(0, Math.min(col, cols - 1)),
    }
  }

  const getPixelFromCell = (row: number, col: number) => ({
    x: col * cellSize,
    y: row * cellSize,
  })

  const isValidCell = (row: number, col: number) => {
    const { rows, cols } = gridInfo.current
    return row >= 0 && row < rows && col >= 0 && col < cols
  }

  return {
    canvasRef: responsive.canvasRef,
    canvasReady: responsive.canvasReady,
    getContext: responsive.getContext,
    getGridInfo,
    getCellFromPixel,
    getPixelFromCell,
    isValidCell,
    drawGrid,
    drawCell,
  }
}
