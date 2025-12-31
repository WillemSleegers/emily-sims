"use client"

import { useRef, useEffect, useState } from "react"
import { setupCanvasForHighDPI } from "@/lib/canvas-utils"

export type CanvasSize = {
  width: number
  height: number
}

export const useResponsiveCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasSize = useRef<CanvasSize>({ width: 0, height: 0 })

  const [canvasReady, setCanvasReady] = useState(false)

  const handleResize = (canvas: HTMLCanvasElement, parent: HTMLElement) => {
    const width = parent.clientWidth
    const height = parent.clientHeight
    canvasSize.current = { width, height }

    setupCanvasForHighDPI(canvas, width, height)
    setCanvasReady(width > 0 && height > 0)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const resizeObserver = new ResizeObserver(() =>
      handleResize(canvas, parent)
    )
    resizeObserver.observe(parent)

    handleResize(canvas, parent) // Run once for initial sizing

    return () => {
      resizeObserver.disconnect()
    }
  }, [handleResize])

  // Convenience functions to access canvas properties without exposing refs
  const getContext = () => {
    return canvasRef.current?.getContext("2d") || null
  }

  const getSize = () => canvasSize.current

  return {
    canvasRef,
    canvasReady,
    getContext,
    getSize,
  }
}
