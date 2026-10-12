# gen.py: writes layers.json — the recorded sound bed for corre (all CC0 recordings), from the story timeline + passes.json
import json, math
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
P = json.load(open("passes.json")); L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=round(t0, 3), t1=round(t1, 3), g=g, **o))

# 1. the promenade at sunrise (0-10): waves on the beach, gulls, early traffic, people
lay("waves", f("surf", "3ffaa3c2"), 0, 18.6, [[0, -40], [0.4, -10], [4.5, -10], [10, -16], [16, -28], [18.6, -40]], src=6, pan=-0.45)
lay("waves2", f("lap", "29e82538"), 0, 14, [[0, -40], [0.4, -16], [8, -18], [14, -40]], pan=-0.6)
lay("gulls", f("gulls", "248c4a57"), 0, 14, [[0, -40], [0.4, -12], [8, -14], [14, -40]], src=12, pan=-0.3)
lay("people", f("gulls", "e5bf6111"), 0, 12, [[0, -40], [0.4, -16], [6, -16], [12, -40]], src=30, hp=150, pan=0.2)
lay("traffic", f("traffic", "c3575018"), 0, 18.6, [[0, -40], [0.4, -18], [9, -14], [14, -12], [18.6, -30]], src=60, pan=0.4)
# 2. your run: footfalls on the stride (cut from one recording), breathing
for i, t in enumerate(P["steps"]):
    if t < 4.65: continue
    g = -9 + 4 * min(1, (t - 4.6) / 6) - 10 * max(0, (t - 15) / 3.5)
    lay(f"step{i}", f"audio/steps/step{(i % 11) + 1:02d}.wav", t - 0.01, t + 0.22, [[t, g], [t + 0.22, g]], loop=False, pan=0.08 if i % 2 else -0.08)
lay("breath", f("breath", "bab5dcda"), 4.6, 18.6, [[4.6, -40], [5.6, -12], [12, -11], [16, -16], [18.6, -30]], src=4)
# 3. the coast road: cars going by (Doppler recordings), then fast whooshes; after Mach 1 nothing behind can reach you
CARS = [(f("carpass", "bcb3560f"), 5.2), (f("carpass", "32ddca2a"), 1.4), (f("carpass", "1ab55f26"), 7.9), (f("carpass", "9d4815b9"), 4.3)]
WH = [(f("whooshb", "210a2965"), 0.55), (f("whooshb", "45c2cda9"), 0.25)]
last = -9
for k, c in enumerate(P["cars"]):
    t = c["t"]
    if t > 18.45 or t - last < 0.42: continue
    last = t; pan = max(-0.8, min(0.8, (c["x"] - 3.5) / 5))
    if t < 14.2:
        fl, pk = CARS[k % 4]; lay(f"car{k}", fl, t - 1.3, t + 1.3, [[t - 1.3, -16], [t, -6 if not c["oncoming"] else -8], [t + 1.3, -18]], src=pk - 1.3, loop=False, pan=pan)
    else:
        fl, pk = WH[k % 2]; lay(f"carw{k}", fl, t - pk, t - pk + 1.2, [[t - pk, -12], [t - pk + 1.2, -14]], loop=False, pan=pan)
# wind: grows with speed (a low, filtered layer first, then the full howl), the gale at Mach 1 and beyond
lay("windlo", f("wind", "582e0d21"), 6, 38.5, [[6, -40], [10, -20], [14, -13], [18.6, -12], [24, -13], [31, -14], [38.5, -18]], src=30, lp=900)
lay("windhi", f("wind", "dffa67b8"), 11, 38.5, [[11, -40], [15, -18], [18.4, -13], [19, -11], [24, -11], [31, -12], [38.5, -14]], src=20)
lay("gusts", f("wind", "bdf05a61"), 14, 38.5, [[14, -40], [18, -16], [30, -12], [38.5, -14]], src=5, pan=0.4)
# 4. Mach 1 (18.6): the double sonic boom, then the roar; glass bursting behind you (heard faint and filtered)
lay("boom1", f("sonic", "12e6d59b"), 18.45, 22.5, [[18.45, -10], [20, -16], [22.5, -32]], loop=False, src=0.05)
lay("boom2", f("sonic", "7f399b83"), 18.42, 21.8, [[18.42, -12], [21.8, -30]], loop=False, src=1.45, lp=2500)
lay("roar", f("falls", "55d8dda1"), 18.6, 38.5, [[18.6, -30], [19.4, -14], [24, -11], [31, -8], [36, -6], [38.4, -4], [38.5, -30]], lp=1600)
for k, (gid, t) in enumerate([("3ed51915", 20.35), ("caaa372a", 20.8), ("a878655c", 21.2), ("07c4e075", 21.55), ("522b0218", 21.9)]):
    lay(f"glass{k}", f("glass", gid), t, t + 2.2, [[t, -21], [t + 2.2, -34]], loop=False, lp=3500, pan=0.6 if k % 2 else -0.6)
# the towers' glass bursting round you (23.6-28.4): heard faint and filtered (you outrun most of the sound)
for k, (gid, t) in enumerate([("3ed51915", 23.7), ("a878655c", 24.4), ("caaa372a", 25.1), ("07c4e075", 25.9), ("522b0218", 26.6), ("3ed51915", 27.3), ("caaa372a", 28.0)]):
    lay(f"tglass{k}", f("glass", gid), t, t + 2.0, [[t, -22], [t + 2.0, -36]], loop=False, lp=3000, pan=0.55 if k % 2 else -0.55)
# 5. the towers and the plains (23-31): jets tearing past
lay("jet1", f("jet", "e97c04ed"), 22.6, 30, [[22.6, -30], [24.5, -8], [27, -6], [30, -22]], src=2.5)
lay("jet2", f("jet", "5d97f086"), 25, 32, [[25, -30], [27.5, -10], [32, -24]], src=6, pan=0.3)
# 6. the air burns (31-38.5): flamethrower roar, a deep rumble, everything at its loudest
lay("flame", f("flame", "0c4714cb"), 30.5, 38.5, [[30.5, -40], [32, -12], [36, -9], [38.4, -8], [38.5, -30]], src=2)
lay("flame2", f("flame", "c112a03e"), 31, 38.5, [[31, -40], [33, -14], [38.4, -8], [38.5, -30]], src=40, pan=0.3)
lay("rumble", f("rumble", "d07e6e1e"), 29, 38.5, [[29, -40], [33, -9], [38.4, -7], [38.5, -30]], src=15)
# 7. above the atmosphere (38.5-44): the roar falls away to a faint low wind; a deep hum
lay("flare", f("whooshb", "210a2965"), 37.6, 40.2, [[37.6, -14], [38.4, -12], [40.2, -30]], loop=False)
lay("thin", f("wind", "582e0d21"), 38.5, 44, [[38.5, -16], [40, -26], [44, -40]], src=80, lp=500)
lay("hum", f("rumble", "d07e6e1e"), 38.5, 48, [[38.5, -20], [41, -18], [44, -26], [48, -40]], src=60, lp=180)
# 8. near-silence (44-48): your heartbeat and breath
lay("heart", f("heart", "c9fbf5d5"), 43.8, 48.6, [[43.8, -40], [44.4, -8], [47.6, -8], [48.6, -40]], src=0.5, lp=900)
lay("breath2", f("breath", "a218b3ce"), 44.2, 48.6, [[44.2, -40], [45, -20], [48.6, -40]], src=1, lp=2500)
# 9. the Moon and Jupiter rush past (48-56): deep whooshes, a low hum that grows
lay("moonpass", f("whooshb", "210a2965"), 49.0, 51.6, [[49.0, -14], [49.9, -8], [51.6, -30]], loop=False, lp=1800, pan=-0.6)
lay("juppass", f("whooshb", "210a2965"), 52.9, 55.6, [[52.9, -14], [53.9, -8], [55.6, -30]], loop=False, lp=1200, pan=0.6)
lay("hum2", f("rumble", "d07e6e1e"), 48, 64.9, [[48, -40], [50, -18], [56, -14], [62, -6], [64.8, -2], [64.9, -40]], src=20, lp=260)
# 10. towards light (56-64.9): the rumble climbs; a cold air layer; then silence 64.9-65.5
lay("cold", f("wind", "dffa67b8"), 56, 64.9, [[56, -40], [59, -24], [64.8, -10], [64.9, -40]], src=90, hp=1200)
# 11. THE HIT (65.5): a burst of roar under the hit (the mixer sizes the hit against it), then a long low tail
lay("burst", f("falls", "55d8dda1"), 65.5, 66.4, [[65.5, 12], [65.9, 3], [66.4, -30]], src=10)
lay("tail", f("rumble", "d07e6e1e"), 65.5, 71, [[65.5, 0], [67, -10], [71, -40]], src=40, lp=300)
# 12. the end card (69-75): a faint low air, fading out
lay("end", f("wind", "582e0d21"), 69, 74.99, [[69, -40], [70, -26], [74.5, -30], [74.99, -60]], src=120, lp=400)
json.dump(dict(duration_s=75.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
