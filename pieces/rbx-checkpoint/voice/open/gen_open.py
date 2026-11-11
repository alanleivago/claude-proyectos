import subprocess, numpy as np, re, difflib, sys
from faster_whisper import WhisperModel
m=WhisperModel('large-v3',device='cpu',compute_type='int8')
n=lambda s:[re.sub(r"[^a-z0-9]","",x.lower()) for x in s.replace('-',' ').split() if re.sub(r"[^a-z0-9]","",x.lower())]
def tr(f):
    a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout,np.float32)
    return ' '.join(s.text for s in m.transcribe(a,language='en',beam_size=5,condition_on_previous_text=False)[0])
for c,N in [(sys.argv[1],int(sys.argv[2]))]:
    txt=open(f'{c}.txt').read()
    for k in range(N):
        out=f'takes/{c}_{k}.wav'
        subprocess.run(['curl','-s','-m','900','-X','POST','http://127.0.0.1:3900/generate','--form-string','text='+txt,'-F','profile_id=227af074','-F','num_step=32','-F','speed=1.25','-F','language=Auto','-o',out])
        a,b=n(txt),n(tr(out))
        e=[(op,' '.join(a[i1:i2]),' '.join(b[j1:j2])) for op,i1,i2,j1,j2 in difflib.SequenceMatcher(None,a,b,autojunk=False).get_opcodes() if op!='equal']
        d=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',out],capture_output=True,text=True).stdout.strip()
        print(c,k,d,'OK' if not e else e,flush=True)
