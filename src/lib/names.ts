// Witty/punny names for the player. Mix of German + English, gender-neutral
// vibe. Designed so the user grins at the initial suggestion and feels free
// to reroll until something fits.

const NAMES = [
  'Sir Refactor',
  'Lady Lambda',
  'Doc Diff',
  'Klaus Kompiliert',
  'Mx. Monad',
  'Promptzilla',
  "Käpt'n Code",
  'Bytebär',
  'Stack Senior',
  'Big Endian',
  'Lord Loop',
  'Captain Crash',
  'Mira Migration',
  'Sven Segfault',
  'Lia Latency',
  'Pavel Pointer',
  'Race Condition',
  'YAML Yoda',
  'Senior Junior',
  'Rubber Duck',
  'Hertha Heap',
  'Karli Kernel',
  'Frau Linter',
  'Don Diff',
  'Bug Wizard',
  'Hot Reload',
  'Toastmeister',
  'Ada Loveless',
  'Captain Hook',
  'Tina Throw',
  'Eddie Edge-Case',
  'Nullzeiger',
  'Frau Rebase',
  'Compile Once',
  'Lukas Lazy',
  'Nina Nullable',
  'Doña Async',
  'Onkel Octet',
  'Tante TCP',
  'Marcus Merge-Konflikt',
];

export function randomName(skip?: string): string {
  // Avoid returning the same name twice in a row
  let pick = NAMES[Math.floor(Math.random() * NAMES.length)];
  if (skip && pick === skip && NAMES.length > 1) {
    while (pick === skip) {
      pick = NAMES[Math.floor(Math.random() * NAMES.length)];
    }
  }
  return pick;
}
