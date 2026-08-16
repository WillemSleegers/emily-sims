"use client"

import { useEffect, useRef, MouseEvent } from "react"

import { CanvasSize } from "@/hooks/useResponsiveCanvas"
import { useAnimatedCanvas } from "@/hooks/useAnimatedCanvas"

import { SimLayout } from "@/components/sim-layout"
import { Canvas } from "@/components/canvas"

import { randomNumber } from "@/lib/random/random"
import {
  Boid,
  createBoid,
  drawBoid,
  handleBoidEdgeCollisions,
  updateBoid,
} from "@/lib/sims/boid"
import { createVector, createVectorFromAngle } from "@/lib/utils-vector"

const SPEED = 125 // px/s

const BoidPage = () => {
  const boids = useRef<Boid[]>([])

  const handleUpdate = (deltaTime: number, size: CanvasSize) => {
    boids.current.forEach((boid) => {
      updateBoid(boid, deltaTime)
      handleBoidEdgeCollisions(boid, size.width, size.height)
    })
  }

  const handleDraw = (ctx: CanvasRenderingContext2D, size: CanvasSize) => {
    ctx.clearRect(0, 0, size.width, size.height)
    boids.current.forEach((boid) => drawBoid(ctx, boid))
  }

  const { canvasRef, canvasReady, getSize } = useAnimatedCanvas(
    handleUpdate,
    handleDraw,
  )

  // Seed with one boid once the canvas has dimensions.
  useEffect(() => {
    if (!canvasReady) return

    const size = getSize()
    const position = createVector(
      randomNumber(0, size.width),
      randomNumber(0, size.height),
    )
    const velocity = createVectorFromAngle(randomNumber(0, 360), SPEED)
    boids.current.push(createBoid(position, velocity))
  }, [canvasReady, getSize])

  // Click anywhere to add a new boid at that position.
  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const position = createVector(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY,
    )
    const velocity = createVectorFromAngle(randomNumber(0, 360), SPEED)
    boids.current.push(createBoid(position, velocity))
  }

  return (
    <SimLayout title="Boid" fullscreen showFPS>
      <Canvas ref={canvasRef} onMouseDown={handleMouseDown} />
    </SimLayout>
  )
}

export default BoidPage
