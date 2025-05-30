"use client"

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  MouseEvent,
  TouchEvent,
} from "react"
import { CircleXIcon, PlayIcon, SquareIcon } from "lucide-react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"

import { clearCanvas } from "@/lib/canvas-utils"
import { drawCell, resizeGrid } from "@/lib/canvas-grid-utils"

import { Cell } from "@/lib/types"
import { hslToHex } from "@/lib/utils"

const DEFAULT_CELL_SIZE = 10
const DEFAULT_FPS = 10

const SandSim = () => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasSize = useRef({ width: 0, height: 0 })
  const animationId = useRef(0)
  const mousePosition = useRef({ x: 0, y: 0 })
  const isPouring = useRef(false)
  const cells = useRef<Cell[]>([])
  const cellsMap = useRef<Map<string, boolean>>(new Map())
  const currentCellColor = useRef("#FFA500")

  // States
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE)
  const [fps, setFps] = useState(DEFAULT_FPS)

  // Cell logic
  const updateCells = useCallback((): void => {
    if (cells.current.length === 0) return

    const maxX = Math.floor(canvasSize.current.width / cellSize)
    const maxY = Math.floor(canvasSize.current.height / cellSize)

    // Create a new array and map for the updated positions
    const newCells: Cell[] = []
    const newCellMap = new Map<string, boolean>()

    // Update positions
    cells.current.forEach((cell) => {
      let newX = cell.x
      let newY = cell.y

      // Only try to move if not at bottom
      if (newY < maxY) {
        // Check for space directly below
        if (!cellsMap.current.has(`${newX},${newY + 1}`)) {
          newY = newY + 1
        }
        // Check for space down-left
        else if (newX > 1 && !cellsMap.current.has(`${newX - 1},${newY + 1}`)) {
          newX = newX - 1
          newY = newY + 1
        }
        // Check for space down-right
        else if (
          newX < maxX &&
          !cellsMap.current.has(`${newX + 1},${newY + 1}`)
        ) {
          newX = newX + 1
          newY = newY + 1
        }
      }

      const newKey = `${newX},${newY}`

      // If position is taken, keep old position
      if (newCellMap.has(newKey)) {
        newCells.push(cell)
        newCellMap.set(`${cell.x},${cell.y}`, true)
      } else {
        newCells.push({ x: newX, y: newY, color: cell.color })
        newCellMap.set(newKey, true)
      }
    })

    cells.current = newCells
    cellsMap.current = newCellMap
  }, [cellSize])

  const pourSand = (): void => {
    if (!isPouring.current) return

    const x = mousePosition.current.x
    const y = mousePosition.current.y
    const color = currentCellColor.current

    // Add sand particle
    const key = `${x},${y}`
    if (!cellsMap.current.has(key)) {
      cells.current.push({
        x,
        y,
        color: color,
      })
      cellsMap.current.set(key, true)
    }
  }

  const clearCells = () => {
    cells.current = []
    cellsMap.current.clear()
    draw()
  }

  const updateColor = useCallback((timestamp: number): void => {
    if (isPouring.current) {
      const now = timestamp / 1000
      const hue = (now * 30) % 360
      const saturation = 50 + Math.sin(now * 0.5) * 15 // Varying saturation
      const lightness = 55 + Math.sin(now * 0.3) * 10 // Varying brightness
      currentCellColor.current = hslToHex(hue, saturation, lightness)
    }
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    clearCanvas(ctx, canvasSize.current.width, canvasSize.current.height)
    cells.current.forEach((cell) => {
      drawCell(ctx, cellSize, cell.x, cell.y, cell.color)
    })
  }, [cellSize])

  // Handle resizing
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dimensions = resizeGrid(canvas, cellSize)
    canvasSize.current.width = dimensions.displayWidth
    canvasSize.current.height = dimensions.displayHeight
  }, [cellSize])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas?.parentElement) return

    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })

    // Watch the parent container for size changes
    resizeObserver.observe(canvas.parentElement)

    // Initial size
    handleResize()

    // Also listen for window resize as backup
    window.addEventListener("resize", handleResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", handleResize)
    }
  }, [handleResize])

  // Mouse and touch event handlers
  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>): void => {
    // Convert mouse position to grid coordinates
    const x = Math.floor(event.nativeEvent.offsetX / cellSize) + 1
    const y = Math.floor(event.nativeEvent.offsetY / cellSize) + 1

    mousePosition.current = { x, y }

    // Start pouring
    isPouring.current = true

    // Force one immediate sand particle
    pourSand()
  }

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>): void => {
    // Convert mouse position to grid coordinates
    const x = Math.floor(event.nativeEvent.offsetX / cellSize) + 1
    const y = Math.floor(event.nativeEvent.offsetY / cellSize) + 1

    // Update mouse position
    mousePosition.current = { x, y }
  }
  const handleMouseUp = (): void => {
    isPouring.current = false
  }

  const handleMouseLeave = (): void => {
    isPouring.current = false
  }

  const handleTouchStart = (event: TouchEvent<HTMLCanvasElement>): void => {
    event.preventDefault() // Prevent scrolling/zooming

    if (event.touches.length > 0) {
      const touch = event.touches[0]
      const rect = canvasRef.current?.getBoundingClientRect()

      if (rect) {
        // Convert touch position to grid coordinates
        const x = Math.floor((touch.clientX - rect.left) / cellSize) + 1
        const y = Math.floor((touch.clientY - rect.top) / cellSize) + 1

        // Update mouse position
        mousePosition.current = { x, y }

        // Start pouring
        isPouring.current = true

        // Force one immediate sand particle
        pourSand()
      }
    }
  }

  const handleTouchMove = (event: TouchEvent<HTMLCanvasElement>): void => {
    event.preventDefault() // Prevent scrolling/zooming

    if (event.touches.length > 0 && isPouring.current) {
      const touch = event.touches[0]
      const rect = canvasRef.current?.getBoundingClientRect()

      if (rect) {
        // Convert touch position to grid coordinates
        const x = Math.floor((touch.clientX - rect.left) / cellSize) + 1
        const y = Math.floor((touch.clientY - rect.top) / cellSize) + 1

        // Update mouse position
        mousePosition.current = { x, y }
      }
    }
  }

  const handleTouchEnd = (): void => {
    isPouring.current = false
  }

  // Loop
  useEffect(() => {
    const interval = 1000 / fps
    let previousTimestamp = 0
    let timeAccumulator = 0

    const animate = (timestamp: number) => {
      if (previousTimestamp === 0) {
        previousTimestamp = timestamp
        animationId.current = window.requestAnimationFrame(animate)
        return
      }

      const deltaTime = timestamp - previousTimestamp
      previousTimestamp = timestamp
      timeAccumulator += deltaTime

      // Draw and update cells at the specified FPS
      if (timeAccumulator >= interval) {
        timeAccumulator -= interval

        updateColor(timestamp)
        pourSand()
        updateCells()
        draw()
      }

      animationId.current = window.requestAnimationFrame(animate)
    }

    animationId.current = window.requestAnimationFrame(animate)

    return () => {
      if (animationId.current) {
        window.cancelAnimationFrame(animationId.current)
        animationId.current = 0
      }
    }
  }, [draw, fps, updateCells, updateColor])

  return (
    <div className="h-dvh p-2 sm:p-3 md:p-4 flex flex-col gap-2">
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between">
        <h1 className="font-semibold text-2xl whitespace-nowrap">
          Emily Sand Sim
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Button
            variant="outline"
            size="icon"
            className="border-none shadow-none"
            onClick={clearCells}
          >
            <CircleXIcon className="size-6" />
          </Button>
          <ToggleGroup
            type="single"
            className="flex gap-1"
            defaultValue={DEFAULT_FPS.toString()}
            onValueChange={(value) => setFps(Number(value))}
          >
            <ToggleGroupItem value="5" className="rounded-md">
              <PlayIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="10" className="rounded-md">
              <div className="flex">
                <PlayIcon />
                <PlayIcon />
              </div>
            </ToggleGroupItem>
            <ToggleGroupItem value="60" className="rounded-md">
              <div className="flex">
                <PlayIcon />
                <PlayIcon />
                <PlayIcon />
              </div>
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            type="single"
            className="flex gap-1"
            defaultValue={DEFAULT_CELL_SIZE.toString()}
            onValueChange={(value) => setCellSize(Number(value))}
          >
            <ToggleGroupItem
              value="5"
              aria-label="Small grid"
              className="rounded-md"
            >
              <SquareIcon className="scale-75" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="10"
              aria-label="Medium grid"
              className="rounded-md"
            >
              <SquareIcon className="scale-100" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="25"
              aria-label="Large grid"
              className="rounded-md"
            >
              <SquareIcon className="scale-125" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex justify-center items-center">
        <canvas
          ref={canvasRef}
          className="rounded border border-primary w-full h-full max-w-full max-h-full select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        />
      </div>
    </div>
  )
}

export default SandSim
