# Copia las tomas de VoiceStudio a lines/<id>_<j>.wav, las verifica con whisper y escribe lines.json con los
# inicios en cadena (pausa PAUSE entre partes de una linea, GAP entre lineas). python prep.py
import json, shutil, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
V = "takes"   # ep5: 4 semillas por toma, pick.py elige la mas viva que whisper oye bien (pick.json)
P = json.load(open("pick.json"))
ids = lambda *t: ",".join(P[x] for x in t)
L = [  # id, tomas, texto, pausa tras la linea (pausas cortas 0,3-0,45 s). Ep7 "The Safe Room"
 ("01_pick", ids("01_a", "01_0", "01_1"), "In a zombie outbreak… you can't defend the whole house… so you pick one room.", 0.45),
 ("02_living", ids("02_0", "02_1"), "So you pick the living room. It's the biggest… Three windows, and two doors.", 0.4),
 ("03_window", ids("03_0"), "Every window is a door for them.", 2.1),   # YOU DIED
 ("04_small", ids("04_0", "04_1", "04_2"), "So you go small. One door, no windows… right in the middle of the house, like a bathroom or a walk-in closet… Even Ready.gov says it, an inside room with as few windows as possible.", 0.45),
 ("05_door", ids("05_0", "05_1"), "Then you fix its door like last time… you drive three-inch screws into the stud, and wedge a bar under the handle. You already know how.", 0.45),
 ("06_box", ids("06_0", "06_1", "06_2"), "Now, your item box… Water, food, a flashlight with spare batteries, a radio, and a charger, all in one chest… Pretty much FEMA's own list.", 0.7),
 ("07_cut", ids("07_0", "07_1", "07_2"), "And while you're packing, you cut your hand on a nail from the barricade, and it won't stop bleeding… So you spray it, put the bandage on… and press down hard for a full fifteen minutes, no peeking.", 0.9),
 ("08_save", ids("08_0", "08_1", "08_2"), "Day three, you save your game… Congratulations… you have a safe room.", 2.4),   # golpes dentro del armario
 ("09_fudge", "ep1", "Oh, fudge.", 0.6),
 ("10_next", ids("10_0"), "Stairs are next week.", 0.0),
]
PAUSE, T0 = 0.3, 0.3
EXTRA = {('02_living', 0): 0.15, ('08_save', 0): 0.2}   # v3: pausas lentas y deliberadas alrededor de 'Lisa'   # v4: pausas cortas (usuario)
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
print("DUR", round(t + 3.5, 2))   # ep7: tarjeta NEXT: THE STAIRS + FOLLOW FOR MORE!   # ep5: tarjeta FOLLOW FOR MORE! ~4 s
