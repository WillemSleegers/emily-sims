"use client"

import { useRef, MouseEvent, TouchEvent } from "react"

import {
  Walker,
  createWalker,
  generateRandomStep,
  drawWalker,
} from "@/lib/sims/walker"
import { addVectors } from "@/lib/utils-vector"
import { useCanvasAnimation } from "@/hooks/useAnimatedCanvas"

const STEP_INTERVAL = 200
const STEP_SIZE = 5

const RandomPage = () => {
  const walkers = useRef<Walker[]>([])
  const stepTimer = useRef<number>(0)

  const handleUpdate = (deltaTime: number) => {
    // Update step timer
    stepTimer.current += deltaTime

    // Check if it's time to update walker directions
    if (stepTimer.current >= STEP_INTERVAL) {
      walkers.current.forEach((walker) => {
        const randomStep = generateRandomStep(STEP_SIZE)
        walker.position = addVectors(walker.position, randomStep)
      })
      stepTimer.current = 0
    }
  }

  const handleDraw = (ctx: CanvasRenderingContext2D) => {
    walkers.current.forEach((walker) => drawWalker(ctx, walker))
  }

  const { canvasRef } = useCanvasAnimation(handleUpdate, handleDraw)

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault()

    const x = event.nativeEvent.offsetX
    const y = event.nativeEvent.offsetY

    const newWalker = createWalker(x, y)
    walkers.current.push(newWalker)
  }

  const handleTouchStart = (event: TouchEvent<HTMLCanvasElement>) => {
    console.log(event)
  }

  return (
    <div className="h-dvh p-4 flex flex-col gap-2 select-none">
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between">
        <h1 className="font-semibold text-2xl whitespace-nowrap">
          Random Walk
        </h1>
      </div>
      <div className="min-h-0 min-w-0 grow">
        <canvas
          ref={canvasRef}
          className="border border-primary rounded w-full h-full touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />
      </div>
    </div>
  )
}

export default RandomPage
