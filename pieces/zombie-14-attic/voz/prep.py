# Copia las tomas de VoiceStudio a lines/<id>_<j>.wav, las verifica con whisper y escribe lines.json con los
# inicios en cadena (pausa PAUSE entre partes de una linea, GAP entre lineas). python prep.py
import json, shutil, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
V = "takes"   # ep5: 4 semillas por toma, pick.py elige la mas viva que whisper oye bien (pick.json)
P = json.load(open("pick.json"))
ids = lambda *t: ",".join(P[x] for x in t)
L = [  # id, tomas, texto, pausa tras la linea. Ep14 "The Attic (Stairs, Part 2)"
 ("01_hook", ids("01_0", "01_1"), "In a zombie outbreak, there's one room in your house nobody ever checks… the attic.", 0.28),
 ("02_recap", ids("02_0", "02_1", "02_2", "02_3"), "Last time, someone knocked downstairs and begged to come in… and most of you said stay quiet. So you stay quiet… and the knocking stops.", 0.9),   # (···) 1.7 s de ambiente
 ("03_silence", ids("03_0", "03_1"), "From now on it's silence. Normal talking is about sixty decibels, and a whisper is around thirty… so you whisper, or you don't talk at all.", 1.1),   # [RESPIRA] respiracion real CC0 en la mezcla
 ("04_light", ids("04_0", "04_1"), "Light's even worse. In total darkness, one small flame can be seen from more than a mile away. So the blanket goes over the window, and the flashlight points at the floor.", 0.28),
 ("05_save", ids("05_0"), "Day five. You save your game.", 0.28),
 ("06_attic", ids("06_0", "06_1"), "Then you go up to the attic with the water and the mattress. The floor pulls heat out of you faster than the air does, so you never sleep on bare boards.", 0.9),   # (···)
 ("07_think", ids("07_0", "07_1"), "Footsteps outside. Heavy ones… and bare.", 3.4),   # ventana estalla + 1 s de silencio + rugido + se levanta
 ("08_shake", ids("08_0"), "That's not a zombie.", 0.28),
 ("09_low", ids("09_0"), "Low sounds carry farther than high ones, so everything for blocks just heard that.", 0.28),
 ("10_tilt", ids("10_0", "10_1"), "It tilts its head… and looks up at the attic.", 0.28),
 ("11_stairs", ids("11_0", "11_1"), "Only one of them can climb your stairs at a time… this one doesn't need to.", 0.28),
 ("12_choice", ids("12_0", "12_1", "12_2"), "So what do you do?… One, stay still. Two, jump to the neighbor's roof.… Comment one or two.", 0.0),
]
PAUSE, T0 = 0.25, 0.25
EXTRA = {('12_choice', 1): 0.3}   # v2 (usuario): pausas cortas
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
out, t = [], T0
for lid, ids, text, gap in L:
    ids = ids.split(","); starts = []
    for j, a in enumerate(ids):
        dst = f"lines/{lid}_{j}.wav"
        shutil.copy(f"{V}/{a}.wav", dst); squeeze(dst)
        x, sr = sf.read(dst); x = x if x.ndim == 1 else x.mean(1)
        seg, _ = m.transcribe(x[::3].astype(np.float32) if sr == 48000 else x.astype(np.float32), language="en")
        heard = " ".join(s.text.strip() for s in seg); d = trimlen(x, sr)
        print(f"{lid}_{j} {d:.2f}s | {heard}")
        starts.append(round(t, 2)); t += d + (PAUSE + EXTRA.get((lid, j), 0) if j < len(ids) - 1 else gap)
        if lid == '12_choice' and j == 0: t = starts[0] - 0.1 + NEG2 + 0.05
    out.append([lid, starts, ",".join(ids), text])
json.dump(out, open("lines.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("DUR", round(t + 2.6, 2))   # ep7: tarjeta NEXT: THE STAIRS + FOLLOW FOR MORE!   # ep5: tarjeta FOLLOW FOR MORE! ~4 s
