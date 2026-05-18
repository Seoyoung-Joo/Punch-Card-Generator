import HoleCircle from './HoleCircle.jsx'
import { useEmotionStore } from '../../store/emotionStore.js'
import { useCardStore } from '../../store/cardStore.js'
import { EMOTION_WORDS } from '../../classes/EmotionLibrary.js'
import { DETECTABLE_EMOTIONS } from '../../classes/EmotionClassifier.js'

const TAG = (color, bg, text) => (
  <span style={{
    fontSize: 9,
    fontFamily: 'monospace',
    color,
    background: bg,
    border: `1px solid ${color}44`,
    borderRadius: 3,
    padding: '1px 5px',
    letterSpacing: 0.3,
  }}>
    {text}
  </span>
)

export default function EmotionPatternEditor() {
  const patterns      = useEmotionStore(s => s.patterns)
  const setPattern    = useEmotionStore(s => s.setPattern)
  const resetPatterns = useEmotionStore(s => s.resetPatterns)
  const rebuildCard   = useCardStore(s => s.rebuildCard)

  const toggleHole = (word, rowIndex, colIndex) => {
    const rows = (patterns[word] || []).map(r => [...r])
    if (!rows[rowIndex]) return
    rows[rowIndex][colIndex] = !rows[rowIndex][colIndex]
    setPattern(word, rows)
    rebuildCard()
  }

  const addRow = (word) => {
    const rows = [...(patterns[word] || []).map(r => [...r]), Array(18).fill(false)]
    setPattern(word, rows)
    rebuildCard()
  }

  const removeRow = (word, rowIndex) => {
    const rows = (patterns[word] || []).map(r => [...r]).filter((_, i) => i !== rowIndex)
    setPattern(word, rows)
    rebuildCard()
  }

  return (
    <div style={{ maxWidth: 820 }}>

      {/* Legend + reset */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ color: '#aaa', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            Click any circle to toggle a hole. Changes save automatically.
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {TAG('#3c6490', '#eef3fa', 'AI detectable')}
            <span style={{ fontSize: 10, color: '#bbb' }}>emotion can be caught from your text / speech</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {TAG('#888', '#f5f5f5', 'hash fallback')}
            <span style={{ fontSize: 10, color: '#bbb' }}>no pattern designed yet — uses word hash instead</span>
          </div>
        </div>
        <button
          onClick={() => { if (confirm('Reset all patterns to built-in defaults?')) { resetPatterns(); rebuildCard() } }}
          style={{
            flexShrink: 0, fontSize: 11, color: '#bbb',
            background: 'none', border: '1px solid #ddd',
            borderRadius: 4, padding: '4px 12px', cursor: 'pointer',
          }}
        >
          reset defaults
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {EMOTION_WORDS.map(word => {
          const rows       = patterns[word] || []
          const isAI       = DETECTABLE_EMOTIONS.has(word)
          const hasDesign  = rows.length > 0 && rows.some(r => r.some(Boolean))
          const isEmpty    = rows.length === 0 || !hasDesign

          return (
            <div key={word}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isAI ? '#8B2020' : '#aaa',
                  fontFamily: 'monospace',
                  minWidth: 76,
                }}>
                  {word}
                </span>

                {isAI   && TAG('#3c6490', '#eef3fa', 'AI detectable')}
                {isEmpty && TAG('#888',    '#f5f5f5', 'hash fallback')}

                <span style={{ fontSize: 10, color: '#ccc', marginLeft: 2 }}>
                  {rows.length} row{rows.length !== 1 ? 's' : ''}
                </span>

                <button
                  onClick={() => addRow(word)}
                  style={{
                    marginLeft: 'auto', fontSize: 11, color: '#8B2020',
                    background: 'none', border: '1px solid #8B202044',
                    borderRadius: 4, padding: '2px 10px', cursor: 'pointer',
                  }}
                >
                  + row
                </button>
              </div>

              {/* Pattern grid */}
              <div style={{
                background: isAI ? '#fdf8f0' : '#f8f8f8',
                border: `1px solid ${isAI ? '#e8e0d4' : '#ebebeb'}`,
                borderRadius: 8,
                padding: '10px 14px',
                display: 'inline-flex',
                flexDirection: 'column',
                gap: 4,
              }}>
                {rows.length === 0 ? (
                  <span style={{ fontSize: 11, color: '#ccc', fontStyle: 'italic', padding: '4px 0' }}>
                    no pattern — will use hash encoding · click + row to design one
                  </span>
                ) : !hasDesign ? (
                  <>
                    {rows.map((row, ri) => (
                      <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        {row.map((punched, ci) => (
                          <HoleCircle key={ci} punched={!!punched} size={16} onClick={() => toggleHole(word, ri, ci)} />
                        ))}
                        <button onClick={() => removeRow(word, ri)} style={{ marginLeft: 6, fontSize: 11, color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }} title="Remove row">×</button>
                      </div>
                    ))}
                    <span style={{ fontSize: 10, color: '#bbb', fontStyle: 'italic', paddingTop: 2 }}>all holes off — click circles to design</span>
                  </>
                ) : (
                  rows.map((row, ri) => (
                    <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {row.map((punched, ci) => (
                        <HoleCircle key={ci} punched={!!punched} size={16} onClick={() => toggleHole(word, ri, ci)} />
                      ))}
                      <button onClick={() => removeRow(word, ri)} style={{ marginLeft: 6, fontSize: 11, color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }} title="Remove row">×</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
