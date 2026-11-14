# speaker_sim.py REF_GLOB CAND_GLOB... -> per candidate: speaker similarity (WavLM-SV x-vector cosine to the mean of the
# approved paragraphs), and timbre stats vs the refs: F0 median, F1/F2/F3 medians (Praat), spectral centroid.
# v3 (user: the new opening sounded like a different voice): pick the opening take that is objectively the same voice.
import sys, glob, json, numpy as np, soundfile as sf, parselmouth, torch
from scipy.signal import resample_poly
from transformers import AutoFeatureExtractor, WavLMForXVector
fe = AutoFeatureExtractor.from_pretrained("microsoft/wavlm-base-plus-sv"); model = WavLMForXVector.from_pretrained("microsoft/wavlm-base-plus-sv").eval()
def load16(fn):
    x, sr = sf.read(fn); x = x.mean(1) if x.ndim > 1 else x
    return resample_poly(x, 16000, sr).astype(np.float32)
def emb(fn):
    with torch.no_grad():
        e = model(**fe(load16(fn), sampling_rate=16000, return_tensors="pt")).embeddings[0]
    return torch.nn.functional.normalize(e, dim=-1).numpy()
def stats(fn):
    snd = parselmouth.Sound(fn); p = snd.to_pitch_ac(pitch_floor=120, pitch_ceiling=700, time_step=0.01); f = p.selected_array["frequency"]; f = f[f > 0]
    fm = snd.to_formant_burg(time_step=0.01, max_number_of_formants=5, maximum_formant=6000); ts = p.xs()[p.selected_array["frequency"] > 0]
    F = [np.nanmedian([fm.get_value_at_time(k, t) for t in ts]) for k in (1, 2, 3)]
    x, sr = sf.read(fn); x = x.mean(1) if x.ndim > 1 else x; S = np.abs(np.fft.rfft(x)); fr = np.fft.rfftfreq(len(x), 1 / sr)
    return dict(f0=float(np.median(f)), F1=F[0], F2=F[1], F3=F[2], centroid=float((S * fr).sum() / S.sum()))
refs = sorted(glob.glob(sys.argv[1])); cands = sorted(sum([glob.glob(g) for g in sys.argv[2:]], []))
R = np.mean([emb(f) for f in refs], 0); R /= np.linalg.norm(R)
rs = [stats(f) for f in refs]; RS = {k: float(np.mean([s[k] for s in rs])) for k in rs[0]}
self_sim = [float(emb(f) @ R) for f in refs]
print("refs", len(refs), "self-sim", round(min(self_sim), 3), "-", round(max(self_sim), 3), {k: round(v) for k, v in RS.items()})
out = []
for f in cands:
    st = stats(f); d = dict(file=f.replace("\\", "/").split("/")[-1], sim=round(float(emb(f) @ R), 3), **{k: round(v) for k, v in st.items()},
                            dF0_st=round(12 * np.log2(st["f0"] / RS["f0"]), 1), dF2_pct=round(100 * (st["F2"] / RS["F2"] - 1), 1), dF3_pct=round(100 * (st["F3"] / RS["F3"] - 1), 1))
    out.append(d); print(d, flush=True)
json.dump(dict(refs=refs, ref_stats=RS, self_sim=self_sim, cands=out), open("speaker_sim.json", "w"), indent=1)
