# final mix (cheese-bank recipe): mixer stems + ambience beds; music 20 LU / beds 22 LU under the voice, SFX ridden >= 4.5 dB under the voice, -14 LUFS, limiter
import soundfile as sf, pyloudnorm as pl, numpy as np, subprocess, sys, os
ALT = False   # the blast version: its own cues/beds, the SFX ride lets the explosion through, hard stop at 61.0 s
subprocess.run([sys.executable,'../../../sound-layer/scripts/mix.py','cues_boom.json' if ALT else 'cues.json'],capture_output=True)
v,sr=sf.read('audio/stems/voice.wav'); v=v*10**(2/20); m,_=sf.read('audio/stems/music.wav'); s,_=sf.read('audio/stems/sfx.wav'); r,_=sf.read('beds_boom.wav' if ALT else 'beds.wav')
M=pl.Meter(sr); lv=M.integrated_loudness(v)
m=m*10**(((lv-18)-M.integrated_loudness(m))/20)   # earshot: the bed read as absent at 20 LU; sf.write('audio/stems/music.wav',m,sr)
# SFX bus rides UNDER the voice (user: SFX covered the voice): short-term envelope of each, SFX kept >= 3 dB under
# the voice while it speaks and under (voice median - 3 dB) in the pauses, then 0 dB bus (was +5)
from scipy.ndimage import uniform_filter1d, maximum_filter1d
rms=lambda x,w: np.sqrt(uniform_filter1d((x**2).mean(1),int(w*sr))+1e-12)
ve=rms(v,0.3); se=rms(s,0.05); vmed=np.median(ve[ve>np.percentile(ve,40)])
tgt=np.where(ve>vmed*0.25, ve*10**(-4.5/20), vmed*10**(-2/20))
g=np.minimum(1,tgt/se)
g[int(59.45*sr):]=np.maximum(g[int(59.45*sr):],0.75)   # the end burst (after the voice) plays out
g=g; g=-maximum_filter1d(-g,int(0.06*sr)); g=uniform_filter1d(g,int(0.04*sr))
s=s*g[:,None]; sf.write('audio/stems/sfx.wav',s,sr)
r=r*10**(((lv-22)-M.integrated_loudness(r))/20)
n=min(len(v),len(m),len(s),len(r)); mix=v[:n]+m[:n]+s[:n]+r[:n];
if True:   # the end burst on top (after the voice), set from the voice's loudness, set from the voice's loudness (the mixer only lifts cues over the bed, which is quiet once the voice stops)
    def ld(p):
        raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','2','-ar',str(sr),'-f','wav','-'],capture_output=True,check=True).stdout; import io; return sf.read(io.BytesIO(raw))[0]
    vrms=np.sqrt(np.mean(v[int(40*sr):int(55*sr)]**2))
    for p,t0,db in [('fs/boom_784205.mp3',59.49,5),('../../../sound-layer/kit/boom/fs-236956-boom-mp3-1.wav',59.49,2),('fs/cardboard_364739.mp3',59.51,-5),('fs/debris_794523.mp3',59.72,-3),('fs/debris_577455.mp3',59.95,-6)]:
        x=ld(p); i0=int(t0*sr); x=x[:max(0,n-i0)]; xr=np.sqrt(np.mean(x[:int(0.6*sr)]**2))+1e-9
        mix[i0:i0+len(x)]+=x*(vrms*10**(db/20)/xr)
mix*=10**((-14-M.integrated_loudness(mix))/20)
thr=10**(-2.2/20); env=np.abs(mix).max(1); g=np.minimum(1,thr/np.maximum(env,1e-9)); la=int(0.005*sr)
gl=np.repeat(np.minimum.reduceat(g,np.arange(0,len(g),la)),la)[:len(g)]; gl=np.minimum(gl,np.concatenate([gl[la:],np.ones(la)]))
a=np.exp(-1/(0.005*sr)); rl=np.exp(-1/(0.08*sr)); c=1.0; out=np.empty_like(gl)
for i,x in enumerate(gl): c=a*c+(1-a)*x if x<c else rl*c+(1-rl)*x; out[i]=c
mix=np.clip(mix*out[:,None],-0.8,0.8); sf.write('audio/final_mix.wav',mix,sr); sf.write('audio/mix.wav',mix,sr)
subprocess.run(['ffmpeg','-v','error','-y','-i','../renders/video_only.mp4','-i','audio/final_mix.wav','-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','256k','-shortest','../renders/guinea-rent.mp4'],check=True); import shutil; shutil.copy('../renders/guinea-rent.mp4','../renders/final.mp4')
print('mix',round(M.integrated_loudness(mix),2),'s')
