# Copia las tomas de VoiceStudio a lines/<id>_<j>.wav, las verifica con whisper y escribe lines.json con los
# inicios en cadena (pausa PAUSE entre partes de una linea, GAP entre lineas). python prep.py
import json, shutil, re, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
V = "takes"   # ep5: 4 semillas por toma, pick.py elige la mas viva que whisper oye bien (pick.json)
P = json.load(open("pick.json"))
ids = lambda *t: ",".join(P[x] for x in t)
L = [  # id, tomas, texto, pausa tras la linea (pausas cortas 0,3-0,45 s)
 ("01_hook", ids("01_0", "01_1"), "Did you know that in P.T.… the ghost walks right behind you the whole time?", 0.4),
 ("02_years", ids("02_0"), "And nobody noticed for five years.", 0.45),
 ("03_loop", ids("03_0", "03_1"), "The whole game is one hallway. You walk out the door at the end… and you're right back at the start, and every loop gets a little weirder.", 0.45),
 ("04_turn", ids("04_0", "04_1", "04_2"), "You'd hear breathing behind you… you'd turn around… and nothing.", 0.6),
 ("05_modder", ids("05_0", "05_1"), "Then a modder hacked the camera… so he could finally see behind the player.", 0.45),
 ("06_reveal", ids("06_0", "06_1", "06_2", "06_3"), "And there she was… Lisa… stuck to your back from the moment you pick up the flashlight… following you step by step.", 0.6),   # la orbita termina sobre Lisa
 ("07_hid", ids("07_0", "07_1", "07_2"), "Every time you turned around… the game would hide her. Face forward again… and she's back.", 0.8),
 ("08_trick", ids("08_0", "08_1", "08_2", "08_3"), "So Ava tried a little trick. If you can't turn around… use the front camera. She held up the phone… and there was a second face on the screen.", 0.6),   # golpe con la cara de Lisa en el selfie
 ("09_breath", ids("09_0"), "Then she felt cold breath right on her neck.", 0.8),   # respiracion de Lisa antes del fudge
 ("09_fudge", "ep1", "Oh, fudge.", 0.45),
 ("10_real", ids("10_0"), "So that feeling of someone right behind you? It was real.", 0.45),
 ("11_cta", ids("11_0", "11_1"), "Send this to the friend who plays at night… and never looks back.", 0.0),
]
PAUSE, T0 = 0.3, 0.3
EXTRA = {('06_reveal', 0): 0.15, ('06_reveal', 1): 0.3}   # v3: pausas lentas y deliberadas alrededor de 'Lisa'   # v4: pausas cortas (usuario)
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
