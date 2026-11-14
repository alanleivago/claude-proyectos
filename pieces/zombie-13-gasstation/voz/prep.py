# Copia las tomas de VoiceStudio a lines/<id>_<j>.wav, las verifica con whisper y escribe lines.json con los
# inicios en cadena (pausa PAUSE entre partes de una linea, GAP entre lineas). python prep.py
import json, shutil, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
V = "takes"   # ep5: 4 semillas por toma, pick.py elige la mas viva que whisper oye bien (pick.json)
P = json.load(open("pick.json"))
ids = lambda *t: ",".join(P[x] for x in t)
L = [  # id, tomas, texto, pausa tras la linea. Ep13 "Gas Station, Part 1"
 ("01_hook", ids("01_0", "01_1"), "It's 2 AM, and you're alone at a gas station, filling up… Then the lights flicker, and the pump stops at twelve forty.", 0.45),
 ("02_pump", ids("02_0", "02_1"), "Your tank's only a quarter full, and the hose is dead… Gas pumps run on electricity, so no power means no gas.", 0.45),
 ("03_shop", ids("03_0", "03_1", "03_2"), "So you head into the shop and grab what matters… Water before snacks, then a flashlight and some bandages… You can last weeks without food, but only about three days without water.", 0.45),
 ("04_cooler", ids("04_0", "04_1"), "Don't hide by the windows. Glass breaks, and they can see you through it… The walk-in cooler has one door, thick walls, and no windows. That's your safe room.", 0.45),
 ("05_low", ids("05_0", "05_2", "05_1"), "Outside, shapes cross in front of a car's headlights… A flashlight behind all that glass can be seen from the road… Flashlight off. Stay low, and don't move.", 0.8),
 ("06_knock", ids("06_0"), "Someone knocks from inside the locked bathroom.", 0.5),
 ("07_stranger", ids("07_s0", "07_s1", "07_s2"), "Please… let me in. I'm not bitten… I cut my hand on the glass.", 0.5),
 ("08_hand", ids("08_0"), "A hand slides out under the door, wrapped in a bandage.", 0.6),
 ("09_blood", ids("09_0") + ",ep1," + ids("09_2"), "A drop of blood rolls out after it… Oh, fudge… Bites bleed, but so do cuts.", 0.5),
 ("10_choice", ids("10_0", "10_1", "10_2"), "So, would you unlock it?… Unlock it, or leave it locked?… Comment one or two.", 0.0),
]
PAUSE, T0 = 0.3, 0.3
EXTRA = {('07_stranger', 0): 0.3, ('09_blood', 0): 0.35, ('10_choice', 0): 0.15, ('10_choice', 1): 0.3}   # v3: pausas lentas y deliberadas alrededor de 'Lisa'   # v4: pausas cortas (usuario)
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
