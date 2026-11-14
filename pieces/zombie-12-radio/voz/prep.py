# Copia las tomas de VoiceStudio a lines/<id>_<j>.wav, las verifica con whisper y escribe lines.json con los
# inicios en cadena (pausa PAUSE entre partes de una linea, GAP entre lineas). python prep.py
import json, shutil, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
V = "takes"   # ep5: 4 semillas por toma, pick.py elige la mas viva que whisper oye bien (pick.json)
P = json.load(open("pick.json"))
ids = lambda *t: ",".join(P[x] for x in t)
L = [  # id, tomas, texto, pausa tras la linea (pausas cortas 0,3-0,45 s). Ep12 "The Radio"
 ("01_hook", ids("01_0", "01_1"), "The lights are out, and your phone has no bars… When the phones die, this is your best friend.", 0.45),
 ("02_radio", ids("02_0", "02_1"), "A hand-crank or battery radio doesn't need the power grid or a cell tower… Crank it for a minute, and it keeps talking for a while.", 0.45),
 ("03_earbud", ids("03_0", "03_1"), "Plug in one earbud and keep the speaker off, because noise brings them… Your other ear stays on the house.", 0.45),
 ("04_night", ids("04_0", "04_2", "04_1"), "At night, AM stations bounce off the sky and carry for hundreds of miles… In the daytime, they don't reach nearly as far… So scan the dial after dark.", 0.45),
 ("05_hour", ids("05_0", "05_1"), "Save your batteries and listen at the top of the hour, when the news comes on… Then write down every time and frequency.", 0.45),
 ("06_repeat", ids("06_0", "06_1"), "Listen for what keeps repeating, like shelters, safe routes, and curfew times… If you hear it every hour, it's probably official.", 0.45),
 ("07_voice", ids("07_0", "07_2", "07_1"), "But a stranger inviting you somewhere isn't a rescue… Anyone can say they're the army… Listening is free. Talking back tells them where you are.", 0.5),
 ("08_radio", ids("08_r0", "08_r1", "08_r2"), "Anyone out there?… We're at the police station. We have food… Come to the front gate.", 1.9),   # v2: revision pidio acortar el hueco (pasos pesados + silueta)
 ("09_fudge", "ep1", "Oh, fudge.", 0.55),
 ("10_choice", ids("10_0", "10_1", "10_2"), "So, what do you do?… Answer them, or stay silent?… Comment one or two.", 0.0),
]
PAUSE, T0 = 0.3, 0.3
EXTRA = {('08_radio', 0): 0.25, ('10_choice', 0): 0.15, ('10_choice', 1): 0.3}   # v3: pausas lentas y deliberadas alrededor de 'Lisa'   # v4: pausas cortas (usuario)
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
