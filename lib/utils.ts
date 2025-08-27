import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  return ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin
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
 * @param value - The normalized value (typically 0-1)
 * @param min - The minimum value of the target range
 * @param max - The maximum value of the target range
 * @returns The denormalized number in the target range
 */
export const denormalize = (
  value: number,
  min: number,
  max: number
): number => {
  return scale(value, 0, 1, min, max)
}
