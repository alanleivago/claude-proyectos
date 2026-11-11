"""What happens on screen (guinea-rent shot list, src/shots.js + set files, voice take 12) -> events-all.json (t, what)."""
import json
E = []
def ev(t, what): E.append({'t': round(t, 3), 'what': what})
CUTS = [1.40, 3.26, 4.66, 5.96, 7.50, 8.50, 10.82, 12.36, 13.44, 15.62, 16.80, 18.24, 19.72, 21.32, 23.54, 24.18, 25.04, 26.36, 27.90,
        30.48, 31.64, 33.14, 35.52, 38.42, 40.88, 43.76, 44.98, 46.52, 48.06, 51.36, 52.94, 54.98, 56.36]
PLACE = {7.50, 10.82, 25.04, 26.36, 35.52, 40.88, 43.76, 44.98, 46.52, 52.94}   # whip pans
for t in CUTS: ev(t - 0.06, 'whoosh: whip' if t in PLACE else 'whoosh soft: cut')
for t in [0.86, 2.28, 3.84, 5.16, 6.6, 7.72, 9.54, 10.26, 11.88, 12.78, 14.82, 15.04, 15.82, 17.48, 19.04, 20.7, 21.98, 22.88, 24.66, 25.44,
          27.28, 28.88, 29.72, 31.08, 32.3, 34.84, 36.38, 37.84, 39.72, 40.4, 41.92, 43.08, 44.62, 45.76, 50.34, 52.02, 53.9, 54.44, 55.8, 57.3, 58.48]:
    ev(t - 0.04, 'whoosh soft: camera move')
# s01-s05 home: Gerald, the house, the notice
for k in range(3): ev(0.15 + k * 0.4, 'footsteps on wood')
ev(1.0, 'guinea pig squeak'); ev(2.3, 'guinea pig sad squeak'); ev(3.4, 'cloth swish: lift'); ev(3.9, 'guinea pig squeak'); ev(4.2, 'sparkle: GERALD plate')
for k in range(6): ev(4.7 + k * 0.18, 'hammer on wood')
ev(5.42, 'guinea pig wheek'); ev(6.0, 'paper: notice'); ev(6.6, 'paper flip')
ev(7.02, 'whoosh: stamp comes down'); ev(7.16, 'rubber stamp: ILLEGAL'); ev(7.17, 'thump: kick'); ev(7.2, 'guinea pig squeak')
# s06-s07 office
ev(7.75, 'heavy thud: law book'); ev(8.02, 'paper flip'); ev(8.84, 'cloth swish: point'); ev(10.3, 'tap: poster')
# s08-s16 home
ev(11.0, 'cloth swish: lift'); ev(11.9, 'guinea pig wheek'); ev(12.2, 'soft thump: lands'); ev(12.15, 'pop: heart'); ev(12.4, 'pop: heart'); ev(12.6, 'pop: heart')
ev(12.85, 'cloth swish: arm up'); ev(13.0, 'guinea pig squeak')
ev(15.05, 'sparkle: halo'); ev(15.1, 'guinea pig sad squeak'); ev(16.0, 'guinea pig sad squeak')
ev(17.1, 'cloth swish: hand to chin')
ev(19.05, 'cartoon boing: baby hop'); ev(19.1, 'guinea pig wheek'); ev(19.43, 'cartoon boing: hop'); ev(19.2, 'sparkle')
ev(19.75, 'pop: hourglass'); ev(20.32, 'pop: hourglass'); ev(20.75, 'guinea pig squeak')
for t in [21.98, 22.88, 23.1]: ev(t, 'cartoon boing: pig pops in'); ev(t + 0.05, 'guinea pig squeak')
ev(22.9, 'gasp')
for k in range(5): ev(23.6 + k * 0.12, 'scurry')
ev(23.56, 'guinea pig wheek'); ev(23.8, 'guinea pig wheek')
ev(24.3, 'phone ring'); ev(25.1, 'phone ring')
for k in range(4): ev(25.2 + k * 0.33, 'guinea pig squeak')
ev(26.38, 'door open'); ev(26.5, 'footsteps on wood'); ev(26.9, 'footsteps on wood')
ev(28.06, 'cardboard: flaps open'); ev(28.5, 'guinea pig squeak'); ev(29.3, 'guinea pig sad squeak')
ev(31.1, 'sparkle: ready'); ev(31.15, 'guinea pig wheek'); ev(32.35, 'guinea pig squeak'); ev(34.9, 'guinea pig squeak')
# office: ordinance, stamp, circle, poster stamp
ev(35.6, 'paper flip'); ev(36.25, 'whoosh: stamp'); ev(36.38, 'rubber stamp: NEW LAW'); ev(36.39, 'thump: kick')
ev(37.86, 'pen writing: circle'); ev(39.75, 'cloth swish: wag'); ev(40.14, 'rubber stamp: NOT ALONE')
# s26 Gerald stressed, s27 map pin
ev(41.0, 'guinea pig squeak'); ev(41.8, 'guinea pig squeak'); ev(42.5, 'guinea pig sad squeak'); ev(43.1, 'cartoon boing: panic pop'); ev(43.12, 'guinea pig wheek')
ev(44.64, 'tap: pin drops')
# s28-s29 the herd, Gerald alone
for k in range(5): ev(45.0 + k * 0.28, 'guinea pig squeak')
ev(45.55, 'cloth swish: point'); ev(45.8, 'guinea pig wheek'); ev(47.45, 'guinea pig sad squeak')
# s30 the box changes hands
ev(48.2, 'footsteps on wood'); ev(50.35, 'cardboard: box handed'); ev(50.4, 'guinea pig squeak')
ev(52.05, 'sparkle: halo'); ev(52.1, 'guinea pig sad squeak')
# s32-s33 the old pig home, the herd hops
for k in range(6): ev(52.98 + k * 0.22, 'scurry')
for k in range(5): ev(54.44 + k * 0.08, 'guinea pig wheek'); ev(54.5, 'pop: heart')
ev(55.5, 'guinea pig wheek'); ev(55.6, 'guinea pig squeak'); ev(55.9, 'guinea pig squeak')
# s34 the contract, then the burst
for a, b in [(56.5, 57.3), (57.3, 58.2)]: ev(a, 'pen writing')
ev(56.38, 'pen writing: signature'); ev(58.48, 'rubber stamp: paw'); ev(58.5, 'guinea pig squeak'); ev(58.9, 'whoosh: crane up')
for k in range(3): ev(59.15 + k * 0.11, 'box shake')
ev(59.5, 'BOOM: explosion'); ev(59.52, 'cardboard: box tears')
for k in range(5): ev(59.56 + k * 0.05, 'guinea pig wheek')
ev(59.75, 'debris'); ev(59.9, 'debris')
for k in range(6): ev(59.95 + k * 0.08, 'soft thump: pig lands')
ev(60.0, 'gasp')
json.dump(sorted(E, key=lambda e: e['t']), open('events-all.json', 'w'), indent=1)
print(len(E))
