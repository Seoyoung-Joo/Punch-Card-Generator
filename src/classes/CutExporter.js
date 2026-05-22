const SIDE_MARGIN      = 17.0
const BLANK_ROWS       = 2
const PATTERN_HOLE_R   = 1.75
const CLIP_HOLE_R      = 1.5
const SPROCKET_HOLE_R  = 1.75
const SCALE_GUIDE_H    = 22

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

const dxfCircle = (cx, cy, r) =>
  `0\nCIRCLE\n8\n0\n10\n${fmt(cx)}\n20\n${fmt(cy)}\n30\n0\n40\n${fmt(r)}`

const dxfLine = (x1, y1, x2, y2) =>
  `0\nLINE\n8\n0\n10\n${fmt(x1)}\n20\n${fmt(y1)}\n30\n0\n11\n${fmt(x2)}\n21\n${fmt(y2)}\n31\n0`

const dxfClosedLines = (pts) =>
  pts.map(([x1, y1], i) => {
    const [x2, y2] = pts[(i + 1) % pts.length]
    return dxfLine(x1, y1, x2, y2)
  })

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
    const SVG_H = H + SCALE_GUIDE_H

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

    els.push(
      `<g id="scale-guide" stroke="#ff00aa" fill="none" stroke-width="0.25">\n` +
      `    <rect x="4" y="${fmt(H + 6)}" width="10" height="10"/>\n` +
      `    <line x1="0" y1="${fmt(H + 19)}" x2="${fmt(W)}" y2="${fmt(H + 19)}"/>\n` +
      `    <line x1="0" y1="${fmt(H + 17)}" x2="0" y2="${fmt(H + 21)}"/>\n` +
      `    <line x1="${fmt(W)}" y1="${fmt(H + 17)}" x2="${fmt(W)}" y2="${fmt(H + 21)}"/>\n` +
      `    <text x="17" y="${fmt(H + 12.8)}" fill="#ff00aa" stroke="none" font-size="3" font-family="monospace">10mm</text>\n` +
      `    <text x="${fmt(W / 2)}" y="${fmt(H + 18)}" fill="#ff00aa" stroke="none" font-size="3" font-family="monospace" text-anchor="middle">card width ${fmt(W)}mm</text>\n` +
      `  </g>`
    )

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" ` +
      `width="${fmt(W)}mm" height="${fmt(SVG_H)}mm" ` +
      `viewBox="0 0 ${fmt(W)} ${fmt(SVG_H)}" ` +
      `preserveAspectRatio="none">\n  ` +
      comment +
      els.join('\n  ') +
      `\n</svg>`
    )
  }

  generatePunchcardDXFs(pattern, machineId = 'brother_24') {
    const machine   = this.getMachine(machineId)
    const { maxRows } = machine
    const totalRows = pattern.length
    const pageCount = Math.ceil(totalRows / maxRows)
    const dxfs      = []

    for (let p = 0; p < pageCount; p++) {
      const startRow = p * maxRows
      const slice    = pattern.slice(startRow, startRow + maxRows)
      dxfs.push(this._sliceToDXF(slice, machine))
    }

    return dxfs
  }

  _sliceToDXF(rows, machine) {
    const { stitches, stitchWidth, rowHeight } = machine

    const patternRows = rows.length
    const totalRows   = BLANK_ROWS * 2 + patternRows
    const W = SIDE_MARGIN * 2 + stitches * stitchWidth
    const H = totalRows * rowHeight

    const entities = []

    // 1. Card outline
    const outlinePts = [
      [2, 0], [W-2, 0], [W-1, 1], [W-1, 20], [W, 22],
      [W, H-22], [W-1, H-20], [W-1, H-1], [W-2, H],
      [2, H], [1, H-1], [1, H-20], [0, H-22],
      [0, 22], [1, 20], [1, 1],
    ]
    entities.push(...dxfClosedLines(outlinePts))

    // 2. Sprocket holes
    const sprocketCount = Math.floor(totalRows / 2)
    for (let i = 0; i < sprocketCount; i++) {
      const cy = rowHeight + i * rowHeight * 2
      entities.push(dxfCircle(6.5,     cy, SPROCKET_HOLE_R))
      entities.push(dxfCircle(W - 6.5, cy, SPROCKET_HOLE_R))
    }

    // 3. Clip holes
    const clipXL = SIDE_MARGIN + stitchWidth / 2 - 6.0
    const clipXR = W - SIDE_MARGIN - stitchWidth / 2 + 6.0
    for (let r = 0; r < totalRows; r++) {
      const cy = rowHeight / 2 + r * rowHeight
      entities.push(dxfCircle(clipXL, cy, CLIP_HOLE_R))
      entities.push(dxfCircle(clipXR, cy, CLIP_HOLE_R))
    }

    // 4. Blank rows top
    for (let r = 0; r < BLANK_ROWS; r++) {
      const cy = rowHeight / 2 + r * rowHeight
      for (let c = 0; c < stitches; c++)
        entities.push(dxfCircle(SIDE_MARGIN + stitchWidth / 2 + c * stitchWidth, cy, PATTERN_HOLE_R))
    }

    // 5. Blank rows bottom
    for (let r = 0; r < BLANK_ROWS; r++) {
      const cy = H - (BLANK_ROWS - r) * rowHeight + rowHeight / 2
      for (let c = 0; c < stitches; c++)
        entities.push(dxfCircle(SIDE_MARGIN + stitchWidth / 2 + c * stitchWidth, cy, PATTERN_HOLE_R))
    }

    // 6. Pattern holes
    const cardCols  = rows[0]?.length ?? stitches
    const colOffset = Math.floor((stitches - cardCols) / 2)
    for (let r = 0; r < patternRows; r++) {
      const cy  = rowHeight / 2 + (BLANK_ROWS + r) * rowHeight
      rows[r].forEach((val, c) => {
        if (!val) return
        const col = c + colOffset
        if (col < 0 || col >= stitches) return
        entities.push(dxfCircle(SIDE_MARGIN + stitchWidth / 2 + col * stitchWidth, cy, PATTERN_HOLE_R))
      })
    }

    // Scale guide: 10mm square and a full-width line below the card.
    entities.push(
      ...dxfClosedLines([
        [4, H + 6],
        [14, H + 6],
        [14, H + 16],
        [4, H + 16],
      ]),
      dxfLine(0, H + 19, W, H + 19),
      dxfLine(0, H + 17, 0, H + 21),
      dxfLine(W, H + 17, W, H + 21)
    )

    const header =
      `0\nSECTION\n2\nHEADER\n` +
      `9\n$ACADVER\n1\nAC1015\n` +
      `9\n$INSUNITS\n70\n4\n` +
      `0\nENDSEC\n`

    return (
      header +
      `0\nSECTION\n2\nENTITIES\n` +
      entities.join('\n') +
      `\n0\nENDSEC\n0\nEOF`
    )
  }

  download(card, machineId = 'brother_24') {
    const pattern = []
    for (let r = 0; r < card.totalRows(); r++)
      pattern.push(card.getRow(r).map(v => v ? 1 : 0))

    const dxfs      = this.generatePunchcardDXFs(pattern, machineId)
    const pageCount = dxfs.length

    dxfs.forEach((dxf, i) => {
      const name = pageCount === 1
        ? `punchcard_${machineId}.dxf`
        : `punchcard_${machineId}_card${i + 1}of${pageCount}.dxf`
      setTimeout(() => this._downloadFile(dxf, name, 'application/dxf'), i * 200)
    })
  }

  downloadSVG(card, machineId = 'brother_24') {
    const pattern = []
    for (let r = 0; r < card.totalRows(); r++)
      pattern.push(card.getRow(r).map(v => v ? 1 : 0))

    const svgs      = this.generatePunchcardSVGs(pattern, machineId)
    const pageCount = svgs.length

    svgs.forEach((svg, i) => {
      const name = pageCount === 1
        ? `punchcard_${machineId}.svg`
        : `punchcard_${machineId}_card${i + 1}of${pageCount}.svg`
      setTimeout(() => this._downloadFile(svg, name, 'image/svg+xml'), i * 200)
    })
  }

  _downloadFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}
