/**
 * Generates a random number between min and max (inclusive)
 * @param min - The minimum value - defaults to 0
 * @param max - The maximum value - defaults to 1
 * @returns A random number between min and max
 */
export const randomNumber = (min: number = 0, max: number = 1): number => {
  if (min > max) {
    throw new Error("Minimum value cannot be greater than maximum value")
  }

  return Math.random() * (max - min) + min
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param min - The minimum integer value - defaults to 0
 * @param max - The maximum integer value - defaults to 10
 * @returns A random integer between min and max
 */
export const randomInteger = (min: number = 0, max: number = 10): number => {
  if (min > max) {
    throw new Error("Minimum value cannot be greater than maximum value")
  }

  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generates a random sign value (-1 or 1)
 * @returns Either -1 or 1 with equal probability
 */
export const randomSign = (): number => {
  return Math.random() < 0.5 ? -1 : 1
}
