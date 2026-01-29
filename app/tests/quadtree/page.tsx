"use client"

import { useEffect, useRef, MouseEvent } from "react"

import { useCanvasAnimation } from "@/hooks/useAnimatedCanvas"

import {
  Circle,
  handleCircleEdgeCollisions,
  updateCirclePosition,
} from "@/lib/sims/circle"
import { createVector } from "@/lib/utils-vector"

import {
  createQuadtree,
  Boundary,
  createBoundary,
  QuadtreeNode,
  insertPoint,
  drawQuadtree,
  drawPoints,
} from "@/lib/quadtree"
import { SimLayout } from "@/components/sim-layout"
import { Canvas } from "@/components/canvas"

const QuadtreePage = () => {
  const circles = useRef<Circle[]>([])
  const quadtree = useRef<QuadtreeNode>(undefined)

  // Move the circles around and have them bounce off of the edges
  const handleUpdate = (
    deltaTime: number,
    size: { width: number; height: number },
  ) => {
    circles.current.forEach((circle) => {
      updateCirclePosition(circle, deltaTime)
      handleCircleEdgeCollisions(circle, size.width, size.height)
    })
  }

  // Draw the circles
  const handleDraw = (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number },
  ) => {
    ctx.clearRect(0, 0, size.width, size.height)
    if (!quadtree.current) return

    drawQuadtree(ctx, quadtree.current)
    drawPoints(ctx, quadtree.current)
  }

  const { canvasRef, canvasReady, getSize } = useCanvasAnimation(
    handleUpdate,
    handleDraw,
  )

  // Setup
  useEffect(() => {
    if (!canvasReady) return

    const size = getSize()

    const boundary: Boundary = createBoundary(
      size.width / 2,
      size.height / 2,
      size.width / 2,
      size.height / 2,
    )
    const capacity = 1
    quadtree.current = createQuadtree(boundary, capacity)
  }, [canvasReady, getSize])

  const handleClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!quadtree.current) return

    const point = createVector(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY,
    )

    insertPoint(quadtree.current, point)
  }

  return (
    <SimLayout title="Quadtree Test" fullscreen showFPS>
      <Canvas ref={canvasRef} onClick={handleClick} />
    </SimLayout>
  )
}

export default QuadtreePage
