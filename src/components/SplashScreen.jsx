import { useState, useEffect, useRef } from 'react'

const LINES = [
  { text: 'I Want',        indent: '10vw' },
  { text: 'My Feelings',   indent: '44vw' },
  { text: 'to be Knitted', indent: '8vw'  },
]
const TOTAL_CHARS = LINES.reduce((s, l) => s + l.text.length, 0)

const FONT = "'Tiny5x3', monospace"
const SIZE = '14vw'
const BG_DOTS = [
  [-3, 10], [7, 36], [9, 82],
  [36, -3], [82, 4],
  [96, 14], [97, 60], [88, 82],
  [8, 96], [70, 94],
].map(([left, top], i) => ({
  id: i,
  left: `${left}%`,
  top: `${top}%`,
  size: 112,
}))

function getAudioCtx(ref) {
  if (!ref.current && (window.AudioContext || window.webkitAudioContext)) {
    ref.current = new (window.AudioContext || window.webkitAudioContext)()
  }
  return ref.current
}

function playTone(audioCtx, { frequency, duration, volume, type = 'triangle', filter = 1200 }) {
  if (!audioCtx) return
  if (audioCtx.state === 'suspended') audioCtx.resume()

  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  const biquad = audioCtx.createBiquadFilter()

  osc.type = type
  osc.frequency.setValueAtTime(frequency, now)
  biquad.type = 'lowpass'
  biquad.frequency.setValueAtTime(filter, now)
  biquad.frequency.exponentialRampToValueAtTime(Math.max(180, filter * 0.35), now + duration)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  osc.connect(biquad)
  biquad.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

function playTypeClack(audioCtx) {
  if (!audioCtx) return
  if (audioCtx.state === 'suspended') audioCtx.resume()

  const now = audioCtx.currentTime
  const noiseLength = Math.floor(audioCtx.sampleRate * 0.032)
  const buffer = audioCtx.createBuffer(1, noiseLength, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < noiseLength; i++) {
    const decay = 1 - i / noiseLength
    data[i] = (Math.random() * 2 - 1) * decay
  }

  const noise = audioCtx.createBufferSource()
  const noiseGain = audioCtx.createGain()
  const noiseFilter = audioCtx.createBiquadFilter()
  const click = audioCtx.createOscillator()
  const clickGain = audioCtx.createGain()

  noise.buffer = buffer
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.setValueAtTime(2600, now)
  noiseFilter.Q.setValueAtTime(1.2, now)
  noiseGain.gain.setValueAtTime(0.0001, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.22, now + 0.002)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032)

  click.type = 'square'
  click.frequency.setValueAtTime(145, now)
  clickGain.gain.setValueAtTime(0.0001, now)
  clickGain.gain.exponentialRampToValueAtTime(0.13, now + 0.002)
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026)

  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(audioCtx.destination)
  click.connect(clickGain)
  clickGain.connect(audioCtx.destination)

  noise.start(now)
  noise.stop(now + 0.04)
  click.start(now)
  click.stop(now + 0.035)
}

export default function SplashScreen({ onStart }) {
  const [charIdx, setCharIdx] = useState(0)
  const [dotCount, setDotCount] = useState(1)
  const [showStart, setShowStart] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [hoverStart, setHoverStart] = useState(false)
  const [visibleDots, setVisibleDots] = useState([])
  const audioRef = useRef(null)

  const typingDone = charIdx >= TOTAL_CHARS

  useEffect(() => {
    if (typingDone) return
    const t = setTimeout(() => {
      const next = charIdx + 1
      const audioCtx = getAudioCtx(audioRef)
      playTypeClack(audioCtx)
      setCharIdx(next)
    }, 55)
    return () => clearTimeout(t)
  }, [charIdx, typingDone])

  useEffect(() => {
    if (!typingDone) return
    const t = setTimeout(() => setShowStart(true), 500)
    return () => clearTimeout(t)
  }, [typingDone])

  useEffect(() => {
    if (!typingDone) return
    const t = setInterval(() => setDotCount(d => (d % 3) + 1), 420)
    return () => clearInterval(t)
  }, [typingDone])

  useEffect(() => {
    if (!typingDone) return
    let dotIndex = 0
    const timeouts = []

    const showNextDot = () => {
      const id = BG_DOTS[dotIndex % BG_DOTS.length].id
      dotIndex += 1
      const audioCtx = getAudioCtx(audioRef)
      playTone(audioCtx, {
        frequency: 165 + (id % 5) * 22,
        duration: 0.11,
        volume: 0.18,
        type: 'triangle',
        filter: 900,
      })
      setVisibleDots(prev => [...prev.filter(dotId => dotId !== id), id].slice(-3))
      const timeout = setTimeout(() => {
        setVisibleDots(prev => prev.filter(dotId => dotId !== id))
      }, 5200)
      timeouts.push(timeout)
    }

    const first = setTimeout(showNextDot, 600)
    timeouts.push(first)
    const interval = setInterval(showNextDot, 1800)

    return () => {
      clearInterval(interval)
      timeouts.forEach(clearTimeout)
    }
  }, [typingDone])

  const handleStart = () => {
    const audioCtx = getAudioCtx(audioRef)
    playTone(audioCtx, {
      frequency: 260,
      duration: 0.12,
      volume: 0.15,
      type: 'triangle',
      filter: 1100,
    })
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
    setExiting(true)
    setTimeout(onStart, 700)
  }

  let remaining = charIdx
  const lineTexts = LINES.map(line => {
    const show = Math.min(remaining, line.text.length)
    remaining = Math.max(0, remaining - line.text.length)
    return line.text.slice(0, show)
  })

  const handleScreenClick = () => {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
    setCharIdx(0)
    setDotCount(1)
    setShowStart(false)
  }

  return (
    <div onClick={handleScreenClick} style={{
      position: 'fixed',
      inset: 0,
      background: '#F5F0E8',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      padding: '3.5vh 0 32px',
      zIndex: 1000,
      transform: exiting ? 'translateY(-100%)' : 'translateY(0)',
      transition: exiting ? 'transform 0.7s cubic-bezier(0.76, 0, 0.24, 1)' : 'none',
      pointerEvents: exiting ? 'none' : 'auto',
    }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {BG_DOTS.map(dot => (
          <span
            key={dot.id}
            style={{
              position: 'absolute',
              left: dot.left,
              top: dot.top,
              width: dot.size,
              height: dot.size,
              borderRadius: '50%',
              background: '#8B2020',
              opacity: visibleDots.includes(dot.id) ? 1 : 0,
              transition: 'none',
            }}
          />
        ))}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Text block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%' }}>
          {LINES.map((line, i) => (
            <div key={i} style={{ paddingLeft: line.indent, lineHeight: 0.9 }}>
              <span style={{
                fontSize: SIZE,
                fontFamily: FONT,
                color: '#8B2020',
                display: 'inline-block',
                fontWeight: 150,
                fontVariationSettings: "'wght' 150",
                letterSpacing: -6,
              }}>
                {lineTexts[i]}
                {i === 2 && (
                  <span style={{
                    fontSize: '1.08em',
                    fontWeight: 130,
                    fontVariationSettings: "'wght' 130",
                    letterSpacing: -20,
                    marginLeft: '0.08em',
                  }}>
                    {typingDone ? '.'.repeat(dotCount) : ''}
                  </span>
                )}
                &nbsp;
              </span>
            </div>
          ))}
        </div>

        {/* Start button */}
        <div style={{ textAlign: 'center', marginTop: '54px' }}>
          <button
            onClick={e => { e.stopPropagation(); handleStart() }}
            onMouseEnter={() => setHoverStart(true)}
            onMouseLeave={() => setHoverStart(false)}
            disabled={!showStart}
            style={{
              opacity: showStart ? 1 : 0,
              transform: showStart ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.45s, transform 0.45s, background 0.15s, color 0.15s',
              padding: '13px 48px',
              background: hoverStart && showStart ? '#8B2020' : 'transparent',
              color: hoverStart && showStart ? '#F5F0E8' : '#8B2020',
              border: '2px solid #8B2020',
              borderRadius: 6,
              fontSize: 20,
              fontWeight: 600,
              cursor: showStart ? 'pointer' : 'default',
              fontFamily: "'Avara', serif",
              letterSpacing: 2,
              pointerEvents: showStart ? 'auto' : 'none',
            }}
          >
            start
          </button>
        </div>
      </div>
    </div>
  )
}
