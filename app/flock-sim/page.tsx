"use client"

import { useEffect, useRef, useState } from "react"
import { EyeIcon } from "lucide-react"

import {
  applyForce,
  Boid,
  calculateAlignment,
  calculateCoherence,
  calculateSeparation,
  createBoid,
  drawBoid,
  drawBoidPerception,
  handleBoidEdgeCollisions,
  updateBoid,
} from "@/lib/sims/boid"
import {
  createVector,
  createVectorFromAngle,
  setVectorMagnitude,
} from "@/lib/utils-vector"
import { randomNumber } from "@/lib/random/random"

import { CanvasSize } from "@/hooks/useResponsiveCanvas"
import { useAnimatedCanvas } from "@/hooks/useAnimatedCanvas"

import { SimLayout } from "@/components/sim-layout"
import { Canvas } from "@/components/canvas"
import { Toggle } from "@/components/ui/toggle"

const BOIDS = 25
const MAX_SPEED = 0.1

const FlockSimPage = () => {
  const [showPerception, setShowPerception] = useState(false)
  const flock = useRef<Boid[]>([])

  const handleUpdate = (deltaTime: number, size: CanvasSize) => {
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

  const handleDraw = (ctx: CanvasRenderingContext2D, size: CanvasSize) => {
    ctx.clearRect(0, 0, size.width, size.height)
    flock.current.forEach((boid) => {
      if (showPerception) drawBoidPerception(ctx, boid)
      drawBoid(ctx, boid)
    })
  }

  const { canvasRef, canvasReady, getSize } = useAnimatedCanvas(
    handleUpdate,
    handleDraw,
  )

  // Seed the flock once the canvas has dimensions to scatter boids across.
  useEffect(() => {
    if (!canvasReady) return

    const size = getSize()
    for (let i = 0; i < BOIDS; i++) {
      const position = createVector(
        randomNumber(0, size.width),
        randomNumber(0, size.height),
      )
      const velocity = createVectorFromAngle(randomNumber(0, 360), 25)
      flock.current.push(createBoid(position, velocity))
    }
  }, [canvasReady, getSize])

  const controls = (
    <Toggle
      pressed={showPerception}
      onPressedChange={setShowPerception}
      aria-label="Show perception radius"
      variant="outline"
      size="sm"
    >
      <EyeIcon />
    </Toggle>
  )

  return (
    <SimLayout title="Flock" fullscreen showFPS controls={controls}>
      <Canvas ref={canvasRef} />
    </SimLayout>
  )
}

export default FlockSimPage
