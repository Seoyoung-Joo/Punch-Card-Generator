import { useState } from 'react'
import { useCardStore } from '../../store/cardStore.js'
import { SVGExporter } from '../../classes/SVGExporter.js'
import { CutExporter, MACHINES } from '../../classes/CutExporter.js'

const svgExporter = new SVGExporter()
const cutExporter = new CutExporter()

export default function ExportButton() {
  const card      = useCardStore(s => s.card)
  const gridColor = useCardStore(s => s.gridColor)
  const [showLabels, setShowLabels] = useState(true)
  const [machineId,  setMachineId]  = useState('brother_24')

  if (!card || card.totalRows() === 0) return null

  const machine   = MACHINES.find(m => m.id === machineId)
  const pageCount = machine ? Math.ceil(card.totalRows() / machine.maxRows) : 1
  const cardCols = card.cols || card.getRow(0)?.length || 24
  const willCrop = !!machine && machine.stitches < cardCols

  const handleExport = () => {
    svgExporter.download(card, 'punchcard.svg', { gridColor, showLabels })
  }

  const handleCutExport = () => {
    if (willCrop && !confirm(`${machine.label} is narrower than the ${cardCols}-stitch pattern. The left and right edges will be cropped. Export anyway?`)) {
      return
    }
    cutExporter.download(card, machineId)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* Machine selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace' }}>machine</span>
        <select
          value={machineId}
          onChange={e => setMachineId(e.target.value)}
          style={{
            fontSize: 11,
            fontFamily: 'monospace',
            color: '#555',
            background: '#fdf8f0',
            border: '1px solid #e0d9ce',
            borderRadius: 5,
            padding: '4px 8px',
            cursor: 'pointer',
          }}
        >
          {MACHINES.map(m => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>
      {willCrop && (
        <div style={{
          maxWidth: 420,
          color: '#8B2020',
          background: '#fff4ec',
          border: '1px solid #e3b8a6',
          borderRadius: 6,
          padding: '6px 10px',
          fontSize: 10,
          fontFamily: 'monospace',
          lineHeight: 1.4,
          textAlign: 'center',
        }}>
          warning: this {machine.stitches}-stitch machine will center-crop the {cardCols}-stitch pattern
        </div>
      )}

      {/* Export buttons */}
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

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#aaa', cursor: 'pointer' }}>
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
          title={`Vinyl cutter SVG — ${machine?.label ?? ''}`}
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
          {card.totalRows()} rows → {pageCount} card{pageCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
