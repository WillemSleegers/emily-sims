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

export const generateRandomStep = (stepSize: number = 100): Vector2D =>
  createVector(randomSign() * stepSize, randomSign() * stepSize)

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
