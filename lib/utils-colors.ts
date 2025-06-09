// HSL to Hex conversion function
export const hslToHex = (h: number, s: number, l: number): string => {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Converts HSL color values to RGB
 * @param h - Hue (0-360 degrees)
 * @param s - Saturation (0-100 percent)
 * @param l - Lightness (0-100 percent)
 * @returns RGB values as {r, g, b} (0-255 range)
 */
export function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  // Normalize values to 0-1 range
  h = ((h % 360) + 360) % 360 // Ensure h is in 0-360 range
  s = Math.max(0, Math.min(100, s)) / 100 // Clamp s to 0-100 and convert to 0-1
  l = Math.max(0, Math.min(100, l)) / 100 // Clamp l to 0-100 and convert to 0-1

  const c = (1 - Math.abs(2 * l - 1)) * s // Chroma
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0,
    g = 0,
    b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else if (h >= 300 && h < 360) {
    r = c
    g = 0
    b = x
  }

  // Convert to 0-255 range and round
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

export function setPixelHSL(
  imageData: ImageData,
  x: number,
  y: number,
  h: number,
  s: number,
  l: number,
  a: number = 255
): void {
  const { r, g, b } = hslToRgb(h, s, l)
  const index = (y * imageData.width + x) * 4

  imageData.data[index] = r // Red
  imageData.data[index + 1] = g // Green
  imageData.data[index + 2] = b // Blue
  imageData.data[index + 3] = a // Alpha
}

export const hueFromElapsedTime = (
  colorSpeed: number,
  accumulatedTime: number
): number => {
  const cycleTime = (100 - colorSpeed) * 100 + 1000
  return ((accumulatedTime / cycleTime) * 360) % 360
}
