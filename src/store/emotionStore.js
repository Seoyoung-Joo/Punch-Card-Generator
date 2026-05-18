import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EMOTION_PATTERNS } from '../data/emotionPatterns.js'

const DEFAULT_PATTERNS = Object.fromEntries(
  Object.entries(EMOTION_PATTERNS).map(([word, rows]) => [
    word,
    rows.map(row => row.map(v => !!v)),
  ])
)

export const useEmotionStore = create(
  persist(
    (set, get) => ({
      /** @type {Record<string, boolean[][]>} word → rows of 18 booleans */
      patterns: DEFAULT_PATTERNS,

      /**
       * Saves a user-designed pattern for an emotion word.
       * @param {string} word
       * @param {boolean[][]} pattern
       */
      setPattern: (word, pattern) =>
        set(state => ({ patterns: { ...state.patterns, [word]: pattern } })),

      /**
       * @param {string} word
       * @returns {boolean[][]|null}
       */
      getPattern: (word) => get().patterns[word] || null,

      /**
       * Resets all patterns back to the built-in defaults.
       */
      resetPatterns: () => set({ patterns: DEFAULT_PATTERNS }),

      /**
       * Returns all patterns as JSON string.
       * @returns {string}
       */
      exportPatterns: () => JSON.stringify(get().patterns, null, 2),
    }),
    {
      name: 'secretpunchcards-emotion-patterns-v2',
      // Only persist the patterns map, not derived state
      partialize: (state) => ({ patterns: state.patterns }),
    }
  )
)
