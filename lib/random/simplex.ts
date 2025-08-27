/**
 * 2D Simplex Noise Generator
 * Improved version of Perlin noise with better visual quality and performance
 * Deterministic by default - same coordinates always return the same value
 */

// Gradient vectors for simplex noise (12 directions on a circle)
const GRADIENTS_3D = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
]

// Permutation table (same as Perlin for consistency)
const PERMUTATION = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
  36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234,
  75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237,
  149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48,
  27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105,
  92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73,
  209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86,
  164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38,
  147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189,
  28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101,
  155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
  178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
  191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
  181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
  138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
  61, 156, 180,
]

// Double the permutation table
const P = [...PERMUTATION, ...PERMUTATION]

// Skewing and unskewing factors for 2D
const F2 = 0.5 * (Math.sqrt(3) - 1) // Skew factor
const G2 = (3 - Math.sqrt(3)) / 6 // Unskew factor

/**
 * Calculate the contribution from a single simplex vertex
 */
const getCornerContribution = (x: number, y: number, gi: number): number => {
  let t = 0.5 - x * x - y * y
  if (t < 0) return 0

  t *= t
  const grad = GRADIENTS_3D[gi % 12]
  return t * t * (grad[0] * x + grad[1] * y)
}

/**
 * Generate 2D Simplex noise
 * Smoother and faster than Perlin noise, with less directional artifacts
 *
 * @param x - X coordinate (any real number)
 * @param y - Y coordinate (any real number)
 * @returns Noise value between approximately -1 and 1
 *
 * Usage:
 *   simplexNoise(0.1, 0.2)           // Always returns the same value
 *   simplexNoise(x * 0.01, y * 0.01) // Common for terrain patterns
 *
 * Advantages over Perlin noise:
 *   - Better visual quality (less grid artifacts)
 *   - Faster computation
 *   - More isotropic (looks the same in all directions)
 */
export const simplexNoise = (x: number, y: number): number => {
  // Skew the input space to determine which simplex cell we're in
  const s = (x + y) * F2
  const i = Math.floor(x + s)
  const j = Math.floor(y + s)

  // Unskew the cell origin back to (x,y) space
  const t = (i + j) * G2
  const X0 = i - t
  const Y0 = j - t
  const x0 = x - X0 // The x,y distances from the cell origin
  const y0 = y - Y0

  // Determine which simplex we are in (upper or lower triangle)
  let i1: number, j1: number // Offsets for second (middle) corner
  if (x0 > y0) {
    i1 = 1
    j1 = 0 // Lower triangle, XY order: (0,0)->(1,0)->(1,1)
  } else {
    i1 = 0
    j1 = 1 // Upper triangle, YX order: (0,0)->(0,1)->(1,1)
  }

  // Calculate the three corner coordinates in skewed space
  const x1 = x0 - i1 + G2 // Offsets for middle corner
  const y1 = y0 - j1 + G2
  const x2 = x0 - 1 + 2 * G2 // Offsets for last corner
  const y2 = y0 - 1 + 2 * G2

  // Work out the hashed gradient indices for the three corners
  const ii = i & 255
  const jj = j & 255
  const gi0 = P[ii + P[jj]]
  const gi1 = P[ii + i1 + P[jj + j1]]
  const gi2 = P[ii + 1 + P[jj + 1]]

  // Calculate the contribution from the three corners
  const n0 = getCornerContribution(x0, y0, gi0)
  const n1 = getCornerContribution(x1, y1, gi1)
  const n2 = getCornerContribution(x2, y2, gi2)

  // Add contributions from each corner to get the final noise value
  // Use Stefan Gustavson's standard scaling factor of 70.0
  const result = 70.0 * (n0 + n1 + n2)

  // Clamp to ensure strict [-1, 1] bounds for reliable angle mapping
  return Math.max(-1, Math.min(1, result))
}

// Export as default for easy importing
export default simplexNoise
