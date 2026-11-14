# Copia las tomas de VoiceStudio a lines/<id>_<j>.wav, las verifica con whisper y escribe lines.json con los
# inicios en cadena (pausa PAUSE entre partes de una linea, GAP entre lineas). python prep.py
import json, shutil, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
V = "takes"   # ep5: 4 semillas por toma, pick.py elige la mas viva que whisper oye bien (pick.json)
P = json.load(open("pick.json"))
ids = lambda *t: ",".join(P[x] for x in t)
L = [  # id, tomas, texto, pausa tras la linea (pausas cortas 0,3-0,45 s). Ep6 "Floor 30"
 ("01_hook", ids("01_0", "01_1"), "Imagine you live on the thirtieth floor… and that was the worst thing about your apartment. Until tonight.", 0.4),
 ("02_alert", ids("02_0"), "Then every phone in the building goes off at once.", 0.9),
 ("03_water", ids("03_0", "03_1"), "First problem: water. The building's pumps run on electricity… so you fill the tub, and a bucket, while there's still pressure. A full tub is about forty gallons.", 0.4),
 ("04_food", ids("04_0", "04_1"), "Next, you count the food… and split it into days.", 0.4),
 ("05_dark", ids("05_0", "05_1"), "Around seven, the city goes dark, block by block… then your building. The fridge dies.", 0.45),
 ("06_tap", ids("06_0", "06_1", "06_2"), "You try the faucet… nothing. Without power, the pumps can't push water up thirty floors.", 0.4),
 ("07_math", ids("07_0", "07_1"), "FEMA says a gallon a day per person… so that tub is about forty days. And your phone's at eighteen percent.", 0.4),
 ("08_dresser", ids("08_0"), "So you push the dresser against the door.", 0.45),
 ("09_steps", ids("09_0", "09_1"), "Close to midnight, footsteps in the hallway. You freeze… and the footsteps stop too.", 0.6),
 ("10_peep", ids("10_0", "10_1"), "Through the peephole, it's the guy from thirty-eleven… staring right at it.", 1.7),   # golpes + caja PLEASE… I JUST NEED WATER.
 ("11_fudge", "ep1", "Oh, fudge.", 0.45),
 ("12_cta", ids("12_0", "12_1", "12_2"), "So, do you open the door, or stay quiet? Comment one or two… most comments decide Part 2.", 0.0),
]
PAUSE, T0 = 0.3, 0.3
EXTRA = {('06_tap', 0): 0.1, ('12_cta', 0): 0.15}   # v3: pausas lentas y deliberadas alrededor de 'Lisa'   # v4: pausas cortas (usuario)
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
print("DUR", round(t + 4.0, 2))   # ep5: tarjeta FOLLOW FOR MORE! ~4 s
