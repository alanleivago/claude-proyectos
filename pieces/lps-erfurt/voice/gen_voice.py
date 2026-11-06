"""venv: VoiceStudio "3d cartoon" (227af074), ONE take per line (seed 1; user rule for #4), local VoiceStudio server
(the backend of the VoiceStudio MCP). Whisper only checks the take. Writes voice/lXX.wav + script.json.
TTS text differs from the caption text only where the TTS needs help pronouncing it (1184 -> "eleven eighty-four").
"Sixty" in line 1 is the loop target (line 13 "...remember:" runs into it): line 1 is one clean take, so the loop
plays the very same "Sixty" every time."""
import json, os, re, subprocess, sys, urllib.request, uuid, wave
from difflib import SequenceMatcher
import numpy as np
from faster_whisper import WhisperModel

V = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(V, "takes"); PROFILE = "227af074"; SR = 44100
os.makedirs(T, exist_ok=True)
LINES = ["Sixty nobles died in one afternoon because of a toilet.",
         "July 1184. Erfurt, Germany.",
         "The Archbishop of Mainz and the Landgrave of Thuringia were feuding over land.",
         "So the emperor sent his son Henry, eighteen, to make them shake hands.",
         "Dozens of counts and knights crammed into one room upstairs.",
         "Nobody checked the beams. They were rotten.",
         "The floor gave way, then the floor below it.",
         "Under all that was the latrine pit.",
         "About sixty men died down there, crushed or choking in the sewage.",
         "The landgrave fell in too. He lived.",
         "Henry was sitting in a stone window niche, so he just hung on.",
         "The archbishop hung on next to him, until someone found a ladder.",
         "So if your bathroom floor ever creaks, remember:"]
TTS = {2: "July, eleven eighty-four. Erfurt, Germany."}
SEED = {int(a.split("=")[0]): int(a.split("=")[1]) for a in sys.argv[1:] if "=" in a}     # 4=2 -> regenerate line 4, seed 2


def gen(text, seed, out):
    b = uuid.uuid4().hex
    parts = [f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n' for k, v in
             {"text": text, "profile_id": PROFILE, "language": "en", "seed": str(seed), "speed": "1.0"}.items()]
    req = urllib.request.Request("http://localhost:3900/generate", data=("".join(parts) + f"--{b}--\r\n").encode(),
                                 headers={"Content-Type": f"multipart/form-data; boundary={b}", "User-Agent": "Mozilla/5.0"})
    open(out, "wb").write(urllib.request.urlopen(req, timeout=600).read())


def pcm(p, sr=16000):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                                        capture_output=True).stdout, np.float32).copy()


def trim(x, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]
    return x[max(0, idx[0] - 1300):idx[-1] + 1300] if len(idx) else x


norm = lambda s: re.sub(r"[^a-z0-9 ]", "", s.lower().replace("-", " "))
asr = WhisperModel("small.en", compute_type="int8"); script = []
for i, text in enumerate(LINES, 1):
    sd = SEED.get(i, 1)
    f = f"{T}/l{i:02d}_s{sd}.wav"
    if not os.path.exists(f):
        gen(TTS.get(i, text), sd, f)
    heard = " ".join(s.text for s in asr.transcribe(pcm(f), language="en")[0])
    sc = SequenceMatcher(None, norm(TTS.get(i, text)), norm(heard)).ratio()
    x = trim(pcm(f, SR))
    print(f"l{i:02d} s{sd} {sc:.2f} {len(x) / SR:.2f}s | {heard.strip()}", flush=True)
    with wave.open(f"{V}/l{i:02d}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    script.append({"id": f"l{i:02d}", "text": text, "file": f"l{i:02d}.wav", "take": os.path.basename(f), "asr": round(sc, 2)})
json.dump({"lines": script}, open(f"{V}/script.json", "w"), indent=1)
