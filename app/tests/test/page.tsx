"use client"

import { useRef, MouseEvent } from "react"
import { FullScreen, useFullScreenHandle } from "react-full-screen"

import { CanvasSize } from "@/hooks/useResponsiveCanvas"
import { useCanvasAnimation } from "@/hooks/useAnimatedCanvas"

import { PageNav } from "@/components/page-nav"

import {
  Circle,
  createCircle,
  drawCircle,
  handleCircleEdgeCollisions,
  updateCirclePosition,
} from "@/lib/sims/circle"
import { createVector, createVectorFromAngle } from "@/lib/utils-vector"

import { cn } from "@/lib/utils"
import { randomNumber } from "@/lib/random/random"

const CIRCLE_SPEED = 50

const TestPage = () => {
  const circles = useRef<Circle[]>([])
  const fullscreenHandle = useFullScreenHandle()

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
  const handleDraw = (ctx: CanvasRenderingContext2D, size: CanvasSize) => {
    ctx.clearRect(0, 0, size.width, size.height)
    circles.current.forEach((circle) => {
      drawCircle(ctx, circle)
    })
  }

  const { canvasRef } = useCanvasAnimation(handleUpdate, handleDraw)

  // Add a circle to the canvas on the click coordinate
  const handleClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const position = createVector(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY
    )
    const velocity = createVectorFromAngle(randomNumber(0, 360), CIRCLE_SPEED)
    const newCircle = createCircle(position, velocity, "#00a63e")
    circles.current.push(newCircle)
  }

  return (
    <div className="h-dvh p-4 flex flex-col gap-2">
      <PageNav title="Test" fullscreenHandle={fullscreenHandle} showFPS />
      <div className={cn("min-h-0 grow border-2 border-primary rounded")}>
        <FullScreen handle={fullscreenHandle} className="h-full">
          <canvas ref={canvasRef} onClick={handleClick} />
        </FullScreen>
      </div>
    </div>
  )
}

export default TestPage
