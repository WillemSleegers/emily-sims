"use client"

import { useRef, useEffect, useState } from "react"
import { setupCanvasForHighDPI } from "@/lib/utils-canvas"

export type CanvasSize = {
  width: number
  height: number
}

type UseResponsiveCanvasOptions = {
  // Called after the canvas has been resized and prepared for high-DPI drawing.
  // Useful for static canvases that only need to redraw on resize.
  onResize?: (ctx: CanvasRenderingContext2D, size: CanvasSize) => void
  // Transforms the container's measured size into the canvas size to use.
  // Defaults to identity (canvas fills the container). Used by specializations
  // like the grid hook to snap dimensions to a cell-size multiple.
  computeSize?: (container: CanvasSize) => CanvasSize
}

export const useResponsiveCanvas = (options: UseResponsiveCanvasOptions = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasSize = useRef<CanvasSize>({ width: 0, height: 0 })

  const [canvasReady, setCanvasReady] = useState(false)

  // Stash latest options in refs so consumers don't need to memoize them,
  // and so the effect below doesn't re-subscribe the observer on every render.
  const onResizeRef = useRef(options.onResize)
  const computeSizeRef = useRef(options.computeSize)
  onResizeRef.current = options.onResize
  computeSizeRef.current = options.computeSize

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const handleResize = () => {
      const container = {
        width: parent.clientWidth,
        height: parent.clientHeight,
      }
      const size = computeSizeRef.current?.(container) ?? container

      // Skip redundant work if the resolved size hasn't changed (e.g. container
      // resized by less than a grid cell, so the snapped size is identical).
      if (
        size.width === canvasSize.current.width &&
        size.height === canvasSize.current.height
      ) {
        return
      }

      canvasSize.current = size

      setupCanvasForHighDPI(canvas, size.width, size.height)
      setCanvasReady(size.width > 0 && size.height > 0)

      // Run after high-DPI setup so the callback draws onto a freshly sized canvas.
      if (size.width > 0 && size.height > 0) {
        const ctx = canvas.getContext("2d")
        if (ctx) onResizeRef.current?.(ctx, size)
      }
    }

    // Watches the parent element's box size directly, not just the window —
    // catches layout changes a window resize listener would miss, like a
    // sidebar toggling or a flex container reflowing.
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
