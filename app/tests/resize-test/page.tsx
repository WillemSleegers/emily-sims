"use client"

import { CanvasSize, useResponsiveCanvas } from "@/hooks/useResponsiveCanvas"
import { useEffect } from "react"
import { SimLayout } from "@/components/sim-layout"
import { Canvas } from "@/components/canvas"

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
    <SimLayout title="Resize Test" fullscreen showFPS>
      <Canvas ref={canvasRef} />
    </SimLayout>
  )
}

export default ResizeTestPage
