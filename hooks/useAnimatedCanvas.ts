import { useCanvas } from "@/hooks/useCanvas"
import { useAnimationLoop } from "@/hooks/animationLoop"

export const useAnimatedCanvas = (
  onUpdate?: (
    deltaTime: number,
    size: { width: number; height: number }
  ) => void,
  onDraw?: (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number }
  ) => void,
  fps = 60
) => {
  const { canvasRef, canvasReady, getContext, getSize } = useCanvas()

  useAnimationLoop(
    (deltaTime) => {
      if (!canvasReady) return

      const ctx = getContext()
      const size = getSize()

      if (!ctx) return

      onUpdate?.(deltaTime, size)
      onDraw?.(ctx, size)
    },
    { fps, enabled: canvasReady }
  )

  return {
    canvasRef,
    canvasReady,
    getSize,
    getContext,
  }
}
