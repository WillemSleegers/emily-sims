"use client"

import { useRef, useEffect, useState } from "react"
import { setupCanvasForHighDPI } from "@/lib/canvas-utils"

export type CanvasSize = {
  width: number
  height: number
}

type UseResponsiveCanvasOptions = {
  // Called after the canvas has been resized and prepared for high-DPI drawing.
  // Useful for static canvases that only need to redraw on resize.
  onResize?: (ctx: CanvasRenderingContext2D, size: CanvasSize) => void
}

export const useResponsiveCanvas = (options: UseResponsiveCanvasOptions = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasSize = useRef<CanvasSize>({ width: 0, height: 0 })

  const [canvasReady, setCanvasReady] = useState(false)

  // Stash the latest onResize in a ref so consumers don't need to memoize it,
  // and so the effect below doesn't re-subscribe the observer on every render.
  const onResizeRef = useRef(options.onResize)
  onResizeRef.current = options.onResize

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const handleResize = () => {
      const width = parent.clientWidth
      const height = parent.clientHeight
      canvasSize.current = { width, height }

      setupCanvasForHighDPI(canvas, width, height)
      setCanvasReady(width > 0 && height > 0)

      // Run after high-DPI setup so the callback draws onto a freshly sized canvas.
      if (width > 0 && height > 0) {
        const ctx = canvas.getContext("2d")
        if (ctx) onResizeRef.current?.(ctx, canvasSize.current)
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(parent)

    handleResize() // Run once for initial sizing

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

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
