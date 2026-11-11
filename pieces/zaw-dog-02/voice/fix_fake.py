"""venv: the first word must be clear (user). The original line-1 take says "Fake" with a weak /f/ (ASR: "Sake"/"Think"
after the retro EQ). This splices "Fake" from a new VoiceStudio take of line 1 (takes/fake/f1.wav, same "3d cartoon"
profile, 32 steps) into voice.wav at the SAME span (0.15-0.41 s), time-fitted, so no word timing, cut or frame moves.
Run after assemble.py, before retro_eq.py.   python voice/fix_fake.py"""
import os, subprocess
import numpy as np, soundfile as sf
V = os.path.dirname(os.path.abspath(__file__)); SR = 44100; O0, O1 = 0.15, 0.41


def load(p, tempo):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-af", f"atempo={tempo}", "-ac", "1", "-ar", str(SR),
                                         "-f", "f32le", "-"], capture_output=True).stdout, np.float32).copy()


x = load(os.path.join(V, "takes", "fake", "f1.wav"), 1.1)
a, b = 0, int(0.38 * SR)                                          # "Fake" in the take (Whisper: -0.02-0.38 s), up to "throw"
seg = x[a:b]; e = np.abs(seg); seg = seg[np.argmax(e > 0.02 * e.max()):]
sf.write("/tmp/fake_seg.wav", seg, SR)
seg = load("/tmp/fake_seg.wav", min(max(len(seg) / SR / (O1 - O0), 0.5), 2.0))
n = int((O1 - O0) * SR); seg = np.pad(seg, (0, max(0, n - len(seg))))[:n]
fd = int(0.006 * SR); seg[:fd] *= np.linspace(0, 1, fd); seg[-fd:] *= np.linspace(1, 0, fd)
v, sr = sf.read(os.path.join(V, "voice.wav")); v = v.astype(np.float32)
seg *= np.sqrt((v[int(O0 * SR):int(O1 * SR)] ** 2).mean() / max((seg ** 2).mean(), 1e-12))
v[int(O0 * SR):int(O0 * SR) + n] = seg
sf.write(os.path.join(V, "voice.wav"), v, SR, subtype="PCM_16"); print("Fake spliced from takes/fake/f1.wav")
