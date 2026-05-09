"use client"

import { MouseEvent, useRef } from "react"

import { useAnimatedGridCanvas } from "@/hooks/useAnimatedGridCanvas"
import { GridInfo } from "@/hooks/useResponsiveGridCanvas"

import { SimLayout } from "@/components/sim-layout"
import { Canvas } from "@/components/canvas"

const CELL_SIZE = 50
const FPS = 5

type Cell = {
  row: number
  col: number
}

const TestGrid = () => {
  const cells = useRef<Cell[]>([])

  const handleUpdate = (_deltaTime: number, gridInfo: GridInfo) => {
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
    <SimLayout title="Grid Test" fullscreen showFPS>
      <Canvas
        ref={canvasRef}
        onMouseDown={handleOnMouseDown}
        className="select-none"
      />
    </SimLayout>
  )
}

export default TestGrid
