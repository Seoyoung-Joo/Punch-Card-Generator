/**
 * @typedef {Object} Token
 * @property {string} word - original word, punctuation stripped, lowercased
 * @property {'word'|'emotion'|'epsilon'} type
 * @property {'speech'|'pause'|'filler'|'manual'} source
 * @property {number} [timestamp] - from Whisper, seconds
 */

export class Tokenizer {
  /** @param {import('./EmotionLibrary.js').EmotionLibrary} emotionLibrary */
  constructor(emotionLibrary) {
    this.emotionLibrary = emotionLibrary
  }

  /**
   * Converts a string into Token[].
   * Inserts ε tokens for filler words.
   * @param {string} transcript
   * @returns {Token[]}
   */
  tokenize(transcript) {
    let words, pauseIndices

    if (typeof transcript === 'string') {
      words = transcript.trim().split(/\s+/).filter(w => w.length > 0)
        .map(w => ({ word: w, start: 0, end: 0 }))
      pauseIndices = []
    } else {
      words = transcript.words
      pauseIndices = transcript.pauseIndices || []
    }

    const tokens = []

    words.forEach((wordToken, i) => {
      const clean = this.stripPunctuation(wordToken.word).toLowerCase()
      if (!clean) return

      const classification = this.classifyWord(clean)

      if (classification === 'filler') {
        tokens.push({ word: clean, type: 'epsilon', source: 'filler', timestamp: wordToken.start })
      } else if (classification === 'emotion') {
        const canonical = this.emotionLibrary.resolveEmotion(clean)
        const intensity = this.detectIntensity(wordToken.word)
        const original = canonical && canonical !== clean ? clean : undefined
        tokens.push({ word: canonical || clean, type: 'emotion', source: 'speech', timestamp: wordToken.start, intensity, original })
      } else {
        tokens.push({ word: clean, type: 'word', source: 'speech', timestamp: wordToken.start })
      }

      if (pauseIndices.includes(i)) {
        tokens.push({ word: 'ε', type: 'epsilon', source: 'pause' })
      }
    })

    return tokens
  }

  /**
   * @param {string} word - already lowercased
   * @returns {'emotion'|'filler'|'word'}
   */
  classifyWord(word) {
    if (this.emotionLibrary.resolveEmotion(word)) return 'emotion'
    if (this.emotionLibrary.isFiller(word)) return 'filler'
    return 'word'
  }

  /**
   * Detects emphasis from raw word (before punctuation stripping).
   * ! → 2, !! or ALL CAPS → 3
   * @param {string} rawWord
   * @returns {1|2|3}
   */
  detectIntensity(rawWord) {
    let intensity = 1
    const exclamations = (rawWord.match(/!/g) || []).length
    const questions    = (rawWord.match(/\?/g) || []).length
    if (exclamations >= 2) intensity = 3
    else if (exclamations >= 1) intensity = 2
    // ? signals uncertainty — softens intensity slightly but marks the word
    else if (questions >= 1) intensity = 1
    const letters = rawWord.replace(/[^a-zA-Z]/g, '')
    if (letters.length > 1 && letters === letters.toUpperCase()) {
      intensity = Math.min(3, intensity + 1)
    }
    return intensity
  }

  /**
   * Extracts sentence-level punctuation that affects emotion reading.
   * @param {string} text
   * @returns {{ exclamations: number, questions: number, ellipsis: boolean, caps: boolean }}
   */
  sentenceSignals(text) {
    return {
      exclamations: (text.match(/!/g) || []).length,
      questions:    (text.match(/\?/g) || []).length,
      ellipsis:     /\.{2,}|…/.test(text),
      caps:         text.replace(/[^a-zA-Z]/g, '').split('').filter(c => c === c.toUpperCase()).length > text.length * 0.5,
    }
  }

  /** @param {string} word @returns {string} */
  stripPunctuation(word) {
    return word.replace(/[^a-zA-Z']/g, '')
  }
}
