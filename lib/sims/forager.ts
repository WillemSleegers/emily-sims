import {
  addVectors,
  createVector,
  scaleVector,
  subtractVectors,
  Vector2D,
  vectorDistance,
  vectorToAngle,
} from "@/lib/utils-vector"
import { simplexNoise } from "@/lib/random/simplex"

export type Forager = {
  position: Vector2D
  // Direction the forager is facing, in radians. Movement is always
  // along this heading at `speed` pixels per second.
  heading: number
  // Current forward speed in pixels per second. Eases between
  // `cruiseSpeed` (wandering) and `chaseSpeed` (food in sight).
  speed: number
  cruiseSpeed: number
  chaseSpeed: number
  // How fast `speed` can change, in pixels per second squared.
  acceleration: number
  // Maximum turn rate in radians per second. Low values keep the
  // forager from snapping instantly toward new targets, which is the
  // main thing that makes the motion look organic.
  turnRate: number
  // A slowly-drifting target heading used while wandering.
  wanderHeading: number
  // Accumulated time, used as the x-coordinate when sampling noise.
  age: number
  // Unique y-offset into the noise field so each forager wanders
  // independently of any others sharing the simulation.
  noiseSeed: number
  perception: number
  // Visual half-length of the triangle from tail to tip.
  length: number
  // Visual half-width of the triangle at the base.
  width: number
  fillColor: string
}

export type Food = {
  position: Vector2D
  radius: number
  fillColor: string
}

export const createForager = (
  position: Vector2D,
  cruiseSpeed: number = 60,
  perception: number = 140,
): Forager => {
  const heading = Math.random() * Math.PI * 2
  return {
    position,
    heading,
    speed: cruiseSpeed,
    cruiseSpeed,
    chaseSpeed: cruiseSpeed * 2.2,
    acceleration: 140,
    turnRate: Math.PI * 1.2,
    wanderHeading: heading,
    age: 0,
    noiseSeed: Math.random() * 1000,
    perception,
    length: 14,
    width: 9,
    fillColor: "#f59e0b",
  }
}

export const createFood = (position: Vector2D): Food => ({
  position,
  radius: 4,
  fillColor: "#22c55e",
})

/**
 * Finds the nearest food within the forager's perception radius.
 */
const findNearestFood = (forager: Forager, foods: Food[]): Food | null => {
  let nearest: Food | null = null
  let nearestDistance = forager.perception

  for (const food of foods) {
    const distance = vectorDistance(forager.position, food.position)
    if (distance < nearestDistance) {
      nearest = food
      nearestDistance = distance
    }
  }

  return nearest
}

/**
 * Returns the signed shortest angular difference (target - current),
 * wrapped into the range [-PI, PI]. This is what lets us turn the
 * smaller of the two directions around a circle instead of unwinding
 * a multi-turn delta.
 */
const angleDifference = (current: number, target: number): number => {
  let diff = target - current
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return diff
}

/**
 * Picks a desired heading and target speed for this frame. When food is
 * in sight the forager aims at it and wants to move at chase speed;
 * otherwise it follows its wander heading at cruise speed.
 */
const desiredMotion = (
  forager: Forager,
  foods: Food[],
  deltaTime: number,
): { heading: number; targetSpeed: number } => {
  const target = findNearestFood(forager, foods)

  if (target) {
    const toFood = subtractVectors(target.position, forager.position)
    return {
      heading: vectorToAngle(toFood),
      targetSpeed: forager.chaseSpeed,
    }
  }

  // Use simplex noise as a smoothly-varying steering signal. Sampling
  // along the time axis gives continuous turn rates in roughly [-1, 1],
  // which feels organic - unlike pure random offsets, consecutive
  // samples are correlated, so the path curves instead of jittering.
  forager.age += deltaTime
  const steer = simplexNoise(forager.age * 0.2, forager.noiseSeed)
  forager.wanderHeading += steer * 1.2 * deltaTime
  return {
    heading: forager.wanderHeading,
    targetSpeed: forager.cruiseSpeed,
  }
}

/**
 * Steers the forager: compute desired heading + speed, then rotate the
 * actual heading toward it at most `turnRate` radians this frame and
 * ease the actual speed toward the target by `acceleration * dt`.
 */
export const updateForagerHeading = (
  forager: Forager,
  foods: Food[],
  deltaTime: number,
): void => {
  const { heading: desired, targetSpeed } = desiredMotion(
    forager,
    foods,
    deltaTime,
  )

  const diff = angleDifference(forager.heading, desired)
  const maxTurn = forager.turnRate * deltaTime

  if (Math.abs(diff) <= maxTurn) {
    forager.heading = desired
  } else {
    forager.heading += Math.sign(diff) * maxTurn
  }

  // Step the current speed toward the target speed without overshooting.
  const speedDiff = targetSpeed - forager.speed
  const maxStep = forager.acceleration * deltaTime
  if (Math.abs(speedDiff) <= maxStep) {
    forager.speed = targetSpeed
  } else {
    forager.speed += Math.sign(speedDiff) * maxStep
  }
}

export const updateForagerPosition = (
  forager: Forager,
  deltaTime: number,
): void => {
  const velocity = createVector(
    Math.cos(forager.heading) * forager.speed,
    Math.sin(forager.heading) * forager.speed,
  )
  forager.position = addVectors(
    forager.position,
    scaleVector(velocity, deltaTime),
  )
}

/**
 * Bounces the forager off the canvas edges by reflecting its heading
 * across the wall it hit and nudging it back inside the bounds.
 */
export const handleForagerEdges = (
  forager: Forager,
  width: number,
  height: number,
): void => {
  const r = forager.length / 2
  let bounced = false

  if (forager.position.x < r) {
    forager.position.x = r
    // Reflect across the vertical wall: x-velocity flips sign.
    forager.heading = Math.PI - forager.heading
    bounced = true
  } else if (forager.position.x > width - r) {
    forager.position.x = width - r
    forager.heading = Math.PI - forager.heading
    bounced = true
  }

  if (forager.position.y < r) {
    forager.position.y = r
    // Reflect across the horizontal wall: y-velocity flips sign.
    forager.heading = -forager.heading
    bounced = true
  } else if (forager.position.y > height - r) {
    forager.position.y = height - r
    forager.heading = -forager.heading
    bounced = true
  }

  // Sync wander heading so the next wander step doesn't immediately
  // pull the forager back into the wall it just bounced off.
  if (bounced) forager.wanderHeading = forager.heading
}

/**
 * Removes any food the forager is currently touching. Mutates the
 * foods array in place and returns the count eaten.
 */
export const consumeFood = (forager: Forager, foods: Food[]): number => {
  let eaten = 0
  const reach = forager.length / 2
  for (let i = foods.length - 1; i >= 0; i--) {
    const food = foods[i]
    const distance = vectorDistance(forager.position, food.position)
    if (distance < reach + food.radius) {
      foods.splice(i, 1)
      eaten++
    }
  }
  return eaten
}

/**
 * Draws the forager as a triangle pointing in its heading direction.
 * The tip of the triangle is the "head" - the leading point that
 * always faces where the forager is going.
 */
export const drawForager = (
  ctx: CanvasRenderingContext2D,
  forager: Forager,
  showPerception: boolean = true,
): void => {
  if (showPerception) {
    ctx.beginPath()
    ctx.arc(
      forager.position.x,
      forager.position.y,
      forager.perception,
      0,
      Math.PI * 2,
    )
    ctx.strokeStyle = "rgba(245, 158, 11, 0.25)"
    ctx.lineWidth = 1
    ctx.stroke()
  }

  ctx.save()
  ctx.translate(forager.position.x, forager.position.y)
  ctx.rotate(forager.heading)

  const halfLength = forager.length / 2
  const halfWidth = forager.width / 2

  // Triangle pointing right at angle 0; rotation aligns it with heading.
  ctx.beginPath()
  ctx.moveTo(halfLength, 0)
  ctx.lineTo(-halfLength, -halfWidth)
  ctx.lineTo(-halfLength, halfWidth)
  ctx.closePath()

  ctx.fillStyle = forager.fillColor
  ctx.fill()
  ctx.restore()
}

export const drawFood = (ctx: CanvasRenderingContext2D, food: Food): void => {
  ctx.beginPath()
  ctx.arc(food.position.x, food.position.y, food.radius, 0, Math.PI * 2)
  ctx.fillStyle = food.fillColor
  ctx.fill()
}

/**
 * Spawns a food item at a uniformly random position within the canvas.
 */
export const spawnRandomFood = (width: number, height: number): Food =>
  createFood(createVector(Math.random() * width, Math.random() * height))
