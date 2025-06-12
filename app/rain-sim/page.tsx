"use client"

import { useEffect, useRef } from "react"

import { useCanvasAnimation } from "@/hooks/useAnimatedCanvas"

import { clearCanvas } from "@/lib/utils-canvas"

import {
  createRaindrop,
  drawRaindrop,
  handleRaindropEdgeCollisions,
  updateRaindropPosition,
} from "@/lib/sims/rain"

import { Raindrop } from "@/lib/types"

const STEP_SIZE = 10

const RainSimPage = () => {
  const raindrops = useRef<Raindrop[]>([])

  const handleUpdate = (
    deltaTime: number,
    size: { width: number; height: number }
  ) => {
    raindrops.current.forEach((raindrop) => {
      handleRaindropEdgeCollisions(raindrop, size.height)
      updateRaindropPosition(raindrop, deltaTime)
    })
  }

  const handleDraw = (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number }
  ) => {
    clearCanvas(ctx, size.width, size.height)
    raindrops.current.forEach((raindrop) => {
      drawRaindrop(ctx, raindrop)
    })
  }

  const { canvasRef, canvasReady, getSize } = useCanvasAnimation(
    handleUpdate,
    handleDraw
  )

  // Perform setup
  useEffect(() => {
    if (!canvasReady) return

    const size = getSize()
    for (let i = 0; i < STEP_SIZE; i++) {
      raindrops.current.push(createRaindrop(size.width, size.height))
    }
  }, [canvasReady, getSize])

  // Handle mouse and touch events
  const handleClick = () => {
    if (!canvasReady) return
    const size = getSize()
    for (let i = 0; i < STEP_SIZE; i++) {
      raindrops.current.push(createRaindrop(size.width, size.height))
    }
  }

  return (
    <div className="h-screen p-4 flex flex-col gap-2">
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between">
        <h1 className="font-semibold text-2xl whitespace-nowrap">
          Emily&apos;s Rain Sim
        </h1>
      </div>
      <div className="min-h-0 min-w-0 grow">
        <canvas
          ref={canvasRef}
          className="border border-primary rounded w-full h-full"
          onMouseDown={handleClick}
        />
      </div>
    </div>
  )
}

export default RainSimPage
