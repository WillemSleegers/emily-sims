"use client"

import { PointerEvent, useRef, useState } from "react"
import { XIcon } from "lucide-react"

import { useAnimatedGridCanvas } from "@/hooks/useAnimatedGridCanvas"
import { GridInfo } from "@/hooks/useResponsiveGridCanvas"

import { SimLayout } from "@/components/sim-layout"
import { Canvas } from "@/components/canvas"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/ui/color-picker"

import {
  SandGrid,
  addSandParticle,
  createSandGrid,
  drawSandGrid,
  resizeSandGrid,
  updateSandGrid,
} from "@/lib/sims/sand"

const CELL_SIZE = 8
const FPS = 30

const DEFAULT_COLOR = "#e6c068"

const SandSim = () => {
  const [color, setColor] = useState(DEFAULT_COLOR)
  const grid = useRef<SandGrid>([])
  const pourCell = useRef<{ row: number; col: number } | null>(null)

  const handleUpdate = (_deltaTime: number, gridInfo: GridInfo) => {
    const { rows, cols } = gridInfo

    // Resize the grid to match the canvas. Existing particles are kept
    // in place (anchored top-left); new space is empty.
    if (grid.current.length !== rows || grid.current[0]?.length !== cols) {
      grid.current = resizeSandGrid(grid.current, rows, cols)
    }

    if (pourCell.current) {
      const { row, col } = pourCell.current
      addSandParticle(grid.current, row, col, color)
    }

    grid.current = updateSandGrid(grid.current)
  }

  const handleDraw = (ctx: CanvasRenderingContext2D, gridInfo: GridInfo) => {
    drawSandGrid(ctx, grid.current, gridInfo.cellSize)
  }

  const { canvasRef, getCellFromPixel, getGridInfo, forceDraw } =
    useAnimatedGridCanvas(CELL_SIZE, handleUpdate, handleDraw, FPS)

  // Pointer events handle mouse and touch in one path. setPointerCapture
  // ensures we keep receiving move/up events even if the pointer leaves
  // the canvas while held.
  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    pourCell.current = getCellFromPixel(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY,
    )
  }

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!pourCell.current) return
    pourCell.current = getCellFromPixel(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY,
    )
  }

  const handlePointerUp = () => {
    pourCell.current = null
  }

  const clearGrid = () => {
    const { rows, cols } = getGridInfo()
    grid.current = createSandGrid(rows, cols)
    forceDraw()
  }

  const controls = (
    <>
      <ColorPicker value={color} onValueChange={setColor} />
      <Button onClick={clearGrid} variant="ghost" size="icon">
        <XIcon />
      </Button>
    </>
  )

  return (
    <SimLayout title="Sand" fullscreen showFPS borderless controls={controls}>
      <Canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="select-none"
      />
    </SimLayout>
  )
}

export default SandSim
