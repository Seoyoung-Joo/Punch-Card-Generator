/**
 * Wraps the Web Speech API into a clean class.
 * Preserves punctuation in transcripts (Chrome adds . ? ! automatically).
 * Handles continuous mode + auto-restart on session end.
 */
export class SpeechRecognizer {
  /**
   * @param {{ onFinal, onInterim, onStop, onError, silenceMs?: number }} callbacks
   */
  constructor({ onFinal, onInterim, onStop, onError, silenceMs = 10000 } = {}) {
    this.onFinal   = onFinal   || (() => {})
    this.onInterim = onInterim || (() => {})
    this.onStop    = onStop    || (() => {})
    this.onError   = onError   || (() => {})

    this.supported   = false
    this._active     = false
    this._finalText  = ''
    this._interimText = ''
    this._liveText   = ''
    this._rec        = null
    this._silenceMs  = silenceMs
    this._silenceTimer = null

    this._init()
  }

  _clearSilenceTimer() {
    if (this._silenceTimer) {
      clearTimeout(this._silenceTimer)
      this._silenceTimer = null
    }
  }

  _resetSilenceTimer() {
    this._clearSilenceTimer()
    if (!this._active || !this._silenceMs) return
    this._silenceTimer = setTimeout(() => {
      this.stop()
    }, this._silenceMs)
  }

  _init() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    this.supported = true

    const rec = new SR()
    rec.continuous     = true
    rec.interimResults = true
    rec.lang           = 'en-US'

    rec.onresult = (e) => {
      let newFinal = ''
      let interim  = ''

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript  // punctuation preserved
        if (e.results[i].isFinal) newFinal += text + ' '
        else interim += text
      }

      if (newFinal) {
        this._finalText = (this._finalText + ' ' + newFinal).trim()
        this.onFinal(this._finalText)
      }

      this._interimText = interim.trim()
      this._liveText = [this._finalText, this._interimText].filter(Boolean).join(' ').trim()
      this.onInterim(this._interimText, this._liveText)

      if (newFinal || interim) {
        this._resetSilenceTimer()
      }
    }

    rec.onend = () => {
      if (this._active) {
        setTimeout(() => { try { rec.start() } catch (_) {} }, 100)
      } else {
        this._clearSilenceTimer()
        this.onStop(this._liveText || this._finalText)
      }
    }

    rec.onerror = (e) => {
      if (e.error !== 'aborted') {
        this._active = false
        this._clearSilenceTimer()
        this.onError(e.error)
      }
    }

    this._rec = rec
  }

  start() {
    if (!this.supported || this._active) return
    this._active    = true
    this._finalText = ''
    this._interimText = ''
    this._liveText = ''
    this._resetSilenceTimer()
    try { this._rec.start() } catch (_) {}
  }

  stop() {
    if (!this._active) return
    this._active = false
    this._clearSilenceTimer()
    try { this._rec.stop() } catch (_) {}
  }

  get transcript() { return this._finalText }
}

/**
 * Extracts punctuation signals from a transcript for emotion/intensity hints.
 * @param {string} text
 * @returns {{ exclamations: number, questions: number, ellipsis: boolean }}
 */
export function extractPunctuationSignals(text) {
  return {
    exclamations: (text.match(/!/g) || []).length,
    questions:    (text.match(/\?/g) || []).length,
    ellipsis:     /\.{2,}|…/.test(text),
  }
}
