"use client"

import { useEffect, useRef, MouseEvent } from "react"

import { CanvasSize } from "@/hooks/useResponsiveCanvas"
import { useAnimatedCanvas } from "@/hooks/useAnimatedCanvas"

import { SimLayout } from "@/components/sim-layout"
import { Canvas } from "@/components/canvas"

import {
  Food,
  Forager,
  consumeFood,
  createFood,
  createForager,
  drawFood,
  drawForager,
  handleForagerEdges,
  spawnRandomFood,
  updateForagerHeading,
  updateForagerPosition,
} from "@/lib/sims/forager"
import { createVector } from "@/lib/utils-vector"

// Average seconds between food spawns. Used with deltaTime to convert
// "food per second" into a per-frame probability.
const FOOD_SPAWN_RATE = 0.25
const MAX_FOOD = 10

const ForageSimPage = () => {
  const foragers = useRef<Forager[]>([])
  const foods = useRef<Food[]>([])

  const handleUpdate = (deltaTime: number, size: CanvasSize) => {
    // Convert from milliseconds to seconds so all speeds and rates are
    // expressed in human-friendly units.
    const dt = deltaTime / 1000

    // Probabilistic food spawn: over many frames, this averages out to
    // FOOD_SPAWN_RATE spawns per second.
    if (
      foods.current.length < MAX_FOOD &&
      Math.random() < FOOD_SPAWN_RATE * dt
    ) {
      foods.current.push(spawnRandomFood(size.width, size.height))
    }

    foragers.current.forEach((forager) => {
      updateForagerHeading(forager, foods.current, dt)
      updateForagerPosition(forager, dt)
      handleForagerEdges(forager, size.width, size.height)
      consumeFood(forager, foods.current)
    })
  }

  const handleDraw = (ctx: CanvasRenderingContext2D, size: CanvasSize) => {
    ctx.clearRect(0, 0, size.width, size.height)
    foods.current.forEach((food) => drawFood(ctx, food))
    foragers.current.forEach((forager) => drawForager(ctx, forager))
  }

  const { canvasRef, canvasReady, getSize } = useAnimatedCanvas(
    handleUpdate,
    handleDraw,
  )

  // Seed the world once the canvas size is known: one forager in the
  // middle and a handful of food items scattered around.
  useEffect(() => {
    if (!canvasReady) return

    const size = getSize()
    foragers.current.push(
      createForager(createVector(size.width / 2, size.height / 2)),
    )
    for (let i = 0; i < 3; i++) {
      foods.current.push(spawnRandomFood(size.width, size.height))
    }
  }, [canvasReady, getSize])

  // Left click adds a forager, right click drops a food item.
  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const position = createVector(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY,
    )
    if (event.button === 2) {
      foods.current.push(createFood(position))
    } else {
      foragers.current.push(createForager(position))
    }
  }

  return (
    <SimLayout title="Forage" fullscreen showFPS>
      <Canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onContextMenu={(event) => event.preventDefault()}
      />
    </SimLayout>
  )
}

export default ForageSimPage
