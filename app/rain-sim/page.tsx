"use client"

import { useRef, MouseEvent } from "react"

import { useCanvasAnimation } from "@/hooks/useAnimatedCanvas"
import { cn } from "@/lib/utils"

import {
  createRaindrop,
  drawRaindrop,
  handleRaindropEdgeCollisions,
  Raindrop,
  updateRaindropPosition,
} from "@/lib/sims/rain"

import { addVectors, createVector, scaleVector } from "@/lib/utils-vector"

const GRAVITY = createVector(0, 9.8)

const RainSimPage = () => {
  const raindrops = useRef<Raindrop[]>([])

  const handleUpdate = (
    deltaTime: number,
    size: { width: number; height: number }
  ) => {
    raindrops.current.forEach((raindrop) => {
      raindrop.acceleration = addVectors(raindrop.acceleration, GRAVITY)
      handleRaindropEdgeCollisions(raindrop, size.height)
      updateRaindropPosition(raindrop, deltaTime)
      raindrop.acceleration = scaleVector(raindrop.acceleration, 0)
    })
  }

  const handleDraw = (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number }
  ) => {
    ctx.clearRect(0, 0, size.width, size.height)
    raindrops.current.forEach((raindrop) => {
      drawRaindrop(ctx, raindrop)
    })
  }

  const { canvasRef, canvasReady } = useCanvasAnimation(
    handleUpdate,
    handleDraw
  )

  // Handle mouse and touch events
  const handleClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasReady) return

    const position = {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    }

    const raindrop = createRaindrop(position, GRAVITY)
    raindrops.current.push(raindrop)
  }

  return (
    <div className="h-screen p-4 flex flex-col gap-2">
      <h1 className="font-semibold text-2xl whitespace-nowrap">
        Emily&apos;s Rain Sim
      </h1>
      <div className="min-h-0 min-w-0 grow">
        <canvas
          ref={canvasRef}
          className={cn(
            "border border-primary rounded",
            !canvasReady && "invisible"
          )}
          onMouseDown={handleClick}
        />
      </div>
    </div>
  )
}

export default RainSimPage
