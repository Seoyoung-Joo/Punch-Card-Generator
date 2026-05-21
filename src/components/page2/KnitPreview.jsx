import { useEffect, useRef, useState } from 'react'
import { useCardStore } from '../../store/cardStore.js'
import { COLOR_PALETTES } from '../../data/colorPalettes.js'
import { PUNCH_COLS } from '../../config/punchCard.js'

const DEFAULT_A = '#1a1a2e'
const DEFAULT_B = '#f0e6d3'
const DEFAULT_C = '#761725'
const DEFAULT_D = '#B5CFE1'

function ColorPickerPair({ yarnA, yarnB, onSetYarnA, onSetYarnB }) {
  const colorA = yarnA || DEFAULT_A
  const colorB = yarnB || DEFAULT_B

  const pickerStyle = (color) => ({
    width: 340,
    height: 340,
    borderRadius: '50%',
    background: color,
    border: '1px solid #d8d0c6',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34, alignItems: 'center', width: '100%' }}>
      <div style={{ fontSize: 18, color: '#8B2020', fontFamily: "'Avara', serif", letterSpacing: 0, textTransform: 'lowercase' }}>
        click to select the colors
      </div>
      <div style={{ display: 'flex', gap: 42, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <label style={pickerStyle(colorA)} title="Yarn A">
          <input type="color" value={colorA} onChange={e => onSetYarnA(e.target.value)}
            style={{ position: 'absolute', inset: -10, width: 360, height: 360, opacity: 0, cursor: 'pointer' }} />
        </label>
        <label style={pickerStyle(colorB)} title="Yarn B">
          <input type="color" value={colorB} onChange={e => onSetYarnB(e.target.value)}
            style={{ position: 'absolute', inset: -10, width: 360, height: 360, opacity: 0, cursor: 'pointer' }} />
        </label>
      </div>
      <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace', lineHeight: 1.5, textAlign: 'center' }}>
        <div>A {colorA}</div>
        <div>B {colorB}</div>
      </div>
    </div>
  )
}

function InlineColorControls({
  yarnA,
  yarnB,
  yarnC,
  yarnD,
  useLayerColors,
  layerStart,
  repeatCount,
  onSetYarnA,
  onSetYarnB,
  onSetYarnC,
  onSetYarnD,
  onSetUseLayerColors,
  onSetLayerStart,
}) {
  const [paletteTarget, setPaletteTarget] = useState('base')

  const selectPalette = (palette) => {
    if (paletteTarget === 'layer') {
      onSetUseLayerColors(true)
      onSetYarnC(palette.a)
      onSetYarnD(palette.b)
      return
    }

    onSetYarnA(palette.a)
    onSetYarnB(palette.b)
  }

  return (
    <div>
      <div style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
        color palette
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[
          ['base', 'base'],
          ['layer', 'next'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setPaletteTarget(value)}
            style={{
              padding: '3px 8px',
              border: '1px solid #8B2020',
              borderRadius: 999,
              background: paletteTarget === value ? '#8B2020' : 'transparent',
              color: paletteTarget === value ? '#fff' : '#8B2020',
              fontSize: 10,
              lineHeight: 1.2,
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8, maxWidth: 340 }}>
        {COLOR_PALETTES.map(palette => (
          <button
            key={palette.name}
            onClick={() => selectPalette(palette)}
            title={`${palette.name} - ${palette.desc}`}
            style={{
              width: 34,
              height: 30,
              borderRadius: 6,
              border: (
                paletteTarget === 'layer'
                  ? yarnC === palette.a && yarnD === palette.b
                  : yarnA === palette.a && yarnB === palette.b
              ) ? '2px solid #8B2020' : '2px solid transparent',
              background: '#fbf8f2',
              cursor: 'pointer',
              padding: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            <span style={{ width: 10, height: 18, borderRadius: 9, background: palette.a, border: '1px solid rgba(0,0,0,0.08)' }} />
            <span style={{ width: 10, height: 18, borderRadius: 9, background: palette.b, border: '1px solid rgba(0,0,0,0.08)' }} />
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
          A
          <input
            type="color"
            value={yarnA}
            onChange={e => onSetYarnA(e.target.value)}
            style={{ width: 28, height: 24, border: 'none', cursor: 'pointer', borderRadius: 3 }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
          B
          <input
            type="color"
            value={yarnB}
            onChange={e => onSetYarnB(e.target.value)}
            style={{ width: 28, height: 24, border: 'none', cursor: 'pointer', borderRadius: 3 }}
          />
        </label>
      </div>
      <button
        onClick={() => onSetUseLayerColors(!useLayerColors)}
        style={{
          marginTop: 10,
          padding: '5px 10px',
          background: useLayerColors ? '#8B2020' : 'transparent',
          color: useLayerColors ? '#fff' : '#8B2020',
          border: '1px solid #8B2020',
          borderRadius: 6,
          fontSize: 11,
          cursor: 'pointer',
          fontFamily: "'Avara', serif",
        }}
      >
        {useLayerColors ? 'remove next layer colors' : '+ next layer colors'}
      </button>
      {useLayerColors && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8, maxWidth: 260 }}>
          <span style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace', minWidth: '100%' }}>
            color from tile
          </span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
            #
            <input
              type="number"
              min={2}
              max={Math.max(2, repeatCount)}
              value={layerStart}
              onChange={e => onSetLayerStart(Math.max(2, Math.min(Math.max(2, repeatCount), Number(e.target.value) || 2)))}
              style={{ width: 46, height: 24, border: '1px solid #ded5c8', borderRadius: 4, background: '#fffaf2', color: '#666' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
            A
            <input
              type="color"
              value={yarnC}
              onChange={e => onSetYarnC(e.target.value)}
              style={{ width: 28, height: 24, border: 'none', cursor: 'pointer', borderRadius: 3 }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
            B
            <input
              type="color"
              value={yarnD}
              onChange={e => onSetYarnD(e.target.value)}
              style={{ width: 28, height: 24, border: 'none', cursor: 'pointer', borderRadius: 3 }}
            />
          </label>
        </div>
      )}
    </div>
  )
}

export default function KnitPreview() {
  const card        = useCardStore(s => s.card)
  const repeatCount = useCardStore(s => s.repeatCount)
  const setRepeatCount = useCardStore(s => s.setRepeatCount)
  const canvasRef = useRef(null)

  const [yarnA, setYarnA] = useState(DEFAULT_A)
  const [yarnB, setYarnB] = useState(DEFAULT_B)
  const [yarnC, setYarnC] = useState(DEFAULT_C)
  const [yarnD, setYarnD] = useState(DEFAULT_D)
  const [useLayerColors, setUseLayerColors] = useState(false)
  const [layerStart, setLayerStart] = useState(2)
  const [scale, setScale] = useState(14)
  const [tilesH, setTilesH] = useState(4)
  const [tileMode, setTileMode] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)

  const maxScale = 30

  useEffect(() => {
    setScale(s => Math.min(s, maxScale))
  }, [tilesH])

  useEffect(() => {
    setLayerStart(s => Math.max(2, Math.min(Math.max(2, repeatCount), s)))
  }, [repeatCount])

  const colorsReady = !!yarnA && !!yarnB

  useEffect(() => {
    if (!canvasRef.current || !colorsReady || !previewOpen) return
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
    const cols = card.cols || card.getRow(0)?.length || PUNCH_COLS
    const reps_h = tileMode ? tilesH : 1
    const reps_v = repeatCount

    canvas.width  = cols * reps_h * scale
    canvas.height = rows * reps_v * scale

    for (let rv = 0; rv < reps_v; rv++) {
      for (let th = 0; th < reps_h; th++) {
        for (let r = 0; r < rows; r++) {
          const row = card.getRow(r)
          for (let c = 0; c < cols; c++) {
            const altLayer = useLayerColors && rv + 1 >= layerStart
            ctx.fillStyle = row[c] ? (altLayer ? yarnC : yarnA) : (altLayer ? yarnD : yarnB)
            ctx.fillRect(
              (th * cols + c) * scale,
              (rv * rows + r) * scale,
              scale,
              scale
            )
          }
        }
      }
    }
  }, [card, yarnA, yarnB, yarnC, yarnD, useLayerColors, layerStart, scale, tilesH, tileMode, repeatCount, colorsReady, previewOpen])

  const downloadPNG = () => {
    if (!canvasRef.current) return
    const a = document.createElement('a')
    a.href = canvasRef.current.toDataURL('image/png')
    a.download = 'knit-preview.png'
    a.click()
  }

  const sliderLabel = { fontSize: 11, color: '#888', fontFamily: 'monospace', minWidth: 36 }
  const sliderRow = { display: 'flex', alignItems: 'center', gap: 8 }

  if (!previewOpen) {
    return (
      <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'center', justifyContent: 'center' }}>
        <ColorPickerPair
          yarnA={yarnA}
          yarnB={yarnB}
          yarnC={yarnC}
          yarnD={yarnD}
          useLayerColors={useLayerColors}
          layerStart={layerStart}
          repeatCount={repeatCount}
          onSetYarnA={setYarnA}
          onSetYarnB={setYarnB}
          onSetYarnC={setYarnC}
          onSetYarnD={setYarnD}
          onSetUseLayerColors={setUseLayerColors}
          onSetLayerStart={setLayerStart}
        />
        <button
          onClick={() => setPreviewOpen(true)}
          style={{
            padding: '9px 22px',
            background: '#8B2020',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: "'Avara', serif",
          }}
        >
          preview knit
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}>
        {/* Color controls */}
        <InlineColorControls
          yarnA={yarnA}
          yarnB={yarnB}
          yarnC={yarnC}
          yarnD={yarnD}
          useLayerColors={useLayerColors}
          layerStart={layerStart}
          repeatCount={repeatCount}
          onSetYarnA={setYarnA}
          onSetYarnB={setYarnB}
          onSetYarnC={setYarnC}
          onSetYarnD={setYarnD}
          onSetUseLayerColors={setUseLayerColors}
          onSetLayerStart={setLayerStart}
        />

        {/* Tile controls */}
        <div>
          <div style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
            repeat
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666', marginBottom: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={tileMode} onChange={e => setTileMode(e.target.checked)} />
            tile pattern
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tileMode && (
              <div style={sliderRow}>
                <span style={sliderLabel}>← {tilesH}×</span>
                <input type="range" min={1} max={4} value={tilesH}
                  onChange={e => setTilesH(Number(e.target.value))} style={{ width: 200 }} />
              </div>
            )}
            <div style={sliderRow}>
              <span style={sliderLabel}>↕ {repeatCount}×</span>
              <input type="range" min={1} max={12} value={repeatCount}
                onChange={e => setRepeatCount(Number(e.target.value))} style={{ width: 200 }} />
            </div>
            <div style={sliderRow}>
              <span style={sliderLabel}>px {scale}</span>
              <input type="range" min={8} max={maxScale} value={scale}
                onChange={e => setScale(Number(e.target.value))} style={{ width: 200 }} />
            </div>
          </div>
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
      <div className="knit-canvas-wrap" style={{
        overflowX: 'auto',
        overflowY: 'auto',
        width: '100%',
        maxHeight: '80vh',
        border: '1px solid #E0D9CE',
        borderRadius: 8,
        display: 'block',
        background: '#F5F0E8',
      }}>
        <div style={{ minWidth: 'max-content', display: 'flex', justifyContent: 'center' }}>
          <canvas ref={canvasRef} style={{ display: 'block', imageRendering: 'pixelated' }} />
        </div>
      </div>

      {card && card.totalRows() > 0 && (
        <p style={{ fontSize: 11, color: '#bbb', fontFamily: 'monospace' }}>
          {card.totalRows()} rows
          {repeatCount > 1 && ` × ${repeatCount} = ${card.totalRows() * repeatCount} total rows`}
          {tileMode && ` · ${tilesH}× across`}
        </p>
      )}
    </div>
  )
}
