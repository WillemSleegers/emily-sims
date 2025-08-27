import { useRef, useEffect, useCallback, useState } from "react"

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

export const useResponsiveGridCanvas = (cellSize: number) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const gridInfo = useRef<GridInfo>({
    cellSize,
    rows: 0,
    cols: 0,
    canvasWidth: 0,
    canvasHeight: 0,
  })

  const [canvasReady, setCanvasReady] = useState(false)

  const calculateGridDimensions = useCallback(
    (containerWidth: number, containerHeight: number): GridInfo => {
      // Simply calculate how many cells fit
      const cols = Math.floor(containerWidth / cellSize)
      const rows = Math.floor(containerHeight / cellSize)

      // Calculate actual canvas dimensions
      const canvasWidth = cols * cellSize
      const canvasHeight = rows * cellSize

      return {
        cellSize,
        rows,
        cols,
        canvasWidth,
        canvasHeight,
      }
    },
    [cellSize]
  )

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas?.parentElement) return

    const parent = canvas.parentElement

    const containerWidth = parent.clientWidth
    const containerHeight = parent.clientHeight

    const newGridInfo = calculateGridDimensions(containerWidth, containerHeight)

    // Only resize if dimensions actually changed
    const current = gridInfo.current
    if (
      current.canvasWidth === newGridInfo.canvasWidth &&
      current.canvasHeight === newGridInfo.canvasHeight &&
      current.rows === newGridInfo.rows &&
      current.cols === newGridInfo.cols
    ) {
      return
    }

    gridInfo.current = newGridInfo

    const dpr = window.devicePixelRatio

    // Set canvas dimensions
    canvas.width = newGridInfo.canvasWidth * dpr
    canvas.height = newGridInfo.canvasHeight * dpr
    canvas.style.width = `${newGridInfo.canvasWidth}px`
    canvas.style.height = `${newGridInfo.canvasHeight}px`

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    if (newGridInfo.canvasWidth > 0 && newGridInfo.canvasHeight > 0) {
      setCanvasReady(true)
    }
  }, [calculateGridDimensions])

  // Re-run when cellSize changes
  useEffect(() => {
    if (canvasReady) {
      handleResize()
    }
  }, [cellSize, handleResize, canvasReady])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas?.parentElement) return

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvas.parentElement)
    handleResize()

    return () => {
      resizeObserver.disconnect()
    }
  }, [handleResize])

  const getContext = useCallback(() => {
    return canvasRef.current?.getContext("2d") || null
  }, [])

  const getGridInfo = useCallback(() => gridInfo.current, [])

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, strokeStyle = "white", lineWidth = 1) => {
      const { canvasWidth, canvasHeight, rows, cols } = gridInfo.current

      ctx.strokeStyle = strokeStyle
      ctx.lineWidth = lineWidth

      // Draw vertical lines
      for (let i = 0; i <= cols; i++) {
        const x = i * cellSize
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasHeight)
        ctx.stroke()
      }

      // Draw horizontal lines
      for (let i = 0; i <= rows; i++) {
        const y = i * cellSize
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvasWidth, y)
        ctx.stroke()
      }
    },
    [cellSize]
  )

  const drawCell = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      fillStyle = "red"
    ) => {
      ctx.beginPath()
      ctx.fillStyle = fillStyle
      ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize)
      ctx.fill()
    },
    [cellSize]
  )

  const getCellFromPixel = useCallback(
    (x: number, y: number) => {
      const row = Math.floor(y / cellSize)
      const col = Math.floor(x / cellSize)
      const { rows, cols } = gridInfo.current

      return {
        row: Math.max(0, Math.min(row, rows - 1)),
        col: Math.max(0, Math.min(col, cols - 1)),
      }
    },
    [cellSize]
  )

  const getPixelFromCell = useCallback(
    (row: number, col: number) => {
      return {
        x: col * cellSize,
        y: row * cellSize,
      }
    },
    [cellSize]
  )

  const isValidCell = useCallback((row: number, col: number) => {
    const { rows, cols } = gridInfo.current
    return row >= 0 && row < rows && col >= 0 && col < cols
  }, [])

  return {
    canvasRef,
    canvasReady,
    getContext,
    getGridInfo,
    getCellFromPixel,
    getPixelFromCell,
    isValidCell,
    drawGrid,
    drawCell,
  }
}
