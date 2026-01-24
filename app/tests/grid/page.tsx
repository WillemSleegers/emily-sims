"use client"

import { MouseEvent, useRef } from "react"

import { useAnimatedGridCanvas } from "@/hooks/useAnimatedGridCanvas"
import { GridInfo } from "@/hooks/useResponsiveGridCanvas"

const CELL_SIZE = 50
const FPS = 5

type Cell = {
  row: number
  col: number
}

const TestGrid = () => {
  const cells = useRef<Cell[]>([])

  const handleUpdate = (deltaTime: number, gridInfo: GridInfo) => {
    const { rows } = gridInfo

    cells.current.forEach((cell) => {
      if (cell.row < rows - 1) cell.row += 1
    })
  }

  const handleDraw = (ctx: CanvasRenderingContext2D, gridInfo: GridInfo) => {
    ctx.clearRect(0, 0, gridInfo.canvasWidth, gridInfo.canvasHeight)
    drawGrid(ctx)
    cells.current.forEach((cell) => drawCell(ctx, cell.col, cell.row))
  }

  const { canvasRef, forceDraw, drawGrid, getCellFromPixel, drawCell } =
    useAnimatedGridCanvas(CELL_SIZE, handleUpdate, handleDraw, FPS)

  const handleOnMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const x = event.nativeEvent.offsetX
    const y = event.nativeEvent.offsetY

    const cell = getCellFromPixel(x, y)
    cells.current.push(cell)

    forceDraw()
  }

  return (
    <div className="h-dvh p-4 flex flex-col gap-4 select-none">
      <h1 className="text-2xl font-bold">Grid Test</h1>
      <div className="flex-1 flex items-center justify-center min-h-0">
        <canvas
          ref={canvasRef}
          className="border border-primary touch-none"
          width={0}
          height={0}
          onMouseDown={handleOnMouseDown}
        />
      </div>
    </div>
  )
}

export default TestGrid
