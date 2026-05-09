export type SandParticle = {
  on: boolean
  color?: string
}

export type SandGrid = SandParticle[][]

export const createSandGrid = (rows: number, cols: number): SandGrid =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ on: false })),
  )

// Resize the grid while preserving existing particles, anchored to the
// top-left. Growing adds empty cells on the right and bottom; shrinking
// truncates particles that fall outside the new bounds.
export const resizeSandGrid = (
  grid: SandGrid,
  newRows: number,
  newCols: number,
): SandGrid => {
  const oldRows = grid.length
  const oldCols = grid[0]?.length ?? 0
  if (oldRows === newRows && oldCols === newCols) return grid

  return Array.from({ length: newRows }, (_, row) =>
    Array.from({ length: newCols }, (_, col) =>
      row < oldRows && col < oldCols ? { ...grid[row][col] } : { on: false },
    ),
  )
}

export const addSandParticle = (
  grid: SandGrid,
  row: number,
  col: number,
  color: string,
) => {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  if (row < 0 || row >= rows || col < 0 || col >= cols) return
  if (grid[row][col].on) return
  grid[row][col] = { on: true, color }
}

// Step the simulation by one tick. Each particle tries to fall straight down,
// then diagonally down-left, then diagonally down-right. We iterate from the
// bottom up so a particle never sees a cell that was already occupied by a
// particle that fell into it on this same tick.
export const updateSandGrid = (grid: SandGrid): SandGrid => {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  const next = grid.map((row) => row.map((cell) => ({ ...cell })))

  for (let row = rows - 2; row >= 0; row--) {
    for (let col = 0; col < cols; col++) {
      if (!grid[row][col].on) continue
      const particle = grid[row][col]

      if (!next[row + 1][col].on) {
        next[row][col] = { on: false }
        next[row + 1][col] = particle
      } else if (col > 0 && !next[row + 1][col - 1].on) {
        next[row][col] = { on: false }
        next[row + 1][col - 1] = particle
      } else if (col < cols - 1 && !next[row + 1][col + 1].on) {
        next[row][col] = { on: false }
        next[row + 1][col + 1] = particle
      }
    }
  }

  return next
}

export const drawSandGrid = (
  ctx: CanvasRenderingContext2D,
  grid: SandGrid,
  cellSize: number,
) => {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0

  ctx.clearRect(0, 0, cols * cellSize, rows * cellSize)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col]
      if (!cell.on) continue
      ctx.fillStyle = cell.color ?? "#e6c068"
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
    }
  }
}
