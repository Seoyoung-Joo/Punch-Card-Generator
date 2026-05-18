/**
 * Seeded PRNG (mulberry32) — same seed always produces the same sequence.
 * @param {number} seed
 * @returns {() => number}
 */
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class PrivacyEncoder {
  /**
   * Pass-through — tension is consumed by HashEncoder inside PunchCard.fromTokens.
   * @param {import('./Tokenizer.js').Token[]} tokens
   * @param {number} tension
   * @returns {import('./Tokenizer.js').Token[]}
   */
  applyTension(tokens, tension) {
    return tokens
  }

  /**
   * Shuffles only 'word' type tokens among themselves.
   * Emotion tokens and epsilon tokens stay fixed in their original positions.
   * Same seed always produces the same result.
   * @param {import('./Tokenizer.js').Token[]} tokens
   * @param {number} seed
   * @returns {import('./Tokenizer.js').Token[]}
   */
  shuffleRows(tokens, seed) {
    const rand = mulberry32(seed)

    // Collect the indices of regular 'word' tokens only
    const wordIndices = tokens.reduce((acc, t, i) => {
      if (t.type === 'word') acc.push(i)
      return acc
    }, [])

    // Extract and shuffle those word tokens
    const wordValues = wordIndices.map(i => tokens[i])
    for (let j = wordValues.length - 1; j > 0; j--) {
      const k = Math.floor(rand() * (j + 1))
      ;[wordValues[j], wordValues[k]] = [wordValues[k], wordValues[j]]
    }

    // Reconstruct: put shuffled words back at the word positions
    const result = [...tokens]
    wordIndices.forEach((idx, i) => { result[idx] = wordValues[i] })
    return result
  }

  /**
   * Inserts a manual ε token after the given index.
   * @param {import('./Tokenizer.js').Token[]} tokens
   * @param {number} afterIndex
   * @returns {import('./Tokenizer.js').Token[]}
   */
  insertManualEpsilon(tokens, afterIndex) {
    const updated = [...tokens]
    updated.splice(afterIndex + 1, 0, { word: 'ε', type: 'epsilon', source: 'manual' })
    return updated
  }

  /**
   * Removes the token at the given index only if it is type 'epsilon'.
   * @param {import('./Tokenizer.js').Token[]} tokens
   * @param {number} index
   * @returns {import('./Tokenizer.js').Token[]}
   */
  removeEpsilon(tokens, index) {
    if (tokens[index]?.type !== 'epsilon') return tokens
    return tokens.filter((_, i) => i !== index)
  }
}
