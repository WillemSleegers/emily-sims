import { Vector2D } from "@/lib/utils-vector"

export type Boundary = {
  x: number // center x
  y: number // center y
  width: number // half-width
  height: number // half-height
}

export type QuadtreeNode = {
  boundary: Boundary
  capacity: number
  points: Vector2D[]
  divided: boolean
  northwest?: QuadtreeNode
  northeast?: QuadtreeNode
  southwest?: QuadtreeNode
  southeast?: QuadtreeNode
}

/**
 * Creates a boundary from center point and half-dimensions
 */
export const createBoundary = (
  x: number,
  y: number,
  width: number,
  height: number
): Boundary => ({
  x,
  y,
  width,
  height,
})

/**
 * Creates a new quadtree node
 */
export const createQuadtree = (
  boundary: Boundary,
  capacity: number = 4
): QuadtreeNode => ({
  boundary,
  capacity,
  points: [],
  divided: false,
})

/**
 * Checks if a point is within a boundary
 */
const boundaryContains = (boundary: Boundary, point: Vector2D): boolean => {
  return (
    point.x >= boundary.x - boundary.width &&
    point.x <= boundary.x + boundary.width &&
    point.y >= boundary.y - boundary.height &&
    point.y <= boundary.y + boundary.height
  )
}

/**
 * Checks if two boundaries intersect
 */
const boundaryIntersects = (a: Boundary, b: Boundary): boolean => {
  return !(
    a.x - a.width > b.x + b.width ||
    a.x + a.width < b.x - b.width ||
    a.y - a.height > b.y + b.height ||
    a.y + a.height < b.y - b.height
  )
}

/**
 * Subdivides a quadtree node into four children
 */
export const subdivide = (node: QuadtreeNode): QuadtreeNode => {
  if (node.divided) return node

  const { x, y, width, height } = node.boundary
  const halfWidth = width / 2
  const halfHeight = height / 2

  const northwest = createQuadtree(
    createBoundary(x - halfWidth, y - halfHeight, halfWidth, halfHeight),
    node.capacity
  )
  const northeast = createQuadtree(
    createBoundary(x + halfWidth, y - halfHeight, halfWidth, halfHeight),
    node.capacity
  )
  const southwest = createQuadtree(
    createBoundary(x - halfWidth, y + halfHeight, halfWidth, halfHeight),
    node.capacity
  )
  const southeast = createQuadtree(
    createBoundary(x + halfWidth, y + halfHeight, halfWidth, halfHeight),
    node.capacity
  )

  return {
    ...node,
    divided: true,
    northwest,
    northeast,
    southwest,
    southeast,
  }
}

/**
 * Inserts a point into the quadtree
 */
export const insertPoint = (node: QuadtreeNode, point: Vector2D): void => {
  // Check if point is in this boundary
  if (!boundaryContains(node.boundary, point)) return

  // If we have capacity and haven't subdivided, add the point here
  if (node.points.length < node.capacity && !node.divided) {
    node.points.push(point)
    return
  }

  // If not divided yet, subdivide (existing points stay here)
  if (!node.divided) {
    const subdivided = subdivide(node)
    node.divided = subdivided.divided
    node.northwest = subdivided.northwest
    node.northeast = subdivided.northeast
    node.southwest = subdivided.southwest
    node.southeast = subdivided.southeast
  }

  // Determine which child the point belongs to and insert only there
  const { x, y } = node.boundary

  if (point.x <= x) {
    if (point.y <= y) {
      // Northwest quadrant
      if (node.northwest) insertPoint(node.northwest, point)
    } else {
      // Southwest quadrant
      if (node.southwest) insertPoint(node.southwest, point)
    }
  } else {
    if (point.y <= y) {
      // Northeast quadrant
      if (node.northeast) insertPoint(node.northeast, point)
    } else {
      // Southeast quadrant
      if (node.southeast) insertPoint(node.southeast, point)
    }
  }
}

/**
 * Queries all points within a boundary range
 */
export const query = (node: QuadtreeNode, range: Boundary): Vector2D[] => {
  const found: Vector2D[] = []

  // Check if this boundary intersects with the query range
  if (!boundaryIntersects(node.boundary, range)) {
    return found
  }

  // Check points in current node
  node.points.forEach((point) => {
    if (boundaryContains(range, point)) {
      found.push(point)
    }
  })

  // If subdivided, also check children
  if (node.divided) {
    if (node.northwest) found.push(...query(node.northwest, range))
    if (node.northeast) found.push(...query(node.northeast, range))
    if (node.southwest) found.push(...query(node.southwest, range))
    if (node.southeast) found.push(...query(node.southeast, range))
  }

  return found
}

/**
 * Gets all points in the quadtree
 */
export const getAllPoints = (node: QuadtreeNode): Vector2D[] => {
  const points = [...node.points]

  if (node.divided) {
    if (node.northwest) points.push(...getAllPoints(node.northwest))
    if (node.northeast) points.push(...getAllPoints(node.northeast))
    if (node.southwest) points.push(...getAllPoints(node.southwest))
    if (node.southeast) points.push(...getAllPoints(node.southeast))
  }

  return points
}

/**
 * Draws the quadtree boundaries on canvas
 */
export const drawQuadtree = (
  ctx: CanvasRenderingContext2D,
  node: QuadtreeNode
): void => {
  const { x, y, width, height } = node.boundary

  // Draw boundary
  ctx.strokeStyle = "white"
  ctx.lineWidth = 1
  ctx.strokeRect(x - width, y - height, width * 2, height * 2)

  // Draw children if subdivided
  if (node.divided) {
    if (node.northwest) drawQuadtree(ctx, node.northwest)
    if (node.northeast) drawQuadtree(ctx, node.northeast)
    if (node.southwest) drawQuadtree(ctx, node.southwest)
    if (node.southeast) drawQuadtree(ctx, node.southeast)
  }
}

/**
 * Draws all points in the quadtree
 */
export const drawPoints = (
  ctx: CanvasRenderingContext2D,
  node: QuadtreeNode
): void => {
  const allPoints = getAllPoints(node)

  ctx.fillStyle = "white"
  allPoints.forEach((point) => {
    ctx.beginPath()
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
    ctx.fill()
  })
}

/**
 * Gets the total number of points in the quadtree
 */
export const getPointCount = (node: QuadtreeNode): number => {
  let count = node.points.length

  if (node.divided) {
    if (node.northwest) count += getPointCount(node.northwest)
    if (node.northeast) count += getPointCount(node.northeast)
    if (node.southwest) count += getPointCount(node.southwest)
    if (node.southeast) count += getPointCount(node.southeast)
  }

  return count
}
