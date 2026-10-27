import sys, os, requests, numpy as np, parselmouth, io
out = sys.argv[1]
TEXT = "Operator... I dug up another human artifact. Humans called it... a fridge."
INSTR = {
 "teen": "female, teenager, high pitch, american accent",
 "teenm": "female, teenager, moderate pitch, american accent",
 #"hi": "female, young adult, high pitch, american accent",
 #"mod": "female, young adult, moderate pitch, american accent",
 #"vhi": "female, young adult, very high pitch, american accent",
}
seeds = [int(s) for s in sys.argv[2].split(",")]
def f0(path):
    snd = parselmouth.Sound(path)
    p = snd.to_pitch_ac(pitch_floor=100, pitch_ceiling=600).selected_array['frequency']
    p = p[p > 0]
    st = 12*np.log2(p/np.median(p))
    return np.median(p), np.percentile(p,5), np.percentile(p,95), st.std()
for k, ins in INSTR.items():
    for s in seeds:
        fn = os.path.join(out, f"{k}_s{s}.wav")
        if not os.path.exists(fn):
            r = requests.post("http://127.0.0.1:3900/generate", data=dict(text=TEXT, language="en", instruct=ins, num_step=32, seed=s, effect_preset="raw"), timeout=600)
            r.raise_for_status(); open(fn,"wb").write(r.content)
        m,a,b,sd = f0(fn)
        dur = parselmouth.Sound(fn).duration
        print(f"{k:4s} seed {s:4d}  F0 med {m:5.0f} [{a:4.0f}-{b:4.0f}] sd {sd:.1f}st  dur {dur:.1f}s", flush=True)
