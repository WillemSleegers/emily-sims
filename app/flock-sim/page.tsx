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
import { createVector, createVectorFromAngle } from "@/lib/utils-vector"
import { randomNumber } from "@/lib/random/random"

import { CanvasSize } from "@/hooks/useResponsiveCanvas"
import { useAnimatedCanvas } from "@/hooks/useAnimatedCanvas"

import { SimLayout } from "@/components/sim-layout"
import { Canvas } from "@/components/canvas"
import { Toggle } from "@/components/ui/toggle"

const BOIDS = 50
// Speed in px/s. Min speed prevents boids from ever fully stopping (which
// would let opposing forces flip them 180° in place because their direction
// becomes meaningless near zero).
const MAX_SPEED = 100
const MIN_SPEED = 50
// Force magnitudes are how much each rule can change velocity per tick.
// Kept small relative to MAX_SPEED (each at most ~5%) so momentum dominates
// and direction changes are gradual. Separation is strongest so boids
// reliably avoid collisions; coherence is the gentlest so the flock drifts
// together rather than snapping inward.
const ALIGNMENT_FORCE = 2.5
const COHERENCE_FORCE = 1.5
const SEPARATION_FORCE = 5
const SEPARATION_RADIUS = 30

const FlockSimPage = () => {
  const [showPerception, setShowPerception] = useState(false)
  const flock = useRef<Boid[]>([])

  const handleUpdate = (deltaTime: number, size: CanvasSize) => {
    const flockCopy = [...flock.current]
    flock.current.forEach((boid) => {
      const alignment = calculateAlignment(boid, flockCopy, ALIGNMENT_FORCE)
      const cohesion = calculateCoherence(boid, flockCopy, COHERENCE_FORCE)
      const separation = calculateSeparation(
        boid,
        flockCopy,
        SEPARATION_RADIUS,
        SEPARATION_FORCE,
      )

      applyForce(boid, separation)
      applyForce(boid, alignment)
      applyForce(boid, cohesion)

      handleBoidEdgeCollisions(boid, size.width, size.height)

      // Min speed prevents dead stops; max speed prevents runaway acceleration.
      updateBoid(boid, deltaTime, MIN_SPEED, MAX_SPEED)
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
      const velocity = createVectorFromAngle(randomNumber(0, 360), MAX_SPEED)
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
