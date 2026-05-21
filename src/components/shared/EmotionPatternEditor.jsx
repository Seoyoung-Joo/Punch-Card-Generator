import HoleCircle from './HoleCircle.jsx'
import { useEmotionStore } from '../../store/emotionStore.js'
import { useCardStore } from '../../store/cardStore.js'
import { EMOTION_WORDS } from '../../classes/EmotionLibrary.js'
import { EMOTION_SYNONYMS } from '../../classes/EmotionWords.js'
import { PUNCH_COLS } from '../../config/punchCard.js'

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

function PatternGrid({ word, rows, onToggleHole, onRemoveRow }) {
  const hasDesign = rows.length > 0 && rows.some(r => r.some(Boolean))

  if (rows.length === 0) {
    return (
      <span style={{ fontSize: 11, color: '#ccc', fontStyle: 'italic', padding: '4px 0' }}>
        no pattern — will use hash encoding · click + row to design one
      </span>
    )
  }

  return (
    <>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {row.map((punched, ci) => (
            <HoleCircle
              key={ci}
              punched={!!punched}
              size={14}
              onClick={() => onToggleHole(word, ri, ci)}
            />
          ))}
          <button
            onClick={() => onRemoveRow(word, ri)}
            style={{ marginLeft: 6, fontSize: 11, color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
            title="Remove row"
          >
            ×
          </button>
        </div>
      ))}
      {!hasDesign && (
        <span style={{ fontSize: 10, color: '#bbb', fontStyle: 'italic', paddingTop: 2 }}>
          all holes off — click circles to design
        </span>
      )}
    </>
  )
}

function PatternColumn({
  word,
  rows,
  label,
  color,
  tagBg,
  onAddRow,
  onToggleHole,
  onRemoveRow,
}) {
  const hasDesign = rows.length > 0 && rows.some(r => r.some(Boolean))
  const isEmpty = rows.length === 0 || !hasDesign

  return (
    <div style={{ width: 540, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 'fit-content', minWidth: 408, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        {TAG(color, tagBg, label)}
        {isEmpty && TAG('#888', '#f5f5f5', 'hash fallback')}
        <span style={{ fontSize: 10, color: '#ccc', marginLeft: 2 }}>
          {rows.length} row{rows.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={onAddRow}
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color,
            background: 'none',
            border: `1px solid ${color}44`,
            borderRadius: 4,
            padding: '2px 10px',
            cursor: 'pointer',
          }}
        >
          + row
        </button>
      </div>

      <div style={{
        background: '#fdf8f0',
        border: '1px solid #e8e0d4',
        borderRadius: 8,
        padding: '10px 14px',
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        <PatternGrid
          word={word}
          rows={rows}
          onToggleHole={onToggleHole}
          onRemoveRow={onRemoveRow}
        />
      </div>
    </div>
  )
}

export default function EmotionPatternEditor() {
  const patterns         = useEmotionStore(s => s.patterns)
  const claudePatterns   = useEmotionStore(s => s.claudePatterns)
  const setPattern       = useEmotionStore(s => s.setPattern)
  const setClaudePattern = useEmotionStore(s => s.setClaudePattern)
  const resetPatterns    = useEmotionStore(s => s.resetPatterns)
  const rebuildCard      = useCardStore(s => s.rebuildCard)

  const toggleHoleIn = (patternMap, setter, word, rowIndex, colIndex) => {
    const rows = (patternMap[word] || []).map(r => [...r])
    if (!rows[rowIndex]) return
    rows[rowIndex][colIndex] = !rows[rowIndex][colIndex]
    setter(word, rows)
    rebuildCard()
  }

  const addRowTo = (patternMap, setter, word) => {
    const rows = [...(patternMap[word] || []).map(r => [...r]), Array(PUNCH_COLS).fill(false)]
    setter(word, rows)
    rebuildCard()
  }

  const removeRowFrom = (patternMap, setter, word, rowIndex) => {
    const rows = (patternMap[word] || []).map(r => [...r]).filter((_, i) => i !== rowIndex)
    setter(word, rows)
    rebuildCard()
  }

  return (
    <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto' }}>

      {/* Legend + reset */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ color: '#aaa', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            API-detected emotion rows and local dictionary emotion rows use separate editable shapes.
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {TAG('#3c6490', '#eef3fa', 'api')}
            <span style={{ fontSize: 10, color: '#bbb' }}>emotion returned by the detection API</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {TAG('#8B6B4A', '#f4eee8', 'local')}
            <span style={{ fontSize: 10, color: '#bbb' }}>typed words and synonyms that resolve into each emotion</span>
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

      <section style={{ marginBottom: 44 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <h3 style={{
            fontSize: 13,
            fontFamily: 'monospace',
            color: '#8B2020',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            emotion patterns
          </h3>
          {TAG('#3c6490', '#eef3fa', 'api column')}
          {TAG('#8B6B4A', '#f4eee8', 'local column')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
        {EMOTION_WORDS.map(word => {
          const apiRows = claudePatterns[word] || []
          const localRows = patterns[word] || []

          return (
            <div key={word} style={{ borderTop: '1px solid #e8e0d4', paddingTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#8B2020',
                  fontFamily: 'monospace',
                  minWidth: 76,
                  textAlign: 'center',
                }}>
                  {word}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 540px)',
                gap: 24,
                alignItems: 'start',
                justifyContent: 'center',
              }}>
                <PatternColumn
                  word={word}
                  rows={apiRows}
                  label="api"
                  color="#3c6490"
                  tagBg="#eef3fa"
                  onAddRow={() => addRowTo(claudePatterns, setClaudePattern, word)}
                  onToggleHole={(w, ri, ci) => toggleHoleIn(claudePatterns, setClaudePattern, w, ri, ci)}
                  onRemoveRow={(w, ri) => removeRowFrom(claudePatterns, setClaudePattern, w, ri)}
                />

                <PatternColumn
                  word={word}
                  rows={localRows}
                  label="local"
                  color="#8B6B4A"
                  tagBg="#f4eee8"
                  onAddRow={() => addRowTo(patterns, setPattern, word)}
                  onToggleHole={(w, ri, ci) => toggleHoleIn(patterns, setPattern, w, ri, ci)}
                  onRemoveRow={(w, ri) => removeRowFrom(patterns, setPattern, w, ri)}
                />
              </div>
            </div>
          )
        })}
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <h3 style={{
            fontSize: 13,
            fontFamily: 'monospace',
            color: '#8B6B4A',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            dictionary word links
          </h3>
          {TAG('#8B6B4A', '#f4eee8', 'local matcher')}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
        }}>
          {EMOTION_WORDS.map(word => {
            const links = [word, ...(EMOTION_SYNONYMS[word] || [])]

            return (
              <div
                key={word}
                style={{
                  border: '1px solid #e8e0d4',
                  background: '#fdf8f0',
                  borderRadius: 8,
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#8B2020', fontWeight: 600 }}>
                    {word}
                  </span>
                  <span style={{ fontSize: 10, color: '#c8bfad' }}>
                    → uses {word} shape
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {links.map(link => (
                    <span
                      key={link}
                      style={{
                        fontSize: 10,
                        fontFamily: 'monospace',
                        color: link === word ? '#8B2020' : '#8B6B4A',
                        background: link === word ? '#fdeaea' : '#f4eee8',
                        border: `1px solid ${link === word ? '#8B202033' : '#8B6B4A22'}`,
                        borderRadius: 4,
                        padding: '2px 6px',
                      }}
                    >
                      {link}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
