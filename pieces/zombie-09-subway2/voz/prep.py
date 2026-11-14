# Copia las tomas de VoiceStudio a lines/<id>_<j>.wav, las verifica con whisper y escribe lines.json con los
# inicios en cadena (pausa PAUSE entre partes de una linea, GAP entre lineas). python prep.py
import json, shutil, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
V = "takes4"   # ep5: 4 semillas por toma, pick.py elige la mas viva que whisper oye bien (pick.json)
P = json.load(open("pick4.json"))   # v4: todas las tomas nuevas, 8 semillas
ids = lambda *t: ",".join(P[x] for x in t)
L = [  # id, tomas, texto, pausa. Ep9 v3: tomas v1 (takes_v1, pick v1) + tomas aparte solo en las comas de la eleccion (get on, / or stay; Red, / White,)
 ("01_hook", ids("01_0", "01_2", "01_3"), "Last time, you had to choose… get on, or stay.", 0.5),
 ("02_stay", ids("02_0", "02_1", "02_2"), "Say you stay. The doors close, and the train leaves without you. On the floor you find the rest of rule two… if you hear footsteps behind you, don't turn around.", 0.4),
 ("03_turn", ids("03_0", "03_1", "03_2"), "And right then, you hear footsteps. So you turn around. Two eyes in the dark… and a smile way too wide for a face.", 0.35),
 ("04_run", ids("04_0"), "You run for the exit, but the gate is still locked.", 0.3),
 ("05_fudge", "ep1", "Oh, fudge.", 2.6),   # YOU DIED + glitch
 ("06_rewind", ids("05_0"), "Okay, let's rewind.", 0.45),
 ("07_geton", ids("06_0", "06_1"), "This time, you get on. The doors shut right in its face, and it bangs on the glass… but you're inside. You finally breathe.", 0.4),
 ("08_speed", ids("07_0", "07_1"), "Then the train speeds up. It switches tracks and stops in a tunnel you've never seen… and the lights go out.", 0.6),
 ("09_screen", ids("08_0", "08_2", "08_3", "08_4", "08_5"), "A screen turns on. Welcome to the last stop, you have one minute. Red, you leave the train. White, you stay on board.", 0.45),
 ("10_open", ids("09_0", "09_1", "09_2", "09_3"), "Then the doors open… on total darkness. Five seconds left… and something out there is breathing.", 0.5),
 ("11_choice", ids("10_0", "10_1", "10_2"), "So, what do you do? Leave… or stay? Comment one or two.", 0.0),
]
PAUSE, T0 = 0.28, 0.3   # tomas aparte: pausa real en la coma
EXTRA = {('11_choice', 1): 0.2, ('02_stay', 0): 0.25, ('03_turn', 0): 0.25, ('10_open', 0): 0.15}   # ep9: respiro corto donde hay accion (tren que se va, giro, puertas)
m = WhisperModel("small", device="cpu", compute_type="int8")
def trimlen(x, sr):
    H = int(0.01 * sr); r = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)])
    nz = np.where(r > r.max() * 10 ** (-45 / 20))[0]; return (nz[-1] - nz[0] + 1) * 0.01
out, t = [], T0
for lid, ids, text, gap in L:
    ids = ids.split(","); starts = []
    for j, a in enumerate(ids):
        dst = f"lines/{lid}_{j}.wav"
        if a != "ep1": shutil.copy(f"{V}/{a}.wav", dst)
        else: shutil.copy("../../zombie-01-door/voz/lines/13_fudge.wav", dst)
        x, sr = sf.read(dst); x = x if x.ndim == 1 else x.mean(1)
        seg, _ = m.transcribe(x[::3].astype(np.float32) if sr == 48000 else x.astype(np.float32), language="en")
        heard = " ".join(s.text.strip() for s in seg); d = trimlen(x, sr)
        print(f"{lid}_{j} {d:.2f}s | {heard}")
        starts.append(round(t, 2)); t += d + (PAUSE + EXTRA.get((lid, j), 0) if j < len(ids) - 1 else gap)
    out.append([lid, starts, ",".join(ids), text])
json.dump(out, open("lines.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("DUR", round(t + 3.0, 2))   # ep7: tarjeta NEXT: THE STAIRS + FOLLOW FOR MORE!   # ep5: tarjeta FOLLOW FOR MORE! ~4 s
