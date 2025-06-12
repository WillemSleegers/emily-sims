import { useCallback, useEffect, useRef } from "react"
import { useAnimationLoop } from "./animationLoop"
import { GridInfo, useGridCanvas } from "./useGridCanvas"

export const useAnimatedGridCanvas = (
  cellSize: number,
  onUpdate?: (
    deltaTime: number,
    ctx: CanvasRenderingContext2D,
    gridInfo: GridInfo
  ) => void,
  onDraw?: (ctx: CanvasRenderingContext2D, gridInfo: GridInfo) => void,
  fps = 60
) => {
  const gridCanvas = useGridCanvas(cellSize)
  const { canvasReady, getContext, getGridInfo } = gridCanvas

  // Store the callbacks in refs so forceDraw can access them
  const drawCallbackRef = useRef(onDraw)
  const updateCallbackRef = useRef(onUpdate)

  useEffect(() => {
    drawCallbackRef.current = onDraw
    updateCallbackRef.current = onUpdate
  }, [onDraw, onUpdate])

  const forceDraw = useCallback(() => {
    if (!canvasReady) return

    const ctx = getContext()
    const gridInfo = getGridInfo()

    if (!ctx || !drawCallbackRef.current) return

    // Call the draw function immediately
    drawCallbackRef.current(ctx, gridInfo)
  }, [canvasReady, getContext, getGridInfo])

  useAnimationLoop(
    (deltaTime) => {
      if (!canvasReady) return

      const ctx = getContext()
      const gridInfo = getGridInfo()

      if (!ctx) return

      updateCallbackRef.current?.(deltaTime, ctx, gridInfo)
      drawCallbackRef.current?.(ctx, gridInfo)
    },
    { enabled: canvasReady }
  )

  return {
    ...gridCanvas,
    forceDraw, // Add forceDraw to the returned object
  }
}
