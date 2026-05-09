// Shared canvas utilities for DPI handling and setup

/**
 * Configures a canvas element for high-DPI displays by setting the internal
 * resolution and applying proper scaling to the drawing context.
 */
export function setupCanvasForHighDPI(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
) {
  const dpr = window.devicePixelRatio

  // Set internal canvas resolution (multiplied by DPI for sharpness)
  canvas.width = width * dpr
  canvas.height = height * dpr

  // Set visual display size (actual size on screen)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext("2d")
  if (ctx) {
    // Reset any previous transformations to not multiply previous scaling factors
    ctx.resetTransform()
    // Scale drawing operations to match the DPI multiplier
    // This allows drawing at normal coordinates while rendering at high resolution
    ctx.scale(dpr, dpr)
  }
}
