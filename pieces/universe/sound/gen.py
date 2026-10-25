# gen.py: writes layers.json — the sound bed for universe (CC0 recordings, reversed copies, code layers). No music.
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
def one(id, file, t, d, db, **o): lay(id, file, t, t + d, [[t, db], [t + d, db]], loop=False, **o)
K, O = 'audio/code/', 'audio/own/'
# 1. sunset at the fountain: water, people, kids, evening birds; cut by the leave at 8 s
cut = lambda db: [[0, -40], [0.4, db], [7.85, db], [8.05, -80]]
lay("fount", f("fountain", "2a34f1c3"), 0, 8.1, cut(-22)); lay("crowd", f("murmur", "93fc7f6c"), 0, 8.1, cut(-24)); lay("kids", f("kids", "997ecd4b"), 0, 8.1, cut(-31), src=30); lay("birds", f("birds", "98041fcc"), 0, 8.1, cut(-30))
one('c_ticks', K + 'ticks.wav', 2.8, 5.2, -22); one('c_leave', K + 'leave.wav', 8.0, 3.0, -12)
# 2. out into space: the drone; muffled fountain; streaks; the shimmer of the galaxy; the rush to the Earth view
lay('c_drone', K + 'drone.wav', 8.0, 46.0, [[8.0, -26], [20, -22], [26.8, -22], [27.0, -40], [29.6, -40], [30.0, -24], [43, -24], [46, -32]], loop=False)
lay("fmuff", f("fountain", "2a34f1c3"), 8.3, 26.9, [[8.3, -40], [9.5, -34], [26.5, -36], [26.9, -80]], lp=500, src=20)
one('c_streaks', K + 'streaks.wav', 10.5, 3.0, -16); one('c_shim', K + 'shimmer.wav', 13.0, 7.0, -20); one('c_shim2', K + 'shimmer.wav', 20.0, 7.0, -24)
one('c_rush', K + 'rush.wav', 24.0, 3.0, -18)
# (27–29.6 nearly silent: the cosmic web)
one('c_quasar', K + 'quasar.wav', 30.9, 4.5, -15); lay("qcrowd", f("murmur", "526fed3a"), 30.0, 37.0, [[30, -40], [30.5, -32], [36.6, -33], [37, -45]])
one('c_chimes', K + 'chimes.wav', 37.0, 3.2, -22)
# 3. the heat: a roar rising to a furnace; steam, crackling paper, fire in the trees and the city; screams; cut dead at 61.6
lay('c_heat', K + 'heat.wav', 43.0, 61.6, [[43.0, -26], [52, -19], [61.5, -16], [61.6, -80]], loop=False)
lay("steam", f("fizz", "308a6547"), 46.0, 61.6, [[46, -40], [46.5, -26], [61.5, -28], [61.6, -80]], hp=1500)
lay("paper", f("fire", "166449d3"), 48.0, 50.4, [[48, -40], [48.6, -24], [50.0, -24], [50.4, -45]], hp=1200)
lay("trees", f("fireroar", "2822466d"), 50.0, 61.6, [[50, -40], [50.6, -21], [61.5, -19], [61.6, -80]])
lay("panic", f("panic", "a222b1dc"), 52.0, 58.0, [[52, -40], [52.6, -27], [57.6, -30], [58, -50]])
# 4. the room outside the universe: a soft hum, the screen's whine; the click; then REWIND, everything backward
lay("room", f("office", "759d6a11"), 62.4, 67.0, [[62.4, -40], [62.8, -34], [66.8, -34], [67.0, -60]], lp=2500)
one('c_click', K + 'click.wav', 66.6, 0.35, -18); one('c_rew', K + 'rewind.wav', 67.0, 3.0, -6)
lay("frev", O + 'fount_rev.wav', 68.0, 70.2, [[68.0, -40], [68.6, -26], [70.0, -24], [70.2, -40]]); lay("crev", O + 'crowd_rev.wav', 68.3, 70.2, [[68.3, -40], [69, -28], [70.2, -40]])
# 5. sunset again, then the card
lay("fount2", f("fountain", "2a34f1c3"), 70.0, 73.0, [[70.0, -40], [70.3, -24], [72.2, -26], [73.0, -60]], src=40); lay("crowd2", f("murmur", "93fc7f6c"), 70.0, 73.0, [[70.0, -40], [70.3, -27], [72.2, -29], [73.0, -60]], src=30)
one('c_end', K + 'end.wav', 73.0, 7.0, -26); lay('cardamb', f('birds', '98041fcc'), 73.0, 79.6, [[73.0, -50], [74, -40], [79, -42], [79.6, -70]], src=80, lp=3000)
json.dump(dict(duration_s=80.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
