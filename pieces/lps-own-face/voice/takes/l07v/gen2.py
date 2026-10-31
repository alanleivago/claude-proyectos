# l07 split: "You see" said on its own (stressed), then the rest; measured loudness + pitch of each "you see" take.
import os, subprocess, uuid, urllib.request
import numpy as np, librosa
D = os.path.dirname(os.path.abspath(__file__)); PROFILE = "227af074"
def gen(text, seed, out):
    b = uuid.uuid4().hex; parts = [f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n' for k, v in
        {"text": text, "profile_id": PROFILE, "language": "en", "seed": str(seed), "speed": "1.0"}.items()]
    req = urllib.request.Request("http://localhost:3900/generate", data=("".join(parts) + f"--{b}--\r\n").encode(),
                                 headers={"Content-Type": f"multipart/form-data; boundary={b}"})
    open(out, "wb").write(urllib.request.urlopen(req, timeout=600).read())
def stats(f):
    y, sr = librosa.load(f, sr=16000); y, _ = librosa.effects.trim(y, top_db=40)
    f0, v, _ = librosa.pyin(y, fmin=70, fmax=400, sr=sr)
    lou = 20 * np.log10(np.sqrt(np.mean(y ** 2)) + 1e-9)
    return round(len(y) / sr, 2), round(lou, 1), round(np.nanmedian(f0), 0), round(np.nanmax(f0) - np.nanmin(f0), 0)
for k, t in {"see_period": "You see.", "see_comma": "You see,", "see_dots": "You see..."}.items():
    for sd in (1, 2, 3, 4):
        f = f"{D}/{k}_s{sd}.wav"
        if not os.path.exists(f): gen(t, sd, f)
        print(k, sd, stats(f))
for sd in (1, 2):
    f = f"{D}/rest_s{sd}.wav"
    if not os.path.exists(f): gen("Your brain loves the version it sees the most.", sd, f)
    print("rest", sd, stats(f))
