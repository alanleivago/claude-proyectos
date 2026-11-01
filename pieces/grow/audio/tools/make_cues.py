"""Write the grow film's cue events into out/cues.json from the picture code (src/head.html, city.js, above.js).
Footfalls: the girl's gait ph = TT*6 in the city (girl.js), legs at full spread at ph = pi/2 + k*pi."""
import json, math, sys
P = sys.argv[1]; FPS = 24; ev = []
def E(t, kind, id, **k):
    d = {'f': round(t * FPS, 2), 'kind': kind, 'id': id}; d.update(k); ev.append(d)
HGT = lambda t: 1.6 * 2 ** (t / 2)
# the doublings: every 2 s, 2..50 (52 is the Moon boom)
for n, t in enumerate(range(2, 51, 2)):
    E(t, 'grow', f'grow:{n + 1:02d}', weight=round(HGT(t) / HGT(2), 3))
# footfalls 0-20 (city): ph = t*6 -> t = (pi/2 + k*pi)/6
k = 0
while True:
    t = (math.pi / 2 + k * math.pi) / 6; k += 1
    if t >= 20: break
    var = 'shoe' if t < 3 else 'heavy' if t < 8 else 'giant'
    E(t, 'step', f'step:{var}:{k:02d}', variant=var, weight=round(HGT(t), 2), pan=0.15 if k % 2 else -0.15)
# crowd (city.js): stop and stare 3.3, flee 5.2
E(3.3, 'voice', 'crowd:gasp'); E(5.2, 'voice', 'crowd:scream')
# the braking car (run shot 5-8): u = lt/1.3, skid from 5.0, stops 6.3
E(5.0, 'car', 'car:skid'); E(5.75, 'car', 'car:horn:1', pan=0.4); E(6.55, 'car', 'car:horn:2', pan=-0.3)
# car alarms once she steps among the cars (cars shot 8-11)
E(8.4, 'car', 'car:alarm:1', pan=0.35); E(9.6, 'car', 'car:alarm:2', pan=-0.4)
# buildings: units fall from 11.1 (ctHit floor) + 0..0.6 s; the avenue goes first, then outwards
for i, t in enumerate([11.25, 12.35, 13.45, 14.5, 16.3, 18.1]):
    E(t, 'collapse', f'collapse:{i + 1}', weight=1.0 if t < 15 else 0.4, pan=[-0.3, 0.35, -0.2, 0.25, 0.0, 0.0][i])
# airliners (above.js AB_PL): swerve apex at t0 + (0.15h + 60)/26 s; heard while approaching
for i, (t0, side) in enumerate([(24.4, 1), (25.3, -1), (26.1, 1), (26.9, -1)]):
    h = HGT(t0 + 2) / 1000; E(min(t0 + 1.2, 27.8), 'plane', f'plane:{i + 1}', pan=0.45 * side)
# space
E(31.0, 'space', 'space:enter')
E(36.6, 'space', 'iss:pass')            # iss2 34-38: the station crosses in front of her eyes
E(42.3, 'space', 'step:space:1', weight=1.0)   # step shot: the stride completes (ss 0..1.3)
E(45.6, 'space', 'step:space:2', weight=0.7)   # step2: the foot settles (ss 0..2.2 from 43.5)
E(47.0, 'space', 'earth:stand')
for i, t in enumerate([49.4, 49.95, 50.5, 51.05]): E(t, 'sat', f'sat:{i + 1}', pan=[-0.5, 0.4, -0.2, 0.55][i])
E(52.0, 'drop', 'moon:drop'); E(57.0, 'card', 'card:in'); E(59.0, 'card', 'card:orsi')
ev.sort(key=lambda e: e['f'])
acts = {'build': {'from': 0, 'dur': 192}, 'journey': {'from': 192, 'dur': 552}, 'peak': {'from': 744, 'dur': 494.4},
        'silence': {'from': 1238.4, 'dur': 9.12}, 'payoff': {'from': 1247.52, 'dur': 120.48}, 'goodbye': {'from': 1368, 'dur': 72}}
json.dump({'_doc': 'Cue file for the grow film (24 fps, 60 s = 1440 frames), written by audio/tools/make_cues.py from src/head.html (acts, shots), city.js (crowd 3.3/5.2, braking car 5.0-6.3, unit collapse from 11.1), above.js (AB_PL airliners, ISS, step, satellites) and girl.js (gait ph = TT*6).',
           'fps': FPS, 'total': 1440, 'acts': acts, 'cue': {'stop': 1238.4, 'drop': 1248, 'endcard': 1368, 'end': 1440}, 'events': ev},
          open(P + '/out/cues.json', 'w'), indent=1)
print(len(ev), 'events')
