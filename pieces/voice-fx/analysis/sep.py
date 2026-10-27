import sys, glob, os, numpy as np, soundfile as sf, torch
from demucs.pretrained import get_model
from demucs.apply import apply_model
m = get_model("htdemucs"); m.eval()
os.makedirs("voc", exist_ok=True)
for p in sys.argv[1:]:
    x, sr = sf.read(p, dtype="float32"); assert sr == 44100
    w = torch.from_numpy(x.T.copy())[None]
    ref = w.mean(1).mean(); std = w.mean(1).std()
    with torch.no_grad(): out = apply_model(m, (w-ref)/std, device="cpu", split=True, overlap=0.25)[0]
    out = out*std + ref
    i = m.sources.index("vocals")
    sf.write("voc/" + os.path.basename(p), out[i].numpy().T, sr, subtype="FLOAT")
    sf.write("voc/" + os.path.basename(p)[:-4] + "_rest.wav", (out.sum(0)-out[i]).numpy().T, sr, subtype="FLOAT")
    print("done", p, flush=True)
