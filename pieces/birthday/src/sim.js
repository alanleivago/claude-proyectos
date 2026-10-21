// =====================================================================
//  SIM — the numbers the piece shows, computed here: the exact probability, 100,000 seeded rooms of 23,
//  the room shown on screen (23 real draws with exactly one shared birthday), the pairs.
// =====================================================================
const BD = (() => {
  let s = 20261014;
  const rnd = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pExact = (n) => { let q = 1; for (let k = 0; k < n; k++) q *= (365 - k) / 365; return 1 - q; };
  const pMine = (n) => 1 - Math.pow(364 / 365, n - 1);
  // 100,000 rooms; keep each room's result for the grid, and the first room with exactly one shared pair
  const N = 100000, hit = new Uint8Array(N); let hits = 0, shown = null;
  for (let i = 0; i < N; i++) {
    const days = [], seen = new Map(); let pairs = 0;
    for (let k = 0; k < 23; k++) { const d = Math.floor(rnd() * 365); days.push(d); pairs += seen.get(d) || 0; seen.set(d, (seen.get(d) || 0) + 1); }
    if (pairs) { hit[i] = 1; hits++; }
    if (!shown && pairs === 1 && i > 20) shown = { room: i, days };
  }
  const match = (() => { const d = shown.days; for (let a = 0; a < 23; a++) for (let b = a + 1; b < 23; b++) if (d[a] === d[b]) return [a, b]; })();
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ML = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const dateOf = (d) => { let m = 0; while (d >= ML[m]) { d -= ML[m]; m++; } return `${d + 1} ${MONTHS[m]}`; };
  const hitsAt = (n) => { let h = 0; for (let i = 0; i < n; i++) h += hit[i]; return h; };   // used sparingly (cached below)
  const CUM = new Uint32Array(101); for (let k = 1; k <= 100; k++) CUM[k] = CUM[k - 1] + hitsAt(k * 1000) - hitsAt((k - 1) * 1000);
  return { pExact, pMine, N, hit, hits, days: shown.days, match, dateOf, CUM, pairs: (n) => n * (n - 1) / 2 };
})();
