"""Whisper check of each voiced paragraph against the script: python qa_voice.py guiones/X.md voz/NN"""
import difflib, re, subprocess, sys, numpy as np
from faster_whisper import WhisperModel
script, d = sys.argv[1], sys.argv[2]
paras = [p.strip() for p in open(script, encoding="utf-8").read().split("\n\n") if p.strip() and not p.lstrip().startswith("#")]
norm = lambda s: re.sub(r"[^\wáéíóúñü ]", " ", s.lower()).split()
m = WhisperModel("medium", device="cpu", compute_type="int8")
for i, p in enumerate(paras, 1):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{d}/p{i:02d}.wav", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    a = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    segs, _ = m.transcribe(a, language="es", beam_size=5)
    heard = " ".join(s.text for s in segs)
    want, got = norm(p.replace("ICE", "ais")), norm(heard)
    r = difflib.SequenceMatcher(None, want, got).ratio()
    flag = "  <-- CHECK" if r < 0.9 or abs(len(want) - len(got)) > 2 else ""
    print(f"p{i:02d} words {len(want)}/{len(got)} ratio {r:.2f}{flag}")
    if flag:
        for op in difflib.SequenceMatcher(None, want, got).get_opcodes():
            if op[0] != "equal": print("    ", op[0], want[op[1]:op[2]], "->", got[op[3]:op[4]])
