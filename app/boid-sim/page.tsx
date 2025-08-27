"use client"

import { useRef, MouseEvent, useEffect } from "react"

import { useCanvasAnimation } from "@/hooks/useAnimatedCanvas"

import { randomNumber } from "@/lib/random/random"
import {
  Boid,
  createBoid,
  drawBoid,
  handleBoidEdgeCollisions,
  updateBoid,
} from "@/lib/sims/boid"
import { createVector, createVectorFromAngle } from "@/lib/utils-vector"

const BoidPage = () => {
  const boids = useRef<Boid[]>([])

  const handleUpdate = (deltaTime: number) => {
    const size = getSize()

    boids.current.forEach((boid) => {
      updateBoid(boid, deltaTime * 0.01)
      handleBoidEdgeCollisions(boid, size.width, size.height)
    })
  }

  const handleDraw = (ctx: CanvasRenderingContext2D) => {
    const size = getSize()

    ctx.clearRect(0, 0, size.width, size.height)

    boids.current.forEach((boid) => {
      drawBoid(ctx, boid)
    })
  }

  const { canvasRef, getSize, canvasReady } = useCanvasAnimation(
    handleUpdate,
    handleDraw
  )

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const position = createVector(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY
    )
    const velocity = createVectorFromAngle(randomNumber(0, 360), 25)
    const boid = createBoid(position, velocity)
    boids.current.push(boid)
  }

  // Setup
  useEffect(() => {
    if (!canvasReady) return

    const size = getSize()
    const position = createVector(
      randomNumber(0, size.width),
      randomNumber(0, size.height)
    )
    const velocity = createVectorFromAngle(randomNumber(0, 360), 25)
    const boid = createBoid(position, velocity)
    boids.current.push(boid)
  }, [canvasReady, getSize])

  return (
    <div className="h-dvh p-4 flex flex-col gap-2 select-none">
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between">
        <h1 className="font-semibold text-2xl whitespace-nowrap">Boid</h1>
      </div>
      <div className="min-h-0 min-w-0 grow">
        <canvas
          ref={canvasRef}
          className="border border-primary rounded w-full h-full touch-none"
          onMouseDown={handleMouseDown}
        />
      </div>
    </div>
  )
}

export default BoidPage
