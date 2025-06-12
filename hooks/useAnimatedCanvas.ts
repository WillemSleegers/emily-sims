import { useResponsiveCanvas } from "@/hooks/useResponsiveCanvas"
import { useAnimationLoop } from "@/hooks/animationLoop"

export const useCanvasAnimation = (
  onUpdate?: (
    deltaTime: number,
    size: { width: number; height: number }
  ) => void,
  onDraw?: (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number }
  ) => void
) => {
  const { canvasRef, canvasReady, getContext, getSize } = useResponsiveCanvas()

  useAnimationLoop(
    (deltaTime) => {
      if (!canvasReady) return

      const ctx = getContext()
      const size = getSize()

      if (!ctx) return

      onUpdate?.(deltaTime, size)
      onDraw?.(ctx, size)
    },
    { enabled: canvasReady }
  )

  return {
    canvasRef,
    canvasReady,
    getSize,
    getContext,
  }
}
