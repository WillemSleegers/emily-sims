import { Vector2D } from "@/lib/utils-vector"

export type Circle = {
  position: Vector2D
  velocity: Vector2D
  radius: number
  colorFill: string
  colorStroke?: string
}

export const createCircle = (position: Vector2D, velocity: Vector2D) => {
  return {
    position: position,
    velocity: velocity,
    radius: 25,
    colorFill: "white",
    colorStroke: "black",
  }
}

export const handleCircleEdgeCollisions = (
  circle: Circle,
  canvasWidth: number,
  canvasHeight: number
): void => {
  // Check left and right edges
  if (circle.position.x - circle.radius <= 0) {
    circle.position.x = circle.radius // Prevent overlap
    circle.velocity.x = Math.abs(circle.velocity.x) // Bounce right
  } else if (circle.position.x + circle.radius >= canvasWidth) {
    circle.position.x = canvasWidth - circle.radius // Prevent overlap
    circle.velocity.x = -Math.abs(circle.velocity.x) // Bounce left
  }

  // Check top and bottom edges
  if (circle.position.y - circle.radius <= 0) {
    circle.position.y = circle.radius // Prevent overlap
    circle.velocity.y = Math.abs(circle.velocity.y) // Bounce down
  } else if (circle.position.y + circle.radius >= canvasHeight) {
    circle.position.y = canvasHeight - circle.radius // Prevent overlap
    circle.velocity.y = -Math.abs(circle.velocity.y) // Bounce up
  }
}

export const updateCirclePosition = (
  circle: Circle,
  deltaTime: number
): void => {
  const dt = deltaTime / 1000 // Convert to seconds

  circle.position.x += circle.velocity.x * dt
  circle.position.y += circle.velocity.y * dt
}

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  lineWidth = 1
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
