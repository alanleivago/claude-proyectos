import glob, os, json, wave, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
F = r"F:/Claude Proyectos/pieces/digger-01-fridge/voz-studio/final"
files = sorted(glob.glob(F + "/digger01_p*.wav"))
m = WhisperModel("small", device="cpu", compute_type="int8")
def load(fn):
    w = wave.open(fn); sr=w.getframerate(); n=w.getnchannels(); sw=w.getsampwidth()
    raw = w.readframes(w.getnframes())
    if sw==3:
        b = np.frombuffer(raw, dtype=np.uint8).reshape(-1,3)
        a = (b[:,0].astype(np.int32) | (b[:,1].astype(np.int32)<<8) | (b[:,2].astype(np.int32)<<16)); a = np.where(a>=1<<23, a-(1<<24), a).astype(np.float32)/(1<<23)
    else: a = np.frombuffer(raw, dtype=np.int16).astype(np.float32)/32768
    if n>1: a=a.reshape(-1,n).mean(1)
    return resample_poly(a,16000,sr).astype(np.float32), len(a)/sr
GAP = 0.45; t0 = 0.0; out = []; preview = []
for fn in files:
    a, dur = load(fn)
    segs,_ = m.transcribe(a, language="en", word_timestamps=True, beam_size=5)
    words = [dict(w=x.word.strip(), start=round(x.start,2), end=round(x.end,2)) for s in segs for x in s.words]
    out.append(dict(file=os.path.basename(fn), dur=round(dur,2), offset_preview=round(t0,2), words=words))
    x, sr = sf.read(fn); preview += [x, np.zeros((int(GAP*sr), x.shape[1]))]; t0 += dur + GAP
sf.write(F + "/digger01_full_preview.wav", np.concatenate(preview[:-1]), sr, subtype="PCM_24")
json.dump(out, open(F + "/word_timings.json","w"), indent=1, ensure_ascii=False)
for p in out:
    print(f"{p['file']} ({p['dur']} s, preview @ {p['offset_preview']} s): " + " ".join(f"{w['w']}[{w['start']:.2f}-{w['end']:.2f}]" for w in p['words']))
print("total", round(t0-GAP,2))
