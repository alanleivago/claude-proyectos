# gen.py: writes layers.json — the sound bed for hombres (CC0 recordings + code layers from synth.py). No music.
import json
C = "F:/Claude Proyectos/sound-layer/work/cand/"
def f(cat, id): return f"{C}{cat}/transition/_raw/ov-{id}.mp3"
L = []
def lay(id, file, t0, t1, g, **o): L.append(dict(id=id, file=file, t0=t0, t1=t1, g=g, **o))
def amb(id, file, t0, t1, db, **o): lay(id, file, t0, t1, [[t0, -40], [t0 + 0.25, db], [t1 - 0.25, db], [t1, -40]], **o)
Z = 10.0
# 1. arena (0-12): the crowd roars with the countdown; at zero half of it is gone: a stunned murmur, then screams
lay("arena", f("arena", "c6f25d22"), 0, Z, [[0, -40], [0.5, -17], [4, -18], [8.8, -18], [9.2, -24], [9.45, -70], [Z, -70]], src=20)
lay("arena2", f("arena", "385dedf6"), 2, Z, [[2, -40], [4, -21], [8.8, -19], [9.2, -26], [9.45, -70], [Z, -70]], src=40, pan=0.3)
lay("stun", f("murmur", "9783c4b5"), Z + 0.6, 12, [[Z + 0.6, -40], [Z + 1.2, -20], [12, -24]], lp=2500)
lay("scream", f("panic", "a222b1dc"), Z + 1.0, 12, [[Z + 1.0, -30], [12, -27]])
# 2. bike (12-25): a quiet suburban street, birds, the bike's tick
amb("suburb", f("suburb", "19404eea"), 12, 25, -19)
lay("birdsA", f("birds", "98041fcc"), 12, 25, [[12, -40], [12.3, -24], [24.8, -24], [25, -40]], src=10)
# 3. cockpit (25-33)
amb("cockpit", f("cockpit", "2dddd1da"), 25, 33, -16, src=20)
# 4. vigil (33-45): a quiet crowd, crickets, a soft wind
amb("vigil", f("murmur", "7cafca84"), 33, 45, -25, lp=1800)
amb("crick", f("crickets", "6df69a63"), 33, 45, -27)
# 5. trench (45-51): wind over the field, a far rumble
amb("trwind", f("wind", "c0b32166"), 45, 51, -19)
amb("trrum", f("rumble", "d07e6e1e"), 45, 51, -30, src=50, lp=300)
# 6. hall (51-58): an empty hall
amb("hall", f("lab", "418a1785"), 51, 58, -22, src=40)
# 7. hospital (58-66)
amb("hosp", f("hospital", "fa9dba2e"), 58, 66, -18)
# 8. market (66-72)
amb("market", f("market", "e2632d4a"), 66, 72, -19)
# 9. blackout (72-78): a room, the city outside; it all goes silent at 73.4
lay("room", f("traffic", "c3575018"), 72, 73.4, [[72, -40], [72.25, -26], [73.4, -60]], lp=2500)
lay("roomq", f("lab", "e3bd8363"), 73.4, 78, [[73.4, -40], [74, -30], [77.8, -30], [78, -40]], src=60)
# 10. school (78-88)
amb("class", f("classroom", "eb9de832"), 78, 88, -20, src=30)
# 11. pole (88-100): night crickets, a spark, the city hum coming back
amb("polecr", f("crickets", "965e8643"), 88, 100, -24)
lay("spark", f("spark", "fdbef211"), 92.4, 94.6, [[92.4, -21], [94.6, -34]], loop=False)
lay("city", f("traffic", "c3575018"), 93.2, 100, [[93.2, -40], [95, -24], [100, -24]], src=60, lp=3000)
# 12. work (100-112)
lay("truck", f("traffic2", "5a8d6ad8"), 100, 106, [[100, -40], [100.25, -20], [105.8, -20], [106, -40]], src=5)
amb("site", f("construct", "d8f76f56"), 106, 112, -18)
# 13. night (112-128): a quiet street, her footsteps
amb("nightamb", f("crickets", "269a5307"), 112, 128, -26)
amb("nsteps", f("steps", "e160926c"), 112, 128, -24, lp=4000)
# 14. lab (128-140): room tone, mist hiss
amb("labrt", f("lab", "ebbe6162"), 128, 140, -20, src=20)
amb("mist", f("fizz", "47f7e118"), 128, 140, -34, lp=5000)
# 15. scan (140-152): the fluorescent hum of the clinic
amb("scanroom", f("hospital", "21bfdb2a"), 140, 152, -26)
# 16. ward (152-162): the newborn cries, the ward around
amb("ward", f("hospital", "15ae9dac"), 152, 162, -24)
lay("baby", f("baby", "844a0d2a"), 152.6, 161.8, [[152.6, -24], [156, -22], [160, -30], [161.8, -40]], src=10)
# 17. street2 (162-172): the same street, children laughing
amb("suburb2", f("suburb", "19404eea"), 162, 172, -19, src=20)
lay("kids", f("bell", "6d1d7fbd"), 165, 172, [[165, -40], [166, -26], [171.6, -26], [172, -40]], src=30, hp=300)
lay("birdsB", f("birds", "0e2335ff"), 162, 172, [[162, -40], [162.3, -24], [171.8, -24], [172, -40]], src=30)
K = 'audio/code/'
lay('c_beeps', K + 'beeps.wav', 4.0, 9.5, [[4.0, -24], [9.5, -24]], loop=False)
lay('c_shim', K + 'shimmer.wav', 14.5, 16.3, [[14.5, -16], [16.3, -16]], loop=False)
lay('c_caut', K + 'caution.wav', 25.0, 33.0, [[25.0, -27], [33.0, -27]], loop=False)
lay('c_pdown', K + 'powerdown.wav', 73.4, 75.0, [[73.4, -20], [75.0, -20]], loop=False)
lay('c_pup', K + 'powerup.wav', 93.0, 95.5, [[93.0, -21], [95.5, -21]], loop=False)
lay('c_fetal', K + 'fetal.wav', 140.0, 152.0, [[140.0, -16], [152.0, -16]], loop=False)
lay('c_buzz', K + 'buzzer.wav', 10.0, 13.2, [[10.0, 5], [13.2, 5]], loop=False)
lay('c_end', K + 'end.wav', 172.0, 179.8, [[172.0, -27], [179.8, -27]], loop=False)
json.dump(dict(duration_s=180.0, layers=L), open("layers.json", "w"), indent=1)
print(len(L), "layers")
