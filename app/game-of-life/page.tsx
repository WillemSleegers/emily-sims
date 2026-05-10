"use client"

import { PointerEvent, useRef, useState } from "react"
import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react"

import { GridInfo } from "@/hooks/useResponsiveGridCanvas"
import { useAnimatedGridCanvas } from "@/hooks/useAnimatedGridCanvas"

import { SimLayout } from "@/components/sim-layout"
import { Canvas } from "@/components/canvas"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"

import {
  LifeGrid,
  createLifeGrid,
  drawLifeGrid,
  randomFillLife,
  stepLife,
} from "@/lib/sims/life"

const CELL_SIZE = 12
const FPS = 10

const GameOfLifePage = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const grid = useRef<LifeGrid>([])
  // Latest play state in a ref so handleUpdate uses the current value
  // without re-binding the callback on every toggle.
  const isPlayingRef = useRef(isPlaying)
  isPlayingRef.current = isPlaying

  // Drag-painting state: when the pointer is down, paintMode holds the
  // value to write to every cell the pointer enters (set on press, based
  // on the initial cell's polarity). null means not dragging.
  const paintMode = useRef<boolean | null>(null)

  const handleUpdate = (_deltaTime: number, gridInfo: GridInfo) => {
    const { rows, cols } = gridInfo

    // Initialize on the first tick with a random pattern.
    if (grid.current.length !== rows || grid.current[0]?.length !== cols) {
      grid.current = createLifeGrid(rows, cols)
      randomFillLife(grid.current)
      return
    }

    if (isPlayingRef.current) {
      grid.current = stepLife(grid.current)
    }
  }

  const handleDraw = (ctx: CanvasRenderingContext2D, gridInfo: GridInfo) => {
    drawLifeGrid(ctx, grid.current, gridInfo.cellSize)
  }

  const { canvasRef, getCellFromPixel, getGridInfo, forceDraw } =
    useAnimatedGridCanvas(CELL_SIZE, handleUpdate, handleDraw, FPS)

  // Press a cell to toggle it, then drag to paint more cells with the
  // same polarity. Pause the sim on press so painted cells aren't
  // immediately killed by the next step.
  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const { row, col } = getCellFromPixel(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY,
    )
    const cell = grid.current[row]?.[col]
    if (cell === undefined) return

    // If the pressed cell was dead, paint alive; if alive, paint dead.
    paintMode.current = !cell
    grid.current[row][col] = paintMode.current
    if (isPlaying) setIsPlaying(false)
    event.currentTarget.setPointerCapture(event.pointerId)
    forceDraw()
  }

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (paintMode.current === null) return
    const { row, col } = getCellFromPixel(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY,
    )
    const cell = grid.current[row]?.[col]
    if (cell === undefined || cell === paintMode.current) return
    grid.current[row][col] = paintMode.current
    forceDraw()
  }

  const handlePointerUp = () => {
    paintMode.current = null
  }

  const reset = () => {
    const { rows, cols } = getGridInfo()
    grid.current = createLifeGrid(rows, cols)
    randomFillLife(grid.current)
    forceDraw()
  }

  const controls = (
    <>
      <Toggle
        pressed={isPlaying}
        onPressedChange={setIsPlaying}
        aria-label={isPlaying ? "Pause" : "Play"}
        variant="outline"
        size="sm"
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </Toggle>
      <Button onClick={reset} variant="ghost" size="icon" aria-label="Reset">
        <RotateCcwIcon />
      </Button>
    </>
  )

  return (
    <SimLayout
      title="Game of Life"
      fullscreen
      showFPS
      borderless
      controls={controls}
    >
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

export default GameOfLifePage
