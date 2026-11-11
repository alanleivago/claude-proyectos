"""What happens on screen (lost-luggage v6: src/shots.js SHOT_LIST + the set files' action times) -> events-all.json (t, what).
Recipe: pieces/guinea-rent/sound/events.py."""
import json, re
E = []
def ev(t, what): E.append({'t': round(t, 3), 'what': what})
src = open('../src/shots.js', encoding='utf-8').read()
ROWS = [(float(t), s) for t, s in re.findall(r'\["s\d+", ([\d.]+), \'(\w+)\'', src)]
for i, (t, st) in enumerate(ROWS[1:], 1):
    ev(t - (0.06 if st != ROWS[i - 1][1] else 0.02), 'whoosh: whip' if st != ROWS[i - 1][1] else 'whoosh soft: cut')   # soft cut whooshes peak on the cut
for t in [0.7, 1.04, 22.48, 24.2, 25.38, 26.26, 27.35, 31.6, 48.66, 50.78, 51.48, 52.4, 57.62]: ev(t - 0.04, 'whoosh soft: camera move')
# s01-s05 the baggage hall: the carousel runs, bags clunk out of the flaps; the clerk types; calendar; CASE CLOSED
for a, b in [(0.0, 6.36), (32.56, 37.06), (53.12, 56.58), (58.10, 60.5)]: ev(a + 0.02, f'conveyor motor run {b - a:.2f}')
for t in [0.40, 1.10, 1.95, 58.12]: ev(t, 'clunk: bag through the flaps')
ev(1.8, 'rubber flaps flap'); ev(58.14, 'rubber flaps flap')
for k in range(4): ev(0.15 + k * 0.45, 'footsteps tile')
ev(3.26, 'keyboard typing')
for t in [4.40, 4.47, 4.54, 4.61, 4.68]: ev(t, 'paper flip: calendar')
ev(4.86, 'paper: report'); ev(5.06, 'whoosh: stamp comes down'); ev(5.20, 'rubber stamp: CASE CLOSED'); ev(5.21, 'thump: kick')
ev(5.66, 'metal cage creak')
# s06-s08 Alabama: the sign + a truck of suitcases roars past; the main street; the loading dock
ev(6.40, 'truck pass by'); ev(7.45, 'car pass by'); ev(8.25, 'car pass by')
ev(8.95, 'dolly rolling'); ev(9.0, 'suitcases rattle'); ev(10.38, 'cash: bills handed')
# s09-s10 the sorting floor: latch, open, shirt, price gun; G1: the bag shakes and bursts
ev(10.94, 'latch'); ev(10.98, 'suitcase lid open'); ev(11.46, 'cloth swish: shirt'); ev(11.56, 'price gun click')
for k in range(3): ev(12.92 + k * 0.1, 'box shake')
ev(13.25, 'BOOM: burst'); ev(13.27, 'latch'); ev(13.3, 'gasp'); ev(13.32, 'rubber chicken squeak'); ev(13.36, 'cartoon boing')
for k in range(4): ev(13.34 + k * 0.08, 'cloth flap: socks')
ev(13.58, 'bowling ball thud'); ev(13.78, 'soft thump: gnome lands'); ev(13.9, 'rubber chicken squeak')
# s11-s19 the store
ev(14.09, 'automatic sliding door'); ev(14.25, 'footsteps tile'); ev(14.5, 'footsteps tile')
for k in range(6): ev(14.8 + k * 0.42, 'footsteps tile')
for t in [17.42, 18.3, 19.0, 19.55, 20.1]: ev(t - 0.05, 'whoosh soft: travel')
ev(20.86, 'heavy thud: ski boot')
ev(22.48, 'cloth swish: jacket up'); ev(25.02, 'cloth rustle: pocket'); ev(25.95, 'paper: card'); ev(26.26, 'gasp')
ev(27.02, 'register beep'); ev(27.35, 'cash register drawer'); ev(27.38, 'thump: kick')
# s20-s21, s30, s32-s33 the museum
for k in range(6): ev(28.0 + k * 0.42, 'footsteps carpet')
ev(29.6, 'cloth swish: point'); ev(48.0, 'metal armor clank'); ev(50.55, 'sparkle: the mask')
ev(52.30, 'metal hinge creak'); ev(52.56, 'whoosh soft: snap'); ev(52.40, 'metal armor clank'); ev(52.45, 'rattlesnake rattle'); ev(52.62, 'snake hiss')
# s22-s25 back at the airport: owners grab their bags; 90 days; SOLD; the invoice
ev(32.8, 'cloth swish: grab'); ev(33.36, 'cloth swish: grab'); ev(33.7, 'pop: heart'); ev(33.72, 'sparkle')
for t in [36.30, 36.48, 36.78]: ev(t, 'paper flip: calendar')
ev(35.2, 'pop: 90 DAYS tag'); ev(37.3, 'cloth swish: handshake'); ev(37.5, 'pop: SOLD tag')
ev(38.5, 'pen writing: signature'); ev(39.2, 'pen writing')
# s26-s29, s31 the sorting floor
for k in range(6): ev(40.5 + k * 0.45, 'counter click')
ev(40.6, 'zipper'); ev(41.4, 'latch'); ev(42.2, 'zipper')
ev(43.4, 'washing machine spin 1.6'); ev(44.62, 'price gun click'); ev(45.44, 'soft thump: shelf')
ev(46.12, 'cloth swish: drop'); ev(46.35, 'soft thump: teddy lands'); ev(46.88, 'latch'); ev(46.92, 'sparkle: glow')
ev(49.06, 'rattlesnake rattle'); ev(49.32, 'snake hiss'); ev(49.33, 'gasp'); ev(49.45, 'soft thump: jump')
# s34-s36
ev(54.74, 'gasp'); ev(57.66, 'whoosh: SALE tag'); ev(57.86, 'tap: tag lands'); ev(57.9, 'metal hinge creak')
# s37-s38 the end gag: wind-up, reach, grip, heavy lift, latches pop, lid swings open, the receipt flutters down
ev(58.46, 'cloth swish: wind-up'); ev(58.6, 'cloth swish: reach'); ev(58.70, 'soft thump: grip')
ev(58.8, 'cloth swish: lift'); ev(58.82, 'suitcases rattle'); ev(59.08, 'soft thump: lift top')
ev(59.22, 'latch'); ev(59.25, 'latch'); ev(59.27, 'metal hinge creak'); ev(59.36, 'suitcase lid open'); ev(59.3, 'gasp')
ev(59.32, 'paper flutter'); ev(59.8, 'paper flutter'); ev(60.28, 'tap: receipt lands')
E.sort(key=lambda e: e['t']); json.dump(E, open('events-all.json', 'w'), indent=0); print(len(E), 'events')
