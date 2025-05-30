import { Raindrop } from "@/lib/types"
import { scale } from "./utils"

export const drawRaindrop = (
  ctx: CanvasRenderingContext2D,
  raindrop: Raindrop
): void => {
  ctx.lineWidth = scale(raindrop.z, 0, 20, 1, 3)
  ctx.strokeStyle = raindrop.color

  ctx.beginPath()
  ctx.moveTo(raindrop.x, raindrop.y)
  ctx.lineTo(raindrop.x, raindrop.y + raindrop.len)
  ctx.stroke()
}
