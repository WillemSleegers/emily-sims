import {
  addVectors,
  divideVector,
  limitVector,
  scaleVector,
  setVectorMagnitude,
  subtractVectors,
  Vector2D,
  vectorDistance,
  vectorMagnitude,
  vectorToAngle,
} from "../utils-vector"

export type Boid = {
  position: Vector2D
  velocity: Vector2D
  angle: number
  width: number
  length: number
  perception: number
  fillColor: string
  strokeColor?: string
}

export const createBoid = (
  position: Vector2D,
  velocity: Vector2D,
  angle: number = 0,
  width: number = 10,
  length: number = 15,
  perception: number = 60,
  fillColor: string = "white",
  strokeColor?: string
): Boid => ({
  position: position,
  velocity: velocity,
  angle: angle,
  width: width,
  length: length,
  perception: perception,
  fillColor: fillColor,
  strokeColor: strokeColor,
})

/**
 * Calculates alignment steering force - matches velocity with nearby boids
 * @param boid - The boid to calculate alignment for
 * @param boids - Array of all boids in the flock
 * @param maxForce - Maximum steering force strength (optional)
 */
export const calculateAlignment = (
  boid: Boid,
  boids: Boid[],
  maxForce: number = 0.03
): Vector2D => {
  let avgVelocity: Vector2D = { x: 0, y: 0 }
  let total = 0

  // Find nearby boids and calculate their average velocity
  boids.forEach((otherBoid) => {
    if (boid !== otherBoid) {
      const distance = vectorDistance(boid.position, otherBoid.position)
      if (distance < boid.perception) {
        avgVelocity = addVectors(avgVelocity, otherBoid.velocity)
        total++
      }
    }
  })

  if (total > 0) {
    // Calculate average velocity
    avgVelocity = divideVector(avgVelocity, total)

    // Create steering force toward average velocity
    let steer = subtractVectors(avgVelocity, boid.velocity)

    // Limit to max force
    if (vectorMagnitude(steer) > maxForce) {
      steer = setVectorMagnitude(steer, maxForce)
    }

    return steer
  }

  return { x: 0, y: 0 } // No nearby boids
}

/**
 * Calculates coherence steering force - moves boid toward center of nearby boids
 * @param boid - The boid to calculate coherence for
 * @param boids - Array of all boids in the flock
 * @param maxForce - Maximum steering force strength (optional)
 */
export const calculateCoherence = (
  boid: Boid,
  boids: Boid[],
  maxForce: number = 0.03
): Vector2D => {
  let centerOfMass: Vector2D = { x: 0, y: 0 }
  let total = 0

  // Find nearby boids and calculate their average position
  boids.forEach((otherBoid) => {
    if (boid !== otherBoid) {
      const distance = vectorDistance(boid.position, otherBoid.position)
      if (distance < boid.perception) {
        centerOfMass = addVectors(centerOfMass, otherBoid.position)
        total++
      }
    }
  })

  if (total > 0) {
    // Calculate average position (center of mass)
    centerOfMass = divideVector(centerOfMass, total)

    // Create steering force toward center of mass
    let steer = subtractVectors(centerOfMass, boid.position)

    // Normalize and scale to max force
    if (vectorMagnitude(steer) > 0) {
      steer = setVectorMagnitude(steer, maxForce)
    }

    return steer
  }

  return { x: 0, y: 0 } // No nearby boids
}

/**
 * Calculates separation steering force - steers away from nearby boids
 * @param boid - The boid to calculate separation for
 * @param boids - Array of all boids in the flock
 * @param separationRadius - Distance at which separation kicks in (optional, defaults to perception/2)
 * @param maxForce - Maximum steering force strength (optional)
 */
export const calculateSeparation = (
  boid: Boid,
  boids: Boid[],
  separationRadius?: number,
  maxForce: number = 0.03
): Vector2D => {
  const sepRadius = separationRadius || boid.perception / 2
  let steer: Vector2D = { x: 0, y: 0 }
  let total = 0

  // Find nearby boids and steer away from them
  boids.forEach((otherBoid) => {
    if (boid !== otherBoid) {
      const distance = vectorDistance(boid.position, otherBoid.position)

      if (distance > 0 && distance < sepRadius) {
        // Calculate vector pointing away from other boid
        let diff = subtractVectors(boid.position, otherBoid.position)

        // Weight by distance (closer = stronger repulsion)
        diff = divideVector(diff, distance) // Normalize by distance

        steer = addVectors(steer, diff)
        total++
      }
    }
  })

  if (total > 0) {
    // Average the steering force
    steer = divideVector(steer, total)

    // Normalize and scale to max force
    if (vectorMagnitude(steer) > 0) {
      steer = setVectorMagnitude(steer, maxForce)
    }
  }

  return steer
}

/**
 * Handles edge wrapping for boids that move off the canvas
 * @param boid - The boid to check and wrap
 * @param canvasWidth - Width of the canvas
 * @param canvasHeight - Height of the canvas
 */
export const handleBoidEdgeCollisions = (
  boid: Boid,
  canvasWidth: number,
  canvasHeight: number
): void => {
  // Wrap horizontally
  if (boid.position.x > canvasWidth) {
    boid.position.x = 0
  } else if (boid.position.x < 0) {
    boid.position.x = canvasWidth
  }

  // Wrap vertically
  if (boid.position.y > canvasHeight) {
    boid.position.y = 0
  } else if (boid.position.y < 0) {
    boid.position.y = canvasHeight
  }
}

/**
 * Updates a boid's position and angle based on its velocity
 * @param boid - The boid to update
 * @param deltaTime - Time step for the update (optional, defaults to 1)
 */
export const updateBoid = (boid: Boid, deltaTime: number = 1): void => {
  // Update angle to match velocity direction
  boid.angle = vectorToAngle(boid.velocity)

  // Update position
  const scaledVelocity = scaleVector(boid.velocity, deltaTime)
  boid.position = addVectors(boid.position, scaledVelocity)
}

export const drawBoid = (ctx: CanvasRenderingContext2D, boid: Boid): void => {
  ctx.save()

  // Translate to the boid's center and rotate
  ctx.translate(boid.position.x, boid.position.y)
  ctx.rotate(boid.angle)

  // Calculate triangle vertices relative to center
  const halfLength = boid.length / 2
  const halfWidth = boid.width / 2

  // Define triangle vertices (pointing right when angle = 0)
  const tip = { x: halfLength, y: 0 }
  const baseLeft = { x: -halfLength, y: -halfWidth }
  const baseRight = { x: -halfLength, y: halfWidth }

  // Draw the triangle
  ctx.beginPath()
  ctx.moveTo(tip.x, tip.y)
  ctx.lineTo(baseLeft.x, baseLeft.y)
  ctx.lineTo(baseRight.x, baseRight.y)
  ctx.closePath()

  // Fill the boid
  ctx.fillStyle = boid.fillColor || "black"
  ctx.fill()

  // Optionally stroke the boid
  if (boid.strokeColor) {
    ctx.strokeStyle = boid.strokeColor
    ctx.stroke()
  }

  ctx.restore()
}

export const drawBoidPerception = (
  ctx: CanvasRenderingContext2D,
  boid: Boid
): void => {
  ctx.beginPath()
  ctx.strokeStyle = "red"
  ctx.arc(boid.position.x, boid.position.y, boid.perception, 0, 2 * Math.PI)
  ctx.stroke()
}

/**
 * Applies a force to the boid's velocity
 * @param boid - The boid to modify
 * @param force - The force vector to apply
 * @param maxSpeed - Optional maximum speed limit
 */
export const applyForce = (
  boid: Boid,
  force: Vector2D,
  maxSpeed?: number
): void => {
  boid.velocity = addVectors(boid.velocity, force)
  if (maxSpeed !== undefined) {
    boid.velocity = limitVector(boid.velocity, maxSpeed)
  }
}
