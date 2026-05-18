import { useRef, useCallback } from 'react'

function getAudioCtx(ref) {
  if (!ref.current) {
    ref.current = new (window.AudioContext || window.webkitAudioContext)()
  }
  return ref.current
}

function playPunch(audioCtx, time, punchedCount) {
  const duration = 0.045
  const bufferSize = Math.floor(audioCtx.sampleRate * duration)
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    // White noise with exponential decay envelope
    const env = Math.pow(1 - i / bufferSize, 4)
    data[i] = (Math.random() * 2 - 1) * env
  }

  const source = audioCtx.createBufferSource()
  source.buffer = buffer

  // Low bandpass gives it a "thunk" character
  const filter = audioCtx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 220 + punchedCount * 4
  filter.Q.value = 0.8

  // Gain scaled by how many holes are punched in this row
  const gain = audioCtx.createGain()
  const volume = 0.12 + Math.min(punchedCount / 18, 1) * 0.18
  gain.gain.setValueAtTime(volume, time)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(audioCtx.destination)
  source.start(time)
}

/**
 * Returns a function that plays a sequential punch sound for each row in the card.
 * Rows with more holes punch louder.
 */
export function usePunchSound() {
  const ctxRef = useRef(null)
  const timeoutsRef = useRef([])

  const play = useCallback((card) => {
    if (!card || card.totalRows() === 0) return

    // Clear any in-progress sequence
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    const audioCtx = getAudioCtx(ctxRef)

    // Resume context if it was suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }

    const rowInterval = 0.072 // seconds between row punches
    const now = audioCtx.currentTime + 0.02

    const totalRows = card.totalRows()
    for (let ri = 0; ri < totalRows; ri++) {
      const row = card.getRow(ri)
      const punchedCount = row.filter(Boolean).length
      if (punchedCount === 0) continue // silent for epsilon rows

      const t = now + ri * rowInterval
      playPunch(audioCtx, t, punchedCount)
    }
  }, [])

  return play
}
