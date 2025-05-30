/**
 * Generates a random number between min and max (inclusive)
 * @param min - The minimum value (inclusive) - defaults to 0
 * @param max - The maximum value (inclusive) - defaults to 1
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
 * @param min - The minimum integer value (inclusive) - defaults to 0
 * @param max - The maximum integer value (inclusive) - defaults to 10
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
