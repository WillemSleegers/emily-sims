"use client"

import { useRef, useEffect, useCallback } from "react"

import { clearCanvas, resizeCanvas } from "@/lib/canvas-utils"

import { Raindrop } from "@/lib/types"
import { drawRaindrop } from "@/lib/sim-rain"
import { randomNumber } from "@/lib/random"
import { scale } from "@/lib/utils"

const FPS = 30
const STEP_SIZE = 10

const RainSim = () => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasSize = useRef({ width: 0, height: 0 })
  const animationId = useRef(0)

  const raindrops = useRef<Raindrop[]>([])

  const addRainDrops = (n: number): void => {
    for (let i = 0; i < n; i++) {
      const x = randomNumber(0, canvasSize.current.width)
      const y = randomNumber(-canvasSize.current.height, 0)
      const z = randomNumber(0, 20)

      const len = scale(z, 0, 20, 10, 20)
      const v = scale(z, 0, 20, 5, 20)

      const raindrop = {
        x: x,
        y: y,
        z: z,
        len: len,
        v: v,
        color: "#4e6881",
      }
      raindrops.current.push(raindrop)
    }
  }

  const updateRaindrops = (): void => {
    // Skip if there are no raindrops
    if (raindrops.current.length === 0) return

    // Update raindrops position and color
    raindrops.current.forEach((raindrop) => {
      if (raindrop.y > canvasSize.current.height) {
        raindrop.y = 0
      } else {
        raindrop.y = raindrop.y + raindrop.v
      }
    })
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    clearCanvas(ctx, canvasSize.current.width, canvasSize.current.height)
    raindrops.current.forEach((raindrop) => {
      drawRaindrop(ctx, raindrop)
    })
  }, [])

  // Loop
  useEffect(() => {
    const interval = 1000 / FPS
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

        draw()
        updateRaindrops()
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
  }, [draw])

  // Handle resizing
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dimensions = resizeCanvas(canvas)

    // Skip if sizes didn't change
    if (
      canvasSize.current.width == dimensions.displayWidth &&
      canvasSize.current.height == dimensions.displayHeight
    )
      return

    canvasSize.current.width = dimensions.displayWidth
    canvasSize.current.height = dimensions.displayHeight

    // Recreate the raindrops
    const currentCount = raindrops.current.length
    raindrops.current = []
    addRainDrops(currentCount)
  }, [])

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

  // Handle mouse and touch events
  const handleClick = () => {
    addRainDrops(STEP_SIZE)
  }

  return (
    <div className="h-dvh p-2 sm:p-3 md:p-4 flex flex-col gap-2">
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between">
        <h1 className="font-semibold text-2xl whitespace-nowrap">
          Emily Rain Sim
        </h1>
      </div>
      <div className="flex-1 min-h-0 flex justify-center items-center">
        <canvas
          ref={canvasRef}
          className="rounded border border-primary w-full h-full max-w-full max-h-full select-none"
          onMouseDown={handleClick}
        />
      </div>
    </div>
  )
}

export default RainSim
