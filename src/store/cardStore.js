import { create } from 'zustand'
import { PunchCard } from '../classes/PunchCard.js'
import { Tokenizer } from '../classes/Tokenizer.js'
import { EmotionLibrary } from '../classes/EmotionLibrary.js'
import { useEmotionStore } from './emotionStore.js'
import {
  applyEpsilonAfterEmotion,
  insertManualEpsilon,
  removeEpsilon,
  shuffleWords,
  insertAudioEmotion,
} from '../classes/TokenEditor.js'

const classifierLibrary = new EmotionLibrary()
const tokenizer = new Tokenizer(classifierLibrary)

function buildLibrary() {
  const patterns = useEmotionStore.getState().patterns
  return new EmotionLibrary(patterns)
}

function buildClaudeLibrary() {
  const claudePatterns = useEmotionStore.getState().claudePatterns
  return new EmotionLibrary(claudePatterns)
}

function buildCard(tokens, tension) {
  return PunchCard.fromTokens(tokens, buildLibrary(), tension, buildClaudeLibrary())
}

export const useCardStore = create((set, get) => ({
  /** @type {import('../classes/Tokenizer.js').Token[]} */
  tokens: [],
  /** @type {PunchCard|null} */
  card: null,
  tension: 3,
  isRecording: false,
  isTranscribing: false,
  rawTranscript: '',
  epsilonAfterEmotion: true,
  gridColor: '#8B2020',
  repeatCount: 1,

  setIsRecording: (v) => set({ isRecording: v }),
  setRepeatCount: (n) => set({ repeatCount: n }),
  setIsTranscribing: (v) => set({ isTranscribing: v }),
  setRawTranscript: (t) => set({ rawTranscript: t }),
  setGridColor: (c) => set({ gridColor: c }),

  setEpsilonAfterEmotion: (v) => {
    set({ epsilonAfterEmotion: v })
    const { tokens, tension } = get()
    if (tokens.length > 0) {
      const rawTokens = tokens.filter(t => t.source !== 'emotion-break')
      const expanded = applyEpsilonAfterEmotion(rawTokens, v)
      set({ tokens: expanded, card: buildCard(expanded, tension) })
    }
  },

  setTension: (n) => {
    set({ tension: n })
    const { tokens } = get()
    if (tokens.length > 0) set({ card: buildCard(tokens, n) })
  },

  processText: (transcript) => {
    const { tension, epsilonAfterEmotion } = get()
    let tokens = tokenizer.tokenize(transcript)
    tokens = applyEpsilonAfterEmotion(tokens, epsilonAfterEmotion)
    const card = buildCard(tokens, tension)
    set({ tokens, card, rawTranscript: transcript })
  },

  processTextWithEmotion: (transcript, emotionWord, phrase) => {
    const { tension, epsilonAfterEmotion } = get()
    let tokens = tokenizer.tokenize(transcript)
    if (emotionWord) {
      tokens = insertAudioEmotion(tokens, emotionWord, phrase)
    }
    tokens = applyEpsilonAfterEmotion(tokens, epsilonAfterEmotion)
    const card = buildCard(tokens, tension)
    set({ tokens, card, rawTranscript: transcript })
  },

  rebuildCard: () => {
    const { tokens, tension } = get()
    if (tokens.length > 0) set({ card: buildCard(tokens, tension) })
  },

  insertEpsilonAt: (index) => {
    const { tokens, tension } = get()
    const updated = insertManualEpsilon(tokens, index)
    set({ tokens: updated, card: buildCard(updated, tension) })
  },

  removeEpsilonAt: (index) => {
    const { tokens, tension } = get()
    const updated = removeEpsilon(tokens, index)
    set({ tokens: updated, card: buildCard(updated, tension) })
  },

  shuffleCard: () => {
    const { tokens, tension } = get()
    if (tokens.length === 0) return
    const seed = Math.floor(Math.random() * 0xFFFFFFFF)
    const shuffled = shuffleWords(tokens, seed)
    set({ tokens: shuffled, card: buildCard(shuffled, tension) })
  },

  injectAudioEmotion: (emotionWord, phrase) => {
    const { tokens, tension } = get()
    const updated = insertAudioEmotion(tokens, emotionWord, phrase)
    set({ tokens: updated, card: buildCard(updated, tension) })
  },

  resetCard: () => set({ tokens: [], card: null, rawTranscript: '' }),
}))
