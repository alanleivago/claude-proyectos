# Copia las tomas de VoiceStudio a lines/<id>_<j>.wav, las verifica con whisper y escribe lines.json con los
# inicios en cadena (pausa PAUSE entre partes de una linea, GAP entre lineas). python prep.py
import json, shutil, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
V = "takes"   # ep5: 4 semillas por toma, pick.py elige la mas viva que whisper oye bien (pick.json)
P = json.load(open("pick.json"))
ids = lambda *t: ",".join(P[x] for x in t)
L = [  # id, tomas, texto, pausa tras la linea. Ep15 "The Last Train, Part 3" (pausas cortas desde el inicio: el ep14 salio largo)
 ("01_hook", ids("01_0", "01_1"), "You stayed on the last train… but who's driving it?", 0.6),
 ("02_leave", ids("02_0") + "/2", "Some of you pressed red. So you step off into the tunnel. Don't touch the third rail, it carries about six hundred volts.", 0.8),
 ("03_steps", ids("03_0", "03_1"), "Then footsteps behind you… and you turn around.", 2.0),   # la criatura sale de lo negro antes del "Oh, fudge"
 ("04_fudge", "04_fudge", "Oh, fudge.", 2.3),   # toma del ep1; despues YOU DIED ~2 s
 ("05_rewind", ids("05_0"), "Let's rewind.", 0.05),   # glitch ~1 s
 ("06_stay", ids("06_0") + "/2", "Most of you pressed white. The doors close, and the hunter stays outside. Then the train speeds up, with nobody driving.", 1.3),
 ("07_dms", ids("07_0") + "/1," + ids("07_1"), "Trains have a dead man's switch. If the driver lets go, it brakes on its own… this one doesn't.", 0.45),
 ("08_rule", ids("08_0"), "Rule three says never enter the cab. You go in anyway, rip the tape off the lever, and pull the brake.", 1.8),   # (···)
 ("09_stop", ids("09_0") + "/1," + ids("09_1"), "It stops in the dark. Then footsteps in the next car… the hunter got on board.", 0.5),
 ("10_count", ids("10_0") + "/1," + ids("10_1", "10_2"), "Ten seconds. Run for the exit… or lock yourself in the cab? Comment one or two.", 0.0),
]
PAUSE, T0 = 0.25, 0.25
EXTRA = {('10_count', 1): 0.2}   # pausa entre la pregunta y 'Comment'   # v2 (usuario): pausas cortas
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
GAPS = {   # pausas entre partes (ep15: el guion son ~42 s de habla; la guia pide >= 61 s: las pausas van en los beats con accion)
 "01_hook": [0.5], "02_leave": [0.45, 0.45], "03_steps": [0.8], "06_stay": [0.4, 0.5], "07_dms": [0.55, 0.55], "09_stop": [0.7, 0.7], "10_count": [0.45, 0.4, 0.55]}
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
        if lid == "10_count" and j == 1: TDEC = round(t - GAPS["10_count"][0] + 0.3, 3); t = TDEC + 3.6   # v3: decision RE3 (corte 0,3 s tras "Ten seconds."): las opciones caen al empezar el negativo con texto (+3,5 s)
        if lid == "10_count" and j == 3: t = max(t, TDEC + 6.85)                                            # "Comment one or two" cuando vuelve el color (+6,4 s)
        starts.append(round(t, 2)); t += d + (GAPS.get(lid, [PAUSE] * 9)[j] if j < len(files) - 1 else gap)
    out.append([lid, starts, ids, text])
json.dump(out, open("lines.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("DUR", round(t + 2.6, 2))   # menu final con FOLLOW FOR MORE! ~2.6 s tras la voz   # ep7: tarjeta NEXT: THE STAIRS + FOLLOW FOR MORE!   # ep5: tarjeta FOLLOW FOR MORE! ~4 s
