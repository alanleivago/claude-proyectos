# Copia las tomas de VoiceStudio a lines/<id>_<j>.wav, las verifica con whisper y escribe lines.json con los
# inicios en cadena (pausa PAUSE entre partes de una linea, GAP entre lineas). python prep.py
import json, shutil, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
V = r"F:/Claude Proyectos/voces"
L = [  # id, tomas, texto (… = corte entre tomas), pausa tras la linea
 ("01_open", "57abec56,e563fe67", "Zombies took the city at nine… and you're locked inside the old police station.", 0.45),
 ("02_safe", "d26667b0,3268e924", "Sounds like the safest place in town… it isn't.", 0.5),
 ("03_radio", "a9a42f19", "The radio says help arrives in seven days. Lights off. Gate locked. Open for no one.", 0.45),
 ("04_good", "6cb8bda5,d2e07e02", "Good news… you found the armory.", 0.4),
 ("05_bad", "3b1a7b85,8ca30d58", "Bad news… one pistol. Fifteen bullets.", 0.5),
 ("06_water", "b258f9b8,61cc5b1a", "But bullets aren't what gets you first… water is. You need one gallon a day.", 0.4),
 ("07_math", "9563009e,8ebcf752", "The water cooler has five. Four toilet tanks… six more. Eleven days. Help comes in seven.", 0.45),
 ("08_glass", "209d333d", "And the front doors? Glass. So you never, ever go near the lobby.", 0.5),
 ("09_save", "fc024706,ba6d4f10", "You save your game. Day one… two forty-seven A.M.", 0.7),
 ("10_knock", "f135d35f,84e456d5", "At three fourteen… someone knocks on the glass.", 0.6),
 ("11_cop", "5b589d9c", "Police department. We're evacuating the block. Open the door.", 0.6),
 ("12_log", "156b5b8a,4e222e93", "Then you check the duty log. Every officer on shift tonight… status: lost.", 0.5),
 ("13_vickers", "ec7f2c4a", "Including Officer Vickers.", 0.6),
 ("14_lights", "ddc6b2d7,f6ae852b", "He's still knocking. Then every light in the station turns on… by itself.", 0.35),
 ("15_fudge", "ep1", "Oh, fudge.", 0.6),
 ("16_choice", "b588c197,b238be56", "Do you open the door? Comment yes or no… most comments decide Day two.", 0.0),
]
PAUSE, T0 = 0.55, 0.3
m = WhisperModel("small", device="cpu", compute_type="int8")
def trimlen(x, sr):
    H = int(0.01 * sr); r = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)])
    nz = np.where(r > r.max() * 10 ** (-45 / 20))[0]; return (nz[-1] - nz[0] + 1) * 0.01
out, t = [], T0
for lid, ids, text, gap in L:
    ids = ids.split(","); starts = []
    for j, a in enumerate(ids):
        dst = f"lines/{lid}_{j}.wav" if a != "ep1" else "lines/15_fudge.wav"
        if a != "ep1": shutil.copy(f"{V}/{a}.wav", dst)
        else: shutil.copy("lines/13_fudge.wav", dst)
        x, sr = sf.read(dst); x = x if x.ndim == 1 else x.mean(1)
        seg, _ = m.transcribe(x[::3].astype(np.float32) if sr == 48000 else x.astype(np.float32), language="en")
        heard = " ".join(s.text.strip() for s in seg); d = trimlen(x, sr)
        print(f"{lid}_{j} {d:.2f}s | {heard}")
        starts.append(round(t, 2)); t += d + (PAUSE if j < len(ids) - 1 else gap)
    out.append([lid, starts, ",".join(ids), text])
json.dump(out, open("lines.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("DUR", round(t + 2.6, 2))
