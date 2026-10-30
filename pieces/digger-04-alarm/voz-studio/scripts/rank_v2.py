# rank_v2.py: list the v2 opening takes (energy of "Operator") and the v2 Jake takes ("asks" length, word gaps)
import json, parselmouth, numpy as np, wave, os
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
os.chdir(r"F:/Claude Proyectos/pieces/digger-04-alarm/voz-studio/takes")
m = WhisperModel("small", device="cpu", compute_type="int8")
def opf(fn, t1=0.9):
    p = parselmouth.Sound(fn).to_pitch_ac(pitch_floor=120, pitch_ceiling=700, time_step=0.01); f = p.selected_array["frequency"]; ts = p.xs(); o = f[(ts < t1) & (f > 0)]
    return int(np.median(o)) if len(o) else 0
for d in json.load(open("v2_p01/A_metrics.json")) + json.load(open("v2_p01/B_metrics.json")):
    fn = "v2_p01/" + d["file"]; print(d["file"], d["match"], "f0", d["f0_med"], "rng", d["f0_range_st"], "move", d["f0_move"], "Operator_f0", opf(fn), "|", d["text"][:60], flush=True)
print("---- p09")
for d in json.load(open("v2_p09/J_metrics.json")):
    fn = "v2_p09/" + d["file"]; w = wave.open(fn); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; sr = w.getframerate()
    segs, _ = m.transcribe(resample_poly(a, 16000, sr).astype(np.float32), language="en", word_timestamps=True, beam_size=5)
    ws = [x for s in segs for x in s.words]; ask = [x for x in ws if x.word.strip().lower().startswith("asks")]
    ak = f"asks {ask[0].start:.2f}-{ask[0].end:.2f} ({ask[0].end - ask[0].start:.2f}s)" if ask else "asks ?"
    print(d["file"], d["match"], "f0", d["f0_med"], "rng", d["f0_range_st"], "move", d["f0_move"], "op_f0", opf(fn, 1.2), ak, "|", d["text"][:70], flush=True)
