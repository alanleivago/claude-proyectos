"""Rank music candidates by CLAP similarity to the clean reference (demucs no_vocals) and to music B.

Each candidate is scored on its best 20 s window (8 windows tried), so a quiet intro doesn't sink a good track.
Run with the earshot venv:  /f/earshot/.venv/Scripts/python.exe prep/rank_music.py
"""
import glob, hashlib, json, subprocess, sys
from pathlib import Path
import numpy as np
sys.path.insert(0, "F:/earshot")
from earshot.models import clap

S = "C:/Users/ALANLE~1/AppData/Local/Temp/claude/f--Claude-Proyectos/180a3cfb-8b3b-49b6-b8ac-a71a3a85ca01/scratchpad"
REF = glob.glob(S + "/refclean/*.wav")
B = glob.glob(S + "/refBonly/*.wav")
pools = ["prep/bgm5/*.mp3", "prep/bgm4/*.mp3", "prep/bgm3/*", "prep/bgm_doc/*.mp3", "../stimulus-01-hf/prep/bgm_cello/[0-9]*.mp3", "../stimulus-01-hf/prep/bgm_orch/*.mp3"]
files, seen = [], set()
for p in pools:
    for f in sorted(glob.glob(p)):
        h = hashlib.md5(Path(f).read_bytes()[:200000]).hexdigest()
        if h not in seen:
            seen.add(h); files.append(f)

def load(f, ss=0, t=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(ss)] + (["-t", str(t)] if t else []) + ["-i", f, "-ac", "1", "-ar", "48000", "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, timeout=120).stdout, np.float32)

m = clap.get()
norm = lambda v: v / np.linalg.norm(v, axis=-1, keepdims=True)
eR = norm(np.array(m.embed_audio([load(f) for f in REF]))).mean(0)
eB = norm(np.array(m.embed_audio([load(f) for f in B]))).mean(0)
out = []
for f in files:
    x = load(f)
    if len(x) < 48000 * 25:
        continue
    L = len(x) / 48000
    starts = np.linspace(0, max(L - 20, 0), 8)
    E = norm(np.array(m.embed_audio([x[int(s * 48000): int((s + 20) * 48000)] for s in starts])))
    sr, sb = E @ norm(eR), E @ norm(eB)
    score = 0.6 * sr + 0.4 * sb
    i = int(score.argmax())
    out.append(dict(file=f, dur=round(L, 1), ref=round(float(sr[i]), 3), B=round(float(sb[i]), 3), score=round(float(score[i]), 3), best_start=round(float(starts[i]), 1)))
out.sort(key=lambda r: -r["score"])
Path("prep/music_rank.json").write_text(json.dumps(out, indent=1))
for r in out[:15]:
    print(r)
