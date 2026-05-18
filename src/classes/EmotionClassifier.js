import { EMOTION_WORDS } from './EmotionLibrary.js'

export const DETECTABLE_EMOTIONS = new Set(EMOTION_WORDS)

const SYSTEM = `You are encoding the emotional core of a sentence into a physical punch card.

Find the ONE emotion that resonates most deeply, and identify the 1-3 word phrase in the sentence where that emotion peaks.

Reply in exactly this format (two lines):
emotion: <one word>
phrase: <1-3 words from the sentence>

Only use "none" as the emotion if the sentence is purely factual with no emotional undertone.
Choose based on the feeling and meaning, not just keywords.`

const PROMPT = (text) =>
  `Available emotion words:\n` +
  `${EMOTION_WORDS.join(', ')}\n\n` +
  `Examples:\n` +
  `- "I kind of regret that" → emotion: guilty | phrase: regret that\n` +
  `- "everything feels pointless" → emotion: lost | phrase: feels pointless\n` +
  `- "i just want to go home" → emotion: lonely | phrase: go home\n` +
  `- "I don't even care anymore" → emotion: numb | phrase: don't care\n` +
  `- "I haven't slept in days" → emotion: tired | phrase: slept in days\n` +
  `- "nobody understands me" → emotion: lonely | phrase: nobody understands\n` +
  `- "this is going to be the last time" → emotion: lost | phrase: last time\n` +
  `- "I finally did it" → emotion: proud | phrase: finally did\n\n` +
  `Sentence: "${text}"`

/**
 * Sends text to Claude Haiku and returns the detected emotion.
 * Requires ANTHROPIC_API_KEY in .env and Vite dev server proxy.
 * @param {string} text
 * @returns {Promise<{ emotion: string|null, source: 'claude'|'offline' }>}
 */
export async function classifyEmotion(text) {
  if (!text?.trim()) return { emotion: null, source: 'claude' }

  try {
    const key = import.meta.env.VITE_ANTHROPIC_KEY
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        system: SYSTEM,
        messages: [{ role: 'user', content: PROMPT(text) }],
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) throw new Error(`claude error ${res.status}`)

    const data = await res.json()
    const raw = (data.content?.[0]?.text || '').toLowerCase()

    const emotionMatch = raw.match(/emotion:\s*([a-z]+)/)
    const phraseMatch  = raw.match(/phrase:\s*(.+)/)
    const word   = emotionMatch?.[1]?.trim() || ''
    const phrase = phraseMatch?.[1]?.trim() || null

    if (!word || word === 'none') return { emotion: null, phrase: null, source: 'claude' }

    const emotion = EMOTION_WORDS.includes(word)
      ? word
      : EMOTION_WORDS.find(e => word.startsWith(e) || e.startsWith(word)) || null

    return { emotion, phrase, source: 'claude' }

  } catch {
    return { emotion: null, source: 'offline' }
  }
}
