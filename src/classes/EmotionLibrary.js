import { EMOTION_PATTERNS } from '../data/emotionPatterns.js'
import { EMOTION_WORDS, resolveEmotion, isFiller } from './EmotionWords.js'
import { fitPatternToCols } from '../config/punchCard.js'

// Re-export so existing imports from EmotionLibrary still work
export { EMOTION_WORDS, FILLER_WORDS } from './EmotionWords.js'

export class EmotionLibrary {
  constructor(patterns = EMOTION_PATTERNS) {
    /** @type {Map<string, boolean[][]>} */
    this.patterns = new Map(
      Object.entries(patterns).map(([word, rows]) => [
        word,
        fitPatternToCols(rows),
      ])
    )
  }

  getPattern(word) {
    return this.patterns.get(word) || null
  }

  setPattern(word, pattern) {
    this.patterns.set(word, fitPatternToCols(pattern))
  }

  /** @param {string} word @returns {boolean} */
  isEmotion(word) {
    return EMOTION_WORDS.includes(word)
  }

  /** @param {string} word @returns {boolean} */
  isFiller(word) {
    return isFiller(word)
  }

  /**
   * Returns the canonical emotion for a word (including synonyms + stems), or null.
   * @param {string} word
   * @returns {string|null}
   */
  resolveEmotion(word) {
    return resolveEmotion(word)
  }

  exportAsJS() {
    const obj = {}
    for (const [word, rows] of this.patterns) {
      obj[word] = rows.map(row => row.map(v => v ? 1 : 0))
    }
    return `export const EMOTION_PATTERNS = ${JSON.stringify(obj, null, 2)}`
  }
}
