"""What happens on screen in trash-library (src/shots.js SHOT_LIST + the set files' action times) -> events-all.json
(t on the VIDEO clock, what). Set files keep story time; from video 50.30 on story = video - 0.6 and the closing gag
story 58.40-61.00 is squeezed into video 59.00-61.00 (STORY_T in shots.js): V() is its inverse. Checked on frames of
renders/trash-library_silent_v3.mp4 (lifter/bags 2.9-3.6, G1 13.7-14.4, the cab 15.95-16.9, the bin + marker 54.4-58.9,
the gate 59.0-60.9)."""
import json, re
E = []
def ev(t, what): E.append({'t': round(t, 3), 'what': what})
def V(s):   # story -> video (inverse of STORY_T)
    if s < 50.30: return s
    if s < 58.40: return s + 0.6
    if s < 59.15: return 59.0 + (s - 58.4) * 0.35 / 0.75
    return 59.35 + (s - 59.15) * 1.65 / 1.85
src = open('../src/shots.js', encoding='utf-8').read()
ROWS = [(float(t), s) for t, s in re.findall(r'\["\w+", ([\d.]+), \'(\w+)\'', src)]
for i, (t, st) in enumerate(ROWS[1:], 1):
    if st != ROWS[i - 1][1]: ev(t - 0.06, 'whoosh: whip')   # place changes: whip pans (17.06 26.19 46.14 48.60 50.30 53.42)
for t in [5.20, 13.74, 19.64, 21.44, 25.28, 31.12, 34.10, 34.66, 43.70, 59.05]: ev(t, 'whoosh soft: camera move')

# ---- A street, dawn (0-17.06): truck rolls in and stops 2.4; lifter 2.70-4.0; chomp 3.36; hop 3.70-4.05; tosses; heavy bag; books; G1
for t in [0.35, 0.95, 1.55]: ev(t, 'reversing beep')
ev(2.30, 'air brake: truck stops')
ev(1.64, 'sparkle small: book glint in the bin')
ev(2.70, 'hydraulic lifter rise'); ev(3.00, 'container lid clatter'); ev(3.30, 'trash bag thud'); ev(3.36, 'trash bag thud')
ev(3.40, 'compactor chomp small'); ev(3.70, 'hydraulic short: blade back'); ev(4.00, 'container thunk down')
ev(3.70, 'cloth swish: hop'); ev(4.05, 'landing thud: hop off the step')
ev(5.46, 'clock clack: 6:00')
for g, r in [(6.25, 6.56), (7.05, 7.28)]:
    ev(g, 'plastic bag rustle: grab'); ev(r, 'cloth swish: toss'); ev(r + 0.34, 'trash bag thud: into the hopper')
ev(7.90, 'plastic bag rustle: grab heavy'); ev(8.40, 'grunt: strain'); ev(8.60, 'plastic bag rustle: strain'); ev(9.05, 'plastic bag rustle: strain')
ev(9.52, 'plastic bag open: knot'); ev(9.95, 'magic shimmer: books glow')
for t in [10.50, 10.72, 10.93]: ev(t, 'footsteps concrete')
ev(11.38, 'book handling: novel'); ev(11.86, 'book handling: comic'); ev(12.36, 'book handling: stack rises'); ev(12.62, 'sparkle small: stack')
ev(12.78, 'book thud soft: stack settles')
ev(13.36, 'plastic bag rustle: empty bag'); ev(13.46, 'cloth swish: toss'); ev(13.72, 'trash bag thud: into the hopper')
ev(13.76, 'gasp'); ev(13.90, 'COMPACTOR CHOMP: G1'); ev(13.92, 'cloth swish: leap'); ev(14.15, 'hydraulic short: blade back')
ev(14.34, 'landing thud: leap'); ev(14.36, 'books rattle: landing')
for k in range(6): ev(15.38 + k * 0.13, 'running footsteps')
ev(15.95, 'truck cab door open'); ev(16.40, 'metal step thud'); ev(16.86, 'book thud soft: books in the crate'); ev(16.90, 'wooden crate knock')

# ---- B depot (17.06-26.19)
ev(17.62, 'DOOR BANG: burst open'); ev(17.70, 'tea glass clink'); ev(17.74, 'gasp')
for t in [17.60, 17.76, 17.91, 18.17, 18.28, 18.40, 18.63, 18.77, 18.90]: ev(t, 'footsteps hard floor')
for t in [18.38, 18.44, 18.50]: ev(t, 'book thud: dump 1')
ev(18.52, 'grunt: armload 2')
ev(19.32, 'books falling: dump 2'); ev(19.42, 'book thud: dump 2'); ev(19.52, 'book thud: dump 2')
for t in [19.72, 19.98]: ev(t, 'book handling: towers grow')
ev(19.56, 'dust puff: urn buried')
for t in [19.27, 19.48, 19.69, 19.90, 20.11, 20.32, 20.53]: ev(t, 'footsteps hard floor')
ev(19.88, 'door close soft')
ev(21.05, 'door creak open: boss')
for t in [21.25, 21.50, 21.75, 21.98, 22.20, 22.40]: ev(t, 'footsteps hard floor')
ev(22.60, 'cloth rustle: arms crossed')
ev(23.06, 'book slide: out of the tower'); ev(23.36, 'book thud soft: books sag'); ev(23.40, 'wood creak: tower wobble')
ev(24.22, 'cloth swish: book raised')
ev(24.92, 'WOOD CREAK: tower leans'); ev(25.00, 'gasp'); ev(25.16, 'yelp: boss')
ev(25.20, 'BOOKS FALLING: avalanche'); ev(25.30, 'books falling: avalanche'); ev(25.35, 'HEAVY THUD: avalanche impact')
for t in [25.44, 25.52, 25.58, 25.66]: ev(t, 'book thud: avalanche')
ev(25.38, 'dust puff: avalanche'); ev(25.60, 'book handling: the hand pops out'); ev(25.75, 'laugh: coworker')

# ---- C factory (26.19-46.14): one walk, steps every 0.42 s on the oak floor; crates down; sign; flip counter; kids' corner
for k in range(11): ev(26.19 + k * 0.42, 'footsteps wood')
ev(30.83, 'footsteps wood')
for t in [31.51, 31.70, 31.81]: ev(t, 'CRATE DOWN')
for t in [31.67, 31.86, 31.97]: ev(t, 'crate knock small')
ev(31.52, 'laugh: coworker')
ev(34.72, 'chain rattle: sign'); ev(34.88, 'cloth swish: sign swings'); ev(35.03, 'metal sign squeak'); ev(35.27, 'chain rattle: sign'); ev(35.40, 'metal sign squeak small')
ev(37.30, 'kid giggle')
for t in [41.50, 41.57, 41.64, 41.71, 41.78, 41.85]: ev(t, 'flip counter clack')
ev(41.52, 'gasp: librarian')
for n in range(0, 19, 2): ev(42.66 + n * 0.042, 'flip counter clack')   # a 24/s rattle: every 2nd flip
ev(42.68, 'yelp: librarian'); ev(43.00, 'landing thud small: librarian')
ev(44.94, 'kid laugh'); ev(45.24, 'beanbag thump'); ev(45.60, 'cloth swish: wave')

# ---- D bay (46.14-48.60), village (48.60-50.30)
for t in [46.30, 46.48, 46.70, 47.00, 47.50]: ev(t, 'footsteps concrete')
ev(46.32, 'books rattle: crate carried'); ev(47.50, 'grunt: coworker heave'); ev(47.80, 'books rattle: crate swung up')
ev(49.08, 'wooden crate lid open'); ev(49.12, 'magic shimmer: crate glow'); ev(49.20, 'kids ooh'); ev(49.66, 'laugh: teacher'); ev(49.80, 'kid giggle'); ev(50.03, 'landing thud small: kid hop')

# ---- D prison (video 50.30-53.42; set times are story)
ev(V(50.14), 'cell bars clank: book under the door'); ev(V(50.16), 'book slide: under the door')
ev(V(50.86), 'book handling: pickup'); ev(V(51.30), 'page flap: book opens')
ev(V(51.80), 'SOB'); ev(V(51.88), 'cloth rustle: pocket'); ev(V(52.03), 'tissue pull'); ev(V(52.40), 'sniff')

# ---- A' street, morning (video 53.42-61.00; set times are story)
for s in [52.90, 53.10, 53.30, 53.50]: ev(V(s), 'footsteps concrete')
ev(V(53.05), 'cloth swish: toss'); ev(V(53.40), 'trash bag thud: into the hopper'); ev(V(53.50), 'compactor chomp small'); ev(V(53.85), 'hydraulic short: blade back')
ev(V(53.64), 'cloth swish: book over the bin'); ev(V(53.90), 'cloth swish: let go'); ev(V(54.16), 'BOOK THUD: into the bin'); ev(V(54.17), 'bin knock'); ev(V(54.22), 'page flap: book opens')
for s in [55.10, 55.36, 55.62, 55.88, 56.14]: ev(V(s), 'footsteps concrete')
ev(V(56.32), 'landing thud small: he stops')
ev(V(56.70), 'book handling: out of the bin'); ev(V(56.72), 'plastic bag rustle: bin')
ev(V(57.12), 'MARKER SQUEAK: strike'); ev(V(57.50), 'MARKER WRITING: CHAPTER 2'); ev(V(57.86), 'marker squeak small')
ev(V(58.45), 'air brake release'); ev(V(58.50), 'truck pulls away')
ev(V(59.20), 'metal clunk small: gate latch'); ev(V(59.20), 'HYDRAULIC WHINE: gate lifts'); ev(V(59.22), 'warm sting: cosy library'); ev(V(59.62), 'metal clunk: gate up')
ev(V(59.45), 'gasp: boss'); ev(V(59.95), 'laugh: hero'); ev(V(60.30), 'cloth swish: boss waves')
ev(V(60.84), 'GATE SLAM')
E.sort(key=lambda e: e['t']); json.dump(E, open('events-all.json', 'w'), indent=0); print(len(E), 'events')
