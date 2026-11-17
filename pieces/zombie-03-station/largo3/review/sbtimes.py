# tiempos de los fotogramas del storyboard: un fotograma por plano al 65 % del plano (las etiquetas ya salieron)
import json, os
H = os.path.dirname(os.path.abspath(__file__))
f = json.load(open(f"{H}/cuts.json")); c = f["cuts"]
ids = [x[0] for x in c if not x[0].startswith("card_") or x[0] == "card_c1810"]
OVR = {"132_explode": 0.45, "58_lever": 0.5, "101_hall": 0.6, "132b_jump": 0.93, "133_land": 0.3, "150_choice": 0.6}   # segundos desde el inicio del plano (momentos de accion)
T = []
for i in ids:
    j = [x[0] for x in c].index(i); t0 = c[j][1]; t1 = c[j + 1][1] if j + 1 < len(c) else f["dur"]
    T.append(round(t0 + (OVR[i] * (t1 - t0) if i in OVR else max(0.3, min(t1 - t0 - 0.25, 0.65 * (t1 - t0)))), 2))
open(f"{H}/sb_times.txt", "w").write(",".join(f"{t:.2f}" for t in T)); print(len(T))
