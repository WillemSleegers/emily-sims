import {
  Vector2D,
  createVector,
  createVectorFromAngle,
  addVectors,
  scaleVector,
} from "@/lib/utils-vector"
import { scale } from "@/lib/utils"
import { hslToHex } from "@/lib/utils-colors"
import { randomNumber } from "@/lib/random/random"

import simplexNoise from "@/lib/random/simplex"

export type MovementMode = "linear" | "sine" | "noise"

export type WalkerMovementConfig = {
  mode: MovementMode
  direction: number // angle in degrees for base movement direction
  sineAmplitude?: number
  sineFrequency?: number
  noiseScale?: number
  noiseMaxAngleChange?: number // maximum angle change per second for noise mode
}

export type Walker = {
  position: Vector2D
  velocity: Vector2D
  speed: number
  radius: number
  hue: number
  config: WalkerMovementConfig
  time: number // accumulated time for sine wave calculations
  noiseOffset: number // unique offset in noise space (0-255)
}

/**
 * Creates a new walker with specified position and configuration
 * @param position - Starting position for the walker
 * @param config - Optional configuration overrides for movement behavior
 * @param speed - Movement speed in pixels per second (default: 150)
 * @param radius - Visual radius for drawing (default: 5)
 * @returns A new Walker instance with default values merged with provided config
 */
export const createWalker = (
  position: Vector2D,
  config?: Partial<WalkerMovementConfig>,
  speed: number = 150,
  radius: number = 5
): Walker => {
  const defaultConfig: WalkerMovementConfig = {
    mode: "linear",
    direction: randomNumber(360), // random direction for all modes
    sineAmplitude: 50,
    sineFrequency: 0.02,
    noiseScale: 0.01, // scaling factor for sampling noise coordinates
    noiseMaxAngleChange: 15, // degrees per second for noise mode
  }

  return {
    position: position,
    velocity: createVector(0, 0),
    speed: speed,
    radius: radius,
    hue: randomNumber(360),
    config: { ...defaultConfig, ...config },
    time: 0, // start time at 0
    noiseOffset: randomNumber(255), // unique noise space offset
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
 * For bouncing: modifies walker.config.direction using reflection math
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
    if (walker.position.x <= 0 || walker.position.x >= canvasWidth) {
      walker.config.direction = Math.abs(180 - walker.config.direction)
    }

    // Handle vertical edges (top/bottom walls)
    if (walker.position.y <= 0 || walker.position.y >= canvasHeight) {
      walker.config.direction = 360 - walker.config.direction
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
 * Updates walker velocity for sine wave movement mode
 * Creates sine wave pattern by combining forward motion with perpendicular oscillation
 * @param walker - The walker to update
 * @param deltaTime - Time elapsed since last frame in milliseconds
 */
export const updateSineMode = (walker: Walker, deltaTime: number): void => {
  // Accumulate time to drive sine wave oscillation
  walker.time += deltaTime

  // Get base direction vector (normalized)
  const baseDirection = createVectorFromAngle(walker.config.direction, 1)

  // Calculate perpendicular direction (rotate base 90 degrees)
  // If base is (x, y), perpendicular is (-y, x)
  const perpendicularDirection = createVector(-baseDirection.y, baseDirection.x)

  // Calculate sine oscillation
  const sineValue = Math.sin(walker.time * walker.config.sineFrequency!)
  const oscillationAmount = sineValue * walker.config.sineAmplitude!

  // Create base velocity (forward motion)
  const baseVelocity = scaleVector(baseDirection, walker.speed)

  // Create oscillation velocity (perpendicular motion)
  const oscillationVelocity = scaleVector(
    perpendicularDirection,
    oscillationAmount
  )

  // Combine base + oscillation for final velocity
  walker.velocity = addVectors(baseVelocity, oscillationVelocity)
}

/**
 * Updates walker velocity for noise-based movement mode
 * Uses simplex noise to create organic, wandering movement patterns
 * @param walker - The walker to update
 * @param deltaTime - Time elapsed since last frame (unused but kept for consistency)
 * @param canvasWidth - Width of the canvas for noise coordinate mapping
 * @param canvasHeight - Height of the canvas for noise coordinate mapping
 */
export const updateNoiseMode = (
  walker: Walker,
  deltaTime: number,
  canvasWidth: number,
  canvasHeight: number
): void => {
  // Map coordinates to simplex noise's native 0-255 range
  const mappedX = scale(walker.position.x, 0, canvasWidth, 0, 255)
  const mappedY = scale(walker.position.y, 0, canvasHeight, 0, 255)

  // Use position + unique offset for each walker's noise sampling
  const noiseValue = simplexNoise(
    (mappedX + walker.noiseOffset) * walker.config.noiseScale!,
    (mappedY + walker.noiseOffset) * walker.config.noiseScale!
  )

  // Convert noise (-1 to 1) to angle change in degrees per second
  // Scale by deltaTime for frame-rate independent movement
  const angleChangePerSecond = noiseValue * walker.config.noiseMaxAngleChange!
  const angleChange = angleChangePerSecond * (deltaTime / 1000)

  // Gradually modify the base direction
  walker.config.direction += angleChange

  // Keep direction within 0-360 degrees
  if (walker.config.direction < 0) walker.config.direction += 360
  if (walker.config.direction >= 360) walker.config.direction -= 360

  // Create velocity from the updated direction
  walker.velocity = createVectorFromAngle(walker.config.direction, walker.speed)
}

/**
 * Updates walker movement based on its configured movement mode
 * Delegates to the appropriate mode-specific update function
 * @param walker - The walker to update
 * @param deltaTime - Time elapsed since last frame in milliseconds
 * @param canvasWidth - Canvas width (required for noise mode)
 * @param canvasHeight - Canvas height (required for noise mode)
 * @throws Error if noise mode is used without canvas dimensions
 */
export const updateWalkerMovement = (
  walker: Walker,
  deltaTime: number,
  canvasWidth?: number,
  canvasHeight?: number
): void => {
  switch (walker.config.mode) {
    case "linear":
      // Set constant velocity vector from direction angle and speed
      walker.velocity = createVectorFromAngle(
        walker.config.direction,
        walker.speed
      )
      break
    case "sine":
      updateSineMode(walker, deltaTime)
      break
    case "noise":
      if (canvasWidth === undefined || canvasHeight === undefined) {
        throw new Error(
          "Canvas dimensions (canvasWidth, canvasHeight) are required for noise movement mode"
        )
      }
      updateNoiseMode(walker, deltaTime, canvasWidth, canvasHeight)
      break
    default:
      // Default to linear movement: constant velocity in specified direction
      walker.velocity = createVectorFromAngle(
        walker.config.direction,
        walker.speed
      )
  }
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
  ctx.beginPath()
  ctx.arc(walker.position.x, walker.position.y, walker.radius, 0, 2 * Math.PI)
  ctx.fillStyle = hslToHex(walker.hue, 77, 41)
  ctx.fill()
}
