"use client"

import { useCallback, useEffect, useRef } from "react"

import { FPSCounter } from "@/components/FPSCounter"

import { useAnimatedCanvas } from "@/hooks/useAnimatedCanvas"

import { clearCanvas } from "@/lib/utils-canvas"

import { Circle } from "@/lib/types"

import {
  createCircle,
  drawCircle,
  handleCircleEdgeCollisions,
  updateCirclePosition,
} from "@/lib/sims/test"

const FPS = 60
const CIRCLES = 10

const TestPage = () => {
  const circles = useRef<Circle[]>([])

  // Setup
  // Start by adding a few circles to the canvas
  const setup = useCallback((size: { width: number; height: number }) => {
    for (let i = 1; i <= CIRCLES; i++) {
      circles.current.push(createCircle(size.width, size.height))
    }
  }, [])

  // Move the circles around and have them bounce off of the edges
  const handleUpdate = (
    deltaTime: number,
    size: { width: number; height: number }
  ) => {
    circles.current.forEach((circle) => {
      handleCircleEdgeCollisions(circle, size.width, size.height)
      updateCirclePosition(circle, deltaTime)
    })
  }

  // Draw the circles
  const handleDraw = (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number }
  ) => {
    clearCanvas(ctx, size.width, size.height)
    circles.current.forEach((circle) => {
      drawCircle(ctx, circle)
    })
  }

  const { canvasRef, canvasReady, getSize } = useAnimatedCanvas(
    handleUpdate,
    handleDraw,
    FPS
  )

  useEffect(() => {
    if (!canvasReady) return

    const size = getSize()
    setup(size)
  }, [canvasReady, getSize, setup])

  return (
    <div className="h-screen p-4 flex flex-col gap-2">
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between">
        <h1 className="font-semibold text-2xl whitespace-nowrap">Test</h1>
        <FPSCounter position="top-right" />
      </div>
      <div className="min-h-0 min-w-0 grow">
        <canvas
          ref={canvasRef}
          className="border border-primary rounded w-full h-full"
        />
      </div>
    </div>
  )
}

export default TestPage
