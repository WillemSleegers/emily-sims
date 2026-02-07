export type Vector2D = {
  x: number
  y: number
}

/**
 * Creates a vector consisting of a x and y coordinate.
 * @param x - x coordinate
 * @param y - y coordinate
 */
export const createVector = (x: number, y: number): Vector2D => ({ x, y })

/**
 * Creates a vector from angle and magnitude
 * @param angle - Angle in degrees (0 points right)
 * @param magnitude - Length of the vector
 */
export const createVectorFromAngle = (
  angle: number,
  magnitude: number,
): Vector2D => ({
  x: Math.cos((angle * Math.PI) / 180) * magnitude,
  y: Math.sin((angle * Math.PI) / 180) * magnitude,
})

/**
 * Creates a unit vector pointing in the given direction
 * @param angle - Angle in radians
 */
export const createUnitVector = (angle: number): Vector2D =>
  createVectorFromAngle(angle, 1)

/**
 * Creates a vector pointing from one point to another
 */
export const createVectorBetween = (
  from: Vector2D,
  to: Vector2D,
): Vector2D => ({
  x: to.x - from.x,
  y: to.y - from.y,
})

/**
 * Calculates the magnitude (length) of a vector
 */
export const vectorMagnitude = (vector: Vector2D): number =>
  Math.sqrt(vector.x * vector.x + vector.y * vector.y)

/**
 * Sets the magnitude of a vector while preserving its direction
 * @param vector - The vector to modify
 * @param newMagnitude - The desired magnitude
 */
export const setVectorMagnitude = (
  vector: Vector2D,
  newMagnitude: number,
): Vector2D => {
  const normalized = normalizeVector(vector)
  return scaleVector(normalized, newMagnitude)
}

/**
 * Normalizes a vector to unit length
 */
export const normalizeVector = (vector: Vector2D): Vector2D => {
  const mag = vectorMagnitude(vector)
  if (mag === 0) return { x: 0, y: 0 }
  return {
    x: vector.x / mag,
    y: vector.y / mag,
  }
}

/**
 * Scales a vector by a scalar value
 */
export const scaleVector = (vector: Vector2D, scalar: number): Vector2D => ({
  x: vector.x * scalar,
  y: vector.y * scalar,
})

/**
 * Adds two vectors together
 */
export const addVectors = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x + b.x,
  y: a.y + b.y,
})

/**
 * Adds two vectors together
 */
export const subtractVectors = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x - b.x,
  y: a.y - b.y,
})

/**
 * Divides a vector by a scalar value
 */
export const divideVector = (vector: Vector2D, divisor: number): Vector2D => ({
  x: vector.x / divisor,
  y: vector.y / divisor,
})

/**
 * Gets the angle of a vector in radians
 */
export const vectorToAngle = (vector: Vector2D): number =>
  Math.atan2(vector.y, vector.x)

/**
 * Limits a vector to a maximum magnitude
 */
export const constrainVector = (
  vector: Vector2D,
  minMagnitude: number,
  maxMagnitude: number,
): Vector2D => {
  let mag = vectorMagnitude(vector)
  if (mag < minMagnitude) {
    mag = minMagnitude
  }
  if (mag > maxMagnitude) {
    mag = maxMagnitude
  }
  return scaleVector(normalizeVector(vector), mag)
}

/**
 * Calculates the distance between two vectors/points
 */
export const vectorDistance = (a: Vector2D, b: Vector2D): number => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Checks if a vector is exactly zero (both x and y components are 0)
 */
export const isZeroVector = (vector: Vector2D): boolean => {
  return vector.x === 0 && vector.y === 0
}
