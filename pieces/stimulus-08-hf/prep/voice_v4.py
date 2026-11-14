"""Round 3 (2026-11-11): voice without compression. Raw take -> highpass + afftdn + agate (NO acompressor / loudnorm /
alimiter) -> same cuts as words_edit.json -> plain gain to TARGET LUFS -> muxed with the picture of edit_v.mp4.

python prep/voice_v4.py   (backs up assets/edit_v.mp4 as assets/edit_v_r2.mp4 once; edit.mp4 is never touched)
"""
import json, re, shutil, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT.parent.parent / "Ref videos Dariel/Stimulus/raw footage/8.mp4"
TARGET = -13.0          # previous edit_v voice was -13.5 LUFS (compressed); +0.5 LU and no compression
CLEAN = ROOT / "audio/voice_nocomp.wav"
CUT = ROOT / "audio/voice_nocomp_edit.wav"
EV, BAK = ROOT / "assets/edit_v.mp4", ROOT / "assets/edit_v_r2.mp4"

subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(RAW), "-vn", "-ac", "2", "-ar", "48000", "-af",
                "highpass=f=80,afftdn=nr=18:nf=-42:tn=1,agate=threshold=0.012:ratio=2:attack=5:release=180",
                "-c:a", "pcm_f32le", str(CLEAN)], check=True)
segs = json.loads((ROOT / "prep/words_edit.json").read_text())["segments"]
# same concat as make_edit.py (video + audio pairs): concat pads each audio piece to its frame-rounded video piece, which
# is what keeps edit.mp4 in lip sync (cuts land ~3 frames after the words_edit times by 23 s) - audio only is mapped out
vf = "".join(f"[0:v]trim={g['src']}:{g['src'] + g['dur']},setpts=PTS-STARTPTS[v{i}];" for i, g in enumerate(segs))
af = "".join(f"[1:a]atrim={g['src']}:{g['src'] + g['dur']},asetpts=PTS-STARTPTS,afade=t=in:d=0.006,"
             f"afade=t=out:st={g['dur'] - 0.006:.4f}:d=0.006[a{i}];" for i, g in enumerate(segs))
cat = "".join(f"[v{i}][a{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=1[v][a]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(RAW), "-i", str(CLEAN), "-filter_complex", vf + af + cat,
                "-map", "[a]", "-c:a", "pcm_f32le", str(CUT), "-map", "[v]", "-f", "null", "-"], check=True)

def lufs(p):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(p), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr.split("Summary:")[-1]
    return float(re.search(r"I:\s+(-?[\d.]+)", r).group(1)), float(re.search(r"Peak:\s+(-?[\d.]+)", r).group(1))

i0, p0 = lufs(CUT)
print(f"clean cut voice: {i0} LUFS, TP {p0} dBTP")
# adelay 9 ms = the old chain's look-ahead latency (cross-correlation vs edit_v_r2: 0 ms lag after it).
# plain gain to TARGET; the raw voice has a ~16 dB crest factor, so a fast look-ahead peak limiter (-1.5 dBFS, 1 ms attack,
# 40 ms release, no makeup) only shaves the plosive/consonant transients - no compressor, no loudnorm leveling.
if not BAK.exists():
    shutil.copyfile(EV, BAK)
g = TARGET - i0
for k in range(3):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(BAK), "-i", str(CUT), "-map", "0:v", "-map", "1:a",
                    "-c:v", "copy", "-af", f"adelay=9:all=1,volume={g:.2f}dB,alimiter=limit=0.84:attack=1:release=40:level=disabled",
                    "-c:a", "aac", "-b:a", "256k", "-shortest", str(EV)], check=True)
    i1, p1 = lufs(EV)
    print(f"pass {k}: gain {g:+.2f} -> {i1} LUFS, TP {p1} dBTP")
    if abs(i1 - TARGET) < 0.15: break
    g += TARGET - i1
