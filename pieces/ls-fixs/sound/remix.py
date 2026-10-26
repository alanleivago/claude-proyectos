# final mix: mixer stems + ambience beds (surf, storm, underwater); music 18 LU under the voice, beds 20 LU under, SFX bus +5 dB, -14 LUFS, limiter
import soundfile as sf, pyloudnorm as pl, numpy as np, subprocess, sys
subprocess.run([sys.executable,'../../../sound-layer/scripts/mix.py','cues.json'],capture_output=True)
v,sr=sf.read('audio/stems/voice.wav'); m,_=sf.read('audio/stems/music.wav'); s,_=sf.read('audio/stems/sfx.wav'); r,_=sf.read('beds.wav')
M=pl.Meter(sr); lv=M.integrated_loudness(v)
m=m*10**(((lv-18)-M.integrated_loudness(m))/20); sf.write('audio/stems/music.wav',m,sr)
s=s*10**(5/20); sf.write('audio/stems/sfx.wav',s,sr)
r=r*10**(((lv-20)-M.integrated_loudness(r))/20)
n=min(len(v),len(m),len(s),len(r)); mix=v[:n]+m[:n]+s[:n]+r[:n]; mix*=10**((-14-M.integrated_loudness(mix))/20)
thr=10**(-2.2/20); env=np.abs(mix).max(1); g=np.minimum(1,thr/np.maximum(env,1e-9)); la=int(0.005*sr)
gl=np.repeat(np.minimum.reduceat(g,np.arange(0,len(g),la)),la)[:len(g)]; gl=np.minimum(gl,np.concatenate([gl[la:],np.ones(la)]))
a=np.exp(-1/(0.005*sr)); rl=np.exp(-1/(0.08*sr)); c=1.0; out=np.empty_like(gl)
for i,x in enumerate(gl): c=a*c+(1-a)*x if x<c else rl*c+(1-rl)*x; out[i]=c
mix=np.clip(mix*out[:,None],-0.8,0.8); sf.write('audio/final_mix.wav',mix,sr); sf.write('audio/mix.wav',mix,sr)
subprocess.run(['ffmpeg','-v','error','-y','-i','../renders/video_only.mp4','-i','audio/final_mix.wav','-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','256k','-shortest','../renders/lego-sea.mp4'],check=True); import shutil; shutil.copy('../renders/lego-sea.mp4','../renders/final.mp4')
print('mix',round(M.integrated_loudness(mix),2),'s')
