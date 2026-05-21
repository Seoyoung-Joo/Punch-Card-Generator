import { useEffect, useRef } from 'react'
import HoleCircle from '../shared/HoleCircle.jsx'
import { useCardStore } from '../../store/cardStore.js'
import { usePunchSound } from '../../hooks/usePunchSound.js'

const CELL = 40
const HOLE_SIZE = 28
const LABEL_W = 120
const NUM_W = 32
const BELT_W = 22
const GRIP_W = 14

function BeltHole({ gridColor }) {
  return (
    <div style={{ width: BELT_W, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        border: `1.5px solid ${gridColor}55`,
        background: '#e4ddd3',
      }} />
    </div>
  )
}

function CardRow({ row, meta, rowIndex, gridColor }) {
  const isEpsilon      = meta.type === 'epsilon'
  const isEmotion      = meta.type === 'emotion'
  const isAudioEmotion = isEmotion && meta.source === 'audio-emotion'
  const isFirstEmotionRow = isEmotion
    && (meta.rowIndexInPattern === 0 || meta.rowIndexInPattern == null)
    && (!meta.repetition || meta.repetition === 0)

  const rowBg = isEpsilon      ? 'rgba(0,0,0,0.032)'
    : isAudioEmotion           ? 'rgba(60,100,180,0.07)'
    : isEmotion                ? 'rgba(139,32,32,0.055)'
    : 'transparent'

  let label = ''
  if (isEpsilon) {
    if (meta.source === 'pause') label = 'pause ε'
    else if (meta.source === 'filler') label = `[${meta.word}] ε`
    else if (meta.source === 'emotion-break') label = '— ε'
    else label = 'ε'
  } else if (isFirstEmotionRow) {
    label = isAudioEmotion ? `~ ${meta.word}` : meta.word
  } else if (isEmotion) {
    label = ''
  } else {
    label = meta.word
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: CELL,
      background: rowBg,
    }}>
      {/* Drag grip */}
      <div style={{
        width: GRIP_W,
        display: 'flex',
        justifyContent: 'center',
        color: '#d0c8be',
        fontSize: 9,
        cursor: 'grab',
        userSelect: 'none',
        flexShrink: 0,
        letterSpacing: -1,
      }}>
        ⋮⋮
      </div>

      <BeltHole gridColor={gridColor} />

      {/* Word label */}
      <div style={{
        width: LABEL_W,
        fontSize: 10,
        color: isEpsilon ? '#c0b8ae' : isAudioEmotion ? '#3c6490' : isEmotion ? '#8B2020' : '#a8a09a',
        textAlign: 'right',
        paddingRight: 10,
        fontFamily: 'monospace',
        overflow: 'hidden',
        flexShrink: 0,
        fontStyle: isEpsilon ? 'italic' : 'normal',
        fontWeight: isFirstEmotionRow ? 600 : 400,
        lineHeight: 1.3,
      }}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        {isFirstEmotionRow && meta.original && (
          <div style={{ fontSize: 8, fontWeight: 400, color: '#c4a0a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            (*{meta.original})
          </div>
        )}
      </div>

      {/* Hole grid */}
      <div style={{ display: 'flex', borderLeft: `1px solid ${gridColor}22`, flexShrink: 0 }}>
        {row.map((punched, ci) => (
          <div
            key={ci}
            style={{
              width: CELL,
              height: CELL,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: `1px solid ${gridColor}22`,
            }}
          >
            <HoleCircle punched={!!punched} size={HOLE_SIZE} />
          </div>
        ))}
      </div>

      {/* Row number */}
      <div style={{
        width: NUM_W,
        fontSize: 9,
        color: '#ccc',
        paddingLeft: 7,
        fontFamily: 'monospace',
        flexShrink: 0,
      }}>
        {rowIndex + 1}
      </div>

      <BeltHole gridColor={gridColor} />
    </div>
  )
}

export default function CardGrid() {
  const card = useCardStore(s => s.card)
  const gridColor = useCardStore(s => s.gridColor)
  const playPunch = usePunchSound()
  const prevCardRef = useRef(null)
  const cols = card?.cols || card?.getRow(0)?.length || 24

  useEffect(() => {
    const prevCard = prevCardRef.current

    if (card && card !== prevCard) {
      if (prevCard && card.totalRows() > prevCard.totalRows()) {
        playPunch(card, prevCard.totalRows())
      } else if (!prevCard) {
        playPunch(card, 0)
      }

      prevCardRef.current = card
    }
  }, [card, playPunch])

  if (!card || card.totalRows() === 0) {
    return (
      <div style={{
        padding: '72px 0',
        textAlign: 'center',
        color: '#C8BFAD',
        fontSize: 15,
        fontStyle: 'italic',
      }}>
        speak or type something to create your punch card
      </div>
    )
  }

  return (
    <div>
      {/* Column header */}
      <div style={{
        display: 'flex',
        paddingLeft: GRIP_W + BELT_W + LABEL_W,
        marginBottom: 4,
      }}>
        {Array.from({ length: cols }, (_, i) => (
          <div key={i} style={{
            width: CELL,
            fontSize: 8,
            color: '#ccc',
            textAlign: 'center',
            fontFamily: 'monospace',
          }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{
        background: '#f7f2ea',
        border: '1px solid #e0d9ce',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 3px 16px rgba(0,0,0,0.07)',
        display: 'inline-block',
      }}>
        <div style={{ height: 1, background: `${gridColor}28` }} />
        {Array.from({ length: card.totalRows() }, (_, ri) => (
          <div key={ri}>
            <CardRow
              row={card.getRow(ri)}
              meta={card.rowMeta[ri]}
              rowIndex={ri}
              gridColor={gridColor}
            />
            <div style={{ height: 1, background: `${gridColor}18` }} />
          </div>
        ))}
      </div>
    </div>
  )
}
