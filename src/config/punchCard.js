export const PUNCH_COLS = 24

export function fitRowToCols(row, cols = PUNCH_COLS) {
  const fitted = (row || []).map(v => !!v)

  if (fitted.length === cols) return fitted

  if (fitted.length < cols) {
    return Array.from({ length: cols }, (_, i) => {
      const sourceIndex = Math.round(i * (fitted.length - 1) / (cols - 1))
      return fitted[sourceIndex]
    })
  }

  const start = Math.floor((fitted.length - cols) / 2)
  return fitted.slice(start, start + cols)
}

export function fitPatternToCols(rows, cols = PUNCH_COLS) {
  return (rows || []).map(row => fitRowToCols(row, cols))
}
