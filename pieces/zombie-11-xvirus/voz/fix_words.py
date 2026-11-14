# Ajusta los tiempos de palabra de engine/timeline.json a la energia real de track.wav (whisper adelanta los inicios
# tras un silencio y corta el final de linea): inicio = primer cuadro de 20 ms sobre -40 dB dentro de la palabra;
# la ultima palabra de cada linea dura hasta que la voz cae bajo -45 dB. python fix_words.py (despues de assemble.py)
import json, numpy as np, soundfile as sf
E = r"F:/Claude Proyectos/pieces/zombie-11-xvirus/engine/timeline.json"
x, sr = sf.read(r"F:/Claude Proyectos/pieces/zombie-11-xvirus/voz/track.wav"); x = x if x.ndim == 1 else x.mean(1)
H = int(0.02 * sr); db = 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)]) + 1e-9)
f = lambda t: min(len(db) - 1, max(0, int(t / 0.02)))
TL = json.load(open(E, encoding="utf8")); W = TL["words"]; n = 0
for i, w in enumerate(W):
    a, b = f(w[1]), f(w[2])
    if db[a] < -40:
        k = next((j for j in range(a, max(a + 1, b)) if db[j] > -40), None)
        if k is not None and k > a: w[1] = round(k * 0.02, 3); n += 1
        if i > 0 and W[i - 1][3] == w[3]: W[i - 1][2] = min(W[i - 1][2], w[1])
    last = i + 1 == len(W) or W[i + 1][3] != w[3]
    if last:
        j = b
        while j < len(db) - 5 and max(db[j:j + 5]) > -45: j += 1
        w[2] = round(max(w[2], j * 0.02), 3)
    w[2] = max(w[2], w[1] + 0.12)
for i in range(len(W) - 1):   # palabra corrida a menos de 0,2 s (inicio corregido): toma tiempo de la siguiente si esta es larga
    w, v = W[i], W[i + 1]
    if v[3] == w[3] and w[2] - w[1] < 0.2 and v[2] - v[1] > 0.4: w[2] = round(w[1] + 0.2, 3); v[1] = max(v[1], w[2])
json.dump(TL, open(E, "w", encoding="utf8"), ensure_ascii=False); print("inicios corregidos", n)
