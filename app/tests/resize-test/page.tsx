"use client"

import { CanvasSize, useResponsiveCanvas } from "@/hooks/useResponsiveCanvas"
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
  const { canvasRef } = useResponsiveCanvas({ onResize: drawDimensions })

  return (
    <SimLayout title="Resize Test" fullscreen>
      <Canvas ref={canvasRef} />
    </SimLayout>
  )
}

export default ResizeTestPage
