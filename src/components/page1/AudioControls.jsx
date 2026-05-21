import { useState, useRef, useEffect } from 'react'
import { useCardStore } from '../../store/cardStore.js'
import { EMOTION_WORDS } from '../../classes/EmotionLibrary.js'
import { classifyEmotion } from '../../classes/EmotionClassifier.js'
import { SpeechRecognizer } from '../../classes/SpeechRecognizer.js'

const BTN = {
  padding: '10px 22px',
  borderRadius: 40,
  border: 'none',
  fontSize: 14,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  transition: 'background 0.2s',
  fontFamily: "'Avara', serif",
}

export default function AudioControls() {
  const [value, setValue]     = useState('')
  const [interim, setInterim] = useState('')
  const [listening, setListening] = useState(false)
  const [detected, setDetected]   = useState(null)
  const [detectionSource, setDetectionSource] = useState(null)
  const [speechSupported, setSpeechSupported] = useState(false)

  const recRef = useRef(null)

  const processText            = useCardStore(s => s.processText)
  const processTextWithEmotion = useCardStore(s => s.processTextWithEmotion)
  const resetCard              = useCardStore(s => s.resetCard)

  useEffect(() => {
    const rec = new SpeechRecognizer({
      onFinal: (text) => {
        setValue(text)
        processText(text)
      },
      onInterim: (text, liveText) => {
        setInterim(text)
        if (liveText) {
          setValue(liveText)
          processText(liveText)
        }
      },
      onStop: (text) => {
        setListening(false)
        setInterim('')
        if (text) detectAndBuild(text)
      },
      onError: () => setListening(false),
    })
    recRef.current = rec
    setSpeechSupported(rec.supported)
  }, [])

  // Debounce card rebuild while typing (not while voice is active)
  useEffect(() => {
    if (!value.trim() || listening) return
    const timer = setTimeout(() => processText(value.trim()), 300)
    return () => clearTimeout(timer)
  }, [value])

  const detectAndBuild = async (text) => {
    if (!text?.trim()) return
    setDetected('thinking')
    setDetectionSource(null)
    const { emotion, phrase, source } = await classifyEmotion(text)
    processTextWithEmotion(text, emotion || null, phrase || null)
    setDetectionSource(source)
    setDetected(emotion || 'none')
  }

  const toggleListening = () => {
    const rec = recRef.current
    if (!rec?.supported) return
    if (listening) {
      rec.stop()   // onStop callback fires with final text + runs detection
    } else {
      setValue('')
      setDetected(null)
      setDetectionSource(null)
      setInterim('')
      resetCard()
      setListening(true)
      rec.start()
    }
  }

  const handleClear = () => {
    setValue('')
    resetCard()
    setDetected(null)
    setDetectionSource(null)
    setInterim('')
  }

  const handleInputChange = (e) => {
    setValue(e.target.value)
    setDetected(null)
    setDetectionSource(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      detectAndBuild(value.trim())
    }
  }

  const handleDetect = () => {
    const text = value.trim()
    if (!text) return
    detectAndBuild(text)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {speechSupported && (
          <button
            onClick={toggleListening}
            style={{ ...BTN, background: listening ? '#8B2020' : '#2C2C2C', color: '#fff' }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#fff',
              opacity: listening ? 1 : 0.4,
              animation: listening ? 'pulse 1s infinite' : 'none',
            }} />
            {listening ? 'stop' : 'speak'}
          </button>
        )}

        <input
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={speechSupported ? 'or type here…' : 'type your secret here…'}
          style={{
            padding: '10px 18px',
            borderRadius: 24,
            border: '1px solid #C8BFAD',
            fontSize: 14,
            background: '#FDF8F0',
            outline: 'none',
            flex: 1,
            maxWidth: 420,
            color: '#2C2C2C',
            fontFamily: "'Avara', serif",
          }}
        />

        {value.trim() && !listening && (
          <button
            onClick={handleDetect}
            disabled={detected === 'thinking'}
            style={{
              ...BTN,
              background: detected === 'thinking' ? '#ddd' : '#8B2020',
              color: '#fff',
              fontSize: 13,
              opacity: detected === 'thinking' ? 0.6 : 1,
            }}
          >
            {detected === 'thinking' ? 'detecting…' : 'detect →'}
          </button>
        )}

        {value && (
          <button onClick={handleClear} style={{
            padding: '8px 16px', borderRadius: 20,
            border: '1px solid #ddd', background: 'transparent',
            color: '#aaa', fontSize: 12, cursor: 'pointer',
          }}>
            clear
          </button>
        )}
      </div>

      {listening && interim && (
        <div style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic', maxWidth: 420, textAlign: 'center' }}>
          {interim}
        </div>
      )}

      {detected && (
        <div style={{
          fontSize: 11,
          fontFamily: 'monospace',
          color: detected === 'thinking' ? '#A89888'
               : detected === 'none'     ? '#A89888'
               : '#8B2020',
        }}>
          {detected === 'thinking' ? 'detecting emotion...'
         : detected === 'none'     ? 'no strong emotion detected'
         : detectionSource === 'local' ? `local emotion match → ${detected}`
         : `emotion detected → ${detected}`}
        </div>
      )}

      {!speechSupported && (
        <p style={{ fontSize: 11, color: '#bbb' }}>
          speech not supported — use Chrome or Edge for voice input
        </p>
      )}

    </div>
  )
}
