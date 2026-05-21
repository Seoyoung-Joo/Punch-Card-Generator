import { PUNCH_COLS } from '../config/punchCard.js'

export class HashEncoder {
  /**
   * Converts a word + tension level into a fixed-width boolean pattern.
   * Same word + same tension always returns the same pattern (deterministic).
   * @param {string} word
   * @param {number} tension - 1–5
   * @param {number} [cols]
   * @returns {boolean[]}
   */
  encode(word, tension, cols = PUNCH_COLS) {
    const hash = this.djb2(word)
    const key = this.tensionKey(tension)
    const combined = hash ^ key
    return Array.from({ length: cols }, (_, i) => Boolean((combined >> i) & 1))
  }

  /**
   * Classic djb2 hash function.
   * @param {string} word
   * @returns {number}
   */
  djb2(word) {
    let h = 5381
    for (let i = 0; i < word.length; i++) {
      h = ((h << 5) + h + word.charCodeAt(i)) & 0xFFFFFF
    }
    return h
  }

  /**
   * Derives a key from tension (1–5) for XOR mixing.
   * @param {number} tension
   * @returns {number}
   */
  tensionKey(tension) {
    return (tension * 0x9e3779b9) & 0xFFFFFF
  }
}
