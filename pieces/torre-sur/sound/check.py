"""Loudness checks: AAC-encoded integrated LUFS / true peak, momentary max per beat, voice-over-SFX margin per line."""
import json, subprocess, re, numpy as np, soundfile as sf, pyloudnorm as pl, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
subprocess.run(['ffmpeg','-v','error','-y','-i','mix.wav','-c:a','aac','-b:a','256k','mix_check.m4a'],check=True,timeout=300)
for f in ['mix.wav','mix_check.m4a']:
    r=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',f,'-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,timeout=300).stderr
    s=r[r.rfind('Summary'):]; print(f,'I',re.search(r'I:\s+(-?[\d.]+)',s).group(1),'LRA',re.search(r'LRA:\s+(-?[\d.]+)',s).group(1),'TP',re.search(r'Peak:\s+(-?[\d.]+)',s).group(1))
m,sr=sf.read('mix.wav'); v,_=sf.read('stems/voice.wav'); x=sum(sf.read(f'stems/{k}.wav')[0] for k in ['bed','fx','hit'])
from scipy.signal import butter, sosfilt
sos=butter(4,[300,4000],'bp',fs=sr,output='sos'); vb=sosfilt(sos,v,axis=0); xb=sosfilt(sos,x,axis=0)
M=pl.Meter(sr,block_size=.4)
def mom(a,t0,t1):
    w=int(.4*sr); best=-99
    for i in range(int(t0*sr),int(t1*sr)-w,int(.1*sr)):
        e=np.mean(a[i:i+w]**2)*2; best=max(best,-0.691+10*np.log10(e+1e-12))
    return best
for a,b,n in [(0,5.3,'office'),(5.5,6.6,'IMPACT'),(6.6,15,'panic'),(15,25,'call+lobby'),(25,33,'stairs'),(33,35,'jump'),(35,49,'sky'),(49,59,'lift+empty'),(59.5,64.2,'jet2'),(64.25,64.95,'silence'),(65,67.7,'sting')]:
    print(f'{n:11s} {a:5.1f}-{b:5.1f} mix max mom {mom(m,a,b):6.1f}  sfx-only {mom(x,a,b):6.1f}')
for l in json.load(open('../voice.json',encoding='utf-8'))['lines']:
    i0,i1=int(l['t0']*sr),int(l['t1']*sr); dv=10*np.log10(np.mean(v[i0:i1]**2)+1e-12); dx=10*np.log10(np.mean(x[i0:i1]**2)+1e-12)
    db=10*np.log10(np.mean(vb[i0:i1]**2)+1e-12)-10*np.log10(np.mean(xb[i0:i1]**2)+1e-12)
    print(l['id'],f"{l['t0']:5.1f} voice-over-sfx {dv-dx:5.1f} dB  (300-4k band {db:5.1f} dB)")
