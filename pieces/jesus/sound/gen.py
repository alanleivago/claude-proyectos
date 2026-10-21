# gen.py: writes layers.json — the sound bed for jesus (CC0 recordings + code layers from synth.py). No music; real choirs.
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
B, D, X = 12.5, 66.5, 65.45
# 1. the plaza at sunset: people, cups, the fountain, pigeons, footsteps; it all drains away as your friend falls quiet
lay("square", f("cafe", "56773fb4"), 0, B, [[0, -40], [0.4, -21], [9.5, -21], [12.2, -36], [12.45, -80]], src=200)
lay("talk", f("park", "fcb2a873"), 0, B, [[0, -40], [0.4, -24], [9.5, -24], [11.6, -40], [12.4, -80]], src=6)
lay("cups", f("clink", "cebbbe79"), 0, B, [[0, -40], [0.4, -27], [9.8, -27], [11.4, -45]])
lay("fount", f("fountain", "2a34f1c3"), 0, B, [[0, -40], [0.4, -31], [11.8, -33], [12.4, -60]], lp=3500)
lay("pig", f("pigeons", "8ad630be"), 0, B, [[0, -40], [0.4, -29], [11.6, -31], [12.4, -60]])
lay("steps", f("steps", "e160926c"), 0, 10.5, [[0, -40], [0.4, -33], [10.0, -33], [10.5, -50]])
# 2. the bolt and the trumpet; pigeons burst up; the awe
lay("thunder", f("thunder", "28ff7103"), B - 0.1, 21, [[B - 0.1, -18], [B + 0.5, -13], [16, -20], [21, -32]], src=0.7)
lay("shofar", f("shofar", "2a5bae1b"), 13.1, 17.6, [[13.1, -17], [17.6, -17]], src=0.8, loop=False)
lay("flap", f("pigeons", "1f89c2ec"), 12.6, 16.4, [[12.6, -16], [16.4, -24]], loop=False)
lay("whistle", f("pigeons", "2626c0a8"), 12.8, 14.5, [[12.8, -20], [14.5, -22]], loop=False)
lay("wind", f("wind", "c0b32166"), 13.5, 61, [[13.5, -40], [15, -30], [44, -30], [46, -31], [54, -30], [60.6, -34], [61, -50]], lp=1500)
lay("ooh", f("crowdgasp", "004b9803"), 14.2, 16.4, [[14.2, -20], [16.4, -26]], src=6, loop=False)
# 3. the sky opens: choir 1
lay("choir1", f("choir", "3aa6851d"), 16.8, 30, [[16.8, -40], [18.5, -14], [23.6, -14], [24.4, -24], [29.5, -27], [30, -45]], src=10)
# 4. kneeling, filming; the tray falls
lay("murm", f("murmur", "526fed3a"), 24, 34, [[24, -40], [24.4, -26], [33.6, -30], [34, -45]])
lay("gasp", f("gasp", "dc075e45"), 24.5, 26, [[24.5, -22], [26, -22]], loop=False)
lay("glass", f("glass", "07c4e075"), 26.3, 30, [[26.3, -15], [30, -22]], loop=False)
lay("clink2", f("clink", "d793a885"), 26.36, 28.3, [[26.36, -17], [28.3, -17]], loop=False)
lay("heart", f("heart", "c9fbf5d5"), 30, 34, [[30, -40], [30.3, -24], [33.8, -24], [34, -40]])
# 5. people rise: choir 2
lay("choir2", f("choir", "effc2c9c"), 34.2, 46, [[34.2, -40], [35.5, -14], [39.8, -14], [40.6, -26], [45.6, -30], [46, -50]], src=13)
lay("aah", f("crowdgasp", "13a90ae6"), 34.8, 40, [[34.8, -40], [35.4, -25], [40, -30]], src=13)
# 6. the crutches fall; joy
lay("crut1", f("crutch", "2a565d6f"), 41.6, 43.5, [[41.6, -15], [43.5, -15]], loop=False)
lay("crut2", f("crutch", "91be68c7"), 41.75, 43.5, [[41.75, -18], [43.5, -18]], loop=False)
lay("cheer", f("crowdgasp", "004b9803"), 43.6, 46, [[43.6, -22], [46, -30]], src=0, loop=False)
lay("fount2", f("fountain", "2a34f1c3"), 40, 46, [[40, -40], [40.5, -33], [46, -36]], lp=3500)
# 7. the sun goes dark; the stars fall
lay("rumble", f("rumble", "a2ee6837"), 47, 54, [[47, -40], [49, -20], [53.5, -20], [54, -40]])
lay("meteor", f("meteor", "0b641901"), 51.2, 56, [[51.2, -18], [56, -24]], loop=False)
lay("panic", f("panic", "a222b1dc"), 51.4, 54, [[51.4, -40], [51.8, -25], [53.6, -27], [54, -45]])
# 8. the cemetery: choir 3 (low, solemn)
lay("choir3", f("choir", "203748b1"), 54, 61, [[54, -40], [55, -16], [60.5, -16], [61, -40]], src=16)
lay("crick", f("crickets", "965e8643"), 54, 61, [[54, -40], [55, -32], [61, -34]])
# 9. the airfield: engines, people running; then everything stops dead
lay("jet1", f("jet", "7de6124e"), 61, X, [[61, -40], [61.3, -15], [65.2, -13], [X, -80]], src=32)
lay("jet2", f("jet", "e97c04ed"), 61, X, [[61, -40], [61.3, -20], [65.2, -18], [X, -80]], src=2)
lay("run", f("panic", "a222b1dc"), 61, X, [[61, -40], [61.4, -26], [65.2, -26], [X, -80]], src=20)
# 10. the descent: choir 4 (hallelujah) over an angelic choir
lay("choir4", f("choir", "69a504f3"), D + 0.1, 72, [[D + 0.1, -10], [71.5, -9], [72, -40]], loop=False)
lay("choir5", f("choir", "3aa6851d"), D, 72.4, [[D, -30], [67.5, -12], [71.8, -12], [72.4, -40]], src=40)
K = 'audio/code/'
lay('c_tram', K + 'tram.wav', 5.0, 7.0, [[5.0, -24], [7.0, -24]], loop=False)
lay('c_trumpet', K + 'trumpet.wav', 12.9, 16.9, [[12.9, -20], [16.9, -20]], loop=False)
lay('c_open', K + 'open.wav', 17.0, 24.0, [[17.0, -21], [24.0, -21]], loop=False)
lay('c_watch1', K + 'watch.wav', 30.3, 31.5, [[30.3, -16], [31.5, -16]], loop=False)
lay('c_watch2', K + 'watch.wav', 32.1, 33.3, [[32.1, -18], [33.3, -18]], loop=False)
lay('c_rise', K + 'rise.wav', 34.6, 40.6, [[34.6, -19], [40.6, -19]], loop=False)
lay('c_joy', K + 'joy.wav', 41.8, 45.8, [[41.8, -23], [45.8, -23]], loop=False)
lay('c_dark', K + 'dark.wav', 46.5, 54.0, [[46.5, -15], [54.0, -15]], loop=False)
lay('c_stars', K + 'stars.wav', 51.0, 61.0, [[51.0, -22], [61.0, -22]], loop=False)
lay('c_beams', K + 'beams.wav', 54.0, 61.0, [[54.0, -22], [61.0, -22]], loop=False)
lay('c_descend', K + 'descend.wav', D, 72.0, [[D, -8], [72.0, -8]], loop=False)
lay('c_open2', K + 'open.wav', D + 0.3, 72.2, [[D + 0.3, -21], [72.2, -21]], loop=False)
lay('c_end', K + 'end.wav', 72.0, 79.0, [[72.0, -26], [79.0, -26]], loop=False)
json.dump(dict(duration_s=79.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
