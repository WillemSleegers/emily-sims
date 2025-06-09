"use client"

import { useRef, useEffect, useCallback, useState } from "react"

export interface CanvasSize {
  width: number
  height: number
}

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasSize = useRef<CanvasSize>({ width: 0, height: 0 })
  const [canvasReady, setCanvasReady] = useState(false)

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas?.parentElement) return

    const parent = canvas.parentElement
    const width = parent.clientWidth
    const height = parent.clientHeight

    const dpr = window.devicePixelRatio

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    canvasSize.current = { width, height }

    if (width > 0 && height > 0) {
      setCanvasReady(true)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas?.parentElement) return

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvas.parentElement)
    handleResize()

    window.addEventListener("resize", handleResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", handleResize)
    }
  }, [handleResize])

  const getContext = useCallback(() => {
    return canvasRef.current?.getContext("2d") || null
  }, [])

  const getSize = useCallback(() => canvasSize.current, [])

  return {
    canvasRef,
    canvasReady,
    getContext,
    getSize,
  }
}
