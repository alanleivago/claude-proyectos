# Copia las tomas de VoiceStudio a lines/<id>_<j>.wav, las verifica con whisper y escribe lines.json con los
# inicios en cadena (pausa PAUSE entre partes de una linea, GAP entre lineas). python prep.py
import json, shutil, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
V = "takes"   # ep5: 4 semillas por toma, pick.py elige la mas viva que whisper oye bien (pick.json)
P = json.load(open("pick.json"))
ids = lambda *t: ",".join(P[x] for x in t)
L = [  # id, tomas, texto, pausa tras la linea. Ep16 "Stuck On Floor 30, Part 2"
 ("01_hook", ids("01_0", "01_1"), "Thirty floors up, the stairs are the only way out… and tonight, something big just walked into the building.", 0.95),
 ("02_open", ids("02_0") + "/2," + ids("02_1"), "Last time, someone knocked on thirty-twelve. Some of you said open it. So you move the dresser and open the door… and his arm is bitten.", 1.1),   # se abalanza (02e)
 ("03_fudge", "04_fudge", "Oh, fudge.", 2.1),   # toma del ep1; despues YOU DIED ~2 s
 ("04_rewind", ids("05_0"), "Let's rewind.", 0.05),   # glitch ~1.2 s
 ("05_quiet", ids("06_0") + "/1," + ids("06_1", "06_2"), "Most of you said stay quiet. So you wait… and a note slides under the door. The stairs. It's coming up.", 0.5),
 ("06_phone", ids("07_0") + "/1", "Your phone's at eighteen percent. Airplane mode alone can stretch that by hours.", 1.8),   # (···) maquina de escribir
 ("07_steps", ids("08_0") + "/2", "Then footsteps in the stairwell, heavy and bare. In a stairwell, sound carries up floor after floor.", 0.5),
 ("08_peep", ids("09_0", "09_1"), "Through the peephole… the hunter reaches your floor.", 1.5),   # el primer golpe (08c)
 ("09_choice", ids("10_0", "10_1", "10_2"), "Hide in the tub… or climb down to the balcony below? Comment one or two.", 0.0),
]
PAUSE, T0 = 0.25, 0.25
EXTRA = {}   # pausa entre la pregunta y 'Comment'   # v2 (usuario): pausas cortas
NEG2 = 3.5   # ep14: la toma 2 de 12_choice cae al empezar el negativo con opciones (decision RE3: 3.5 s despues del corte)   # v3: pausas lentas y deliberadas alrededor de 'Lisa'   # v4: pausas cortas (usuario)
def squeeze(p, mx=0.35, keep=0.28):   # v2 (usuario): aire muerto > 0,35 s dentro de una toma se acorta a 0,28 s (corte en el silencio, fundido de 10 ms)
    x, sr = sf.read(p); H = int(0.01 * sr); r = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)])
    q = r < r.max() * 10 ** (-40 / 20); nz = np.where(~q)[0]; a0, a1 = nz[0], nz[-1]; out, i, last = [], a0, 0
    while i <= a1:
        if q[i]:
            j = i
            while j <= a1 and q[j]: j += 1
            if (j - i) * 0.01 > mx:
                c0 = (i + int(keep / 2 / 0.01)) * H; c1 = (j - int(keep / 2 / 0.01)) * H; f = int(0.01 * sr)
                seg = x[last:c0].copy(); seg[-f:] *= np.linspace(1, 0, f); out.append(seg); last = c1
            i = j
        else: i += 1
    rest = x[last:].copy(); f = int(0.01 * sr); rest[:f] *= np.linspace(0, 1, f); out.append(rest); y = np.concatenate(out)
    if len(y) < len(x): print(f"   squeeze {p}: -{(len(x) - len(y)) / sr:.2f}s"); sf.write(p, y, sr)
m = WhisperModel("small", device="cpu", compute_type="int8")
def trimlen(x, sr):
    H = int(0.01 * sr); r = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)])
    nz = np.where(r > r.max() * 10 ** (-45 / 20))[0]; return (nz[-1] - nz[0] + 1) * 0.01
def split_sil(x, sr, n):   # ep15: parte una toma de varias frases en sus n silencios mas largos (corte en el centro del silencio, nunca en una palabra)
    H = int(0.01 * sr); r = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)]); q = r < r.max() * 10 ** (-40 / 20)
    nz = np.where(~q)[0]; runs, i = [], nz[0]
    while i <= nz[-1]:
        if q[i]:
            j = i
            while j <= nz[-1] and q[j]: j += 1
            runs.append((j - i, (i + j) // 2)); i = j
        else: i += 1
    cuts = sorted(c for _, c in sorted(runs, reverse=True)[:n]); b = [0] + [c * H for c in cuts] + [len(x)]
    out = []
    for k in range(len(b) - 1):
        y = x[b[k]:b[k + 1]].copy(); f = int(0.01 * sr); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f); out.append(y)
    return out
GAPS = {   # pausas entre partes (ep16): las mas largas caen en beats con accion
 "01_hook": [0.8], "02_open": [0.4, 0.45, 0.55], "05_quiet": [0.45, 0.75, 0.55], "06_phone": [0.45], "07_steps": [0.4, 0.55], "08_peep": [0.75], "09_choice": [0.35, 0.4]}
out, t = [], T0
for lid, ids, text, gap in L:
    files = []
    for a in ids.split(","):
        a, _, n = a.partition("/"); tmp = f"lines/_tmp.wav"; shutil.copy(f"{V}/{a}.wav", tmp); squeeze(tmp)
        x, sr = sf.read(tmp); x = x if x.ndim == 1 else x.mean(1)
        files += split_sil(x, sr, int(n)) if n else [x]
    starts = []
    for j, x in enumerate(files):
        dst = f"lines/{lid}_{j}.wav"; sf.write(dst, x, sr)
        seg, _ = m.transcribe(x[::3].astype(np.float32) if sr == 48000 else x.astype(np.float32), language="en")
        heard = " ".join(s.text.strip() for s in seg); d = trimlen(x, sr)
        print(f"{lid}_{j} {d:.2f}s | {heard}")
        if lid == "09_choice" and j == 0: TDEC = round(t, 3); t = TDEC + 2.3   # decision RE3 (nota 8: negativos cortos): las opciones caen al empezar el negativo con texto (+2,2 s)
        if lid == "09_choice" and j == 2: t = max(t, TDEC + 4.75)              # "Comment one or two" cuando vuelve el color (+4,3 s)
        starts.append(round(t, 2)); t += d + (GAPS.get(lid, [PAUSE] * 9)[j] if j < len(files) - 1 else gap)
    out.append([lid, starts, ids, text])
json.dump(out, open("lines.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("DUR", round(t + 2.6, 2))   # menu final con FOLLOW FOR MORE! ~2.6 s tras la voz   # ep7: tarjeta NEXT: THE STAIRS + FOLLOW FOR MORE!   # ep5: tarjeta FOLLOW FOR MORE! ~4 s
