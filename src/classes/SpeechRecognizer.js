/**
 * Wraps the Web Speech API into a clean class.
 * Preserves punctuation in transcripts (Chrome adds . ? ! automatically).
 * Handles continuous mode + auto-restart on session end.
 */
export class SpeechRecognizer {
  /**
   * @param {{ onFinal, onInterim, onStop, onError }} callbacks
   */
  constructor({ onFinal, onInterim, onStop, onError } = {}) {
    this.onFinal   = onFinal   || (() => {})
    this.onInterim = onInterim || (() => {})
    this.onStop    = onStop    || (() => {})
    this.onError   = onError   || (() => {})

    this.supported   = false
    this._active     = false
    this._finalText  = ''
    this._rec        = null

    this._init()
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
      this.onInterim(interim)
    }

    rec.onend = () => {
      if (this._active) {
        setTimeout(() => { try { rec.start() } catch (_) {} }, 100)
      } else {
        this.onStop(this._finalText)
      }
    }

    rec.onerror = (e) => {
      if (e.error !== 'aborted') {
        this._active = false
        this.onError(e.error)
      }
    }

    this._rec = rec
  }

  start() {
    if (!this.supported || this._active) return
    this._active    = true
    this._finalText = ''
    try { this._rec.start() } catch (_) {}
  }

  stop() {
    if (!this._active) return
    this._active = false
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
