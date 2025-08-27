/**
 * Generates a random number between min and max
 * @param minOrMax - Maximum value (if used alone) or minimum value (if max provided)
 * @param max - Maximum value (optional, defaults to treating first param as max)
 * @returns Random number between the determined min and max values
 */
export const randomNumber = (minOrMax: number, max?: number): number => {
  const [min, actualMax] = max !== undefined ? [minOrMax, max] : [0, minOrMax]

  if (min > actualMax) {
    throw new Error("Minimum value cannot be greater than maximum value")
  }

  return Math.random() * (actualMax - min) + min
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param minOrMax - Maximum value (if used alone) or minimum value (if max provided)
 * @param max - Maximum value (optional, defaults to treating first param as max)
 * @returns Random integer between the determined min and max values (inclusive)
 */
export const randomInt = (minOrMax: number, max?: number): number => {
  const [min, actualMax] = max !== undefined ? [minOrMax, max] : [0, minOrMax]

  if (min > actualMax) {
    throw new Error("Minimum value cannot be greater than maximum value")
  }

  return Math.floor(Math.random() * (actualMax - min + 1)) + min
}

/**
 * Generates a random sign value (-1 or 1)
 * @returns Either -1 or 1 with equal probability
 */
export const randomSign = (): number => {
  return Math.random() < 0.5 ? -1 : 1
}
