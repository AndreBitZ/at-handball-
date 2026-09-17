// Deterministic match engine shared by the seeder and the live ticker.
// One engine minute advances every TICK_MS of real time.

export const TICK_MS = 5000; // 1 game minute per 5s → a full match ~5.5 real minutes
export const FULL_TIME_MINUTE = 66; // 60' + breaks
export const FIRST_HALF_END = 30;

export function hash01(n: number): number {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 2246822507);
  x = Math.imul(x ^ (x >>> 13), 3266489909);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

export function matchSeed(round: number, homeIdx: number, awayIdx: number) {
  return round * 1000 + homeIdx * 37 + awayIdx * 511;
}

// Goal probability for `side` (0 = home, 1 = away) at a given engine minute.
export function goalAt(
  seed: number,
  side: number,
  rating: number,
  minute: number,
): boolean {
  const h = hash01(seed * 7 + minute * 131 + side * 7919 + 13);
  const factor = 0.72 + rating / 190;
  return h < 0.36 * factor;
}

export function seedForTeam(teamIdx: number) {
  return teamIdx * 1543 + 7;
}
