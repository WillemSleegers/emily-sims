import { scale } from "@/lib/utils"
import { randomNumber } from "../random/random"
import {
  Vector2D,
  addVectors,
  createVector,
  limitVector,
  scaleVector,
} from "../utils-vector"

export type Raindrop = {
  position: Vector2D
  velocity: Vector2D
  acceleration: Vector2D

  len: number
  maxSpeed: number
  color: string
}

export const createRaindrop = (
  position: Vector2D,
  velocity: Vector2D,
  color: string
): Raindrop => {
  const zMin = 0
  const zMax = 20
  const z = randomNumber(zMin, zMax)
  return {
    position: position,
    velocity: velocity,
    acceleration: createVector(0, 0),

    len: scale(z, zMin, zMax, 10, 20),
    maxSpeed: scale(z, zMin, zMax, 300, 200),
    color: color,
  }
}

export const updateRaindropPosition = (
  raindrop: Raindrop,
  deltaTime: number
): void => {
  const dt = deltaTime / 1000

  raindrop.velocity = addVectors(raindrop.velocity, raindrop.acceleration)
  raindrop.velocity = limitVector(raindrop.velocity, raindrop.maxSpeed)

  const scaledVelocity = scaleVector(raindrop.velocity, dt)

  raindrop.position = addVectors(raindrop.position, scaledVelocity)
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
  ctx.lineWidth = raindrop.len / 5
  ctx.strokeStyle = raindrop.color

  ctx.beginPath()
  ctx.moveTo(raindrop.position.x, raindrop.position.y)
  ctx.lineTo(raindrop.position.x, raindrop.position.y + raindrop.len)
  ctx.stroke()
}
