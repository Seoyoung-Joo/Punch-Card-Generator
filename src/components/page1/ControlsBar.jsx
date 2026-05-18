import { useCardStore } from '../../store/cardStore.js'

const GRID_COLORS = [
  { value: '#8B2020', label: 'red' },
  { value: '#457b9d', label: 'blue' },
]

const btnBase = {
  padding: '6px 14px',
  borderRadius: 6,
  border: '1px solid #ddd',
  background: 'transparent',
  fontSize: 12,
  color: '#666',
  cursor: 'pointer',
  fontFamily: "'Avara', serif",
}

const btnRed = {
  ...btnBase,
  background: '#8B2020',
  border: '1px solid #8B2020',
  color: '#fff',
}

export default function ControlsBar() {
  const tension              = useCardStore(s => s.tension)
  const setTension           = useCardStore(s => s.setTension)
  const shuffleCard          = useCardStore(s => s.shuffleCard)
  const insertEpsilonAt      = useCardStore(s => s.insertEpsilonAt)
  const tokens               = useCardStore(s => s.tokens)
  const card                 = useCardStore(s => s.card)
  const gridColor            = useCardStore(s => s.gridColor)
  const setGridColor         = useCardStore(s => s.setGridColor)
  const epsilonAfterEmotion  = useCardStore(s => s.epsilonAfterEmotion)
  const setEpsilonAfterEmotion = useCardStore(s => s.setEpsilonAfterEmotion)

  if (!card && tokens.length === 0) return null

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center',
      padding: '6px 0',
    }}>
      {/* Tension slider */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#666' }}>
        <span style={{ fontFamily: 'monospace', color: '#888', fontSize: 11 }}>tension</span>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={tension}
          onChange={e => setTension(Number(e.target.value))}
          style={{ width: 90 }}
        />
        <span style={{ fontFamily: 'monospace', minWidth: 10, color: '#8B2020', fontWeight: 600 }}>
          {tension}
        </span>
      </label>

      <div style={{ width: 1, height: 18, background: '#e0d9ce' }} />

      <button onClick={shuffleCard} style={btnRed}>shuffle ⇄</button>

      <button onClick={() => insertEpsilonAt(tokens.length - 1)} style={btnBase}>
        + blank row
      </button>

      <div style={{ width: 1, height: 18, background: '#e0d9ce' }} />

      {/* ε after emotion */}
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        color: '#888',
        cursor: 'pointer',
        userSelect: 'none',
      }}>
        <input
          type="checkbox"
          checked={epsilonAfterEmotion}
          onChange={e => setEpsilonAfterEmotion(e.target.checked)}
        />
        ε after emotion
      </label>

      <div style={{ width: 1, height: 18, background: '#e0d9ce' }} />

      {/* Grid color dots */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace' }}>lines</span>
        {GRID_COLORS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setGridColor(value)}
            title={label}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: value,
              border: gridColor === value ? '2px solid #333' : '2px solid transparent',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
