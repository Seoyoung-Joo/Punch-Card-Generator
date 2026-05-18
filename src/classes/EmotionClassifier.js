import { EMOTION_WORDS } from './EmotionLibrary.js'
import { resolveEmotion } from './EmotionWords.js'

export const DETECTABLE_EMOTIONS = new Set(EMOTION_WORDS)

/**
 * Public-safe emotion detector for the web demo.
 * The private Claude API prototype should run server-side only, never with a browser-exposed key.
 * @param {string} text
 * @returns {Promise<{ emotion: string|null, phrase: string|null, source: 'local' }>}
 */
export async function classifyEmotion(text) {
  if (!text?.trim()) return { emotion: null, phrase: null, source: 'local' }

  const words = text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  for (let i = 0; i < words.length; i++) {
    const emotion = resolveEmotion(words[i])
    if (emotion) {
      const phrase = words.slice(Math.max(0, i - 1), Math.min(words.length, i + 2)).join(' ')
      return { emotion, phrase, source: 'local' }
    }
  }

  return { emotion: null, phrase: null, source: 'local' }
}
