import {
  addVectors,
  createVector,
  scaleVector,
  setVectorMagnitude,
  subtractVectors,
  Vector2D,
  vectorMagnitude,
} from "@/lib/utils-vector"
import { constrain } from "../utils"

export type Circle = {
  position: Vector2D
  velocity: Vector2D
  acceleration: Vector2D
  radius: number
  colorFill: string
  colorStroke?: string
}

export const createCircle = (
  position: Vector2D,
  velocity: Vector2D,
  color: string,
) => {
  return {
    position: position,
    velocity: velocity,
    acceleration: createVector(0, 0),
    radius: 25,
    colorFill: color,
  }
}

export const handleAttraction = (circle: Circle, circles: Circle[]) => {
  let force
  let d
  let strength
  for (const c of circles) {
    if (c != circle) {
      force = subtractVectors(c.position, circle.position)
      d = constrain(vectorMagnitude(force), 100, 1000)
      strength = 20000 / (d * d)

      force = setVectorMagnitude(force, strength)
      applyForce(circle, force)
      console.log(strength)
    }
  }
}

export const handleCircleEdgeCollisions = (
  circle: Circle,
  canvasWidth: number,
  canvasHeight: number,
): void => {
  // Check left and right edges
  if (circle.position.x - circle.radius <= 0) {
    circle.position.x = circle.radius // Prevent overlap with the edge
    circle.velocity.x = Math.abs(circle.velocity.x) // Bounce right
  } else if (circle.position.x + circle.radius >= canvasWidth) {
    circle.position.x = canvasWidth - circle.radius // Prevent overlap with the edge
    circle.velocity.x = -Math.abs(circle.velocity.x) // Bounce left
  }

  // Check top and bottom edges
  if (circle.position.y - circle.radius <= 0) {
    circle.position.y = circle.radius // Prevent overlap with the edge
    circle.velocity.y = Math.abs(circle.velocity.y) // Bounce down
  } else if (circle.position.y + circle.radius >= canvasHeight) {
    circle.position.y = canvasHeight - circle.radius // Prevent overlap with the edge
    circle.velocity.y = -Math.abs(circle.velocity.y) // Bounce up
  }
}

export const applyForce = (circle: Circle, force: Vector2D) => {
  circle.acceleration = addVectors(circle.acceleration, force)
}

export const updateCirclePosition = (
  circle: Circle,
  deltaTime: number,
): void => {
  const dt = deltaTime / 1000 // Convert to seconds

  circle.velocity = addVectors(circle.velocity, circle.acceleration)
  circle.acceleration = scaleVector(circle.velocity, 0)
  circle.position = addVectors(
    circle.position,
    scaleVector(circle.velocity, dt),
  )
}

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  lineWidth = 1,
) => {
  ctx.beginPath()
  ctx.arc(circle.position.x, circle.position.y, circle.radius, 0, 2 * Math.PI)

  if (circle.colorFill) {
    ctx.fillStyle = circle.colorFill
    ctx.fill()
  }

  if (circle.colorStroke) {
    ctx.strokeStyle = circle.colorStroke
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}
