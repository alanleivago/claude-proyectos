# gen.py: writes layers.json — the sound bed for religion (CC0 recordings + code layers from synth.py). No music.
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
def amb(id, file, t0, t1, db, fi=0.15, fo=0.15, **o): lay(id, file, t0, t1, [[t0, -40], [t0 + fi, db], [t1 - fo, db], [t1, -60]], **o)
K = 'audio/code/'
# 1. the cathedral: a pipe organ in a big stone room
amb("organ", f("organ", "41a4911f"), 0, 6.0, -15, fi=0.6, fo=0.05)
amb("cathamb", f("organ", "99f19919"), 0, 6.0, -26, src=40, fo=0.05)
# 2. the temples: a breath of each place, a thump on the cut, the shimmer as it dissolves
amb("mosq", f("murmur", "526fed3a"), 6.0, 7.25, -26, fi=0.05, fo=0.05)
amb("syn", f("murmur", "93fc7f6c"), 7.25, 8.5, -27, fi=0.05, fo=0.05, src=20)
amb("hin", f("chantin", "f046696d"), 8.5, 9.75, -21, fi=0.05, fo=0.05, src=2)
amb("bud", f("chantin", "0877048b"), 9.75, 11.0, -21, fi=0.05, fo=0.05, src=6)
lay("bowl", f("bowl", "4e1a2fa4"), 9.75, 11.0, [[9.75, -20], [11.0, -26]], loop=False)
for i, t in enumerate([6.0, 7.25, 8.5, 9.75]):
    lay(f"c_th{i}", K + 'thump.wav', t, t + 0.8, [[t, -16], [t + 0.8, -16]], loop=False)
    lay(f"c_sh{i}", K + 'shimmer.wav', t + 0.15, t + 1.75, [[t + 0.15, -19], [t + 1.75, -19]], loop=False)
# 3. the plaza: bells ring and stop; murmur; a long shimmer
amb("plzm", f("murmur", "93fc7f6c"), 11.0, 15.0, -24, fi=0.1)
lay("bells", f("bell", "6d1d7fbd"), 11.0, 13.6, [[11.0, -40], [11.1, -20], [13.2, -21], [13.6, -70]], src=30)
for k in range(3): t = 11.6 + k * 0.9; lay(f"c_shp{k}", K + 'shimmer.wav', t, t + 1.6, [[t, -20], [t + 1.6, -20]], loop=False)
lay("c_thp", K + 'thump.wav', 11.0, 11.8, [[11.0, -18], [11.8, -18]], loop=False)
# 4. the city from above: wind, shimmers one after another
amb("wind", f("wind", "c0b32166"), 15.0, 18.0, -24, fi=0.1, lp=2500)
for k in range(10): t = 15.15 + k * 0.22; lay(f"c_sha{k}", K + 'shimmer.wav', t, t + 1.6, [[t, -24], [t + 1.6, -24]], loop=False)
# 5. St Peter's Square: a huge crowd, bells that stop
amb("vatc", f("murmur", "93fc7f6c"), 18.0, 23.0, -20, fi=0.1, src=5)
lay("vbells", f("bell", "44a8667a"), 18.0, 19.6, [[18.0, -40], [18.1, -22], [19.3, -22], [19.6, -70]], src=10)
for k in range(3): t = 18.8 + k * 0.9; lay(f"c_shv{k}", K + 'shimmer.wav', t, t + 1.6, [[t, -19], [t + 1.6, -19]], loop=False)
lay("vgasp", f("crowdgasp", "004b9803"), 19.4, 21.6, [[19.4, -22], [21.6, -28]], src=6, loop=False)
# 6. the Ganges: water, birds, chanting that fades into just the river
amb("lap", f("lap", "df9d3b7c"), 23.0, 28.0, -22, fi=0.1)
amb("birds", f("birds", "98041fcc"), 23.0, 28.0, -30, fi=0.1)
lay("gchant", f("chantin", "ca699660"), 23.0, 26.4, [[23.0, -40], [23.1, -21], [24.4, -22], [26.0, -36], [26.4, -70]])
lay("c_shg", K + 'shimmer.wav', 23.6, 25.2, [[23.6, -20], [25.2, -20]], loop=False)
# 7. the nursery
amb("baby", f("baby", "5f7ae1b4"), 28.0, 33.0, -30, fi=0.1, src=2)
lay("c_nur", K + 'nursery.wav', 28.0, 33.0, [[28.0, -27], [33.0, -27]], loop=False)
for k in range(2): t = 31.1 + k * 0.25; lay(f"c_shn{k}", K + 'shimmer.wav', t, t + 1.6, [[t, -21], [t + 1.6, -21]], loop=False)
# 8. the shop counter
lay("reg", f("register", "62dd2f8f"), 33.0, 38.0, [[33.0, -40], [33.1, -20], [37.6, -22], [38.0, -60]], src=1)
amb("shop", f("murmur", "526fed3a"), 33.0, 38.0, -32, fi=0.1)
lay("c_shb", K + 'shimmer.wav', 35.9, 37.5, [[35.9, -20], [37.5, -20]], loop=False)
# 9. the stadium: songs, drums, flares
lay("sing", f("chant", "79f85181"), 38.0, 45.5, [[38.0, -40], [38.1, -16], [44.4, -16], [45.0, -26], [45.45, -80]])
lay("boca", f("chant", "67b1f788"), 38.0, 45.5, [[38.0, -40], [38.1, -19], [44.4, -19], [45.0, -28], [45.45, -80]])
lay("brig", f("chant", "5c96e82c"), 40.0, 45.5, [[40.0, -40], [40.1, -20], [44.4, -20], [45.0, -30], [45.45, -80]])
lay("c_swell", K + 'swell.wav', 44.45, 45.45, [[44.45, -20], [45.45, -18]], loop=False)
# 10. the shop window: silence; then the glass, the alarm
lay("glass1", f("glass", "3ed51915"), 46.5, 50.0, [[46.5, -10], [50.0, -16]], loop=False)
lay("glass2", f("glass", "a878655c"), 46.55, 51.0, [[46.55, -14], [51.0, -20]], loop=False)
lay("alarm", f("alarm", "342038c5"), 46.9, 51.0, [[46.9, -40], [47.1, -18], [50.6, -18], [51.0, -60]], src=3)
lay("street", f("traffic", "c3575018"), 46.5, 51.0, [[46.5, -40], [47.0, -26], [51.0, -26]], lp=1200, src=50)
# 11. the military cemetery: wind, birds, a warm chord when the 7 % glow
amb("wwind", f("wind", "c0b32166"), 51.0, 56.0, -30, fi=0.2, lp=1500, src=10)
amb("wbirds", f("birds", "98041fcc"), 51.0, 56.0, -34, fi=0.2, src=20)
lay("c_glow", K + 'glow.wav', 52.4, 56.0, [[52.4, -25], [56.0, -25]], loop=False)
# 12. the hospital corridor
amb("hosp", f("hospital", "15ae9dac"), 56.0, 60.0, -26, fi=0.1)
lay("c_hosp", K + 'hospital.wav', 56.0, 60.0, [[56.0, -27], [60.0, -27]], loop=False)
lay("c_end", K + 'end.wav', 60.0, 64.0, [[60.0, -24], [64.0, -24]], loop=False)
json.dump(dict(duration_s=64.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
