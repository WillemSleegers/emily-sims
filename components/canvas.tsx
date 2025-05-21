"use client"

import { drawGrid } from "@/lib/canvasGridUtils"
import { drawCircle } from "@/lib/canvasUtils"
import { useEffect, useRef } from "react"

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Handle canvas resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current

      if (canvas) {
        const parent = canvas.parentElement

        if (parent) {
          const dpr = window.devicePixelRatio

          const width = parent.clientWidth
          const height = parent.clientHeight

          canvas.width = width * dpr
          canvas.height = height * dpr

          const ctx = canvas.getContext("2d", { alpha: false })!
          ctx.scale(dpr, dpr)

          canvas.style.width = `${width}px`
          canvas.style.height = `${height}px`

          drawGrid(ctx, "black", 20, width, height)
          drawCircle(ctx, width / 2, height / 2)
        }
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="h-full">
      <canvas ref={canvasRef} className="border-2 rounded border-black" />
    </div>
  )
}

export default Canvas
