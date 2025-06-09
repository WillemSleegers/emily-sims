"use client"

import { useRef } from "react"

import { useAnimatedCanvas } from "@/hooks/useAnimatedCanvas"

import {
  createWalker,
  updateWalkerPosition,
  drawWalker,
  randomStep,
  Walker,
} from "@/lib/sims/walker"

const FPS = 30

const RandomPage = () => {
  const walkers = useRef<Walker[]>([])

  const handleUpdate = (deltaTime: number) => {
    walkers.current.forEach((walker) =>
      updateWalkerPosition(walker, randomStep(25), deltaTime)
    )
  }

  const handleDraw = (ctx: CanvasRenderingContext2D) => {
    walkers.current.forEach((walker) => drawWalker(ctx, walker))
  }

  const { canvasRef } = useAnimatedCanvas(handleUpdate, handleDraw, FPS)

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault()

    const x = event.nativeEvent.offsetX
    const y = event.nativeEvent.offsetY

    const newWalker = createWalker(x, y)
    walkers.current.push(newWalker)
  }

  return (
    <div className="h-screen p-4 flex flex-col gap-2">
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-between">
        <h1 className="font-semibold text-2xl whitespace-nowrap">
          Random Walk
        </h1>
      </div>
      <div className="min-h-0 min-w-0 grow">
        <canvas
          ref={canvasRef}
          className="border border-primary rounded w-full h-full touch-none"
          style={{ touchAction: "none" }}
          onMouseDown={handleMouseDown}
        />
      </div>
    </div>
  )
}

export default RandomPage
