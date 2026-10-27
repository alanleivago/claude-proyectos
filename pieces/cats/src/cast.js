// =====================================================================
//  CAST — people (ivMan `who`) and cats (ivCat `coat`). Shared by all sections; edit here only.
//  Colour = identity. Cyan is free in this piece (no ghost); the counter/graphics use warm cream.
// =====================================================================
const CAST = {
  kai:     { key: 'kai', top: 'hoodie', col: '#3c6fd1', col2: '#284c94' },                                  // you, 16, blue hoodie
  lily:    { key: 'lily', top: 'coat', col: '#f2c230', col2: '#c4951a', hair: 'puffs', shirt: '#e05a7a', head: 1.12 }, // sister, 7, yellow coat (make h ≈ 0.62 of Kai)
  mom:     { key: 'mom', top: 'cardigan', col: '#8a5bb0', col2: '#5e3c7c', hair: 'bun' },
  gomez:   { key: 'gomez', top: 'cardigan', col: '#c2703f', col2: '#8f4f2a', hair: 'bun', glasses: true },  // Mrs. Gomez, 6 cats
  teacher: { key: 'teacher', top: 'suit', col: '#5b6a7a', col2: '#3e4a58', glasses: true },
  anchor:  { key: 'anchor', top: 'suit', col: '#b8323a', col2: '#7e2228', hair: 'pony' },
  cop:     { key: 'cop', top: 'uniform', col: '#2a3550', col2: '#1c2438', hat: 'buscap', capCol: '#1c2438' },
  kidA:    { key: 'kidA', top: 'tee', col: '#7a6c8a' }, kidB: { key: 'kidB', top: 'tee', col: '#5d7086' },
  kidC:    { key: 'kidC', top: 'jacket', col: '#9a5f6e', hair: 'pony' }, kidD: { key: 'kidD', top: 'hoodie', col: '#6f7d5a' },
  extraA:  { key: 'extraA', top: 'coat', col: '#6b6378' }, extraB: { key: 'extraB', top: 'tee', col: '#8a7a64' }, extraC: { key: 'extraC', top: 'jacket', col: '#5f6f8a', hair: 'bun' },
};
const CATS = {
  pickles: { ...IV_COATS.orange, key: 'pickles' },           // 14, orange tabby, loaf-shaped, grumpy (British voice)
  duchess: { ...IV_COATS.white, key: 'duchess' },            // white Persian, posh
  boss:    { ...IV_COATS.grey, key: 'boss' },                // one-eyed grey tabby tom, street king (draw him big: s ×1.3)
  noodle:  { ...IV_COATS.kitten, key: 'noodle' },           // tiny hyper kitten (s ×0.6)
  shadow:  { ...IV_COATS.black, key: 'shadow' },            // the black cat with green eyes (cliffhanger)
  gomez1:  { ...IV_COATS.calico, key: 'gomez1' }, gomez2: { ...IV_COATS.tux, key: 'gomez2' }, gomez3: { ...IV_COATS.grey, key: 'gomez3', oneEye: false },
  alley:   [IV_COATS.black, IV_COATS.tux, IV_COATS.grey, IV_COATS.calico, IV_COATS.kitten, IV_COATS.orange, IV_COATS.white].map((c, i) => ({ ...c, key: 'alley' + i, oneEye: false })),
};
const GROUND = 900;
