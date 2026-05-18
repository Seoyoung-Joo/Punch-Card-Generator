/**
 * Pure functions for manipulating token arrays.
 * No Zustand dependency — all functions take tokens and return new arrays.
 */

/**
 * Inserts or removes ε tokens after every emotion token.
 * @param {import('./Tokenizer.js').Token[]} tokens
 * @param {boolean} enabled
 * @returns {import('./Tokenizer.js').Token[]}
 */
export function applyEpsilonAfterEmotion(tokens, enabled) {
  if (!enabled) return tokens.filter(t => t.source !== 'emotion-break')
  const result = []
  tokens.forEach(t => {
    result.push(t)
    if (t.type === 'emotion') {
      result.push({ word: 'ε', type: 'epsilon', source: 'emotion-break' })
    }
  })
  return result
}

/**
 * Inserts a manual ε token after the given index.
 * @param {import('./Tokenizer.js').Token[]} tokens
 * @param {number} index
 * @returns {import('./Tokenizer.js').Token[]}
 */
export function insertManualEpsilon(tokens, index) {
  const updated = [...tokens]
  updated.splice(index + 1, 0, { word: 'ε', type: 'epsilon', source: 'manual' })
  return updated
}

/**
 * Removes the epsilon token at the given index.
 * @param {import('./Tokenizer.js').Token[]} tokens
 * @param {number} index
 * @returns {import('./Tokenizer.js').Token[]}
 */
export function removeEpsilon(tokens, index) {
  return tokens.filter((_, i) => i !== index)
}

/**
 * Shuffles word tokens in place; emotion and epsilon rows stay fixed.
 * @param {import('./Tokenizer.js').Token[]} tokens
 * @param {number} seed
 * @returns {import('./Tokenizer.js').Token[]}
 */
export function shuffleWords(tokens, seed) {
  const wordIndices = tokens.map((t, i) => (t.type === 'word' ? i : null)).filter(i => i !== null)
  const words = wordIndices.map(i => tokens[i])

  // Seeded Fisher-Yates
  let s = seed
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xFFFFFFFF; return (s >>> 0) / 0x100000000 }
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[words[i], words[j]] = [words[j], words[i]]
  }

  const result = [...tokens]
  wordIndices.forEach((idx, i) => { result[idx] = words[i] })
  return result
}

/**
 * Inserts an emotion token near the phrase peak in the token list.
 * @param {import('./Tokenizer.js').Token[]} tokens
 * @param {string|null} emotionWord
 * @param {string|null} phrase
 * @returns {import('./Tokenizer.js').Token[]}
 */
export function insertAudioEmotion(tokens, emotionWord, phrase) {
  const newToken = emotionWord
    ? { word: emotionWord, type: 'emotion', source: 'audio-emotion', intensity: 2 }
    : { word: 'neutral', type: 'emotion', source: 'audio-emotion', intensity: 1 }

  let insertAt = tokens.length
  if (phrase) {
    const phraseWords = phrase.toLowerCase().split(/\s+/)
    for (let i = 0; i < tokens.length; i++) {
      if (phraseWords.some(pw => tokens[i].word.toLowerCase().includes(pw))) {
        insertAt = i + 1
      }
    }
  }

  insertAt = Math.min(insertAt, 22)

  return [
    ...tokens.slice(0, insertAt),
    newToken,
    ...tokens.slice(insertAt),
  ]
}
