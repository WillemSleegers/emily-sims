"use client"

import { CanvasSize, useResponsiveCanvas } from "@/hooks/useResponsiveCanvas"
import { useEffect } from "react"
import { PageNav } from "@/components/page-nav"
import { FullScreen, useFullScreenHandle } from "react-full-screen"
import { cn } from "@/lib/utils"

const drawDimensions = (ctx: CanvasRenderingContext2D, size: CanvasSize) => {
  // Draw dimensions text in the center
  ctx.fillStyle = "#ffffff"
  ctx.font = "24px monospace"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const text = `${size.width} × ${size.height}`
  ctx.fillText(text, size.width / 2, size.height / 2)
}

const ResizeTestPage = () => {
  const { canvasRef, canvasReady, getSize } = useResponsiveCanvas()
  const fullscreenHandle = useFullScreenHandle()

  // Draw the dimensions on the canvas whenever it resizes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set up a ResizeObserver to redraw when canvas resizes
    const parent = canvas.parentElement
    if (!parent) return

    const resizeObserver = new ResizeObserver(() => {
      const size = getSize()
      drawDimensions(ctx, size)
    })
    resizeObserver.observe(parent)

    return () => {
      resizeObserver.disconnect()
    }
  }, [canvasReady, canvasRef, getSize])

  return (
    <div className="h-dvh p-4 flex flex-col gap-2">
      <PageNav
        title="Resize Test"
        fullscreenHandle={fullscreenHandle}
        showFPS
      />
      <div className={cn("min-h-0 grow border-2 border-primary rounded")}>
        <FullScreen handle={fullscreenHandle} className="h-full">
          <canvas ref={canvasRef} />
        </FullScreen>
      </div>
    </div>
  )
}

export default ResizeTestPage
