import { HashEncoder } from './HashEncoder.js'
import { PUNCH_COLS, fitRowToCols } from '../config/punchCard.js'

/**
 * @typedef {Object} RowMeta
 * @property {string} word
 * @property {'word'|'emotion'|'epsilon'} type
 * @property {'speech'|'pause'|'filler'|'manual'} source
 * @property {number} [rowIndexInPattern] - for emotion words that expand to multiple rows
 */

const hashEncoder = new HashEncoder()

export class PunchCard {
  static COLS = PUNCH_COLS

  constructor(cols = PUNCH_COLS) {
    this.cols = cols
    /** @type {boolean[][]} [rowIndex][colIndex] — true = punched */
    this.grid = []
    /** @type {RowMeta[]} one entry per row */
    this.rowMeta = []
  }

  /**
   * Builds a PunchCard from a Token array.
   * - 'word' tokens → fixed-width hash pattern (one row)
   * - 'emotion' tokens → emotionLibrary pattern (one or more rows)
   * - 'epsilon' tokens → all-false row (blank)
   * @param {import('./Tokenizer.js').Token[]} tokens
   * @param {import('./EmotionLibrary.js').EmotionLibrary} emotionLibrary
   * @param {number} tension - 1–5
   * @param {import('./EmotionLibrary.js').EmotionLibrary} [claudeEmotionLibrary]
   * @returns {PunchCard}
   */
  static fromTokens(tokens, emotionLibrary, tension, claudeEmotionLibrary = emotionLibrary) {
    const card = new PunchCard()

    for (const token of tokens) {
      if (token.type === 'word') {
        card.grid.push(hashEncoder.encode(token.word, tension, card.cols))
        card.rowMeta.push({ word: token.word, type: 'word', source: token.source })

      } else if (token.type === 'emotion') {
        const sourceLibrary = token.source === 'audio-emotion' ? claudeEmotionLibrary : emotionLibrary
        const patterns = sourceLibrary.getPattern(token.word) || emotionLibrary.getPattern(token.word)
        const intensity = token.intensity || 1
        if (patterns && patterns.length > 0) {
          for (let rep = 0; rep < intensity; rep++) {
            patterns.forEach((row, rowIndex) => {
              const fittedRow = fitRowToCols(row, card.cols)
              const finalRow = rep === 0
                ? fittedRow
                : fittedRow.map((v, ci) => v || (hashEncoder.encode(token.word + rep, tension, card.cols)[ci] && ci % 4 === rep % 4))
              card.grid.push(finalRow)
              card.rowMeta.push({ word: token.word, type: 'emotion', source: token.source, rowIndexInPattern: rowIndex, repetition: rep, original: rowIndex === 0 && rep === 0 ? token.original : undefined })
            })
          }
        } else {
          for (let rep = 0; rep < intensity; rep++) {
            card.grid.push(hashEncoder.encode(token.word, tension, card.cols))
            card.rowMeta.push({ word: token.word, type: 'emotion', source: token.source, rowIndexInPattern: 0, repetition: rep })
          }
        }

      } else if (token.type === 'epsilon') {
        card.grid.push(Array(card.cols).fill(false))
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
    const card = new PunchCard(this.cols)
    card.grid = this.grid.map(row => [...row])
    card.rowMeta = this.rowMeta.map(m => ({ ...m }))
    return card
  }
}
