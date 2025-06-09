import { Raindrop } from "@/lib/types"
import { scale } from "@/lib/utils"
import { randomNumber } from "../random"
import { createVector } from "../utils-vector"

export const createRaindrop = (
  canvasWidth: number,
  canvasHeight: number
): Raindrop => {
  const z = randomNumber(0, 20)
  return {
    position: createVector(
      randomNumber(0, canvasWidth),
      randomNumber(-canvasHeight, 0)
    ),
    z: z,
    velocity: createVector(0, scale(z, 0, 20, 50, 200)),
    len: scale(z, 0, 20, 10, 20),
    color: "#4e6881",
  }
}

export const updateRaindropPosition = (
  raindrop: Raindrop,
  deltaTime: number
): void => {
  const dt = deltaTime / 1000 // Convert to seconds

  raindrop.position.x += raindrop.velocity.x * dt
  raindrop.position.y += raindrop.velocity.y * dt
}

export const handleRaindropEdgeCollisions = (
  raindrop: Raindrop,
  canvasHeight: number
): void => {
  if (raindrop.position.y >= canvasHeight) {
    raindrop.position.y = 0
  }
}

export const drawRaindrop = (
  ctx: CanvasRenderingContext2D,
  raindrop: Raindrop
): void => {
  ctx.lineWidth = scale(raindrop.z, 0, 20, 1, 3)
  ctx.strokeStyle = raindrop.color

  ctx.beginPath()
  ctx.moveTo(raindrop.position.x, raindrop.position.y)
  ctx.lineTo(raindrop.position.x, raindrop.position.y + raindrop.len)
  ctx.stroke()
}
