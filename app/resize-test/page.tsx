"use client"

import { useResponsiveCanvas } from "@/hooks/useResponsiveCanvas"
import { useEffect } from "react"
import { PageNav } from "@/components/page-nav"
import { FullScreen, useFullScreenHandle } from "react-full-screen"

const ResizeTestPage = () => {
  const { canvasRef, canvasReady, getSize } = useResponsiveCanvas()
  const fullscreenHandle = useFullScreenHandle()

  // Draw the dimensions on the canvas whenever it resizes
  useEffect(() => {
    if (!canvasReady) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const drawDimensions = () => {
      const size = getSize()

      // Draw dimensions text in the center
      ctx.fillStyle = "#ffffff"
      ctx.font = "24px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const text = `${size.width} × ${size.height}`
      ctx.fillText(text, size.width / 2, size.height / 2)
    }

    drawDimensions()

    // Set up a ResizeObserver to redraw when canvas resizes
    const parent = canvas.parentElement
    if (!parent) return

    const resizeObserver = new ResizeObserver(() => {
      drawDimensions()
    })
    resizeObserver.observe(parent)

    return () => {
      resizeObserver.disconnect()
    }
  }, [canvasReady, canvasRef, getSize])

  return (
    <div className="h-screen p-4 flex flex-col gap-2">
      <PageNav
        title="Resize Test"
        fullscreenHandle={fullscreenHandle}
        showFPS
      />
      <FullScreen handle={fullscreenHandle} className="min-h-0 min-w-0 grow">
        <canvas
          ref={canvasRef}
          className={`border border-primary rounded ${!canvasReady && "invisible"}`}
        />
      </FullScreen>
    </div>
  )
}

export default ResizeTestPage
