import { ComponentProps, forwardRef } from "react"
import { cn } from "@/lib/utils"

export const Canvas = forwardRef<
  HTMLCanvasElement,
  ComponentProps<"canvas">
>(({ className, ...props }, ref) => (
  <canvas ref={ref} className={cn("touch-none", className)} {...props} />
))

Canvas.displayName = "Canvas"
