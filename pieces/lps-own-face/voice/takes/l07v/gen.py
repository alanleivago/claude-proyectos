# l07 variants: "You see" stressed, then a comma pause (user, 2026-10-30). Writes takes + a measurement table.
import sys, re, subprocess, uuid, urllib.request, os, json
import numpy as np
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__)); PROFILE = "227af074"
TEXTS = {"A": "You see... your brain loves the version it sees the most.",
         "B": "You SEE, your brain loves the version it sees the most.",
         "C": "You see. Your brain loves the version it sees the most.",
         "D": "You see — your brain loves the version it sees the most."}
def gen(text, seed, out):
    b = uuid.uuid4().hex; parts = [f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n' for k, v in
        {"text": text, "profile_id": PROFILE, "language": "en", "seed": str(seed), "speed": "1.0"}.items()]
    req = urllib.request.Request("http://localhost:3900/generate", data=("".join(parts) + f"--{b}--\r\n").encode(),
                                 headers={"Content-Type": f"multipart/form-data; boundary={b}"})
    open(out, "wb").write(urllib.request.urlopen(req, timeout=600).read())
def pcm(p, sr=16000):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
asr = WhisperModel("small.en", compute_type="int8"); rows = []
for k, txt in TEXTS.items():
    for sd in (1, 2, 3):
        f = f"{D}/{k}_s{sd}.wav"
        if not os.path.exists(f): gen(txt, sd, f)
        x = pcm(f); segs, _ = asr.transcribe(x, language="en", word_timestamps=True)
        ws = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
        heard = " ".join(w[0] for w in ws)
        i = next((j for j, w in enumerate(ws) if w[0].lower().startswith("see")), None)
        if i is None or i + 1 >= len(ws): rows.append((k, sd, None, None, heard)); continue
        rms = lambda a, b: 20 * np.log10(np.sqrt((x[int(a * 16000):int(b * 16000)] ** 2).mean()) + 1e-9)
        stress = rms(ws[0][1], ws[i][2]) - rms(ws[i + 1][1], ws[-1][2])     # "you see" loudness vs the rest
        # real pause: longest run of 20 ms frames under -40 dB between "see" start and the next word end
        a, b = int(ws[i][1] * 16000), int(ws[i + 1][2] * 16000); fr = x[a:b][: (b - a) // 320 * 320].reshape(-1, 320)
        q = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9) < -40; run = best = 0
        for v in q: run = run + 1 if v else 0; best = max(best, run)
        rows.append((k, sd, round(stress, 1), round(best * 0.02, 2), heard))
for r in rows: print(r)
