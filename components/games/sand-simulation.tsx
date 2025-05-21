"use client"

import { useEffect, useRef, useState, MouseEvent, TouchEvent } from "react"
import { clearCanvas } from "@/lib/canvasUtils"

import { Cell } from "@/lib/types"
import { drawGrid, drawCell } from "@/lib/canvasGridUtils"
import { Button } from "@/components/ui/button"
import { CircleXIcon, PlayIcon, SquareIcon } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { hslToHex } from "@/lib/utils"

const SandSimulation = () => {
  // States
  const [canvasSize, setCanvasSize] = useState({ width: 100, height: 0 })
  const [cellSize, setCellSize] = useState(15)
  const [fps, setFps] = useState(10)

  // Track mouse position
  const mousePosition = useRef({ x: 0, y: 0 })
  const isPouring = useRef(false)

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationId = useRef(0)
  const previousTimestamp = useRef(0)
  const timeAccumulator = useRef(0)
  const needsRedraw = useRef(true)

  const cellsRef = useRef<Cell[]>([])
  const cellMapRef = useRef<Map<string, boolean>>(new Map())

  const cellColor = useRef("#FFA500")

  // Function to add a cell, directly updates refs without using React state
  const addCell = (x: number, y: number, color?: string): void => {
    // Skip if outside the canvas bounds
    if (
      x < 1 ||
      y < 1 ||
      x > Math.floor(canvasSize.width / cellSize) ||
      y > Math.floor(canvasSize.height / cellSize)
    ) {
      return
    }

    const key = `${x},${y}`
    if (!cellMapRef.current.has(key)) {
      cellsRef.current.push({
        x,
        y,
        color: color || cellColor.current,
      })
      cellMapRef.current.set(key, true)
      needsRedraw.current = true
    }
  }

  // Handle canvas resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current

      if (canvas) {
        const parent = canvas.parentElement
        if (parent) {
          // Get the DPR and size of the canvas
          const dpr = window.devicePixelRatio

          const width = Math.floor(parent.clientWidth / cellSize) * cellSize
          const height =
            Math.floor(parent.clientHeight / cellSize) * cellSize - cellSize // Figure out why subtracting by something fixes the height resizing

          console.log(width * dpr)
          console.log(height * dpr)

          // Set the "actual" size of the canvas
          canvas.width = width * dpr
          canvas.height = height * dpr

          const ctx = canvas.getContext("2d", { alpha: false })!
          ctx.scale(dpr, dpr)

          canvas.style.width = `${width}px`
          canvas.style.height = `${height}px`

          setCanvasSize({ width, height })
          needsRedraw.current = true
        }
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [cellSize])

  // Draw all cells
  const drawAllCells = (ctx: CanvasRenderingContext2D): void => {
    clearCanvas(ctx)

    // Draw grid
    drawGrid(ctx, "#d1d5dc", cellSize, canvasSize.width, canvasSize.height)

    // Draw all cells
    cellsRef.current.forEach((cell) => {
      drawCell(ctx, cellSize, cell.x, cell.y, cell.color)
    })
  }

  // Add sand at the current mouse position
  const pourSand = (): void => {
    // Safety check
    if (!isPouring.current) return

    // Add main particle
    addCell(mousePosition.current.x, mousePosition.current.y)

    // Add some randomness for a more natural pour effect
    if (Math.random() > 0.5) {
      const offset = Math.random() > 0.5 ? 1 : -1
      addCell(mousePosition.current.x + offset, mousePosition.current.y)
    }
  }

  // Update all cells - physics calculation
  const updateCellPositions = (): void => {
    if (cellsRef.current.length === 0) return

    const maxX = Math.floor(canvasSize.width / cellSize)
    const maxY = Math.floor(canvasSize.height / cellSize)

    // Create a new array and map for the updated positions
    const newCells: Cell[] = []
    const newCellMap = new Map<string, boolean>()

    // Update positions
    cellsRef.current.forEach((cell) => {
      // Copy the cell to avoid mutation
      let newX = cell.x
      let newY = cell.y

      // Only try to move if not at bottom
      if (newY < maxY) {
        // Check for space directly below
        if (!cellMapRef.current.has(`${newX},${newY + 1}`)) {
          newY = newY + 1
        }
        // Check for space down-left
        else if (
          newX > 1 &&
          !cellMapRef.current.has(`${newX - 1},${newY + 1}`)
        ) {
          newX = newX - 1
          newY = newY + 1
        }
        // Check for space down-right
        else if (
          newX < maxX &&
          !cellMapRef.current.has(`${newX + 1},${newY + 1}`)
        ) {
          newX = newX + 1
          newY = newY + 1
        }
      }

      const newKey = `${newX},${newY}`

      // If this position is already taken in our new map, it means another
      // particle has already moved there during this update - keep old position
      if (newCellMap.has(newKey)) {
        newCells.push(cell)
        newCellMap.set(`${cell.x},${cell.y}`, true)
      } else {
        newCells.push({ x: newX, y: newY, color: cell.color })
        newCellMap.set(newKey, true)
      }
    })

    // Replace the old cells with new ones
    cellsRef.current = newCells
    cellMapRef.current = newCellMap
    needsRedraw.current = true
  }

  // Mouse event handlers
  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>): void => {
    // Convert mouse position to grid coordinates
    const x = Math.floor(event.nativeEvent.offsetX / cellSize) + 1
    const y = Math.floor(event.nativeEvent.offsetY / cellSize) + 1

    // Update mouse position
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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Initialize with a draw
    drawAllCells(ctx)

    const frameInterval = 1000 / fps

    // For sand pouring
    let timeSinceLastParticle = 0
    const particleInterval = 1000 / 20 // 20 = pour rate

    const animate = (timestamp: number) => {
      if (previousTimestamp.current === 0) {
        previousTimestamp.current = timestamp
        animationId.current = window.requestAnimationFrame(animate)
        return
      }

      const deltaTime = timestamp - previousTimestamp.current
      previousTimestamp.current = timestamp
      timeAccumulator.current += deltaTime

      // Update the current color based on timestamp
      const now = timestamp / 1000
      const hue = (now * 10) % 360 // 0-360 degrees of color wheel
      const saturation = 75 // 0-100%
      const lightness = 60 // 0-100%

      cellColor.current = hslToHex(hue, saturation, lightness)

      // Handle sand pouring
      if (isPouring.current) {
        timeSinceLastParticle += deltaTime

        // Pour sand at a regular interval
        if (timeSinceLastParticle >= particleInterval) {
          pourSand()
          timeSinceLastParticle = 0
        }
      }

      // Update physics at fixed time steps
      if (timeAccumulator.current >= frameInterval) {
        timeAccumulator.current -= frameInterval
        updateCellPositions()
      }

      // Draw only when needed
      if (needsRedraw.current) {
        drawAllCells(ctx)
        needsRedraw.current = false
      }

      animationId.current = window.requestAnimationFrame(animate)
    }

    animationId.current = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(animationId.current)
      previousTimestamp.current = 0
    }
  }, [canvasSize, cellSize, fps])

  // Controls for the simulation
  const clearCells = () => {
    cellsRef.current = []
    cellMapRef.current.clear()
    needsRedraw.current = true

    // Force a redraw immediately
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) drawAllCells(ctx)
    }
  }

  const handleCellSizeChange = (newSize: number) => {
    // Clear cells when changing size
    cellsRef.current = []
    cellMapRef.current.clear()
    needsRedraw.current = true
    setCellSize(newSize)
  }

  return (
    <div className="h-full p-4 flex flex-col gap-4">
      <div className="flex gap-x-4 justify-center">
        <Button variant="outline" size="icon" onClick={clearCells}>
          <CircleXIcon />
        </Button>
        <ToggleGroup
          type="single"
          defaultValue="10"
          onValueChange={(value) => setFps(Number(value))}
        >
          <ToggleGroupItem value="10">
            <PlayIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="25">
            <div className="flex">
              <PlayIcon />
              <PlayIcon />
            </div>
          </ToggleGroupItem>
          <ToggleGroupItem value="60">
            <div className="flex">
              <PlayIcon />
              <PlayIcon />
              <PlayIcon />
            </div>
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup
          type="single"
          defaultValue="15"
          onValueChange={(value) => handleCellSizeChange(Number(value))}
        >
          <ToggleGroupItem value="10">
            <SquareIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="15">
            <SquareIcon className="size-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="50">
            <SquareIcon className="size-6" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="grow flex justify-center">
        <canvas
          ref={canvasRef}
          className="border-2 rounded border-gray-300"
          width={canvasSize.width}
          height={canvasSize.height}
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

export default SandSimulation
