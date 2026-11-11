"""venv: F0 over the last word of each take ('did'): falling (statement) vs rising (question). python voice/pitch_end.py l07_a l07_b ...
For takes with extra words after 'did.' (l07_f 'The end.'), the take is cut at the end of 'did' -> takes/<name>_cut.wav."""
import os, subprocess, sys
import numpy as np, librosa
from faster_whisper import WhisperModel
V = os.path.dirname(os.path.abspath(__file__)); m = WhisperModel("small.en", compute_type="int8")
for n in sys.argv[1:]:
    p = os.path.join(V, "takes", n + ".wav"); y, sr = librosa.load(p, sr=16000)
    ws = [w for s in m.transcribe(y, language="en", word_timestamps=True)[0] for w in s.words]
    k = next(i for i, w in enumerate(ws) if "did" in w.word.lower())
    a, b = ws[k].start, ws[k].end
    if k < len(ws) - 1:                                   # cut the extra words: end at the quietest point between 'did' and the next word
        y44, s44 = librosa.load(p, sr=44100); lo, hi = int(b * s44), int(ws[k + 1].start * s44)
        e = np.convolve(y44[lo:hi] ** 2, np.ones(441), "same"); c = lo + int(np.argmin(e)) if hi > lo else lo
        y44 = y44[:c]; y44[-441:] *= np.linspace(1, 0, 441)
        import soundfile as sf; sf.write(os.path.join(V, "takes", n + "_cut.wav"), y44, s44)
    seg = y[int(a * sr):int((b + 0.1) * sr)]
    f0, vf, _ = librosa.pyin(seg, fmin=70, fmax=400, sr=sr, frame_length=1024)
    f = f0[~np.isnan(f0)]
    if len(f) < 4:
        print(n, "no f0"); continue
    q = len(f) // 3; d = 12 * np.log2(np.median(f[-q:]) / np.median(f[:q]))
    print(f"{n}: 'did' F0 start {np.median(f[:q]):.0f} Hz -> end {np.median(f[-q:]):.0f} Hz = {d:+.1f} st  | heard: {''.join(w.word for w in ws)}")
