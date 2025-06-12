"use client"

import { useAnimatedGridCanvas } from "@/hooks/useAnimatedGridCanvas"
import { GridInfo } from "@/hooks/useGridCanvas"
import { useRef, useState, useCallback } from "react"

const ResponsiveGameOfLife = () => {
  const [cellSize, setCellSize] = useState(10)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generation, setGeneration] = useState(0)

  const gameState = useRef<boolean[][]>([])
  const lastUpdate = useRef(0)
  const updateInterval = 200 // milliseconds

  const initializeGame = useCallback((rows: number, cols: number) => {
    // Initialize with random pattern
    gameState.current = Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => Math.random() > 0.7)
      )
    setGeneration(0)
    console.log(`Initialized ${rows}×${cols} grid`)
  }, [])

  const countNeighbors = useCallback(
    (row: number, col: number, grid: boolean[][]) => {
      let count = 0
      const rows = grid.length
      const cols = grid[0]?.length || 0

      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue

          const newRow = row + i
          const newCol = col + j

          if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            if (grid[newRow][newCol]) count++
          }
        }
      }
      return count
    },
    []
  )

  const updateGameState = useCallback(() => {
    const current = gameState.current
    if (current.length === 0) return

    const newState = current.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        const neighbors = countNeighbors(rowIndex, colIndex, current)

        if (cell) {
          // Live cell: survive with 2-3 neighbors
          return neighbors === 2 || neighbors === 3
        } else {
          // Dead cell: birth with exactly 3 neighbors
          return neighbors === 3
        }
      })
    )

    gameState.current = newState
    setGeneration((prev) => prev + 1)
  }, [countNeighbors])

  const handleUpdate = (
    deltaTime: number,
    ctx: CanvasRenderingContext2D,
    gridInfo: GridInfo
  ) => {
    const { rows, cols } = gridInfo

    // Reinitialize if grid dimensions changed
    if (
      gameState.current.length !== rows ||
      (gameState.current[0] && gameState.current[0].length !== cols)
    ) {
      initializeGame(rows, cols)
      return
    }

    // Update game logic at specified interval
    if (isPlaying) {
      lastUpdate.current += deltaTime
      if (lastUpdate.current >= updateInterval) {
        updateGameState()
        lastUpdate.current = 0
      }
    }
  }

  const handleDraw = (ctx: CanvasRenderingContext2D, gridInfo: GridInfo) => {
    const { canvasWidth, canvasHeight, cellSize, rows, cols } = gridInfo

    // Don't draw if game state doesn't match current grid dimensions
    if (
      gameState.current.length !== rows ||
      (gameState.current[0] && gameState.current[0].length !== cols)
    ) {
      return // Skip drawing during reinitialization
    }

    // CRITICAL: Fill canvas with background FIRST to prevent white flashing
    // This must happen before anything else
    ctx.fillStyle = "#000000" // Black background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw live cells in white
    ctx.fillStyle = "#ffffff"
    gameState.current.forEach((row, rowIndex) => {
      row.forEach((isAlive, colIndex) => {
        if (isAlive) {
          const { x, y } = getPixelFromCell(rowIndex, colIndex)
          ctx.fillRect(x, y, cellSize, cellSize) // Fill entire cell
        }
      })
    })
  }

  const {
    canvasRef,
    canvasReady,
    getCellFromPixel,
    getPixelFromCell,
    getGridInfo,
    isValidCell,
  } = useAnimatedGridCanvas(cellSize, handleUpdate, handleDraw, 60)

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasReady || isPlaying) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const { row, col } = getCellFromPixel(x, y)

    if (isValidCell(row, col) && gameState.current[row]) {
      gameState.current[row][col] = !gameState.current[row][col]
    }
  }

  const resetGame = () => {
    const { rows, cols } = getGridInfo()
    initializeGame(rows, cols)
    setIsPlaying(false)
  }

  const addGlider = () => {
    const { rows, cols } = getGridInfo()
    if (rows < 5 || cols < 5) return

    // Add a glider pattern at top-left
    const glider = [
      [false, true, false],
      [false, false, true],
      [true, true, true],
    ]

    glider.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (
          gameState.current[r + 1] &&
          gameState.current[r + 1][c + 1] !== undefined
        ) {
          gameState.current[r + 1][c + 1] = cell
        }
      })
    })
  }

  return (
    <div className="h-screen p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Game of Life</h1>

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm">Cell Size:</label>
            <input
              type="range"
              min="5"
              max="30"
              value={cellSize}
              onChange={(e) => setCellSize(parseInt(e.target.value))}
              className="w-20"
              disabled={isPlaying}
            />
            <span className="w-8 text-sm">{cellSize}px</span>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded text-white font-medium ${
              isPlaying
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={resetGame}
            className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white font-medium"
            disabled={isPlaying}
          >
            Reset
          </button>

          <button
            onClick={addGlider}
            className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-medium"
            disabled={isPlaying}
          >
            Add Glider
          </button>
        </div>
      </div>

      <div className="flex-1 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="cursor-pointer"
        />
      </div>

      {canvasReady && (
        <div className="text-sm text-gray-600 text-center">
          Grid: {getGridInfo().cols}×{getGridInfo().rows} | Generation:{" "}
          {generation} |
          {isPlaying ? "Playing" : "Paused - Click cells to toggle"}
        </div>
      )}
    </div>
  )
}

export default ResponsiveGameOfLife
