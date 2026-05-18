export class CutExporter {
  /**
   * Returns one SVG string per physical card page (exactly pageRows rows each).
   * Each SVG contains only punched holes — no background, no grid, no labels.
   * Designed for Silhouette Cutter: import each file as a separate cut job.
   *
   * @param {import('./PunchCard.js').PunchCard} card
   * @param {{ pageRows?: number, cellMm?: number, holeR?: number }} [options]
   * @returns {string[]}
   */
  toCutSVGs(card, options = {}) {
    const { pageRows = 24, cellMm = 3.5, holeR = 1.2 } = options
    const cols = 18
    const totalRows = card.totalRows()
    const paddedTotal = Math.ceil(totalRows / pageRows) * pageRows
    const W = cols * cellMm
    const H = pageRows * cellMm
    const pages = []

    for (let start = 0; start < paddedTotal; start += pageRows) {
      const circles = []

      for (let localRi = 0; localRi < pageRows; localRi++) {
        const ri = start + localRi
        const row = ri < totalRows ? card.getRow(ri) : null
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
   * Downloads all cut SVG pages as separate files.
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
      setTimeout(() => { a.click(); URL.revokeObjectURL(url) }, i * 200)
    })
  }
}
