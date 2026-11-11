# From voice_final_v4_fast.wav: shorten every quiet run (10 ms RMS < -40 dB) longer than 0.15 s to 0.10 s
# (cut from its middle, keeping 0.05 s of each side; 5 ms fades), then atempo=0.92 (pitch kept). words remapped.
import json, subprocess, numpy as np, soundfile as sf
a,sr=sf.read('voice_final_v4_fast.wav',dtype='float32'); W=json.load(open('words_v4_fast.json'))
h=int(0.01*sr); n=len(a)//h
db=20*np.log10(np.sqrt((a[:n*h].reshape(n,h)**2).mean(1))+1e-9); q=db<-40
runs=[];s=None
for i,x in enumerate(q):
    if x and s is None: s=i
    if (not x or i==n-1) and s is not None:
        e=i if not x else i+1
        if s>0 and e<n and (e-s)*0.01>0.15: runs.append((s*0.01,e*0.01))
        s=None
cuts=[(s0+0.05,e0-0.05) for s0,e0 in runs]
f=int(0.005*sr); r=np.linspace(0,1,f,dtype='float32'); parts=[];t=0.0
for c0,c1 in cuts:
    p=a[int(t*sr):int(c0*sr)].copy()
    if parts: p[:f]*=r
    p[-f:]*=r[::-1]; parts.append(p); t=c1
p=a[int(t*sr):].copy(); p[:f]*=r; parts.append(p)
sf.write('voice_gapcut.wav',np.concatenate(parts),sr,subtype='PCM_16')
rem=lambda x:x-sum(min(c1,x)-c0 for c0,c1 in cuts if x>c0)
print('pauses shortened',len(cuts),'removed s',round(sum(c1-c0 for c0,c1 in cuts),3))
subprocess.run(['ffmpeg','-v','error','-y','-i','voice_gapcut.wav','-af','atempo=0.92','-ar','48000','-c:a','pcm_s16le','voice_final.wav'],check=True)
new=[{'word':w['word'],'start':round(rem(w['start'])/0.92,3),'end':round(rem(w['end'])/0.92,3)} for w in W]
json.dump(new,open('words.json','w'),ensure_ascii=False,indent=1)
subprocess.run(['ffmpeg','-v','error','-y','-i','voice_final.wav','-t','20','preview_slow.wav'],check=True)
d=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','voice_final.wav'],capture_output=True,text=True).stdout)
print('dur',round(d,3),'wpm',round(len(new)/(new[-1]['end']-new[0]['start'])*60))
