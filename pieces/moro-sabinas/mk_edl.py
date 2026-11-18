"""Arma la EDL de edit.py desde renders/phr.json: una entrada por frase (-0.08/+0.15 s), punch-in en frases > 2.5 s, ganancia para nivelar voz a -20 dB RMS."""
import json, subprocess, sys, re, numpy as np
from pathlib import Path
D = Path(__file__).parent; P = json.loads((D / "renders/phr.json").read_text(encoding="utf-8"))
L = json.loads((D / "lines.json").read_text(encoding="utf-8"))
MUTE = json.loads(sys.argv[1]); MERGE = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
def rms(cid, s, e):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(s), "-to", str(e), "-i", str(D / "clips" / f"{cid}.mp4"), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768; return 20 * np.log10(np.sqrt(np.mean(a ** 2)) + 1e-9)
rows = []
for cid in L:
    if cid in MUTE: rows.append(f"       ('{cid}', ({MUTE[cid][0]}, {MUTE[cid][1]}), '', 0),"); continue
    if cid == list(L)[-1]: rows.append("       ('BLACK', 0.4),")
    ph = [p["v"] for p in P[cid]["phr"]]
    mm = []  # frases de Whisper que se solapan (o casi): un solo tramo, si no la voz se repite
    for v in ph:
        if mm and v[0] < mm[-1][1] + 0.1: mm[-1] = [mm[-1][0], max(mm[-1][1], v[1])]
        else: mm.append(list(v))
    ph = mm
    for a, b in MERGE.get(cid, []):  # unir frases a..b (índices)
        ph[a:b + 1] = [[ph[a][0], ph[b][1]]]
    g = -20 - rms(cid, ph[0][0], ph[-1][1]); g = max(-6, min(6, g))
    for s, e in ph:
        s, e = round(max(0, s - 0.08), 2), round(e + 0.15, 2)
        sw = f", [({round((s + e) / 2, 2)}, PUNCH)]" if e - s > 2.6 else ""
        rows.append(f"       ('{cid}', ({s}, {e}), '', '{g:.1f}dB'{sw}),")
print("EDL = [" + "\n".join(rows).strip()[:-1] + "]")
