"use client"

import { useRef, MouseEvent } from "react"

import { CanvasSize } from "@/hooks/useResponsiveCanvas"
import { useCanvasAnimation } from "@/hooks/useAnimatedCanvas"

import { SimLayout } from "@/components/sim-layout"
import { Canvas } from "@/components/canvas"

import {
  Circle,
  createCircle,
  drawCircle,
  handleAttraction,
  handleCircleEdgeCollisions,
  updateCirclePosition,
} from "@/lib/sims/circle"
import { createVector, createVectorFromAngle } from "@/lib/utils-vector"

import { randomNumber } from "@/lib/random/random"

const CIRCLE_SPEED = 50
const CIRCLE_COLOR = "#00a63e"

const TestPage = () => {
  const circles = useRef<Circle[]>([])

  // Move the circles around and have them bounce off of the edges
  const handleUpdate = (
    deltaTime: number,
    size: { width: number; height: number },
  ) => {
    circles.current.forEach((circle, i) => {
      handleAttraction(circle, circles.current)
      updateCirclePosition(circle, deltaTime)
      handleCircleEdgeCollisions(circle, size.width, size.height)
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
      event.nativeEvent.offsetY,
    )
    const velocity = createVectorFromAngle(randomNumber(0, 360), CIRCLE_SPEED)
    const newCircle = createCircle(position, velocity, CIRCLE_COLOR)
    circles.current.push(newCircle)
  }

  return (
    <SimLayout title="Attraction" fullscreen showFPS>
      <Canvas ref={canvasRef} onClick={handleClick} />
    </SimLayout>
  )
}

export default TestPage
