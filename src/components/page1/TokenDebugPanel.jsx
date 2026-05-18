import { useCardStore } from '../../store/cardStore.js'

const TYPE_COLORS = {
  word:    { bg: '#f0ece6', color: '#8B6B4A' },
  emotion: { bg: '#fdeaea', color: '#8B2020' },
  epsilon: { bg: '#f0f0f0', color: '#aaa' },
}

export default function TokenDebugPanel({ onClose }) {
  const tokens       = useCardStore(s => s.tokens)
  const card         = useCardStore(s => s.card)
  const rawTranscript = useCardStore(s => s.rawTranscript)

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#FDF8F0',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px 16px',
        borderBottom: '1px solid #E0D9CE',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 11,
          color: '#aaa',
          fontFamily: 'monospace',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          how it works
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            color: '#aaa',
            lineHeight: 1,
            padding: '0 4px',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
        {tokens.length === 0 ? (
          <p style={{ color: '#bbb', fontSize: 13, fontStyle: 'italic' }}>
            speak or type something to see the translation
          </p>
        ) : (
          <>
            {/* Raw transcript */}
            {rawTranscript && (
              <section style={{ marginBottom: 24 }}>
                <Label>raw transcript</Label>
                <p style={{
                  fontSize: 13,
                  color: '#555',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  background: '#fff',
                  border: '1px solid #E0D9CE',
                  borderRadius: 6,
                  padding: '8px 12px',
                }}>
                  "{rawTranscript}"
                </p>
              </section>
            )}

            {/* Token list */}
            <section style={{ marginBottom: 24 }}>
              <Label>tokens ({tokens.length})</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {tokens.map((token, i) => {
                  const style = TYPE_COLORS[token.type] || TYPE_COLORS.word
                  return (
                    <span
                      key={i}
                      style={{
                        background: style.bg,
                        color: style.color,
                        border: `1px solid ${style.color}33`,
                        borderRadius: 4,
                        padding: '3px 8px',
                        fontFamily: 'monospace',
                        fontSize: 11,
                      }}
                    >
                      {token.type === 'epsilon' ? 'ε' : token.word}
                      <span style={{ opacity: 0.5, marginLeft: 4, fontSize: 9 }}>
                        {token.type[0]}
                      </span>
                    </span>
                  )
                })}
              </div>
            </section>

            {/* Bit arrays */}
            {card && card.totalRows() > 0 && (
              <section>
                <Label>rows → 0 / 1</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {Array.from({ length: card.totalRows() }, (_, ri) => {
                    const meta = card.rowMeta[ri]
                    const row = card.getRow(ri)
                    const isEmotion = meta.type === 'emotion'
                    const isEpsilon = meta.type === 'epsilon'
                    return (
                      <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 70,
                          fontSize: 9,
                          fontFamily: 'monospace',
                          color: isEmotion ? '#8B2020' : isEpsilon ? '#ccc' : '#aaa',
                          textAlign: 'right',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}>
                          {meta.type === 'epsilon' ? 'ε' : meta.word}
                        </span>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: 10,
                          color: isEpsilon ? '#ddd' : '#555',
                          letterSpacing: 2,
                        }}>
                          {row.map(v => v ? '1' : '0').join(' ')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Label({ children }) {
  return (
    <div style={{
      fontSize: 10,
      color: '#bbb',
      fontFamily: 'monospace',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: 8,
    }}>
      {children}
    </div>
  )
}
