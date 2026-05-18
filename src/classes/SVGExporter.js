const CELL   = 14
const HOLE_R = 4.5
const PAD_L  = 80
const PAD_R  = 36
const PAD_V  = 12
const BELT_R = 3

export class SVGExporter {
  /**
   * Full SVG string with beige background, grid lines, holes, belt holes, labels.
   * @param {import('./PunchCard.js').PunchCard} card
   * @param {{ gridColor?: string, showLabels?: boolean }} [options]
   * @returns {string}
   */
  toSVG(card, options = {}) {
    const { gridColor = '#8B2020', showLabels = true } = options

    const cols = 18
    const pageRows = 24
    const actualRows = card.totalRows()
    const rows = Math.ceil(actualRows / pageRows) * pageRows
    const W = PAD_L + cols * CELL + PAD_R
    const H = PAD_V + rows * CELL + PAD_V

    const parts = []

    parts.push(`<rect width="${W}" height="${H}" fill="#f7f2ea" rx="6"/>`)

    for (let c = 0; c <= cols; c++) {
      const x = PAD_L + c * CELL
      parts.push(`<line x1="${x}" y1="${PAD_V}" x2="${x}" y2="${H - PAD_V}" stroke="${gridColor}" stroke-width="0.4" opacity="0.3"/>`)
    }

    for (let r = 0; r < rows; r++) {
      const y = PAD_V + r * CELL
      const cy = y + CELL / 2
      const meta = r < actualRows ? card.rowMeta[r] : null
      const row  = r < actualRows ? card.getRow(r) : Array(cols).fill(false)

      parts.push(`<line x1="${PAD_L}" y1="${y}" x2="${PAD_L + cols * CELL}" y2="${y}" stroke="${gridColor}" stroke-width="0.4" opacity="0.25"/>`)
      parts.push(`<circle cx="${PAD_L / 2}" cy="${cy}" r="${BELT_R}" fill="none" stroke="${gridColor}" stroke-width="0.8" opacity="0.5"/>`)

      if (showLabels && meta) {
        const label = meta.type === 'epsilon' ? 'ε' : (meta.rowIndexInPattern === 0 || meta.rowIndexInPattern == null) ? meta.word : ''
        if (label) {
          parts.push(`<text x="${PAD_L - 8}" y="${cy + 3}" font-size="6" fill="#aaa" font-family="monospace" text-anchor="end">${label}</text>`)
        }
      }

      row.forEach((punched, c) => {
        const cx = PAD_L + c * CELL + CELL / 2
        if (punched) {
          parts.push(`<circle cx="${cx}" cy="${cy}" r="${HOLE_R}" fill="#1A1A1A"/>`)
        } else {
          parts.push(`<circle cx="${cx}" cy="${cy}" r="${HOLE_R}" fill="none" stroke="#C8BFAD" stroke-width="0.8"/>`)
        }
      })

      parts.push(`<text x="${PAD_L + cols * CELL + 7}" y="${cy + 3}" font-size="6" fill="#ccc" font-family="monospace">${r + 1}</text>`)

      const bx = PAD_L + cols * CELL + PAD_R - 10
      parts.push(`<circle cx="${bx}" cy="${cy}" r="${BELT_R}" fill="none" stroke="${gridColor}" stroke-width="0.8" opacity="0.5"/>`)
    }

    const yb = PAD_V + rows * CELL
    parts.push(`<line x1="${PAD_L}" y1="${yb}" x2="${PAD_L + cols * CELL}" y2="${yb}" stroke="${gridColor}" stroke-width="0.4" opacity="0.25"/>`)

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n  ${parts.join('\n  ')}\n</svg>`
  }

  /**
   * @param {import('./PunchCard.js').PunchCard} card
   * @param {string} [filename]
   * @param {{ gridColor?: string, showLabels?: boolean }} [options]
   */
  download(card, filename = 'punchcard.svg', options = {}) {
    const svg = this.toSVG(card, options)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Returns a canvas bitmap for knit machine preview.
   * @param {import('./PunchCard.js').PunchCard} card
   * @returns {HTMLCanvasElement}
   */
  toBitmap(card) {
    const canvas = document.createElement('canvas')
    canvas.width = 18
    canvas.height = card.totalRows()
    const ctx = canvas.getContext('2d')
    for (let r = 0; r < card.totalRows(); r++) {
      const row = card.getRow(r)
      for (let c = 0; c < 18; c++) {
        ctx.fillStyle = row[c] ? '#1A1A1A' : '#f7f2ea'
        ctx.fillRect(c, r, 1, 1)
      }
    }
    return canvas
  }
}
