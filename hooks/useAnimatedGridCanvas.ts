import { useCallback, useEffect, useRef } from "react"

import { useAnimationLoop } from "@/hooks/useAnimationLoop"
import {
  GridInfo,
  useResponsiveGridCanvas,
} from "@/hooks/useResponsiveGridCanvas"

export const useAnimatedGridCanvas = (
  cellSize: number,
  onUpdate?: (deltaTime: number, gridInfo: GridInfo) => void,
  onDraw?: (ctx: CanvasRenderingContext2D, gridInfo: GridInfo) => void,
  fps = 10,
) => {
  // Stash latest callbacks in refs so the resize and animation paths
  // always see the current versions without re-subscribing observers.
  const drawCallbackRef = useRef(onDraw)
  const updateCallbackRef = useRef(onUpdate)
  const accumulatedTime = useRef(0)

  useEffect(() => {
    drawCallbackRef.current = onDraw
    updateCallbackRef.current = onUpdate
  }, [onDraw, onUpdate])

  // Redraw on resize so static-between-ticks sims (like Game of Life)
  // re-render their last frame at the new dimensions immediately.
  const gridCanvas = useResponsiveGridCanvas(cellSize, {
    onResize: (ctx, gridInfo) => drawCallbackRef.current?.(ctx, gridInfo),
  })
  const { canvasReady, getContext, getGridInfo } = gridCanvas

  const targetInterval = 1000 / fps

  // The loop itself still runs at full display refresh rate via
  // useAnimationLoop, but update/draw only fire once enough time has
  // accumulated to reach the target interval. This lets tick-based sims
  // (Game of Life, sand, rain) evolve at a controlled, low rate independent
  // of the display's refresh rate, rather than every rAF frame.
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
    { enabled: canvasReady },
  )

  // Trigger a draw outside the animation loop. Useful for redrawing
  // immediately in response to user input (e.g. clicks adding cells).
  const forceDraw = useCallback(() => {
    const ctx = getContext()
    if (!ctx) return
    drawCallbackRef.current?.(ctx, getGridInfo())
  }, [getContext, getGridInfo])

  return {
    ...gridCanvas,
    forceDraw,
  }
}
