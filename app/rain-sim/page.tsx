"use client"

import { PointerEvent, useEffect, useRef, useState } from "react"

import { CanvasSize } from "@/hooks/useResponsiveCanvas"
import { useAnimatedCanvas } from "@/hooks/useAnimatedCanvas"

import { SimLayout } from "@/components/sim-layout"
import { Canvas } from "@/components/canvas"
import { ColorPicker } from "@/components/ui/color-picker"

import {
  createRaindrop,
  drawRaindrop,
  handleRaindropEdgeCollisions,
  Raindrop,
  updateRaindropPosition,
} from "@/lib/sims/rain"
import { addVectors, createVector, scaleVector } from "@/lib/utils-vector"
import { randomNumber } from "@/lib/random/random"

const GRAVITY = createVector(0, 9.8)
const DEFAULT_COLOR = "#457b9d"
const INITIAL_DROPS = 80

const RainSimPage = () => {
  const [color, setColor] = useState(DEFAULT_COLOR)
  const raindrops = useRef<Raindrop[]>([])
  const pourPosition = useRef<{ x: number; y: number } | null>(null)
  // Latest color in a ref so the animation tick uses the current value
  // without forcing handleUpdate to re-bind on every color change.
  const colorRef = useRef(color)
  colorRef.current = color

  const handleUpdate = (deltaTime: number, size: CanvasSize) => {
    // Spawn an extra drop at the pointer each tick while held.
    if (pourPosition.current) {
      raindrops.current.push(
        createRaindrop(
          createVector(pourPosition.current.x, pourPosition.current.y),
          GRAVITY,
          colorRef.current,
        ),
      )
    }

    raindrops.current.forEach((raindrop) => {
      raindrop.acceleration = addVectors(raindrop.acceleration, GRAVITY)
      handleRaindropEdgeCollisions(raindrop, size.height)
      updateRaindropPosition(raindrop, deltaTime)
      // Reset acceleration each tick so forces don't accumulate forever.
      raindrop.acceleration = scaleVector(raindrop.acceleration, 0)
    })
  }

  const handleDraw = (ctx: CanvasRenderingContext2D, size: CanvasSize) => {
    ctx.clearRect(0, 0, size.width, size.height)
    raindrops.current.forEach((raindrop) => drawRaindrop(ctx, raindrop))
  }

  const { canvasRef, canvasReady, getSize } = useAnimatedCanvas(
    handleUpdate,
    handleDraw,
  )

  // Seed an initial population so it's actively raining as soon as the page
  // loads. Drops wrap from the bottom back to the top, so this single seed
  // keeps the rain going forever.
  useEffect(() => {
    if (!canvasReady) return
    if (raindrops.current.length > 0) return

    const size = getSize()
    for (let i = 0; i < INITIAL_DROPS; i++) {
      const position = createVector(
        randomNumber(0, size.width),
        randomNumber(0, size.height),
      )
      raindrops.current.push(createRaindrop(position, GRAVITY, color))
    }
  }, [canvasReady, getSize, color])

  // Pointer events let mouse and touch share one path. setPointerCapture
  // keeps move/up firing even if the pointer leaves the canvas while held.
  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    pourPosition.current = {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!pourPosition.current) return
    pourPosition.current = {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    }
  }

  const handlePointerUp = () => {
    pourPosition.current = null
  }

  const controls = <ColorPicker value={color} onValueChange={setColor} />

  return (
    <SimLayout title="Rain" fullscreen showFPS controls={controls}>
      <Canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </SimLayout>
  )
}

export default RainSimPage
