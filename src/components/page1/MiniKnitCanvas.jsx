import { useEffect, useRef } from 'react'
import { useCardStore } from '../../store/cardStore.js'
import { PUNCH_COLS } from '../../config/punchCard.js'

const YARN_A = '#1a1a2e'
const YARN_B = '#f0e6d3'
const TILES_H = 4
const MAX_W = 252
const MAX_H = 160

export default function MiniKnitCanvas({ onClickKnit }) {
  const card = useCardStore(s => s.card)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !card || card.totalRows() === 0) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const cols = card.cols || card.getRow(0)?.length || PUNCH_COLS
    const rows = card.totalRows()
    const scaleByW = Math.floor(MAX_W / (cols * TILES_H))
    const scaleByH = Math.floor(MAX_H / rows)
    const scale = Math.max(1, Math.min(scaleByW, scaleByH))

    canvas.width = cols * TILES_H * scale
    canvas.height = rows * scale

    for (let th = 0; th < TILES_H; th++) {
      for (let r = 0; r < rows; r++) {
        const row = card.getRow(r)
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = row[c] ? YARN_A : YARN_B
          ctx.fillRect((th * cols + c) * scale, r * scale, scale, scale)
        }
      }
    }
  }, [card])

  if (!card || card.totalRows() === 0) return null

  return (
    <div
      onClick={onClickKnit}
      title="go to knit preview"
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        background: '#F5F0E8',
        border: '1px solid #E0D9CE',
        borderRadius: 8,
        padding: '8px 10px 10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        zIndex: 100,
        cursor: onClickKnit ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s',
      }}
    >
      <div style={{
        fontSize: 9,
        color: '#bbb',
        fontFamily: 'monospace',
        letterSpacing: 1.5,
        marginBottom: 6,
        textTransform: 'uppercase',
      }}>
        knit preview
      </div>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', imageRendering: 'pixelated' }}
      />
    </div>
  )
}
