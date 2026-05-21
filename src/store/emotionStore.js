import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EMOTION_PATTERNS } from '../data/emotionPatterns.js'
import { API_EMOTION_PATTERNS } from '../data/apiEmotionPatterns.js'
import { fitPatternToCols, fitRowToCols, PUNCH_COLS } from '../config/punchCard.js'

function normalizePatterns(patterns) {
  return Object.fromEntries(
    Object.entries(patterns).map(([word, rows]) => [
    word,
    fitPatternToCols(rows),
    ])
  )
}

const DEFAULT_PATTERNS = normalizePatterns(EMOTION_PATTERNS)
const DEFAULT_API_PATTERNS = normalizePatterns(API_EMOTION_PATTERNS)

function normalizeStoredPatterns(patterns) {
  return Object.fromEntries(
    Object.entries(patterns || {}).map(([word, rows]) => [
      word,
      (rows || []).map(row => {
        const boolRow = (row || []).map(v => !!v)
        const looksLikeOldCentered18 =
          boolRow.length === PUNCH_COLS
          && boolRow.slice(0, 3).every(v => !v)
          && boolRow.slice(-3).every(v => !v)

        return looksLikeOldCentered18
          ? fitRowToCols(boolRow.slice(3, -3))
          : fitRowToCols(boolRow)
      }),
    ])
  )
}

export const useEmotionStore = create(
  persist(
    (set, get) => ({
      /** @type {Record<string, boolean[][]>} word → fixed-width punch rows */
      patterns: DEFAULT_PATTERNS,
      /** @type {Record<string, boolean[][]>} API-detected emotion → fixed-width punch rows */
      claudePatterns: DEFAULT_API_PATTERNS,

      /**
       * Saves a user-designed pattern for an emotion word.
       * @param {string} word
       * @param {boolean[][]} pattern
       */
      setPattern: (word, pattern) =>
        set(state => ({ patterns: { ...state.patterns, [word]: fitPatternToCols(pattern) } })),

      /**
       * Saves a Claude-detected pattern for an emotion word.
       * @param {string} word
       * @param {boolean[][]} pattern
       */
      setClaudePattern: (word, pattern) =>
        set(state => ({ claudePatterns: { ...state.claudePatterns, [word]: fitPatternToCols(pattern) } })),

      /**
       * @param {string} word
       * @returns {boolean[][]|null}
       */
      getPattern: (word) => get().patterns[word] || null,

      /**
       * @param {string} word
       * @returns {boolean[][]|null}
       */
      getClaudePattern: (word) => get().claudePatterns[word] || null,

      /**
       * Resets all patterns back to the built-in defaults.
       */
      resetPatterns: () => set({ patterns: DEFAULT_PATTERNS, claudePatterns: DEFAULT_API_PATTERNS }),

      /**
       * Returns all patterns as JSON string.
       * @returns {string}
       */
      exportPatterns: () => JSON.stringify({
        dictionaryPatterns: get().patterns,
        claudePatterns: get().claudePatterns,
      }, null, 2),
    }),
    {
      name: 'secretpunchcards-emotion-patterns-v2',
      version: 3,
      migrate: (persistedState, version) => {
        if (version < 3) {
          const patterns = persistedState?.patterns
            ? normalizeStoredPatterns(persistedState.patterns)
            : DEFAULT_PATTERNS
          const claudePatterns = persistedState?.claudePatterns
            ? normalizeStoredPatterns(persistedState.claudePatterns)
            : DEFAULT_API_PATTERNS

          return { ...persistedState, patterns, claudePatterns }
        }
        return persistedState
      },
      partialize: (state) => ({
        patterns: state.patterns,
        claudePatterns: state.claudePatterns,
      }),
    }
  )
)
