import { useState } from 'react'
import { DndContext } from '@dnd-kit/core'
import AudioControls from './components/page1/AudioControls.jsx'
import CardGrid from './components/page1/CardGrid.jsx'
import ControlsBar from './components/page1/ControlsBar.jsx'
import RowDragLayer from './components/page1/RowDragLayer.jsx'
import TokenDebugPanel from './components/page1/TokenDebugPanel.jsx'
import ExportButton from './components/page1/ExportButton.jsx'
import KnitPreview from './components/page2/KnitPreview.jsx'
import MiniKnitCanvas from './components/page1/MiniKnitCanvas.jsx'
import EmotionPatternEditor from './components/shared/EmotionPatternEditor.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import { useCardStore } from './store/cardStore.js'

const PAGES = ['record', 'knit', 'edit']
const EDIT_PASSWORD = '3020470'

const NAV_BTN = (active) => ({
  padding: '11px 16px',
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: active ? '#fff' : '#C46060',
  cursor: 'pointer',
  fontSize: 13,
  fontFamily: "'Avara', serif",
  textAlign: 'left',
  width: '100%',
  letterSpacing: 0.3,
  transition: 'background 0.15s',
})

function LockedEditPanel({ children }) {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === EDIT_PASSWORD) {
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
      setPassword('')
    }
  }

  if (unlocked) return children

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}
    >
      <input
        type="password"
        value={password}
        onChange={e => {
          setPassword(e.target.value)
          setError(false)
        }}
        placeholder="password"
        autoFocus
        style={{
          width: 180,
          padding: '10px 14px',
          borderRadius: 6,
          border: `1px solid ${error ? '#8B2020' : '#C8BFAD'}`,
          background: '#FDF8F0',
          color: '#2C2C2C',
          fontSize: 13,
          fontFamily: 'monospace',
          outline: 'none',
          textAlign: 'center',
        }}
      />
      <button
        type="submit"
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
        unlock edit
      </button>
      {error && (
        <span style={{ fontSize: 10, color: '#8B2020', fontFamily: 'monospace' }}>
          wrong password
        </span>
      )}
    </form>
  )
}

export default function App() {
  const [page, setPage] = useState('record')
  const [debugOpen, setDebugOpen] = useState(false)
  const [hasVisitedKnit, setHasVisitedKnit] = useState(false)
  const [showMiniKnit, setShowMiniKnit] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const card = useCardStore(s => s.card)
  const hasCard = !!card && card.totalRows() > 0

  return (
    <DndContext>
      {showSplash && <SplashScreen onStart={() => setShowSplash(false)} />}
      <RowDragLayer />

      <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>

        {/* ── Left sidebar nav ── */}
        <nav style={{
          width: 120,
          background: '#8B2020',
          borderRight: 'none',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 10px 20px',
          gap: 4,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}>
          {PAGES.map(p => {
            const active = page === p
            return (
              <button
                key={p}
                onClick={() => { setPage(p); if (p === 'knit') setHasVisitedKnit(true) }}
                style={{ ...NAV_BTN(active), display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: active ? '#fff' : 'transparent',
                  border: active ? 'none' : '1px solid #C46060',
                }} />
                {p}
              </button>
            )
          })}

          {/* 0/1 debug panel toggle */}
          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={() => setDebugOpen(v => !v)}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: `1px solid ${debugOpen ? '#fff' : 'rgba(255,255,255,0.3)'}`,
                background: debugOpen ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: debugOpen ? '#fff' : 'rgba(255,255,255,0.45)',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'monospace',
                width: '100%',
                textAlign: 'left',
                letterSpacing: 1,
              }}
            >
              0 / 1
            </button>
          </div>
        </nav>

        {/* ── Main content ── */}
        <main style={{
          flex: 1,
          padding: '36px 24px',
          overflowY: 'auto',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {page === 'record' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>
              <AudioControls />
              <ControlsBar />
              <CardGrid />
              <ExportButton />
              {hasVisitedKnit && hasCard && (
                <button
                  onClick={() => setShowMiniKnit(v => !v)}
                  style={{
                    padding: '6px 14px',
                    background: 'transparent',
                    color: showMiniKnit ? '#8B2020' : '#B0A898',
                    border: `1px solid ${showMiniKnit ? '#8B2020' : '#C8BFAD'}`,
                    borderRadius: 6,
                    fontSize: 11,
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                >
                  knit preview {showMiniKnit ? '▲' : '▼'}
                </button>
              )}
              {hasVisitedKnit && hasCard && showMiniKnit && (
                <MiniKnitCanvas onClickKnit={() => setPage('knit')} />
              )}
            </div>
          )}

          <div style={{ display: page === 'knit' ? 'block' : 'none', width: '100%' }}>
            <KnitPreview />
          </div>

          {page === 'edit' && (
            <LockedEditPanel>
              <div style={{ width: '100%' }}>
                <h2 style={{
                  fontSize: 18,
                  fontFamily: 'Avara',
                  fontWeight: 400,
                  marginBottom: 24,
                  color: '#2C2C2C',
                  textAlign: 'center',
                }}>
                  emotion patterns
                </h2>
                <EmotionPatternEditor />
              </div>
            </LockedEditPanel>
          )}
        </main>

        {/* ── Sliding debug panel ── */}
        {debugOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 420,
              height: '100vh',
              zIndex: 300,
              boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
            }}
            className="debug-panel-enter"
          >
            <TokenDebugPanel onClose={() => setDebugOpen(false)} />
          </div>
        )}

        {/* Backdrop */}
        {debugOpen && (
          <div
            onClick={() => setDebugOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.15)',
              zIndex: 299,
            }}
          />
        )}
      </div>
    </DndContext>
  )
}
