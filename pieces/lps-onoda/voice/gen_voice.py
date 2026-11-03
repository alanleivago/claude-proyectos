"""venv: VoiceStudio "3d cartoon" (227af074) takes for every line, 3 seeds each; Whisper picks the take that matches
the text best (ties -> shortest, LPS pace). Writes voice/lXX.wav + voice/script.json for assemble.py."""
import json, os, re, shutil, subprocess, urllib.request, uuid
from difflib import SequenceMatcher
import numpy as np
from faster_whisper import WhisperModel

V = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(V, "takes"); PROFILE = "227af074"
LINES = ["This man kept fighting World War Two for 29 years after it ended.",
         "In 1944, Japan sent him to a tiny island in the Philippines with one order.",
         "Never surrender.",
         "A year later, the war ended.", "Nobody told him.",
         "Well, they tried. Planes dropped leaflets saying it was over.",
         "He decided they were fake.",
         "So he kept going. One year. Ten. Twenty.",
         "His three comrades left, one by one.",
         "In 1974, a college dropout went into that jungle looking for three things.",
         "A panda, the Yeti, and Lieutenant Onoda.",
         "He found one of them.",
         "Oh-noh-dah still wouldn't stop, unless his old commander ordered him to.",
         "So Japan found that commander, who was selling books by then, and flew him to the island.",
         "He read the order out loud.", "And Oh-noh-dah saluted,",
         "and went home, after 29 years of fighting a war that was already over."]


def gen(text, seed, out):
    b = uuid.uuid4().hex
    parts = [f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n' for k, v in
             {"text": text, "profile_id": PROFILE, "language": "en", "seed": str(seed), "speed": "1.0"}.items()]
    req = urllib.request.Request("http://localhost:3900/generate", data=("".join(parts) + f"--{b}--\r\n").encode(),
                                 headers={"Content-Type": f"multipart/form-data; boundary={b}"})
    open(out, "wb").write(urllib.request.urlopen(req, timeout=600).read())


def pcm(p, sr=16000):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                                        capture_output=True).stdout, np.float32)


norm = lambda s: re.sub(r"[^a-z0-9 ]", "", s.lower().replace("29", "twenty nine").replace("1944", "nineteen forty four")
                        .replace("1974", "nineteen seventy four").replace("-", " "))
asr = WhisperModel("small.en", compute_type="int8"); script = []
for i, text in enumerate(LINES, 1):
    best = None
    for sd in (1, 2, 3):
        f = f"{T}/l{i:02d}_s{sd}.wav"
        if not os.path.exists(f):
            gen(text, sd, f)
        x = pcm(f); heard = " ".join(s.text for s in asr.transcribe(x, language="en")[0])
        sc = SequenceMatcher(None, norm(text), norm(heard)).ratio(); dur = len(x) / 16000
        print(f"l{i:02d} s{sd} {sc:.2f} {dur:.2f}s | {heard.strip()}")
        if best is None or (sc, -dur) > (best[0], -best[1]):
            best = (sc, dur, f)
    shutil.copy(best[2], f"{V}/l{i:02d}.wav")
    script.append({"id": f"l{i:02d}", "text": text, "file": f"l{i:02d}.wav", "take_score": round(best[0], 2)})
json.dump({"lines": script}, open(f"{V}/script.json", "w"), indent=1)
print("min score", min(s["take_score"] for s in script))
