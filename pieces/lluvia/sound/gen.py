# gen.py: writes layers.json — the sound bed for lluvia (CC0 recordings + code layers from synth.py)
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
UNDER, HIT, STOP = 47.0, 54.4, 55.0

# 1. the city (0-10), then the rain takes over
lay("street", f("traffic2", "b855dc09"), 0, 14, [[0, -40], [0.4, -17], [6, -21], [10, -28], [14, -40]], src=10)
lay("crowd", f("murmur", "9783c4b5"), 0, 10.5, [[0, -40], [0.4, -21], [8, -26], [10.5, -40]], hp=150)
lay("drops", f("umbrella", "81caa6b0"), 0.8, 12, [[0.8, -40], [2.5, -22], [8, -20], [12, -32]], src=5)
lay("steps", f("steps", "9a3e9d04"), 5.5, 9.5, [[5.5, -24], [9.5, -40]], loop=False, pan=0.3)
# 2. the downpour: city rain with thunder, growing into a wall; water running, gurgling drains
lay("rain1", f("rain", "aeb93f5a"), 2, UNDER, [[2, -40], [5, -20], [15, -15], [35, -13], [UNDER, -12]], src=20)
lay("rain2", f("rain", "6772eec3"), 6, UNDER, [[6, -40], [10, -19], [30, -15], [UNDER, -13]], src=8)
lay("rain3", f("rain", "ec0aada3"), 20, UNDER, [[20, -40], [24, -18], [44, -14], [UNDER, -13]], src=40)
lay("drain", f("drain", "c6d3cbf2"), 10, 30, [[10, -40], [12, -19], [26, -21], [30, -40]])
lay("flow", f("rapids", "2791b267"), 24, UNDER, [[24, -40], [27, -21], [40, -19], [UNDER, -24]])
lay("splash", f("lap", "27727379"), 17, 40, [[17, -40], [19, -22], [36, -24], [40, -40]], pan=-0.3)
for k, (tt, tid) in enumerate([(8.2, "679eb912"), (15.3, "ae930eab"), (31.4, "28ff7103"), (38.6, "679eb912"), (44.1, "ae930eab")]):
    lay(f"thun{k}", f("thunder", tid), tt, min(tt + 4.5, UNDER), [[tt, -12], [min(tt + 4.5, UNDER), -30]], loop=False, pan=0.4 if k % 2 else -0.4)
# 3. under the water (47-54.4): code drone + bubbles recording
lay("bubbles", f("bubbles", "be1cfee7"), UNDER, HIT - 0.9, [[UNDER, -26], [HIT - 0.9, -30]], src=30, lp=1200)
# 4. THE THUNDER (54.4) after 0.5 s of near silence; then silence, drips, the water draining, birds, a breeze
lay("thhit", f("thunder", "29f0067b"), HIT, HIT + 4.5, [[HIT, 2], [HIT + 4.5, -30]], loop=False, hp=280)
lay("drip1", f("drip", "d9fe8532"), STOP + 0.4, 66, [[STOP + 0.4, -40], [STOP + 1.5, -22], [64, -24], [66, -40]])
lay("drip2", f("drip", "34b7caec"), 56, 66, [[56, -40], [57.5, -24], [66, -40]], pan=0.4)
lay("drainout", f("drain", "8465ef8b"), 58, 66, [[58, -40], [59, -20], [64, -22], [66, -40]], src=30, lp=2500)
lay("birds", f("birds", "98041fcc"), 62, 70, [[62, -40], [64, -18], [69, -18], [70, -40]])
lay("birds2", f("birds", "0e2335ff"), 64.5, 70, [[64.5, -40], [66, -22], [70, -40]], src=20, pan=0.3)
lay("breeze", f("wind", "c0b32166"), 57, 70, [[57, -40], [60, -30], [70, -32]], lp=1200)
K = 'audio/code/'
lay('c_rain', K + 'rainwall.wav', 2.0, UNDER, [[2.0, -12], [40, -9], [UNDER, -8]], loop=False)
lay('c_under', K + 'under.wav', UNDER, HIT - 0.8, [[UNDER, -12], [HIT - 0.8, -12]], loop=False)
for k, tt in enumerate([8.2, 15.3, 31.4, 38.6, 44.1]): lay(f'c_roll{k}', K + 'roll.wav', tt + 0.15, tt + 3.15, [[tt + 0.15, -16], [tt + 3.15, -16]], loop=False)
lay('c_thunder', K + 'thunder.wav', HIT, HIT + 4.5, [[HIT, 8], [HIT + 4.5, 8]], loop=False, hp=280)
lay('c_end', K + 'end.wav', 70.0, 74.9, [[70.0, -18], [74.9, -18]], loop=False)
json.dump(dict(duration_s=75.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
