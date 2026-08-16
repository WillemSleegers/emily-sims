import { useResponsiveCanvas } from "@/hooks/useResponsiveCanvas"
import { useAnimationLoop } from "@/hooks/useAnimationLoop"

export const useAnimatedCanvas = (
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

  // getContext/getSize are re-read every frame rather than captured once, so
  // this always draws onto the current canvas even across resizes, without
  // needing to restart the animation loop.
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
