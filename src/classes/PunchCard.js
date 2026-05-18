import { HashEncoder } from './HashEncoder.js'

/**
 * @typedef {Object} RowMeta
 * @property {string} word
 * @property {'word'|'emotion'|'epsilon'} type
 * @property {'speech'|'pause'|'filler'|'manual'} source
 * @property {number} [rowIndexInPattern] - for emotion words that expand to multiple rows
 */

const hashEncoder = new HashEncoder()

export class PunchCard {
  static COLS = 18

  constructor() {
    /** @type {boolean[][]} [rowIndex][colIndex] — true = punched */
    this.grid = []
    /** @type {RowMeta[]} one entry per row */
    this.rowMeta = []
  }

  /**
   * Builds a PunchCard from a Token array.
   * - 'word' tokens → 18-bit hash pattern (one row)
   * - 'emotion' tokens → emotionLibrary pattern (one or more rows)
   * - 'epsilon' tokens → all-false row (blank)
   * @param {import('./Tokenizer.js').Token[]} tokens
   * @param {import('./EmotionLibrary.js').EmotionLibrary} emotionLibrary
   * @param {number} tension - 1–5
   * @returns {PunchCard}
   */
  static fromTokens(tokens, emotionLibrary, tension) {
    const card = new PunchCard()

    for (const token of tokens) {
      if (token.type === 'word') {
        card.grid.push(hashEncoder.encode(token.word, tension))
        card.rowMeta.push({ word: token.word, type: 'word', source: token.source })

      } else if (token.type === 'emotion') {
        const patterns = emotionLibrary.getPattern(token.word)
        const intensity = token.intensity || 1
        if (patterns && patterns.length > 0) {
          for (let rep = 0; rep < intensity; rep++) {
            patterns.forEach((row, rowIndex) => {
              const finalRow = rep === 0
                ? [...row]
                : row.map((v, ci) => v || (hashEncoder.encode(token.word + rep, tension)[ci] && ci % 4 === rep % 4))
              card.grid.push(finalRow)
              card.rowMeta.push({ word: token.word, type: 'emotion', source: token.source, rowIndexInPattern: rowIndex, repetition: rep })
            })
          }
        } else {
          for (let rep = 0; rep < intensity; rep++) {
            card.grid.push(hashEncoder.encode(token.word, tension))
            card.rowMeta.push({ word: token.word, type: 'emotion', source: token.source, rowIndexInPattern: 0, repetition: rep })
          }
        }

      } else if (token.type === 'epsilon') {
        card.grid.push(Array(PunchCard.COLS).fill(false))
        card.rowMeta.push({ word: token.word || 'ε', type: 'epsilon', source: token.source })
      }
    }

    return card
  }

  /** @param {number} index @returns {boolean[]} */
  getRow(index) {
    return this.grid[index]
  }

  /** @returns {number} */
  totalRows() {
    return this.grid.length
  }

  /** @returns {PunchCard} */
  clone() {
    const card = new PunchCard()
    card.grid = this.grid.map(row => [...row])
    card.rowMeta = this.rowMeta.map(m => ({ ...m }))
    return card
  }
}
