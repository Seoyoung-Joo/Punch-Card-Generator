// Each emotion has a hand-designed visual motif (1–4 rows of 18 bits).
// Design principles: symmetry = resolved emotions, hollow = avoidant,
// dense = powerful, fading = diminishing, fragmented = broken.
// Hash blending for per-word variety happens in PunchCard.fromTokens.
export const EMOTION_PATTERNS = {

  // Two lobes converging to a full center — warmth, fullness
  love: [
    [0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0],
    [0,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
  ],

  // Aggressive dense triplets offset each row — jagged, relentless
  hate: [
    [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1],
    [0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1],
  ],

  // Contracted to edges, center hollow — flinching away
  scared: [
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0],
  ],

  // Heavy weight fading row by row — drooping
  sad: [
    [1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,0,0],
    [0,1,1,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0],
    [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
  ],

  // Full then broken underneath — overwhelming then jagged
  angry: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0],
    [1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1],
  ],

  // One hole at the far edge, then silence — isolated
  lonely: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],

  // Two bruises, slightly asymmetric — concentrated pain
  hurt: [
    [0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
    [0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0],
  ],

  // Scattered single dots across three rows — no center, no direction
  lost: [
    [0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
    [0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
  ],

  // Halfhearted alternating → sparse → silent — running out of energy
  tired: [
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],

  // Just the two corners, nothing else — tentative, apologetic
  sorry: [
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
  ],

  // Two groups at opposite edges, stepping inward — reaching across distance
  miss: [
    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0],
  ],

  // Dense block asymmetric in corner, retreating — hiding face
  shame: [
    [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],

  // Two solid walls converging row by row — closing in, heavy loss
  grief: [
    [1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
    [0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0],
    [0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0],
  ],

  // Completely blank then barely a trace — flatline with faint pulse
  numb: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0],
  ],

  // Three dense rows — two full, one with tiny breaks — overwhelming
  rage: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  ],

  // Perfect checkerboard — buoyant, balanced
  joy: [
    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
  ],

  // Small seed at center, expanding — building possibility
  hope: [
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  ],

  // Hollow center, thick edges, trembling — exposed, braced
  fear: [
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
  ],

  // Irregular rhythm, no pattern — nervous system firing randomly
  anxious: [
    [1,0,0,1,0,1,0,0,0,1,0,0,1,0,1,0,0,1],
    [0,1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,1,0],
    [0,0,1,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0],
  ],

  // Solid centered bar — upright, stable, full
  proud: [
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
  ],

  // Heavy on one side, sparse gaze toward the other — watching, wanting
  jealous: [
    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,0,1,0],
    [0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,0,1],
  ],

  // Off-center block pressing down — burden that won't lift
  guilty: [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
  ],

  // True void — nothing at all
  empty: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],

  // Placeholder — design this pattern yourself in the editor
  neutral: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],

  // Dense, varied, no dead spots — full of it
  alive: [
    [1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1],
    [0,1,1,0,1,0,1,0,1,1,0,1,0,1,0,1,1,0],
    [1,1,0,1,0,1,1,0,1,0,1,1,0,1,1,0,1,1],
  ],
}
