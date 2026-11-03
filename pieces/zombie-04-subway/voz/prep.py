# Copia las tomas de VoiceStudio a lines/<id>_<j>.wav, las verifica con whisper y escribe lines.json con los
# inicios en cadena (pausa PAUSE entre partes de una linea, GAP entre lineas). python prep.py
import json, shutil, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
V = "takes_v4"   # v4: voz entera regenerada (4 semillas por toma, pick_v4.py elige la mas viva que whisper oye bien)
L = [  # id, tomas, texto, pausa tras la linea (v4: respiraciones cortas; apagon y tren con un golpe breve)
 ("01_open", "01_0_s4,01_1_s2", "Imagine you miss the last train… and the station locks you in.", 0.35),
 ("02_phone", "02_0_s1,02_1_s2", "Your phone has no signal and three percent battery. It's eleven forty-two… and the next train isn't until five thirty.", 0.35),
 ("03_sheet", "03_0_s1", "Then you find a sheet taped up in the ticket booth, night shift instructions. Rule one says never board an empty train.", 0.3),
 ("04_rule2", "04_0_s2,04_1_s2,04_2_s4", "Rule two is torn off halfway through… if you hear footsteps behind you, don't… and that's where the paper ends.", 0.4),
 ("05_laugh", "05_0_s1", "You laugh it off. It's probably the staff pranking the new guy.", 0.35),
 ("06_midnight", "06_0_s1,06_1_s3", "At eleven fifty-nine you're still waiting. When the clock hits midnight… every light in the station goes out.", 1.5),   # v5: apagon un poco mas largo
 ("07_train", "07_0_s1,07_1_s3", "A train pulls in with two headlights… and it doesn't make a sound. The doors slide open on an empty car.", 1.5),   # v5: un golpe con las puertas abiertas
 ("08_steps", "08_0_s4,08_1_s3", "Then you hear slow footsteps behind you. Something is standing right there… and you can feel it breathing on your neck.", 0.4),
 ("09_fudge", "ep1", "Oh, fudge.", 0.3),
 ("10_doors", "10_0_s3", "And the doors start closing.", 0.45),
 ("11_choice", "11_0_s4,11_2_s2", "So do you get on… or do you stay?", 0.45),
 ("12_cta", "12_0_s4", "Comment one or two, and most comments decide Part two.", 0.0),
]
PAUSE, T0 = 0.3, 0.3   # v4: pausas cortas (usuario)
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
        starts.append(round(t, 2)); t += d + (PAUSE if j < len(ids) - 1 else gap)
    out.append([lid, starts, ",".join(ids), text])
json.dump(out, open("lines.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("DUR", round(t + 2.6, 2))
