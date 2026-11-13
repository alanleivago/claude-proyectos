"""venv: Whisper the retro voice line by line (spans from timing.json) and check the first word "Start". python voice/verify.py"""
import json, os, subprocess, numpy as np
from faster_whisper import WhisperModel
V = os.path.dirname(os.path.abspath(__file__)); T = json.load(open(f"{V}/timing.json"))
x = np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",f"{V}/voice_retro.wav","-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout, np.float32)
asr = WhisperModel("small.en", compute_type="int8"); S = json.load(open(f"{V}/script.json"))["lines"]
ed = T["starts"][1:] + [T["end"]]
for i, (a, b) in enumerate(zip(T["starts"], ed)):
    seg = np.concatenate([np.zeros(4000, np.float32), x[int((a-0.08)*16000):int(b*16000)]])
    print(i+1, "|", " ".join(s.text for s in asr.transcribe(seg, language="en", beam_size=5)[0]).strip(), "||", S[i]["text"])
w = T["words"][:3]; print("first words", w)
