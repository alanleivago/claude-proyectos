# gen.py: writes layers.json — the sound bed for pi (CC0 recordings, slowed copies, code layers). No music.
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
def one(id, file, t, d, db, **o): lay(id, file, t, t + d, [[t, db], [t + d, db]], loop=False, **o)
K, O, P, B = 'audio/code/', 'audio/own/', 8.0, 56.0
# 1. the walk: people, kids, birds, pigeons, footsteps, the city far off; cut by the drop at 8 s
cut = lambda db: [[0, -40], [0.4, db], [7.85, db], [8.05, -80]]
lay("talk", f("park", "fcb2a873"), 0, P + 0.1, cut(-24)); lay("kids", f("kids", "997ecd4b"), 0, P + 0.1, cut(-31), src=30); lay("birds", f("birds", "98041fcc"), 0, P + 0.1, cut(-28))
lay("pig", f("pigeons", "8ad630be"), 0, P + 0.1, cut(-30)); lay("steps", f("steps", "e160926c"), 0, P + 0.1, cut(-31)); lay("traffic", f("traffic", "c3575018"), 0, P + 0.1, cut(-35), lp=900, src=40)
one('c_ticks', K + 'ticks.wav', 2.8, 5.2, -22); one('c_drop', K + 'drop.wav', P, 2.6, -16)
# 2. the slowed world: a low drone, the park pitched down and muffled
lay('c_drone', K + 'slowdrone.wav', P, B, [[P, -24], [30, -20], [50, -18], [55.4, -18], [55.45, -80]], loop=False)
lay("pslow", O + 'park_slow.wav', P + 0.1, 44, [[P + 0.1, -40], [P + 1.0, -25], [43.5, -27], [44, -50]])
lay("bslow", O + 'birds_slow.wav', P + 0.1, 44, [[P + 0.1, -40], [P + 1.0, -30], [43.5, -32], [44, -50]])
# events on round things
one('e_donut', K + 'crack.wav', 8.4, 1.6, -18); [one(f'e_bub{i}', K + 'pop.wav', t, 1.2, -24) for i, t in enumerate([8.5, 8.9, 9.3, 9.7])]
one('e_par1', K + 'pop.wav', 12.4, 1.2, -22); one('e_par2', K + 'groan.wav', 12.6, 2.4, -26)
one('e_bike', K + 'groan.wav', 15.4, 2.4, -18); one('e_bike2', K + 'groan.wav', 15.9, 2.4, -22)
lay('e_fount', O + 'splash_slow.wav', 18.2, 21.0, [[18.2, -14], [21.0, -26]], loop=False, src=2)
[one(f'e_mh{i}', K + 'clang.wav', t, 2.0, -20) for i, t in enumerate([20.0, 20.6, 21.2, 21.8])]
one('e_bridge', K + 'crack.wav', 23.2, 1.6, -18); lay('e_brum', f("rumble", "a2ee6837"), 23.2, 25.0, [[23.2, -22], [25.0, -26]])
one('e_wheel', K + 'groan.wav', 25.3, 2.4, -18); one('e_wheel2', K + 'clang.wav', 26.2, 2.0, -18)
[one(f'e_dome{i}', K + 'pop.wav', t, 1.2, -20) for i, t in enumerate([28.3, 28.5, 28.7])]; one('e_domec', K + 'crack.wav', 28.4, 1.6, -18)
one('e_sun', K + 'sky.wav', 30.0, 3.0, -17); one('e_halo', K + 'sky.wav', 33.0, 3.0, -22); one('e_moon', K + 'crack.wav', 35.8, 1.6, -20)
one('e_whine', K + 'whine.wav', 37.0, 3.0, -21); one('e_roll', K + 'pop.wav', 40.4, 1.2, -20)
lay('e_planet', K + 'rumble.wav', 44.0, 55.5, [[44.0, -26], [50.0, -21], [55.4, -19], [55.45, -80]], loop=False)
one('e_clock', K + 'ticks.wav', 47.0, 2.4, -26)
lay('e_fold', f("rumble", "a2ee6837"), 50.0, 55.45, [[50.0, -30], [53, -22], [55.4, -20], [55.45, -80]])
# 3. π comes back: debris settles, people cry out, a siren far away
one('c_back', K + 'back.wav', B, 4.0, -5); one('e_settle', K + 'crack.wav', 56.4, 1.6, -22)
lay('panic', f("panic", "a222b1dc"), 57.0, 65.0, [[57.0, -40], [57.6, -27], [64.4, -29], [65.0, -60]])
lay('siren', f("siren", "1c6e336c"), 58.0, 65.0, [[58.0, -40], [59, -32], [64.4, -32], [65.0, -60]], lp=2500)
lay('birds2', f("birds", "98041fcc"), 58.0, 65.0, [[58.0, -40], [59, -32], [64.4, -33], [65.0, -60]], src=40)
one('c_end', K + 'end.wav', 65.0, 8.0, -24); lay('cardamb', f('birds', '98041fcc'), 65.0, 81.6, [[65.0, -50], [66.5, -36], [80.8, -38], [81.6, -70]], src=80, lp=3000); one('c_end2', K + 'end.wav', 73.5, 8.0, -30)
json.dump(dict(duration_s=82.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
