"""voice_tight.wav + frase extra (ext2/ext_<seed>.wav) empalmada en silencio -> voice.wav de 60.5 s, voz continua.
python splice.py [seed]"""
import sys, json, numpy as np, soundfile as sf
SR = 48000; seed = sys.argv[1] if len(sys.argv) > 1 else "18"
v = sf.read("voice_tight.wav", dtype="float32")[0]; e = sf.read(f"ext2/ext_{seed}.wav", dtype="float32")[0]
def env(a): h = SR//200; n = len(a)//h; return 20*np.log10(np.sqrt(np.mean(a[:n*h].reshape(n, h)**2, 1))+1e-9)
dv, de = env(v), env(e)
v_end = (np.nonzero(dv > -40)[0][-1] + 1) * SR//200            # fin real de "birthday"
e0 = max(0, np.nonzero(de > -40)[0][0] * SR//200 - SR//50)     # inicio de la frase (20 ms antes)
e1 = (np.nonzero(de > -40)[0][-1] + 1) * SR//200
rms = lambda a: np.sqrt(np.mean(a**2))
e = e[e0:e1] * (rms(v[v_end-8*SR:v_end]) / rms(e[e0:e1]))      # mismo nivel que el final de la voz
GAP = int(0.32*SR); total = int(60.5*SR)
out = np.zeros(total, np.float32)
out[:v_end] = v[:v_end]; out[v_end+GAP:v_end+GAP+len(e)] = e
f = int(0.01*SR); out[v_end:v_end+f] *= 0                       # (silencio ya bajo -40 dB)
end = v_end+GAP+len(e)
print(f"birthday termina {v_end/SR:.2f}s, frase {((v_end+GAP)/SR):.2f}-{end/SR:.2f}s, total 60.50s, cola {60.5-end/SR:.2f}s")
assert end <= total
sf.write("voice.wav", out, SR)
