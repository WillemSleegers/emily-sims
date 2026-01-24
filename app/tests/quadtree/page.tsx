"use client"

import { useEffect, useRef, MouseEvent } from "react"

import { useCanvasAnimation } from "@/hooks/useAnimatedCanvas"

import { FPSCounter } from "@/components/FPSCounter"

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
import { PageNav } from "@/components/page-nav"
import { cn } from "@/lib/utils"
import { FullScreen, useFullScreenHandle } from "react-full-screen"

const QuadtreePage = () => {
  const circles = useRef<Circle[]>([])
  const quadtree = useRef<QuadtreeNode>(undefined)
  const fullscreenHandle = useFullScreenHandle()

  // Move the circles around and have them bounce off of the edges
  const handleUpdate = (
    deltaTime: number,
    size: { width: number; height: number }
  ) => {
    circles.current.forEach((circle) => {
      handleCircleEdgeCollisions(circle, size.width, size.height)
      updateCirclePosition(circle, deltaTime)
    })
  }

  // Draw the circles
  const handleDraw = (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number }
  ) => {
    ctx.clearRect(0, 0, size.width, size.height)
    if (!quadtree.current) return

    drawQuadtree(ctx, quadtree.current)
    drawPoints(ctx, quadtree.current)
  }

  const { canvasRef, canvasReady, getSize } = useCanvasAnimation(
    handleUpdate,
    handleDraw
  )

  // Setup
  useEffect(() => {
    if (!canvasReady) return

    const size = getSize()

    const boundary: Boundary = createBoundary(
      size.width / 2,
      size.height / 2,
      size.width / 2,
      size.height / 2
    )
    const capacity = 1
    quadtree.current = createQuadtree(boundary, capacity)
  }, [canvasReady, getSize])

  const handleClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!quadtree.current) return

    const point = createVector(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY
    )

    insertPoint(quadtree.current, point)
  }

  return (
    <div className="p-4 flex flex-col gap-2">
      <PageNav
        title="Quadtree Test"
        fullscreenHandle={fullscreenHandle}
        showFPS
      />
      <div className={cn("min-h-0 grow border-2 border-primary rounded")}>
        <FullScreen handle={fullscreenHandle} className="h-full">
          <canvas ref={canvasRef} onClick={handleClick} />
        </FullScreen>
      </div>
    </div>
  )
}

export default QuadtreePage
