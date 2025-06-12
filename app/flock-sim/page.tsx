"use client"

import {
  applyForce,
  calculateAlignment,
  calculateCoherence,
  calculateSeparation,
  createBoid,
  drawBoid,
  drawBoidPerception,
  handleBoidEdgeCollisions,
  updateBoid,
} from "@/lib/sims/boid"
import { Boid } from "@/lib/types"
import { setVectorMagnitude } from "@/lib/utils-vector"
import { useCallback, useEffect, useRef } from "react"
import { useCanvasAnimation } from "@/hooks/useAnimatedCanvas"

const BOIDS = 25
const MAX_SPEED = 0.1
const PERCEPTION = 120
const SHOW_PERCEPTION = false

const FlockSimPage = () => {
  const flock = useRef<Boid[]>([])

  const setup = useCallback((size: { width: number; height: number }) => {
    for (let i = 0; i < BOIDS; i++) {
      flock.current.push(createBoid(size.width, size.height, PERCEPTION))
    }
  }, [])

  const handleUpdate = (
    deltaTime: number,
    size: { width: number; height: number }
  ) => {
    const flockCopy = [...flock.current]
    flock.current.forEach((boid) => {
      const alignment = calculateAlignment(boid, flockCopy, 0.001)
      const cohesion = calculateCoherence(boid, flockCopy, 0.0005)
      const separation = calculateSeparation(boid, flockCopy, 15, 0.002)

      applyForce(boid, separation)
      applyForce(boid, alignment)
      applyForce(boid, cohesion)

      boid.velocity = setVectorMagnitude(boid.velocity, MAX_SPEED)

      handleBoidEdgeCollisions(boid, size.width, size.height)

      updateBoid(boid, deltaTime)
    })
  }

  const handleDraw = (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number }
  ) => {
    ctx.clearRect(0, 0, size.width, size.height)
    flock.current.forEach((boid) => {
      if (SHOW_PERCEPTION) drawBoidPerception(ctx, boid)
      drawBoid(ctx, boid)
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
    setup(size)
  }, [canvasReady, getSize, setup])

  return (
    <div className="h-screen p-4 flex flex-col gap-2">
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between">
        <h1 className="font-semibold text-2xl whitespace-nowrap">
          Emily&apos;s Flock Sim
        </h1>
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

export default FlockSimPage
