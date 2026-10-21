# gen.py: writes layers.json — the sound bed for pulsar (CC0 recordings + code layers from synth.py). No music.
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
F, SH = 44.0, 51.0
# the fair at night: crowd, kids, the sea against the pilings, a distant city; it all goes quiet before the flare
lay("crowd", f("murmur", "93fc7f6c"), 0, F, [[0, -40], [0.4, -22], [10, -22], [12, -27], [42.6, -27], [43.0, -80]])
lay("talk", f("park", "fcb2a873"), 0, F, [[0, -40], [0.4, -25], [10, -25], [12, -30], [42.6, -30], [43.0, -80]], src=6)
lay("kids", f("kids", "997ecd4b"), 0, 12, [[0, -40], [0.4, -30], [11.6, -30], [12, -45]], src=50)
lay("sea", f("lap", "df9d3b7c"), 0, F, [[0, -40], [0.4, -24], [42.6, -26], [43.0, -80]])
lay("city", f("traffic", "c3575018"), 0, F, [[0, -40], [0.4, -32], [42.6, -34], [43.0, -80]], lp=1000, src=30)
lay("gasp", f("murmur", "526fed3a"), 10.2, 13.5, [[10.2, -40], [10.6, -24], [13.5, -40]], src=3)
# after the flare: screaming, glass breaking, the sea, then silence and crickets
lay("scream", f("panic", "a222b1dc"), F + 0.5, 59.0, [[F + 0.5, -40], [F + 1.0, -21], [57, -24], [59.0, -45]])
lay("glass1", f("glass", "07c4e075"), SH + 1.2, SH + 5.0, [[SH + 1.2, -14], [SH + 5.0, -20]], loop=False)
lay("glass2", f("glass", "3ed51915"), SH + 1.5, SH + 6.0, [[SH + 1.5, -16], [SH + 6.0, -22]], loop=False)
lay("glass3", f("glass", "a878655c"), SH + 2.1, SH + 6.0, [[SH + 2.1, -18], [SH + 6.0, -24]], loop=False)
lay("sea2", f("lap", "df9d3b7c"), 58, 71, [[58, -40], [59, -26], [70.6, -26], [71, -45]], src=20)
lay("crick", f("crickets", "965e8643"), 59, 71, [[59, -40], [61, -28], [70.6, -28], [71, -45]])
lay("wind", f("wind", "c0b32166"), 64, 71, [[64, -40], [66, -28], [70.6, -28], [71, -45]], lp=800)
K = 'audio/code/'
lay('c_appear', K + 'appear.wav', 9.0, 15.0, [[9.0, -24], [15.0, -24]], loop=False)
lay('c_pulse', K + 'pulse.wav', 16.0, 43.0, [[16.0, -22], [34, -19], [42.9, -16], [43.0, -80]], loop=False)
lay('c_aur', K + 'aurora.wav', 24.0, 43.0, [[24.0, -30], [42.9, -27], [43.0, -80]], loop=False)
lay('c_flare', K + 'flare.wav', F, F + 7.0, [[F, -12], [F + 7.0, -14]], loop=False, hp=300)
lay('c_shock', K + 'shock.wav', SH, SH + 4.0, [[SH, -14], [SH + 4.0, -16]], loop=False)
lay('c_pd', K + 'powerdown.wav', SH + 1.4, SH + 3.8, [[SH + 1.4, -20], [SH + 3.8, -20]], loop=False)
lay('c_end', K + 'end.wav', 71.0, 79.0, [[71.0, -30], [79.0, -30]], loop=False)
json.dump(dict(duration_s=79.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
