import { useResponsiveCanvas } from "@/hooks/useResponsiveCanvas"
import { useAnimationLoop } from "@/hooks/animationLoop"

export const useCanvasAnimation = (
  onUpdate: (
    deltaTime: number,
    size: { width: number; height: number }
  ) => void,
  onDraw: (
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number }
  ) => void
) => {
  const { canvasRef, canvasReady, getContext, getSize } = useResponsiveCanvas()

  // Run each animation frame: get canvas context and size, then call update and draw callbacks
  const animate = (deltaTime: number) => {
    const ctx = getContext()
    if (!ctx) return

    const size = getSize()

    onUpdate(deltaTime, size)
    onDraw(ctx, size)
  }

  useAnimationLoop(animate, { enabled: canvasReady })

  return {
    canvasRef,
    canvasReady,
    getSize,
    getContext,
  }
}
