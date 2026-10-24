// =====================================================================
//  CAST — every character's look (styles/ifverse/kit.js ivMan `who`). Shared by all sections; edit here only.
//  Colours mean one person each; cyan (#7ff0ff) is reserved for the ghost (the future) and the counter.
// =====================================================================
const CAST = {
  you:     { key: 'you', top: 'hoodie', col: '#3aa36b', col2: '#23704a' },                                   // Theo, 16, green hoodie
  nia:     { key: 'nia', top: 'jacket', col: '#f2c230', col2: '#c4951a', hair: 'puffs', shirt: '#2c2a3a' },  // best friend
  dad:     { key: 'dad', top: 'uniform', col: '#3d6fb6', col2: '#2a4f86', hat: 'buscap', build: 1.12 },     // Raymond, night bus driver
  dadHome: { key: 'dad', top: 'uniform', col: '#3d6fb6', col2: '#2a4f86', build: 1.12 },                    // same, cap off (kitchen)
  voss:    { key: 'voss', top: 'suit', col: '#9aa1ad', col2: '#6c7380', tie: '#b8323a', hair: 'tuft' },      // bus company manager
  okafor:  { key: 'okafor', top: 'cardigan', col: '#8a5bb0', col2: '#5e3c7c', hair: 'bun', glasses: true }, // passenger, seat four
  teacher: { key: 'teacher', top: 'cardigan', col: '#c2703f', col2: '#8f4f2a', hair: 'pony', glasses: true },
  coach:   { key: 'coach', top: 'tee', col: '#d6453d', cap: true, hat: 'cap', capCol: '#2b2b2b' },
  manager: { key: 'manager', top: 'vest', col: '#2d2a35', col2: '#e0557a' },                                 // arcade manager
  painter: { key: 'painter', top: 'tee', col: '#e9e2d4', pants: '#4a5f86', hat: 'cap', capCol: '#e9e2d4' },
  cityW:   { key: 'cityW', top: 'suit', col: '#4f5e7a', col2: '#36425a', hair: 'bun', tie: '#e9e2d4' },     // city official who says "Play it again."
  city2:   { key: 'city2', top: 'suit', col: '#5b5148', col2: '#40382f' },
  city3:   { key: 'city3', top: 'coat', col: '#7d8a74', col2: '#59644f', glasses: true },
  cyclist: { key: 'cyclist', top: 'tee', col: '#e3893a' },
  kidA:    { key: 'kidA', top: 'tee', col: '#7a6c8a' },
  kidB:    { key: 'kidB', top: 'tee', col: '#5d7086' },
  kidC:    { key: 'kidC', top: 'jacket', col: '#9a5f6e', hair: 'pony' },
  kidD:    { key: 'kidD', top: 'hoodie', col: '#6f7d5a' },
  extraA:  { key: 'extraA', top: 'coat', col: '#6b6378' },
  extraB:  { key: 'extraB', top: 'tee', col: '#8a7a64' },
  extraC:  { key: 'extraC', top: 'jacket', col: '#5f6f8a', hair: 'bun' },
};
const GROUND = 900;   // the floor line at the actors' plane (d = 1) in the base framing — every set keeps it
