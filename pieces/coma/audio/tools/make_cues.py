"""Write the coma film's cue events into out/cues.json from the picture code: src/head.html (SHOTS, acts, cues),
lake.js (jump arc, hit flash 10.0, storm flashes/bolts, monitor alarm), hospital.js (monitor pulse mod(t, 0.77),
penlight 19.1, phone buzz mod(lt, 0.385) < 0.2, doctor walk, MRI vibration, intercom LED), house.js (gait f = 1.9 Hz)."""
import json, sys
P = sys.argv[1]; FPS = 24; ev = []
def E(t, kind, id, **k):
    d = {'f': round(t * FPS, 2), 'kind': kind, 'id': id}; d.update(k); ev.append(d)
# party / dare / jump (lake.js SHOT_FN.party/dare/jump)
for i, t in enumerate([4.35, 5.6, 6.5]): E(t, 'cheer', f'dare:cheer:{i + 1}', pan=[-0.2, 0.25, 0.0][i])
E(7.0, 'foley', 'jump:crouch')                     # crouch 0..0.35 s, the pier boards take the weight
E(7.45, 'foley', 'jump:takeoff')                   # air = lt > 0.45
E(9.55, 'whoosh', 'jump:fall')                     # the fall: pitch swings down 8.25-9.6, the rush peaks just before the water
E(9.9, 'splash', 'jump:splash')                    # white fill ss(2.88, 3.0): the water surface
E(10.0, 'impact', 'hit:rock')                      # TIMELINE.cues.hit, white flash exp(-lt*7)
E(10.05, 'bubbles', 'hit:bubbles'); E(12.0, 'bubbles', 'sink:bubbles')
# monitor pulse: day1 glow beat = mod(t, 0.77); the bed monitor (lkMon) in the dream / storm / off
t = 16.17
while t < 47.0:
    if not (29.2 <= t < 31.0): E(t, 'beep', f'beep:{int(t * 100)}', zone='lake' if 24 <= t < 36 else 'room')
    t = round(t + 0.77, 3)
E(29.2, 'alarm', 'storm:alarm')                    # lkMon alarm from lt 1.2 (flashes at 4 Hz)
E(19.1, 'click', 'pupil:penlight')                 # op = seg(lt, 0.1, 0.5)
E(28.5, 'thunder', 'storm:bolt:1', weight=1.0, pan=0.35); E(29.95, 'thunder', 'storm:bolt:2', weight=1.0, pan=-0.3)
E(30.5, 'thunder', 'storm:flash:3', weight=0.5)
# phone buzz pulses (hospital.js phone: mod(lt, 0.385) < 0.2)
k = 0
while 39.0 + k * 0.385 < 40.85: E(39.0 + k * 0.385, 'buzz', f'phone:buzz:{k}'); k += 1
E(41.6, 'page', 'doctor:page')
for k in range(4): E(45.05 + k * 0.52, 'step', f'doctor:step:{k}', variant='doctor', pan=0.25 + k * 0.08)
E(44.3, 'voice', 'wrong:mom:cry')
E(50.0, 'click', 'voice:intercom')                 # micLed on, the technician speaks
k = 0
while True:                                        # house gait: bob = cos(2*pi*1.9*lt), foot down at the low point
    t = 52.0 + (0.5 + k) / 1.9; k += 1
    if t >= 56.55: break
    E(t, 'step', f'house:step:{k}', variant='tile', pan=0.08 if k % 2 else -0.08)
E(57.0, 'drop', 'lights:on'); E(57.4, 'ui', 'lights:detected')
E(60.6, 'voice', 'know:laugh'); E(61.6, 'voice', 'know:breath:1'); E(62.9, 'voice', 'know:breath:2')
t = 64.6
while t < 74.0: E(t, 'beep', f'slowbeep:{int(t * 100)}', zone='slow'); t = round(t + 1.25, 3)
ev.sort(key=lambda e: e['f'])
acts = {'build': {'from': 0, 'dur': 384}, 'journey': {'from': 384, 'dur': 480}, 'peak': {'from': 864, 'dur': 494.4},
        'silence': {'from': 1358.4, 'dur': 9.6}, 'gift': {'from': 1368, 'dur': 168}, 'goodbye': {'from': 1536, 'dur': 264}}
json.dump({'_doc': 'Cue file for the coma film (24 fps, 75 s = 1800 frames), written by audio/tools/make_cues.py from src/head.html, lake.js, hospital.js, house.js.',
           'fps': FPS, 'total': 1800, 'acts': acts, 'cue': {'hit': 240, 'black': 372, 'storm': 672, 'stop': 1358.4, 'drop': 1368, 'endcard': 1632, 'end': 1800}, 'events': ev},
          open(P + '/out/cues.json', 'w'), indent=1)
print(len(ev), 'events')
