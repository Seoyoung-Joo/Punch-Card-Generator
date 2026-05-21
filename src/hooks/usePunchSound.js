import { useRef, useCallback } from 'react'

function getAudioCtx(ref) {
  if (!ref.current) {
    ref.current = new (window.AudioContext || window.webkitAudioContext)()
  }
  return ref.current
}

function playRowNote(audioCtx, time, punchedCount, rowIndex, cols = 24) {
  const duration = 0.09
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  const filter = audioCtx.createBiquadFilter()

  const scale = [0, 3, 5, 7, 10]
  const semitone = scale[rowIndex % scale.length] + Math.floor(rowIndex / scale.length) * 12
  const base = 220
  const densityLift = Math.min(punchedCount, 12) * 3
  const freq = base * Math.pow(2, semitone / 12) + densityLift

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(freq, time)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(1900, time)
  filter.frequency.exponentialRampToValueAtTime(520, time + duration)

  const volume = 0.18 + Math.min(punchedCount / cols, 1) * 0.22
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(time)
  osc.stop(time + duration + 0.01)
}

/**
 * Returns a function that plays short typewriter-like notes for newly added rows.
 * Rows with more holes play slightly brighter and louder.
 */
export function usePunchSound() {
  const ctxRef = useRef(null)

  const play = useCallback((card, startRow = 0) => {
    if (!card || card.totalRows() === 0) return

    const audioCtx = getAudioCtx(ctxRef)

    // Resume context if it was suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }

    const rowInterval = 0.085
    const now = audioCtx.currentTime + 0.02

    const totalRows = card.totalRows()
    for (let ri = Math.max(0, startRow); ri < totalRows; ri++) {
      const row = card.getRow(ri)
      const punchedCount = row.filter(Boolean).length
      if (punchedCount === 0) continue // silent for epsilon rows

      const t = now + (ri - startRow) * rowInterval
      playRowNote(audioCtx, t, punchedCount, ri, row.length || card.cols || 24)
    }
  }, [])

  return play
}
