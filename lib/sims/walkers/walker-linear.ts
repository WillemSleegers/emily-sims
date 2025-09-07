import {
  Vector2D,
  createVector,
  createVectorFromAngle,
  addVectors,
  scaleVector,
} from "@/lib/utils-vector"
import { hslToHex } from "@/lib/utils-colors"
import { randomNumber } from "@/lib/random/random"
import { scale } from "@/lib/utils"

export type Walker = {
  position: Vector2D
  velocity: Vector2D
  speed: number
  radius: number
  hue: number
  direction: number
  tail: Vector2D[]
  maxTailLength: number
}

/**
 * Creates a new walker with specified position and radius
 * @param position - Starting position for the walker
 * @param speed - Movement speed in pixels per second (default: 150)
 * @param radius - Visual radius for drawing (default: 5)
 * @returns A new Walker instance
 */
export const createWalker = (
  position: Vector2D,
  speed: number = 50,
  radius: number = 5,
  maxTailLength: number = 40,
  hue?: number
): Walker => {
  return {
    position: position,
    velocity: createVector(0, 0),
    speed: speed,
    radius: radius,
    hue: hue ?? randomNumber(60) + 180, // Use provided hue or default analogous palette
    direction: randomNumber(360),
    tail: [position],
    maxTailLength: maxTailLength,
  }
}

/**
 * Handles walker collision with canvas edges
 * @param walker - The walker to check for collisions
 * @param canvasWidth - Width of the canvas
 * @param canvasHeight - Height of the canvas
 * @param bounce - If true, reflects direction; if false, wraps position
 *
 * @important This function should be called BEFORE movement calculations
 * (updateWalkerMovement) so that direction changes take effect in the same frame.
 *
 * For bouncing: modifies walker.direction using reflection math
 * - Horizontal walls: newDirection = 180° - oldDirection
 * - Vertical walls: newDirection = -oldDirection (360° - oldDirection)
 */
export const handleEdgeCollision = (
  walker: Walker,
  canvasWidth: number,
  canvasHeight: number,
  bounce: boolean = false
) => {
  if (bounce) {
    // Handle horizontal edges (left/right walls)
    if (walker.position.x <= walker.radius || walker.position.x >= canvasWidth - walker.radius) {
      walker.direction = 180 - walker.direction
    }

    // Handle vertical edges (top/bottom walls)
    if (walker.position.y <= walker.radius || walker.position.y >= canvasHeight - walker.radius) {
      walker.direction = 360 - walker.direction
    }
  } else {
    // Wrapping behavior (teleport to opposite side)
    if (walker.position.x <= 0) {
      walker.position.x = canvasWidth
    } else if (walker.position.x >= canvasWidth) {
      walker.position.x = 0
    }

    if (walker.position.y <= 0) {
      walker.position.y = canvasHeight
    } else if (walker.position.y >= canvasHeight) {
      walker.position.y = 0
    }
  }
}

/**
 * Updates walker movement by setting velocity based on direction and speed
 * @param walker - The walker to update
 */
export const updateWalkerMovement = (walker: Walker): void => {
  walker.velocity = createVectorFromAngle(walker.direction, walker.speed)
}

/**
 * Moves a walker by scaling its velocity by deltaTime for frame-rate independent movement
 * @param walker - The walker to move
 * @param deltaTime - Time elapsed since last frame in milliseconds
 *
 * @example
 * // With speed = 150 pixels/second and deltaTime = 16.67ms (60 FPS):
 * // Movement per frame = 150 * (16.67 / 1000) = ~2.5 pixels
 */
export const move = (walker: Walker, deltaTime: number): void => {
  const scaledVelocity = scaleVector(walker.velocity, deltaTime / 1000)
  walker.position = addVectors(walker.position, scaledVelocity)

  // Add current position to tail history
  walker.tail.push({ ...walker.position })

  // Keep tail at maximum length by removing oldest positions
  if (walker.tail.length > walker.maxTailLength) {
    walker.tail.shift() // remove first (oldest) element
  }
}

/**
 * Renders a walker as a colored circle on the canvas
 * @param ctx - Canvas 2D rendering context
 * @param walker - The walker to draw
 */
export const drawWalker = (
  ctx: CanvasRenderingContext2D,
  walker: Walker
): void => {
  // Draw tail first (so walker appears on top)
  drawWalkerTail(ctx, walker)

  // Draw walker circle
  ctx.beginPath()
  ctx.arc(walker.position.x, walker.position.y, walker.radius, 0, 2 * Math.PI)
  ctx.fillStyle = hslToHex(walker.hue, 100, 40)
  ctx.fill()
}

/**
 * Renders a walker's tail as connected line segments with fading opacity
 * @param ctx - Canvas 2D rendering context
 * @param walker - The walker whose tail to draw
 */
export const drawWalkerTail = (
  ctx: CanvasRenderingContext2D,
  walker: Walker
): void => {
  if (walker.tail.length < 2) return // need at least 2 points for a line

  for (let i = 1; i < walker.tail.length; i++) {
    const prevPoint = walker.tail[i - 1]
    const currentPoint = walker.tail[i]

    // Calculate opacity: newest segments are most opaque with non-linear curve
    const progress = i / (walker.tail.length - 1) // 0 to 1
    const easedProgress = Math.pow(progress, 1.5) // non-linear curve for more dramatic fade
    const opacity = easedProgress * 0.8 // 0 to 0.8 opacity

    // Set line style with fading opacity
    ctx.strokeStyle = `hsla(${walker.hue}, 100%, 40%, ${opacity})`
    ctx.lineWidth = scale(easedProgress, 0, 1, 1, 7.5)
    ctx.lineCap = "round"

    // Draw line segment
    ctx.beginPath()
    ctx.moveTo(prevPoint.x, prevPoint.y)
    ctx.lineTo(currentPoint.x, currentPoint.y)
    ctx.stroke()
  }
}
