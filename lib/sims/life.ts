// Conway's Game of Life: each cell is alive (true) or dead (false).
// On each step: a live cell with 2 or 3 live neighbors survives; a dead
// cell with exactly 3 live neighbors comes alive; everything else dies.

export type LifeGrid = boolean[][]

export const createLifeGrid = (rows: number, cols: number): LifeGrid =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => false))

// Fill the grid randomly. density is the probability each cell starts alive.
export const randomFillLife = (grid: LifeGrid, density = 0.3) => {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      grid[row][col] = Math.random() < density
    }
  }
}

const countNeighbors = (grid: LifeGrid, row: number, col: number) => {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const r = row + dr
      const c = col + dc
      if (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c]) count++
    }
  }
  return count
}

export const stepLife = (grid: LifeGrid): LifeGrid => {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  const next: LifeGrid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => false),
  )
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const n = countNeighbors(grid, row, col)
      next[row][col] = grid[row][col] ? n === 2 || n === 3 : n === 3
    }
  }
  return next
}

export const drawLifeGrid = (
  ctx: CanvasRenderingContext2D,
  grid: LifeGrid,
  cellSize: number,
  liveColor = "#ffffff",
  background = "#0a0a0a",
) => {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0

  ctx.fillStyle = background
  ctx.fillRect(0, 0, cols * cellSize, rows * cellSize)

  ctx.fillStyle = liveColor
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!grid[row][col]) continue
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
    }
  }
}
