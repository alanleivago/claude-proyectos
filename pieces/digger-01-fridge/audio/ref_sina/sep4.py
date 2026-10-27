# demucs htdemucs 4 stems -> stems/<id>_{drums,bass,other,vocals}.wav and <id>_music.wav (all but vocals)
import sys, os, numpy as np, soundfile as sf, torch
from demucs.pretrained import get_model
from demucs.apply import apply_model
m = get_model("htdemucs"); m.eval(); os.makedirs("stems", exist_ok=True)
for p in sys.argv[1:]:
    x, sr = sf.read(p, dtype="float32"); w = torch.from_numpy(x.T.copy())[None]
    ref = w.mean(1).mean(); std = w.mean(1).std()
    with torch.no_grad(): out = apply_model(m, (w - ref) / std, device="cpu", split=True, overlap=0.25)[0]
    out = out * std + ref; b = os.path.basename(p)[:-4]
    for i, s in enumerate(m.sources): sf.write(f"stems/{b}_{s}.wav", out[i].numpy().T, sr, subtype="FLOAT")
    sf.write(f"stems/{b}_music.wav", (out.sum(0) - out[m.sources.index("vocals")]).numpy().T, sr, subtype="FLOAT")
    print("done", b, flush=True)
