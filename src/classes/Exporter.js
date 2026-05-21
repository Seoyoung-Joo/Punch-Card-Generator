const CELL   = 14
const HOLE_R = 4.5
const PAD_L  = 80   // left margin (label + belt hole)
const PAD_R  = 36   // right margin (row number + belt hole)
const PAD_V  = 12
const BELT_R = 3

export class Exporter {
  /**
   * Full SVG string with beige background, grid lines, holes, belt holes, labels.
   * @param {import('./PunchCard.js').PunchCard} card
   * @param {{ gridColor?: string, showLabels?: boolean }} [options]
   * @returns {string}
   */
  toSVG(card, options = {}) {
    const {
      gridColor  = '#8B2020',
      showLabels = true,
    } = options

    const cols = card.cols || card.getRow(0)?.length || 24
    const pageRows = 24
    const actualRows = card.totalRows()
    const rows = Math.ceil(actualRows / pageRows) * pageRows  // pad to full 24-row sets
    const W = PAD_L + cols * CELL + PAD_R
    const H = PAD_V + rows * CELL + PAD_V

    const parts = []

    // Background
    parts.push(`<rect width="${W}" height="${H}" fill="#f7f2ea" rx="6"/>`)

    // Vertical grid lines
    for (let c = 0; c <= cols; c++) {
      const x = PAD_L + c * CELL
      parts.push(`<line x1="${x}" y1="${PAD_V}" x2="${x}" y2="${H - PAD_V}" stroke="${gridColor}" stroke-width="0.4" opacity="0.3"/>`)
    }

    // Rows
    for (let r = 0; r < rows; r++) {
      const y = PAD_V + r * CELL
      const cy = y + CELL / 2
      const meta = r < actualRows ? card.rowMeta[r] : null
      const row  = r < actualRows ? card.getRow(r) : Array(cols).fill(false)

      // Horizontal grid line
      parts.push(`<line x1="${PAD_L}" y1="${y}" x2="${PAD_L + cols * CELL}" y2="${y}" stroke="${gridColor}" stroke-width="0.4" opacity="0.25"/>`)

      // Belt hole left
      parts.push(`<circle cx="${PAD_L / 2}" cy="${cy}" r="${BELT_R}" fill="none" stroke="${gridColor}" stroke-width="0.8" opacity="0.5"/>`)

      // Label
      if (showLabels && meta) {
        const label = meta.type === 'epsilon' ? 'ε' : (meta.rowIndexInPattern === 0 || meta.rowIndexInPattern == null) ? meta.word : ''
        if (label) {
          parts.push(`<text x="${PAD_L - 8}" y="${cy + 3}" font-size="6" fill="#aaa" font-family="monospace" text-anchor="end">${label}</text>`)
        }
      }

      // Holes
      row.forEach((punched, c) => {
        const cx = PAD_L + c * CELL + CELL / 2
        if (punched) {
          parts.push(`<circle cx="${cx}" cy="${cy}" r="${HOLE_R}" fill="#1A1A1A"/>`)
        } else {
          parts.push(`<circle cx="${cx}" cy="${cy}" r="${HOLE_R}" fill="none" stroke="#C8BFAD" stroke-width="0.8"/>`)
        }
      })

      // Row number
      parts.push(`<text x="${PAD_L + cols * CELL + 7}" y="${cy + 3}" font-size="6" fill="#ccc" font-family="monospace">${r + 1}</text>`)

      // Belt hole right
      const bx = PAD_L + cols * CELL + PAD_R - 10
      parts.push(`<circle cx="${bx}" cy="${cy}" r="${BELT_R}" fill="none" stroke="${gridColor}" stroke-width="0.8" opacity="0.5"/>`)
    }

    // Bottom grid line
    const yb = PAD_V + rows * CELL
    parts.push(`<line x1="${PAD_L}" y1="${yb}" x2="${PAD_L + cols * CELL}" y2="${yb}" stroke="${gridColor}" stroke-width="0.4" opacity="0.25"/>`)

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n  ${parts.join('\n  ')}\n</svg>`
  }

  /**
   * Triggers browser download of SVG file.
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
   * Returns an array of SVG strings — one per physical card page (max pageRows rows each).
   * Each SVG contains ONLY punched holes as filled circles — no background, no grid, no labels.
   * Designed for Silhouette Cutter: import each file as a separate cut job.
   *
   * @param {import('./PunchCard.js').PunchCard} card
   * @param {{ pageRows?: number, cellMm?: number, holeR?: number }} [options]
   * @returns {string[]}
   */
  toCutSVGs(card, options = {}) {
    const {
      pageRows = 24,
      cellMm   = 3.5,
      holeR    = 1.2,
    } = options
    const cols = card.cols || card.getRow(0)?.length || 24
    const totalRows = card.totalRows()
    // Always pad to a full multiple of pageRows
    const paddedTotal = Math.ceil(totalRows / pageRows) * pageRows
    const W = cols * cellMm
    const H = pageRows * cellMm   // every page is exactly pageRows tall
    const pages = []

    for (let start = 0; start < paddedTotal; start += pageRows) {
      const circles = []

      for (let localRi = 0; localRi < pageRows; localRi++) {
        const ri = start + localRi
        const row = ri < totalRows ? card.getRow(ri) : null  // null = empty padding row
        const cy = (localRi + 0.5) * cellMm
        if (row) {
          row.forEach((punched, ci) => {
            if (punched) {
              const cx = (ci + 0.5) * cellMm
              circles.push(`<circle cx="${cx}" cy="${cy}" r="${holeR}" fill="#000000"/>`)
            }
          })
        }
      }

      pages.push(
        `<svg xmlns="http://www.w3.org/2000/svg" ` +
        `width="${W}mm" height="${H}mm" ` +
        `viewBox="0 0 ${W} ${H}">\n  ${circles.join('\n  ')}\n</svg>`
      )
    }

    return pages
  }

  /**
   * Downloads all cut SVG pages as separate files (e.g. punchcard-cut-1.svg, -2.svg …).
   * @param {import('./PunchCard.js').PunchCard} card
   * @param {string} [basename]
   * @param {{ pageRows?: number, cellMm?: number, holeR?: number }} [options]
   */
  downloadCutSVGs(card, basename = 'punchcard-cut', options = {}) {
    const pages = this.toCutSVGs(card, options)
    pages.forEach((svg, i) => {
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = pages.length === 1 ? `${basename}.svg` : `${basename}-${i + 1}.svg`
      // Stagger downloads so browser doesn't suppress them
      setTimeout(() => { a.click(); URL.revokeObjectURL(url) }, i * 200)
    })
  }

  /**
   * Returns a canvas bitmap (for knit preview).
   * @param {import('./PunchCard.js').PunchCard} card
   * @returns {HTMLCanvasElement}
   */
  toBitmap(card) {
    const canvas = document.createElement('canvas')
    const cols = card.cols || card.getRow(0)?.length || 24
    canvas.width = cols
    canvas.height = card.totalRows()
    const ctx = canvas.getContext('2d')
    for (let r = 0; r < card.totalRows(); r++) {
      const row = card.getRow(r)
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = row[c] ? '#1A1A1A' : '#f7f2ea'
        ctx.fillRect(c, r, 1, 1)
      }
    }
    return canvas
  }
}
