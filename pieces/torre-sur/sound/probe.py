import sys, numpy as np, subprocess, io, soundfile as sf
def load(p):
    raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','2','-ar','48000','-f','wav','-'],capture_output=True,check=True).stdout
    return sf.read(io.BytesIO(raw))[0]
for p in sys.argv[1:]:
    x=load(p); m=np.abs(x).max(1); w=4800
    env=[20*np.log10(np.sqrt((x[i:i+w]**2).mean())+1e-9) for i in range(0,len(x)-w,w)]
    print(p.split('/')[-1], f"{len(x)/48000:.2f}s pk@{m.argmax()/48000:.2f} pk={20*np.log10(m.max()):.1f}dB", ' '.join(f"{e:.0f}" for e in env[::max(1,len(env)//40)]))
