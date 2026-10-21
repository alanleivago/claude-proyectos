"""Shape the music track to the story, from the voice timing: audio/track.wav -> audio/track-shaped.wav.
Full level through the build; out over the question ("which"); silence until the hit (0.32s before "You are that ship");
back on the hit; eased down 3 dB for the goodbye (from "The trap was never the ship")."""
import json, numpy as np, soundfile as sf
V = {l["id"]: l for l in json.load(open("voice.json"))["lines"]}
which1, hit, t7 = V["which"]["t1"], V["you"]["t0"] - 0.32, V["trap"]["t0"] - 0.3
x, sr = sf.read("audio/track.wav", always_2d=True); t = np.arange(len(x)) / sr
db = np.interp(t, [0, which1 - 0.6, which1 - 0.05, hit - 0.02, hit, t7, t7 + 2.5, t[-1]], [0, 0, -60, -60, 1.5, 1.5, -2.5, -2.5])
sf.write("audio/track-shaped.wav", (x * 10 ** (db / 20)[:, None]).astype(np.float32), sr, subtype="FLOAT")
print(f"shaped: silence {which1:.2f}-{hit:.2f}s, goodbye from {t7:.2f}s")
