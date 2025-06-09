import { createVector, Vector2D } from "@/lib/utils-vector"
import { randomSign } from "../random"

export type Walker = {
  position: Vector2D
}

export const createWalker = (x: number, y: number): Walker => {
  return {
    position: {
      x: x,
      y: y,
    },
  }
}

export const randomStep = (stepSize: number = 5): Vector2D => {
  return createVector(randomSign() * stepSize, randomSign() * stepSize)
}

export const updateWalkerPosition = (
  walker: Walker,
  velocity: Vector2D,
  deltaTime: number
): void => {
  const dt = deltaTime / 1000 // Convert to seconds

  walker.position.x += velocity.x * dt
  walker.position.y += velocity.y * dt
}

export const drawWalker = (
  ctx: CanvasRenderingContext2D,
  walker: Walker
): void => {
  const radius = 5

  ctx.beginPath()
  ctx.arc(walker.position.x, walker.position.y, radius, 0, 2 * Math.PI)

  ctx.fillStyle = "white"
  ctx.fill()
}
