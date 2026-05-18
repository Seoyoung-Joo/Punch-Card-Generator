import { useState } from 'react'
import { DndContext } from '@dnd-kit/core'
import AudioControls from './components/page1/AudioControls.jsx'
import CardGrid from './components/page1/CardGrid.jsx'
import ControlsBar from './components/page1/ControlsBar.jsx'
import RowDragLayer from './components/page1/RowDragLayer.jsx'
import TokenDebugPanel from './components/page1/TokenDebugPanel.jsx'
import ExportButton from './components/page1/ExportButton.jsx'
import KnitPreview from './components/page2/KnitPreview.jsx'
import EmotionPatternEditor from './components/shared/EmotionPatternEditor.jsx'

const PAGES = ['record', 'knit', 'edit']

const NAV_BTN = (active) => ({
  padding: '11px 16px',
  borderRadius: 6,
  border: 'none',
  background: active ? '#8B2020' : 'transparent',
  color: active ? '#fff' : '#A89888',
  cursor: 'pointer',
  fontSize: 13,
  fontFamily: "'Avara', serif",
  textAlign: 'left',
  width: '100%',
  letterSpacing: 0.3,
  transition: 'background 0.15s',
})

export default function App() {
  const [page, setPage] = useState('record')
  const [debugOpen, setDebugOpen] = useState(false)

  return (
    <DndContext>
      <RowDragLayer />

      <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>

        {/* ── Left sidebar nav ── */}
        <nav style={{
          width: 120,
          background: '#EDE8DF',
          boxShadow: '2px 0 10px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 10px 20px',
          gap: 4,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}>
          {PAGES.map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={NAV_BTN(page === p)}
            >
              {p}
            </button>
          ))}

          {/* 0/1 debug panel toggle */}
          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={() => setDebugOpen(v => !v)}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: `1px solid ${debugOpen ? '#8B2020' : '#C8BFAD'}`,
                background: debugOpen ? '#8B202015' : 'transparent',
                color: debugOpen ? '#8B2020' : '#B0A898',
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
            </div>
          )}

          {page === 'knit' && <KnitPreview />}

          {page === 'edit' && (
            <div>
              <h2 style={{
                fontSize: 18,
                fontFamily: 'Avara',
                fontWeight: 400,
                marginBottom: 24,
                color: '#2C2C2C',
              }}>
                emotion patterns
              </h2>
              <EmotionPatternEditor />
            </div>
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
