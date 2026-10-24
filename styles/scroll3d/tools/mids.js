// one time per shot: node mids.js <piece dir> <duration> [fraction=0.6] → Spanish-clock seconds, comma separated
const s = require('fs').readFileSync(process.argv[2] + '/src/head.html', 'utf8');
const A = eval(s.slice(s.indexOf('const ANCH = [') + 13, s.indexOf('];', s.indexOf('const ANCH = [')) + 1).replace('DURATION', process.argv[3]));
const es = (r) => { for (let i = 1; i < A.length; i++) { const [r0, s0] = A[i - 1], [r1, s1] = A[i]; if (r <= r1) return s0 + (s1 - s0) * (r - r0) / (r1 - r0); } };
const sh = [...s.matchAll(/\['(\w+)', ([\d.]+), ([\d.]+), '/g)].map((m) => [m[1], +m[2], +m[3]]);
const f = +(process.argv[4] || 0.6);
console.log(sh.map(([k, a, b]) => es(a + (b - a) * f).toFixed(2)).join(','));
