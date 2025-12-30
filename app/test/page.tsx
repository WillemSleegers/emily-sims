"use client"

import { useEffect, useRef } from "react"

import { useCanvasAnimation } from "@/hooks/useAnimatedCanvas"

import { FPSCounter } from "@/components/FPSCounter"

import {
  Circle,
  createCircle,
  drawCircle,
  handleCircleEdgeCollisions,
  updateCirclePosition,
} from "@/lib/sims/test"
import { randomNumber } from "@/lib/random/random"
import { createVectorFromAngle } from "@/lib/utils-vector"

const CIRCLES = 10

const TestPage = () => {
  const circles = useRef<Circle[]>([])

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
    ctx.clearRect(0, 0, size.width, size.height)
    circles.current.forEach((circle) => {
      drawCircle(ctx, circle)
    })
  }

  const { canvasRef, canvasReady, getSize } = useCanvasAnimation(
    handleUpdate,
    handleDraw
  )

  // On setup
  useEffect(() => {
    if (!canvasReady) return

    const size = getSize()
    for (let i = 1; i <= CIRCLES; i++) {
      const position = { x: size.width / 2, y: size.height / 2 }
      const velocity = createVectorFromAngle(randomNumber(0, 360), 50)
      circles.current.push(createCircle(position, velocity))
    }
  }, [canvasReady, getSize])

  return (
    <div className="h-screen p-4 flex flex-col gap-2">
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between">
        <h1 className="font-semibold text-2xl whitespace-nowrap">Test</h1>
        <FPSCounter position="top-right" />
      </div>
      <div className="min-h-0 min-w-0 grow">
        <canvas
          ref={canvasRef}
          className="border border-primary rounded"
        />
      </div>
    </div>
  )
}

export default TestPage
