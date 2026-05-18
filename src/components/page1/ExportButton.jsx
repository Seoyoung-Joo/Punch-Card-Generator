import { useState } from 'react'
import { useCardStore } from '../../store/cardStore.js'
import { SVGExporter } from '../../classes/SVGExporter.js'
import { CutExporter } from '../../classes/CutExporter.js'

const svgExporter = new SVGExporter()
const cutExporter = new CutExporter()

export default function ExportButton() {
  const card      = useCardStore(s => s.card)
  const gridColor = useCardStore(s => s.gridColor)
  const [showLabels, setShowLabels] = useState(true)

  if (!card || card.totalRows() === 0) return null

  const handleExport = () => {
    svgExporter.download(card, 'punchcard.svg', { gridColor, showLabels })
  }

  const handleCutExport = () => {
    cutExporter.downloadCutSVGs(card, 'punchcard-cut', { pageRows: 24 })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
      <button
        onClick={handleExport}
        style={{
          padding: '8px 20px',
          background: '#2C2C2C',
          color: '#f5f0e8',
          border: 'none',
          borderRadius: 6,
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: "'Avara', serif",
        }}
      >
        export SVG ↓
      </button>

      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        color: '#aaa',
        cursor: 'pointer',
      }}>
        <input
          type="checkbox"
          checked={showLabels}
          onChange={e => setShowLabels(e.target.checked)}
        />
        show labels
      </label>

      <div style={{ width: 1, height: 18, background: '#e0d9ce' }} />

      <button
        onClick={handleCutExport}
        title="Holes-only SVG for Silhouette Cutter, split into 24-row pages"
        style={{
          padding: '8px 20px',
          background: 'transparent',
          color: '#8B2020',
          border: '1px solid #8B2020',
          borderRadius: 6,
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: "'Avara', serif",
        }}
      >
        cut SVG ✂
      </button>

      <span style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace' }}>
        {card.totalRows()} rows → {Math.ceil(card.totalRows() / 24)} card{Math.ceil(card.totalRows() / 24) !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
