# onsets.py FILES... : per file duration, peak time, LUFS-ish rms, first strong onsets (s) - to choose trims
import sys, numpy as np, librosa, warnings; warnings.filterwarnings("ignore")
for p in sys.argv[1:]:
    y, sr = librosa.load(p, sr=22050, mono=True)
    if len(y) < 512: print(p, "short"); continue
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=256)
    on = librosa.onset.onset_detect(onset_envelope=env, sr=sr, hop_length=256, units="time", backtrack=True)
    st = env[librosa.time_to_frames(on, sr=sr, hop_length=256)] if len(on) else []
    order = np.argsort(-np.array(st))[:8] if len(on) else []
    rms = librosa.feature.rms(y=y, hop_length=512)[0]; pk = np.argmax(np.abs(y)) / sr
    print(f"{p.split('/')[-1][:48]:48s} dur {len(y)/sr:6.2f} peak@{pk:6.2f} rms {20*np.log10(rms.mean()+1e-9):6.1f} n_on {len(on):3d} strong: {sorted(round(float(on[i]),2) for i in order)}")
