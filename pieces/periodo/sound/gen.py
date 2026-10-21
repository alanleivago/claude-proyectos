# gen.py: writes layers.json — the sound bed for periodo (CC0 recordings + code layers from synth.py). No music.
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
def amb(id, file, t0, t1, db, **o): lay(id, file, t0, t1, [[t0, -40], [t0 + 0.15, db], [t1 - 0.15, db], [t1, -40]], **o)
amb("gym", f("gymamb", "a263f4c8"), 0, 6, -23)
lay("groan1", f("groan", "44e0bfe0"), 3.7, 6.0, [[3.7, -22], [6.0, -24]], loop=False)
amb("street", f("traffic", "c3575018"), 6, 11, -21, src=40)
lay("groan2", f("groan", "0346b8cf"), 6.2, 11.0, [[6.2, -40], [6.6, -22], [10.8, -24], [11.0, -40]], src=3)
amb("stadium", f("stadium", "58e2e562"), 11, 19, -19, src=60)
lay("groan3", f("groan", "fb30c77a"), 11.0, 19.0, [[11.0, -40], [11.4, -24], [18.8, -26], [19.0, -40]])
amb("site", f("constr2", "d8f76f56"), 19, 26, -21)
lay("beep", f("constr2", "6bb02f1f"), 19.6, 23.0, [[19.6, -30], [23.0, -30]], loop=False)
lay("groan4", f("groan", "0346b8cf"), 19.0, 26.0, [[19.0, -40], [19.4, -24], [25.8, -26], [26.0, -40]], src=20)
amb("market", f("smarket", "b5ce52ab"), 26, 34, -20, src=30)
lay("groan5", f("groan", "fb30c77a"), 26.0, 34.0, [[26.0, -40], [26.4, -26], [33.8, -26], [34.0, -40]], src=8)
amb("parl", f("murmur", "526fed3a"), 34, 43, -22)
lay("groan6", f("groan", "0346b8cf"), 34.0, 43.0, [[34.0, -40], [34.4, -27], [42.8, -27], [43.0, -40]], src=30)
amb("office", f("office", "759d6a11"), 43, 50, -22, src=20)
lay("laugh", f("park", "fcb2a873"), 43, 50, [[43, -40], [43.3, -27], [49.8, -27], [50, -40]], src=12)
lay("night", f("crickets", "965e8643"), 50.0, 56.0, [[50.0, -40], [50.9, -30], [52.5, -30], [52.7, -22], [55.8, -22], [56.0, -45]])
K = 'audio/code/'
for t, n in [(3.6, 'sting'), (6.0, 'sting'), (11.0, 'sting_hi'), (19.0, 'sting'), (26.0, 'sting_hi'), (34.0, 'sting')]: lay(f'c_st{t}', K + n + '.wav', t, t + 0.9, [[t, -21], [t + 0.9, -21]], loop=False)
for t, lv in [(3.6, 4), (11, 6), (19, 7), (26, 8), (34, 9), (43, 10)]: lay(f'c_lv{t}', K + f'lv{lv}.wav', t + 0.15, t + 0.33, [[t + 0.15, -20], [t + 0.33, -20]], loop=False)
lay('c_drop', K + 'drop.wav', 3.75, 4.35, [[3.75, -21], [4.35, -21]], loop=False)
lay('c_vote', K + 'vote.wav', 38.0, 42.6, [[38.0, -25], [42.6, -25]], loop=False)
lay('c_look', K + 'look.wav', 52.6, 55.0, [[52.6, -10], [55.0, -10]], loop=False, hp=250)
lay('c_look2', K + 'look.wav', 53.8, 56.0, [[53.8, -16], [56.0, -18]], loop=False, hp=400)
lay('crowdlaugh', f('stadium', '4104e353'), 53.4, 56.0, [[53.4, -40], [53.8, -14], [55.6, -15], [56.0, -45]])
lay('c_end', K + 'end.wav', 56.0, 62.0, [[56.0, -30], [62.0, -30]], loop=False)
json.dump(dict(duration_s=62.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
