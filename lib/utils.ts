import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
 * Scales a number from one range to another range
 * @param value - The number to scale
 * @param fromMin - The minimum value of the original range
 * @param fromMax - The maximum value of the original range
 * @param toMin - The minimum value of the target range
 * @param toMax - The maximum value of the target range
 * @returns The scaled number in the target range
 */
export const scale = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number => {
  // Validate input ranges
  if (fromMin === fromMax) {
    throw new Error(
      "Source range cannot have zero width (fromMin cannot equal fromMax)"
    )
  }

  // Calculate the scaled value
  return ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin
}

/**
 * Scales a number from one range to another range, with clamping to prevent values outside the target range
 * More efficient approach: check bounds first, then scale
 * @param value - The number to scale
 * @param fromMin - The minimum value of the original range
 * @param fromMax - The maximum value of the original range
 * @param toMin - The minimum value of the target range
 * @param toMax - The maximum value of the target range
 * @returns The scaled number clamped to the target range
 */
export const scaleClamp = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number => {
  // Validate input ranges
  if (fromMin === fromMax) {
    throw new Error(
      "Source range cannot have zero width (fromMin cannot equal fromMax)"
    )
  }

  // Check bounds first - more efficient than scaling then clamping!
  if (value <= fromMin) return toMin
  if (value >= fromMax) return toMax

  // Only scale if within range
  return scale(value, fromMin, fromMax, toMin, toMax)
}

/**
 * Normalizes a number to a 0-1 range
 * @param value - The number to normalize
 * @param min - The minimum value of the range
 * @param max - The maximum value of the range
 * @returns The normalized number between 0 and 1
 */
export const normalize = (value: number, min: number, max: number): number => {
  return scale(value, min, max, 0, 1)
}

/**
 * Denormalizes a number from 0-1 range to a target range
 * @param normalizedValue - The normalized value (typically 0-1)
 * @param min - The minimum value of the target range
 * @param max - The maximum value of the target range
 * @returns The denormalized number in the target range
 */
export const denormalize = (
  normalizedValue: number,
  min: number,
  max: number
): number => {
  return scale(normalizedValue, 0, 1, min, max)
}
