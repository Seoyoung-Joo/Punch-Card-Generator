import { useEffect, useRef, useState } from 'react'
import { useCardStore } from '../../store/cardStore.js'
import { COLOR_PALETTES } from '../../data/colorPalettes.js'

const DEFAULT_A = '#1a1a2e'
const DEFAULT_B = '#f0e6d3'

export default function KnitPreview() {
  const card = useCardStore(s => s.card)
  const canvasRef = useRef(null)

  const [yarnA, setYarnA] = useState(DEFAULT_A)
  const [yarnB, setYarnB] = useState(DEFAULT_B)
  const [scale, setScale] = useState(20)
  const [tilesH, setTilesH] = useState(4)
  const [tilesV, setTilesV] = useState(4)
  const [tileMode, setTileMode] = useState(true)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!card || card.totalRows() === 0) {
      canvas.width = 400
      canvas.height = 200
      ctx.fillStyle = '#f5f0e8'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ccc'
      ctx.font = '13px Avara'
      ctx.textAlign = 'center'
      ctx.fillText('no card yet', 200, 106)
      return
    }

    const rows = card.totalRows()
    const cols = 18

    const reps_h = tileMode ? tilesH : 1
    const reps_v = tileMode ? tilesV : 1

    canvas.width  = cols * reps_h * scale
    canvas.height = rows * reps_v * scale

    for (let tv = 0; tv < reps_v; tv++) {
      for (let th = 0; th < reps_h; th++) {
        for (let r = 0; r < rows; r++) {
          const row = card.getRow(r)
          for (let c = 0; c < cols; c++) {
            ctx.fillStyle = row[c] ? yarnA : yarnB
            ctx.fillRect(
              (th * cols + c) * scale,
              (tv * rows + r) * scale,
              scale,
              scale
            )
          }
        }
      }
    }
  }, [card, yarnA, yarnB, scale, tilesH, tilesV, tileMode])

  const selectPalette = (p) => {
    setYarnA(p.a)
    setYarnB(p.b)
  }

  const downloadPNG = () => {
    if (!canvasRef.current) return
    const a = document.createElement('a')
    a.href = canvasRef.current.toDataURL('image/png')
    a.download = 'knit-preview.png'
    a.click()
  }

  const sliderLabel = { fontSize: 11, color: '#888', fontFamily: 'monospace', minWidth: 36 }
  const sliderRow = { display: 'flex', alignItems: 'center', gap: 8 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}>
        {/* Palette picker */}
        <div>
          <div style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
            color palette
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {COLOR_PALETTES.map(p => (
              <button
                key={p.name}
                onClick={() => selectPalette(p)}
                title={`${p.name} — ${p.desc}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: (yarnA === p.a && yarnB === p.b) ? '2px solid #8B2020' : '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                }}
              >
                <div style={{ width: '50%', height: '100%', background: p.a }} />
                <div style={{ width: '50%', height: '100%', background: p.b }} />
              </button>
            ))}
          </div>

          {/* Custom colors */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
              A
              <input type="color" value={yarnA} onChange={e => setYarnA(e.target.value)}
                style={{ width: 28, height: 24, border: 'none', cursor: 'pointer', borderRadius: 3 }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
              B
              <input type="color" value={yarnB} onChange={e => setYarnB(e.target.value)}
                style={{ width: 28, height: 24, border: 'none', cursor: 'pointer', borderRadius: 3 }} />
            </label>
          </div>
        </div>

        {/* Tile controls */}
        <div>
          <div style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
            repeat
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666', marginBottom: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={tileMode} onChange={e => setTileMode(e.target.checked)} />
            tile pattern
          </label>

          {tileMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={sliderRow}>
                <span style={sliderLabel}>← {tilesH}×</span>
                <input type="range" min={1} max={8} value={tilesH}
                  onChange={e => setTilesH(Number(e.target.value))} style={{ width: 80 }} />
              </div>
              <div style={sliderRow}>
                <span style={sliderLabel}>↓ {tilesV}×</span>
                <input type="range" min={1} max={8} value={tilesV}
                  onChange={e => setTilesV(Number(e.target.value))} style={{ width: 80 }} />
              </div>
              <div style={sliderRow}>
                <span style={sliderLabel}>px {scale}</span>
                <input type="range" min={4} max={40} value={scale}
                  onChange={e => setScale(Number(e.target.value))} style={{ width: 80 }} />
              </div>
            </div>
          )}
        </div>

        {/* Export */}
        <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
          <button
            onClick={downloadPNG}
            style={{
              padding: '8px 18px',
              background: '#8B2020',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: "'Avara', serif",
            }}
          >
            export PNG
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight: '65vh',
        border: '1px solid #E0D9CE',
        borderRadius: 8,
        display: 'inline-block',
        background: '#F5F0E8',
      }}>
        <canvas ref={canvasRef} style={{ display: 'block', imageRendering: 'pixelated' }} />
      </div>

      {card && card.totalRows() > 0 && (
        <p style={{ fontSize: 11, color: '#bbb' }}>
          {card.totalRows()} rows × 18 cols
          {tileMode && ` → tiled ${tilesH}×${tilesV}`}
        </p>
      )}
    </div>
  )
}
