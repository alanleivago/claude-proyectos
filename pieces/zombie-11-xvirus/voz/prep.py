# Copia las tomas de VoiceStudio a lines/<id>_<j>.wav, las verifica con whisper y escribe lines.json con los
# inicios en cadena (pausa PAUSE entre partes de una linea, GAP entre lineas). python prep.py
import json, shutil, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
V = "takes"   # ep5: 4 semillas por toma, pick.py elige la mas viva que whisper oye bien (pick.json)
P = json.load(open("pick.json"))
ids = lambda *t: ",".join(P[x] for x in t)
L = [  # id, tomas, texto, pausa tras la linea (pausas cortas 0,3-0,45 s). Ep11 "How Not to Turn"
 ("01_hook", ids("01_0", "01_1"), "In a zombie outbreak, the bite isn't what turns you… the X-virus is.", 0.45),
 ("02_micro", ids("02_0"), "In this world, it spreads like rabies. It's in their blood and spit, and it gets in through a bite, a scratch, or a splash in your eyes or mouth.", 0.45),
 ("03_fight", ids("03_0", "03_1"), "Most people fight with bare arms… then one drop of blood hits their eye. A splash counts as a bite.", 2.3),   # YOU DIED
 ("04_gear", ids("04_0", "04_1"), "So cover up. Long sleeves, gloves, goggles, and a mask or a bandana… Blood on a sleeve is just laundry.", 0.45),
 ("05_wash", ids("05_0", "05_1", "05_2"), "If you get bitten or scratched anyway, wash the wound with soap and running water for a full fifteen minutes… then disinfect it… and get real medical help, fast.", 0.45),
 ("06_face", ids("06_0"), "After a fight or a cleanup, don't touch your face. Wash your hands first.", 0.45),
 ("07_diary", ids("07_0", "07_1"), "In this world, it moves fast. Day one, fever and headache. Day two, red eyes and a blank stare… Day three, you don't want to know.", 0.45),
 ("08_quar", ids("08_0"), "So anyone who shows up, even the guy at the door, stays alone and watched for seventy-two hours before joining you.", 0.5),
 ("09_twist", ids("09_0", "09_1") + ",ep1", "Then you spot a scratch on your arm… when did that happen?… Oh, fudge.", 0.5),
 ("10_choice", ids("10_0", "10_1", "10_2"), "So, what do you do?… Wash it for fifteen minutes, or quarantine yourself?… Comment one or two.", 0.0),
]
PAUSE, T0 = 0.3, 0.3
EXTRA = {('09_twist', 1): 0.25, ('10_choice', 0): 0.15, ('10_choice', 1): 0.3}   # v3: pausas lentas y deliberadas alrededor de 'Lisa'   # v4: pausas cortas (usuario)
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
