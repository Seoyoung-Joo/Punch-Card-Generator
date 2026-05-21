import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const EMOTION_WORDS = [
  'love', 'hate', 'scared', 'sad', 'angry', 'lonely', 'hurt', 'lost',
  'tired', 'sorry', 'miss', 'shame', 'grief', 'numb', 'rage', 'joy',
  'hope', 'fear', 'anxious', 'proud', 'jealous', 'guilty', 'empty', 'alive',
]

const SYSTEM = `You are encoding the emotional core of a sentence into a physical punch card.

Find the ONE emotion that resonates most deeply, and identify the 1-3 word phrase in the sentence where that emotion peaks.

Reply in exactly this format:
emotion: <one word>
phrase: <1-3 words from the sentence>

Only use "none" as the emotion if the sentence is purely factual with no emotional undertone.
Choose based on the feeling and meaning, not just keywords.`

const promptFor = (text) =>
  `Available emotion words:\n` +
  `${EMOTION_WORDS.join(', ')}\n\n` +
  `Examples:\n` +
  `- "I kind of regret that" -> emotion: guilty | phrase: regret that\n` +
  `- "everything feels pointless" -> emotion: lost | phrase: feels pointless\n` +
  `- "i just want to go home" -> emotion: lonely | phrase: go home\n` +
  `- "I don't even care anymore" -> emotion: numb | phrase: don't care\n` +
  `- "I haven't slept in days" -> emotion: tired | phrase: slept in days\n` +
  `- "nobody understands me" -> emotion: lonely | phrase: nobody understands\n` +
  `- "this is going to be the last time" -> emotion: lost | phrase: last time\n` +
  `- "I finally did it" -> emotion: proud | phrase: finally did\n\n` +
  `Sentence: "${text}"`

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function parseClaudeText(text) {
  const raw = String(text || '').toLowerCase()
  const emotionMatch = raw.match(/emotion:\s*([a-z]+)/)
  const phraseMatch = raw.match(/phrase:\s*(.+)/)
  const word = emotionMatch?.[1]?.trim() || ''
  const phrase = phraseMatch?.[1]?.trim() || null

  return {
    emotion: word && word !== 'none' ? word : null,
    phrase,
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const anthropicKey = env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_KEY
  const anthropicModel = env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001'

  return {
    base: './',
    plugins: [
      react(),
      {
        name: 'anthropic-emotion-api',
        configureServer(server) {
          server.middlewares.use('/api/classify-emotion', async (req, res) => {
            if (req.method !== 'POST') {
              sendJson(res, 405, { error: 'method not allowed' })
              return
            }

            if (!anthropicKey) {
              sendJson(res, 503, { error: 'missing ANTHROPIC_API_KEY' })
              return
            }

            try {
              const { text } = await readJsonBody(req)
              if (!text?.trim()) {
                sendJson(res, 200, { emotion: null, phrase: null, source: 'claude' })
                return
              }

              const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': anthropicKey,
                  'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                  model: anthropicModel,
                  max_tokens: 80,
                  system: SYSTEM,
                  messages: [{ role: 'user', content: promptFor(text) }],
                }),
              })

              if (!claudeRes.ok) {
                const detail = await claudeRes.text()
                sendJson(res, claudeRes.status, { error: 'claude request failed', detail })
                return
              }

              const data = await claudeRes.json()
              const parsed = parseClaudeText(data.content?.[0]?.text)
              sendJson(res, 200, { ...parsed, source: 'claude' })
            } catch (error) {
              sendJson(res, 500, { error: error.message || 'emotion detection failed' })
            }
          })
        },
      },
    ],
  }
})
