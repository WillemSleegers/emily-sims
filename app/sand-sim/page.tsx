"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { XIcon } from "lucide-react"

import { useAnimatedGridCanvas } from "@/hooks/useAnimatedGridCanvas"
import { GridInfo } from "@/hooks/useResponsiveGridCanvas"

import { Button } from "@/components/ui/button"

import { hslToHex, hueFromElapsedTime } from "@/lib/utils-colors"

import { SandParticle } from "@/lib/sims/sand"

const FPS = 10
const BRUSH_SIZE = 1

const SandSim = () => {
  const [cellSize, setCellSize] = useState(8)
  const [pouringRate, setPouringRate] = useState(50)
  const [rainbowMode, setRainbowMode] = useState(true)
  const [colorSpeed, setColorSpeed] = useState(50) // How fast colors rotate

  const grid = useRef<SandParticle[][]>([])
  const lastUpdate = useRef(0)
  const updateInterval = 100
  const timeAccumulator = useRef(0) // Track time for color rotation

  // State for continuous pouring
  const isPouring = useRef(false)
  const pouringInterval = useRef<NodeJS.Timeout | null>(null)
  const lastPourPosition = useRef<{ row: number; col: number } | null>(null)

  const initializeGrid = useCallback((rows: number, cols: number) => {
    grid.current = Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => ({ on: false }))
      )
  }, [])

  const updatePhysics = useCallback(() => {
    const current = grid.current
    if (current.length === 0) return

    const rows = current.length
    const cols = current[0].length
    const newGrid = current.map((row) => row.map((cell) => ({ ...cell })))

    for (let row = rows - 2; row >= 0; row--) {
      for (let col = 0; col < cols; col++) {
        if (current[row][col].on) {
          const particle = current[row][col]

          // Try to fall straight down
          if (!newGrid[row + 1][col].on) {
            newGrid[row][col] = { on: false }
            newGrid[row + 1][col] = particle
          }
          // Try to fall diagonally left
          else if (col > 0 && !newGrid[row + 1][col - 1].on) {
            newGrid[row][col] = { on: false }
            newGrid[row + 1][col - 1] = particle
          }
          // Try to fall diagonally right
          else if (col < cols - 1 && !newGrid[row + 1][col + 1].on) {
            newGrid[row][col] = { on: false }
            newGrid[row + 1][col + 1] = particle
          }
        }
      }
    }

    grid.current = newGrid
  }, [])

  const handleUpdate = (deltaTime: number, gridInfo: GridInfo) => {
    const { rows, cols } = gridInfo

    // Update time accumulator for color rotation
    timeAccumulator.current += deltaTime

    // Initialize grid if needed
    if (
      grid.current.length !== rows ||
      (grid.current[0] && grid.current[0].length !== cols)
    ) {
      initializeGrid(rows, cols)
      return
    }

    // Update physics at slow interval
    lastUpdate.current += deltaTime
    if (lastUpdate.current >= updateInterval) {
      updatePhysics()
      lastUpdate.current = 0
    }
  }

  const handleDraw = (ctx: CanvasRenderingContext2D, gridInfo: GridInfo) => {
    const { canvasWidth, canvasHeight, rows, cols } = gridInfo

    if (
      grid.current.length !== rows ||
      (grid.current[0] && grid.current[0].length !== cols)
    ) {
      return
    }

    // Clear with background
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw grid cells
    grid.current.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.on) {
          const x = rowIndex
          const y = colIndex

          if (cell.hue) ctx.fillStyle = hslToHex(cell.hue, 80, 60)

          ctx.fillRect(x, y, cellSize, cellSize)
        }
      })
    })
  }

  const {
    canvasRef,
    getCellFromPixel,
    getGridInfo,

    forceDraw,
  } = useAnimatedGridCanvas(cellSize, handleUpdate, handleDraw, FPS)

  const addSand = useCallback(
    (centerRow: number, centerCol: number) => {
      const { rows, cols } = getGridInfo()
      const currentHue = rainbowMode
        ? hueFromElapsedTime(colorSpeed, timeAccumulator.current)
        : 45

      // Add sand in a brush pattern
      for (let dr = -BRUSH_SIZE + 1; dr < BRUSH_SIZE; dr++) {
        for (let dc = -BRUSH_SIZE + 1; dc < BRUSH_SIZE; dc++) {
          const row = centerRow + dr
          const col = centerCol + dc

          if (row >= 0 && row < rows && col >= 0 && col < cols) {
            if (!grid.current[row][col].on) {
              grid.current[row][col] = {
                on: true,
                hue: currentHue,
              }
            }
          }
        }
      }
    },
    [rainbowMode, colorSpeed, getGridInfo]
  )

  // Helper function to get coordinates from mouse or touch event
  const getEventCoordinates = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return null

      const rect = canvas.getBoundingClientRect()

      let clientX: number
      let clientY: number

      if ("touches" in event) {
        if (event.touches.length === 0) return null
        clientX = event.touches[0].clientX
        clientY = event.touches[0].clientY
      } else {
        clientX = event.clientX
        clientY = event.clientY
      }

      const x = clientX - rect.left
      const y = clientY - rect.top

      const { row, col } = getCellFromPixel(x, y)

      return { row, col }
    },
    [getCellFromPixel, canvasRef]
  )

  // Start continuous pouring
  const startPouring = useCallback(
    (row: number, col: number) => {
      if (isPouring.current) return

      isPouring.current = true
      lastPourPosition.current = { row, col }

      // Pour sand immediately
      addSand(row, col)
      forceDraw()

      // Set up continuous pouring
      pouringInterval.current = setInterval(() => {
        if (lastPourPosition.current) {
          addSand(lastPourPosition.current.row, lastPourPosition.current.col)
          forceDraw()
        }
      }, pouringRate)
    },
    [addSand, forceDraw, pouringRate]
  )

  // Stop continuous pouring
  const stopPouring = useCallback(() => {
    isPouring.current = false
    lastPourPosition.current = null

    if (pouringInterval.current) {
      clearInterval(pouringInterval.current)
      pouringInterval.current = null
    }
  }, [])

  // Update pouring position during drag
  const updatePouringPosition = useCallback((row: number, col: number) => {
    if (isPouring.current) {
      lastPourPosition.current = { row, col }
    }
  }, [])

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      event.preventDefault()

      const coords = getEventCoordinates(event)
      if (coords) {
        startPouring(coords.row, coords.col)
      }
    },
    [getEventCoordinates, startPouring]
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getEventCoordinates(event)
      if (coords && isPouring.current) {
        updatePouringPosition(coords.row, coords.col)
      }
    },
    [getEventCoordinates, updatePouringPosition]
  )

  const handleMouseUp = useCallback(() => {
    stopPouring()
  }, [stopPouring])

  // Touch event handlers
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault()

      const coords = getEventCoordinates(event)
      if (coords) {
        startPouring(coords.row, coords.col)
      }
    },
    [getEventCoordinates, startPouring]
  )

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault()

      const coords = getEventCoordinates(event)
      if (coords && isPouring.current) {
        updatePouringPosition(coords.row, coords.col)
      }
    },
    [getEventCoordinates, updatePouringPosition]
  )

  const handleTouchEnd = useCallback(() => {
    stopPouring()
  }, [stopPouring])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pouringInterval.current) {
        clearInterval(pouringInterval.current)
      }
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    stopPouring()
  }, [stopPouring])

  const clearGrid = () => {
    const { rows, cols } = getGridInfo()
    initializeGrid(rows, cols)
    forceDraw()
  }

  return (
    <div className="h-dvh p-4 flex flex-col gap-4 select-none">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rainbow Sand Simulation</h1>

        <div className="flex gap-4 items-center text-sm">
          <div className="flex items-center gap-2">
            <label>Cell Size:</label>
            <input
              type="range"
              min="4"
              max="20"
              value={cellSize}
              onChange={(e) => setCellSize(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="w-8">{cellSize}px</span>
          </div>

          <div className="flex items-center gap-2">
            <label>Pour Rate:</label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={pouringRate}
              onChange={(e) => setPouringRate(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="w-12">{pouringRate}ms</span>
          </div>

          <div className="flex items-center gap-2">
            <label>
              <input
                type="checkbox"
                checked={rainbowMode}
                onChange={(e) => setRainbowMode(e.target.checked)}
                className="mr-1"
              />
              Rainbow
            </label>
          </div>

          {rainbowMode && (
            <div className="flex items-center gap-2">
              <label>Color Speed:</label>
              <input
                type="range"
                min="1"
                max="99"
                value={colorSpeed}
                onChange={(e) => setColorSpeed(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="w-8">{colorSpeed}</span>
            </div>
          )}

          <Button onClick={clearGrid} variant="ghost">
            <XIcon />
          </Button>
        </div>
      </div>

      <div className="flex-1  bg-gray-900 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="border border-primary touch-none"
        />
      </div>
    </div>
  )
}

export default SandSim
