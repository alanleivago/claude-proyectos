# usage: gen.py PROFILE OUTDIR PREFIX N_PARAGRAPHS(or all) [seeds]
import sys, os, re, requests, numpy as np, wave, json, difflib
from faster_whisper import WhisperModel
prof, out, pre, npar = sys.argv[1:5]
seeds = [int(s) for s in (sys.argv[5] if len(sys.argv)>5 else "1,2,3,4").split(",")]
g = open(r"F:/Claude Proyectos/pieces/digger-01-fridge/guion.md", encoding="utf-8").read()
body = g.split("~70 s)")[1].split("\n---")[0]
pars = [p.strip().replace("\u2026", "...") for p in body.split("\n\n") if p.strip()]
if npar != "all": pars = pars[:int(npar)]
m = WhisperModel("small", device="cpu", compute_type="int8")
def load(fn):
    w = wave.open(fn); sr=w.getframerate(); n=w.getnchannels()
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)/32768
    if n>1: a=a.reshape(-1,n).mean(1)
    from scipy.signal import resample_poly
    return resample_poly(a,16000,sr).astype(np.float32) if sr!=16000 else a
norm = lambda s: re.sub(r"[^a-z0-9 ]", " ", s.lower().replace("-", " ")).split()
os.makedirs(out, exist_ok=True); log = []
for i,t in enumerate(pars,1):
    best=None
    for s in seeds:
        fn = os.path.join(out, f"{pre}_p{i:02d}.wav")
        r = requests.post("http://127.0.0.1:3900/generate", data=dict(text=t, language="en", profile_id=prof, num_step=32, seed=s, effect_preset="raw"), timeout=900)
        r.raise_for_status(); open(fn,"wb").write(r.content)
        segs,_ = m.transcribe(load(fn), language="en", beam_size=5)
        hyp = " ".join(x.text.strip() for x in segs)
        a,b = norm(t), norm(hyp.replace("minus 26","minus twenty six").replace("-26","minus twenty six"))
        ratio = difflib.SequenceMatcher(None,"".join(a),"".join(b)).ratio()
        print(f"p{i:02d} seed {s} match {ratio:.3f} | {hyp}", flush=True)
        if best is None or ratio>best[0]: best=(ratio,s,hyp,r.content)
        if ratio>=0.98: break
    open(fn,"wb").write(best[3]); log.append(dict(p=i, seed=best[1], match=round(best[0],3), text=t, whisper=best[2]))
json.dump(log, open(os.path.join(out, f"{pre}_gen.json"),"w"), indent=1, ensure_ascii=False)
