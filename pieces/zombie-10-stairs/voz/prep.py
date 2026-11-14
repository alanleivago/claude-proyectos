# Copia las tomas de VoiceStudio a lines/<id>_<j>.wav, las verifica con whisper y escribe lines.json con los
# inicios en cadena (pausa PAUSE entre partes de una linea, GAP entre lineas). python prep.py
import json, shutil, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
V = "takes"   # ep5: 4 semillas por toma, pick.py elige la mas viva que whisper oye bien (pick.json)
P = json.load(open("pick.json"))
ids = lambda *t: ",".join(P[x] for x in t)
L = [  # id, tomas, texto, pausa tras la linea (pausas cortas 0,3-0,45 s). Ep10 "The Stairs"
 ("01_up", ids("01_0", "01_1"), "In a zombie outbreak, your safe room won't hold forever… so you go up.", 0.45),
 ("02_down", ids("02_0"), "Most people stay downstairs, with two doors and five windows to guard at once.", 0.5),
 ("03_door", ids("03_0", "03_1"), "Then the front door gives, and they pour in… and you're too late for the stairs.", 2.4),   # YOU DIED
 ("04_rule", ids("04_0", "04_1"), "In this world, zombies are terrible at stairs… So you go up. The staircase becomes your wall, only one can climb at a time.", 0.45),
 ("05_block", ids("05_0", "05_1"), "First, you block the bottom steps. Tip the sofa, stack the dresser on it… and screw them together with three-inch screws. You already know how.", 0.45),
 ("06_top", ids("06_0"), "Then the top. You screw a door across the stairs on its edge, and push a heavy shelf against it.", 0.45),
 ("07_ladder", ids("07_0", "07_1"), "But don't trap yourself. Your exit is the upstairs window, with an escape ladder… Fire safety says every room needs two ways out.", 0.45),
 ("08_carry", ids("08_0", "08_1"), "You carry up the water, the backpack, the radio, and the First Aid Spray… Day four, you save your game.", 0.75),
 ("09_knock", ids("09_0"), "Then someone knocks downstairs. Zombies don't knock.", 1.0),
 ("09_man", ids("09_m0", "09_m1", "09_m2"), "Hello?… Please,… I'm not bitten!", 0.6),
 ("10_choice", ids("10_0", "10_1", "10_2"), "So, should you open the door?… Let them in, or stay quiet?… Comment one or two.", 0.0),
]
PAUSE, T0 = 0.3, 0.3
EXTRA = {('03_door', 0): -0.1, ('09_man', 0): 0.35, ('09_man', 1): 0.1, ('10_choice', 0): 0.15, ('10_choice', 1): 0.35}   # v3: pausas lentas y deliberadas alrededor de 'Lisa'   # v4: pausas cortas (usuario)
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
print("DUR", round(t + 2.5, 2))   # ep7: tarjeta NEXT: THE STAIRS + FOLLOW FOR MORE!   # ep5: tarjeta FOLLOW FOR MORE! ~4 s
