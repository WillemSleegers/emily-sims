import { useCallback, useEffect, useRef } from "react"

import { useAnimationLoop } from "@/hooks/animationLoop"
import {
  GridInfo,
  useResponsiveGridCanvas,
} from "@/hooks/useResponsiveGridCanvas"

export const useAnimatedGridCanvas = (
  cellSize: number,
  onUpdate?: (deltaTime: number, gridInfo: GridInfo) => void,
  onDraw?: (ctx: CanvasRenderingContext2D, gridInfo: GridInfo) => void,
  fps = 10
) => {
  const gridCanvas = useResponsiveGridCanvas(cellSize)
  const { canvasReady, getContext, getGridInfo } = gridCanvas

  const drawCallbackRef = useRef(onDraw)
  const updateCallbackRef = useRef(onUpdate)
  const accumulatedTime = useRef(0)

  useEffect(() => {
    drawCallbackRef.current = onDraw
    updateCallbackRef.current = onUpdate
  }, [onDraw, onUpdate])

  const forceDraw = useCallback(() => {
    if (!canvasReady) return

    const ctx = getContext()
    const gridInfo = getGridInfo()

    if (!ctx || !drawCallbackRef.current) return

    drawCallbackRef.current(ctx, gridInfo)
  }, [canvasReady, getContext, getGridInfo])

  useEffect(() => {
    if (canvasReady) forceDraw()
  }, [canvasReady, forceDraw])

  const targetInterval = 1000 / fps

  useAnimationLoop(
    (deltaTime) => {
      if (!canvasReady) return

      const ctx = getContext()
      const gridInfo = getGridInfo()

      if (!ctx) return

      accumulatedTime.current += deltaTime

      if (accumulatedTime.current >= targetInterval) {
        const gridDeltaTime = accumulatedTime.current
        accumulatedTime.current = 0

        updateCallbackRef.current?.(gridDeltaTime, gridInfo)
        drawCallbackRef.current?.(ctx, gridInfo)
      }
    },
    { enabled: canvasReady }
  )

  return {
    ...gridCanvas,
    forceDraw,
  }
}
