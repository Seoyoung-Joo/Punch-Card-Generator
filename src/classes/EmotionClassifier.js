import { EMOTION_WORDS } from './EmotionLibrary.js'
import { resolveEmotion, PHRASE_EMOTIONS } from './EmotionWords.js'

export const DETECTABLE_EMOTIONS = new Set(EMOTION_WORDS)

/**
 * Local fallback emotion detector for static builds and offline development.
 * @param {string} text
 * @returns {Promise<{ emotion: string|null, phrase: string|null, source: 'local' }>}
 */
async function classifyEmotionLocally(text) {
  if (!text?.trim()) return { emotion: null, phrase: null, source: 'local' }

  const words = text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`
    const emotion = PHRASE_EMOTIONS[bigram]
    if (emotion) {
      return { emotion, phrase: bigram, source: 'local' }
    }
  }

  for (let i = 0; i < words.length; i++) {
    const emotion = resolveEmotion(words[i])
    if (emotion) {
      const phrase = words.slice(Math.max(0, i - 1), Math.min(words.length, i + 2)).join(' ')
      return { emotion, phrase, source: 'local' }
    }
  }

  return { emotion: null, phrase: null, source: 'local' }
}

/**
 * Sends text to the local server-side Claude proxy, then falls back to local matching.
 * The browser never receives or reads the Anthropic API key.
 * @param {string} text
 * @returns {Promise<{ emotion: string|null, phrase: string|null, source: 'claude'|'local' }>}
 */
export async function classifyEmotion(text) {
  if (!text?.trim()) return { emotion: null, phrase: null, source: 'local' }

  try {
    const res = await fetch('/api/classify-emotion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(15000),
    })

    if (res.ok) {
      const data = await res.json()
      const word = data.emotion?.toLowerCase?.() || null
      const emotion = word && EMOTION_WORDS.includes(word)
        ? word
        : EMOTION_WORDS.find(e => word?.startsWith(e) || e.startsWith(word)) || null

      return {
        emotion,
        phrase: data.phrase || null,
        source: 'claude',
      }
    }
  } catch {
    // Static GitHub Pages builds do not have the local Claude proxy.
  }

  return classifyEmotionLocally(text)
}
