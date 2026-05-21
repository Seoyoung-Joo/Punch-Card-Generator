export const EMOTION_WORDS = [
  'love', 'hate', 'scared', 'sad', 'angry', 'lonely', 'hurt', 'lost',
  'tired', 'sorry', 'miss', 'shame', 'grief', 'numb', 'rage', 'joy',
  'hope', 'fear', 'anxious', 'proud', 'jealous', 'guilty', 'empty', 'alive',
]

export const FILLER_WORDS = [
  'like', 'just', 'um', 'uh', 'actually', 'so', 'really', 'very', 'quite', 'maybe',
]

export const EMOTION_SYNONYMS = {
  love:    ['obsessed', 'adore', 'crush', 'smitten', 'devoted', 'fond', 'attached', 'care', 'caring', 'soft', 'sweet', 'butterflies', 'romantic', 'falling', 'infatuated', 'dreamy', 'hooked', 'heart', 'cute', 'cherish', 'favorite', 'warm'],
  hate:    ['despise', 'disgusted', 'gross', 'loathe', 'annoying', 'irritating', 'horrible', 'toxic', 'repulsed', 'bitter', 'resentful', 'resent', 'unbearable', 'awful', 'terrible', 'dreadful', 'ugh', 'ew', 'sick', 'nasty', 'overit'],
  scared:  ['terrified', 'freaked', 'shaking', 'panicking', 'spooked', 'paranoid', 'jumpy', 'rattled', 'shook', 'trembling', 'dreading', 'unsafe', 'creeped', 'tense', 'frozen', 'helpless', 'vulnerable', 'panic', 'horrified', 'petrified', 'startled'],
  sad:     ['upset', 'unhappy', 'depressed', 'crying', 'gloomy', 'heartbroken', 'devastated', 'miserable', 'crushed', 'broken', 'low', 'heavy', 'tearful', 'dark', 'down', 'rough', 'blue', 'hopeless', 'hurting', 'struggling', 'bummed', 'sucks'],
  angry:   ['mad', 'pissed', 'frustrated', 'annoyed', 'furious', 'irritated', 'fuming', 'livid', 'agitated', 'aggravated', 'heated', 'triggered', 'offended', 'bothered', 'snapped', 'exploded', 'seething', 'outraged', 'raging', 'ticked', 'upset'],
  lonely:  ['alone', 'isolated', 'ignored', 'forgotten', 'invisible', 'excluded', 'unwanted', 'rejected', 'abandoned', 'distant', 'disconnected', 'outsider', 'separated', 'hollow', 'stranded', 'solitary', 'overlooked', 'unnoticed', 'unloved', 'adrift'],
  hurt:    ['pained', 'wounded', 'bruised', 'betrayed', 'stung', 'crushed', 'broken', 'shattered', 'wronged', 'mistreated', 'used', 'disrespected', 'dismissed', 'abandoned', 'lied', 'cheated', 'backstabbed', 'blindsided', 'gutted'],
  lost:    ['confused', 'stuck', 'unsure', 'clueless', 'blank', 'wandering', 'searching', 'uncertain', 'aimless', 'scattered', 'overwhelmed', 'dazed', 'spinning', 'idk', 'directionless', 'hopeless', 'stranded', 'helpless', 'nowhere', 'unmoored'],
  tired:   ['exhausted', 'drained', 'sleepy', 'burnt', 'spent', 'wiped', 'worn', 'sluggish', 'dragging', 'slow', 'blah', 'meh', 'depleted', 'checked', 'lifeless', 'fatigued', 'beat', 'dead', 'overworked', 'done', 'sleep', 'sick'],
  sorry:   ['regret', 'regretful', 'apologize', 'messed', 'mistake', 'ashamed', 'oops', 'apologizing', 'embarrassed', 'remorse', 'screwed', 'blew', 'wronged', 'failed', 'ruined', 'broke', 'damaged', 'harmed', 'caused'],
  miss:    ['wishing', 'homesick', 'nostalgic', 'remember', 'remembered', 'reminiscing', 'dreaming', 'longing', 'wished', 'replaying', 'craving', 'aching', 'yearning', 'pining', 'wanting', 'memories', 'memory', 'missed'],
  shame:   ['embarrassed', 'humiliated', 'mortified', 'judged', 'exposed', 'awkward', 'cringe', 'cringed', 'ridiculous', 'stupid', 'dumb', 'pathetic', 'worthless', 'useless', 'failure', 'laughed', 'mocked', 'belittled', 'small', 'inferior'],
  grief:   ['mourning', 'grieving', 'loss', 'died', 'dead', 'gone', 'heartache', 'devastated', 'shattered', 'weeping', 'sobbing', 'crying', 'aching', 'suffering', 'agony', 'tragedy', 'traumatized', 'bereaved', 'wrecked'],
  numb:    ['nothing', 'blank', 'whatever', 'flat', 'hollow', 'disconnected', 'zoned', 'spaced', 'absent', 'shutdown', 'cold', 'robotic', 'autopilot', 'distant', 'detached', 'indifferent', 'apathetic', 'checked', 'vacant', 'emptyish'],
  rage:    ['exploding', 'screaming', 'snapped', 'furious', 'violent', 'explosive', 'flipping', 'wild', 'raging', 'boiling', 'uncontrollable', 'losing', 'fire', 'unhinged', 'berserk', 'irate', 'seething'],
  joy:     ['happy', 'excited', 'amazing', 'awesome', 'cool', 'wonderful', 'fantastic', 'pumped', 'stoked', 'thrilled', 'glad', 'pleased', 'delighted', 'cheerful', 'upbeat', 'grinning', 'laughing', 'beaming', 'great', 'good', 'yay', 'nice', 'fun'],
  hope:    ['hopefully', 'wishing', 'positive', 'optimistic', 'believe', 'possible', 'someday', 'eventually', 'praying', 'manifesting', 'trusting', 'anticipating', 'forward', 'better', 'brighter', 'improving', 'healing', 'rising'],
  fear:    ['terrified', 'scared', 'dreading', 'worried', 'panicking', 'afraid', 'freaked', 'paranoid', 'unsafe', 'threatened', 'shaking', 'avoiding', 'hiding', 'dreads', 'phobia', 'nervous', 'fearing', 'alarmed', 'uneasy'],
  anxious: ['stressed', 'worried', 'overthinking', 'nervous', 'tense', 'panicking', 'spiraling', 'restless', 'jittery', 'uneasy', 'agitated', 'racing', 'ruminating', 'obsessing', 'fixating', 'dreading', 'twitchy', 'stress'],
  proud:   ['accomplished', 'succeeded', 'won', 'achieved', 'satisfied', 'confident', 'strong', 'capable', 'validated', 'recognized', 'nailed', 'crushed', 'earned', 'worked', 'deserved', 'fulfilled', 'empowered'],
  jealous: ['envious', 'envy', 'comparing', 'insecure', 'replaced', 'overlooked', 'inferior', 'inadequate', 'competitive', 'possessive', 'suspicious', 'threatened', 'bitter', 'resentful', 'second', 'behind', 'sidelined', 'passed'],
  guilty:  ['regret', 'wrong', 'responsible', 'caused', 'blaming', 'screwed', 'ruined', 'hurt', 'failed', 'mistake', 'fault', 'burden', 'haunted', 'carrying', 'tormented', 'confessing', 'owning', 'remorse', 'ashamed'],
  empty:   ['nothing', 'hollow', 'blank', 'pointless', 'meaningless', 'void', 'flat', 'lifeless', 'robot', 'surviving', 'bare', 'gone', 'absent', 'cold', 'dark', 'missing', 'incomplete', 'unfulfilled'],
  alive:   ['free', 'awake', 'real', 'present', 'electric', 'buzzing', 'glowing', 'full', 'whole', 'powerful', 'unstoppable', 'thriving', 'energized', 'lit', 'invincible', 'vibrant', 'fierce', 'burning', 'fire', 'radiant'],
}

// Reverse map: synonym → canonical emotion
export const SYNONYM_TO_EMOTION = {}
for (const [emotion, synonyms] of Object.entries(EMOTION_SYNONYMS)) {
  for (const syn of synonyms) {
    SYNONYM_TO_EMOTION[syn] = emotion
  }
}

/**
 * Returns stem variants to try when looking up a word.
 * Handles -ing, -ed, -s, -es, -er, -ly, double-consonant roots.
 * @param {string} word
 * @returns {string[]}
 */
export function stemVariants(word) {
  const v = [word]
  const add = (w) => { if (w && w.length > 2 && !v.includes(w)) v.push(w) }

  if (word.endsWith('ing') && word.length > 5) {
    const stem = word.slice(0, -3)
    add(stem)
    add(stem + 'e')
    if (stem.length > 2 && stem.at(-1) === stem.at(-2)) add(stem.slice(0, -1))
  }
  if (word.endsWith('ed') && word.length > 4) {
    const stem = word.slice(0, -2)
    add(stem)
    add(stem + 'e')
    if (stem.length > 2 && stem.at(-1) === stem.at(-2)) add(stem.slice(0, -1))
  }
  if (word.endsWith('ies') && word.length > 4) add(word.slice(0, -3) + 'y')
  if (word.endsWith('ied') && word.length > 4) add(word.slice(0, -3) + 'y')
  if (word.endsWith('es') && word.length > 4)  add(word.slice(0, -2))
  if (word.endsWith('s')  && word.length > 3)  add(word.slice(0, -1))
  if (word.endsWith('ly') && word.length > 4) {
    const stem = word.slice(0, -2)
    add(stem)
    if (stem.endsWith('il')) add(stem.slice(0, -2) + 'y')
  }
  if (word.endsWith('er') && word.length > 4) add(word.slice(0, -2))

  return v
}

/**
 * Resolves a word (including synonyms and stems) to its canonical emotion.
 * @param {string} word - lowercased
 * @returns {string|null}
 */
export function resolveEmotion(word) {
  for (const variant of stemVariants(word)) {
    if (EMOTION_WORDS.includes(variant)) return variant
    if (SYNONYM_TO_EMOTION[variant]) return SYNONYM_TO_EMOTION[variant]
  }
  return null
}

/**
 * @param {string} word - lowercased
 * @returns {boolean}
 */
export function isFiller(word) {
  return FILLER_WORDS.includes(word)
}

// Bigram phrases where meaning depends on context — checked before word-by-word scan
export const PHRASE_EMOTIONS = {
  'freaking out':     'anxious',
  'freaking cool':    'alive',
  'freaking awesome': 'alive',
  'freaking amazing': 'joy',
  'freaking love':    'love',
  'freaking hate':    'hate',
  'so cool':          'alive',
  'so good':          'joy',
  'so happy':         'joy',
  'so sad':           'sad',
  'so tired':         'tired',
  'so done':          'numb',
  'not okay':         'hurt',
  'not fine':         'hurt',
}
