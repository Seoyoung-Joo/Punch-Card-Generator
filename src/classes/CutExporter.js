const SIDE_MARGIN      = 17.0
const BLANK_ROWS       = 2
const PATTERN_HOLE_R   = 1.75
const CLIP_HOLE_R      = 1.5
const SPROCKET_HOLE_R  = 1.75

export const MACHINES = [
  { id: 'brother_12',    label: '12-stitch 4.5mm Brother/Silver Reed/Studio', stitches: 12, stitchWidth: 4.5, rowHeight: 5.0, maxRows: 56 },
  { id: 'toyota_12',     label: '12-stitch 4.5mm Toyota 747',                  stitches: 12, stitchWidth: 4.5, rowHeight: 5.0, maxRows: 56 },
  { id: 'empisal_18',    label: '18-stitch 6mm Empisal MK70',                  stitches: 18, stitchWidth: 6.0, rowHeight: 6.0, maxRows: 46 },
  { id: 'brother_24',    label: '24-stitch 4.5mm Brother/Silver Reed/Studio',  stitches: 24, stitchWidth: 4.5, rowHeight: 5.0, maxRows: 56 },
  { id: 'knitmaster_30', label: '30-stitch 3.6mm Knitmaster',                  stitches: 30, stitchWidth: 3.6, rowHeight: 3.6, maxRows: 60 },
  { id: 'passap_40',     label: '40-stitch 5mm Passap Deco',                   stitches: 40, stitchWidth: 5.0, rowHeight: 5.0, maxRows: 56 },
]

const fmt  = (n) => Math.round(n * 100) / 100
const circ = (cx, cy, r) =>
  `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${r}" fill="white" stroke="black" stroke-width="0.1"/>`

export class CutExporter {
  getMachine(id) {
    return MACHINES.find(m => m.id === id) ?? MACHINES.find(m => m.id === 'brother_24')
  }

  /**
   * Generates one SVG per page for the given pattern.
   * @param {number[][]} pattern - 2D array [rows][cols], 0=no hole, 1=hole
   * @param {string} machineId
   * @returns {string[]} array of SVG strings, length = ceil(pattern.length / machine.maxRows)
   */
  generatePunchcardSVGs(pattern, machineId = 'brother_24') {
    const machine   = this.getMachine(machineId)
    const { maxRows } = machine
    const totalRows = pattern.length
    const pageCount = Math.ceil(totalRows / maxRows)
    const svgs      = []

    for (let p = 0; p < pageCount; p++) {
      const startRow = p * maxRows
      const slice    = pattern.slice(startRow, startRow + maxRows)
      svgs.push(this._sliceToSVG(slice, machine, startRow + 1, startRow + slice.length, p + 1, pageCount))
    }

    return svgs
  }

  // Builds a single card SVG from a rows slice (2D array of 0/1).
  _sliceToSVG(rows, machine, patternRowStart, patternRowEnd, cardN, cardTotal) {
    const { stitches, stitchWidth, rowHeight } = machine

    const patternRows = rows.length
    const totalRows   = BLANK_ROWS * 2 + patternRows
    const W = SIDE_MARGIN * 2 + stitches * stitchWidth
    const H = totalRows * rowHeight

    // 1. Card outline with direction notch
    const pts = [
      [2, 0], [W-2, 0], [W-1, 1], [W-1, 20], [W, 22],
      [W, H-22], [W-1, H-20], [W-1, H-1], [W-2, H],
      [2, H], [1, H-1], [1, H-20], [0, H-22],
      [0, 22], [1, 20], [1, 1],
    ].map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' ')

    const els = []
    els.push(`<polygon points="${pts}" fill="white" stroke="black" stroke-width="0.1"/>`)

    // 2. Sprocket holes — every 2 rows, symmetric
    const sprocketCount = Math.floor(totalRows / 2)
    for (let i = 0; i < sprocketCount; i++) {
      const cy = rowHeight + i * rowHeight * 2
      els.push(circ(6.5,     cy, SPROCKET_HOLE_R))
      els.push(circ(W - 6.5, cy, SPROCKET_HOLE_R))
    }

    // 3. Clip holes — every row
    const clipXL = SIDE_MARGIN + stitchWidth / 2 - 6.0
    const clipXR = W - SIDE_MARGIN - stitchWidth / 2 + 6.0
    for (let r = 0; r < totalRows; r++) {
      const cy = rowHeight / 2 + r * rowHeight
      els.push(circ(clipXL, cy, CLIP_HOLE_R))
      els.push(circ(clipXR, cy, CLIP_HOLE_R))
    }

    // 4. Blank rows — top 2
    for (let r = 0; r < BLANK_ROWS; r++) {
      const cy = rowHeight / 2 + r * rowHeight
      for (let c = 0; c < stitches; c++) {
        els.push(circ(SIDE_MARGIN + stitchWidth / 2 + c * stitchWidth, cy, PATTERN_HOLE_R))
      }
    }

    // 5. Blank rows — bottom 2
    for (let r = 0; r < BLANK_ROWS; r++) {
      const cy = H - (BLANK_ROWS - r) * rowHeight + rowHeight / 2
      for (let c = 0; c < stitches; c++) {
        els.push(circ(SIDE_MARGIN + stitchWidth / 2 + c * stitchWidth, cy, PATTERN_HOLE_R))
      }
    }

    // 6. Pattern holes — center card columns inside machine stitch count
    const cardCols  = rows[0]?.length ?? stitches
    const colOffset = Math.floor((stitches - cardCols) / 2)

    for (let r = 0; r < patternRows; r++) {
      const cy  = rowHeight / 2 + (BLANK_ROWS + r) * rowHeight
      const row = rows[r]
      row.forEach((val, c) => {
        if (!val) return
        const col = c + colOffset
        if (col < 0 || col >= stitches) return
        els.push(circ(SIDE_MARGIN + stitchWidth / 2 + col * stitchWidth, cy, PATTERN_HOLE_R))
      })
    }

    const comment = cardTotal > 1
      ? `<!-- card ${cardN} of ${cardTotal} | pattern rows ${patternRowStart}–${patternRowEnd} -->\n  `
      : `<!-- pattern rows ${patternRowStart}–${patternRowEnd} -->\n  `

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" ` +
      `width="${fmt(W)}mm" height="${fmt(H)}mm" ` +
      `viewBox="0 0 ${fmt(W)} ${fmt(H)}" ` +
      `preserveAspectRatio="none">\n  ` +
      comment +
      els.join('\n  ') +
      `\n</svg>`
    )
  }

  /**
   * Downloads one SVG file per page.
   * Naming: punchcard_{machineId}.svg  or  punchcard_{machineId}_card{N}of{total}.svg
   */
  download(card, machineId = 'brother_24') {
    const total    = card.totalRows()

    const pattern  = []
    for (let r = 0; r < total; r++) {
      pattern.push(card.getRow(r).map(v => v ? 1 : 0))
    }

    const svgs      = this.generatePunchcardSVGs(pattern, machineId)
    const pageCount = svgs.length

    svgs.forEach((svg, i) => {
      const name = pageCount === 1
        ? `punchcard_${machineId}.svg`
        : `punchcard_${machineId}_card${i + 1}of${pageCount}.svg`
      setTimeout(() => this._downloadSVG(svg, name), i * 200)
    })
  }

  _downloadSVG(svg, filename) {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}
