import subprocess, numpy as np, re, difflib, sys, shutil
from faster_whisper import WhisperModel
m=WhisperModel('large-v3',device='cpu',compute_type='int8')
n=lambda s:[re.sub(r"[^a-z0-9]","",x.lower()) for x in s.replace('-',' ').split() if re.sub(r"[^a-z0-9]","",x.lower())]
NUM={'1971':'nineteen seventy one','1':'one','2':'two','3':'three','7th':'seventh','8':'eight','9':'nine','10':'ten','16':'sixteen','60':'sixty','8,000,000,000':'eight billion','16,000,000,000':'sixteen billion'}
def num(s):
    return ' '.join(NUM.get(re.sub(r"[.,!?;:\"]+$","",w),w) for w in s.split())
def tr(f):
    a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout,np.float32)
    return ' '.join(s.text for s in m.transcribe(a,language='en',beam_size=5,condition_on_previous_text=False)[0])
def errs(txt,f):
    a=n(txt); b=n(num(tr(f))); a=n(num(txt))
    return [(op,' '.join(a[i1:i2]),' '.join(b[j1:j2])) for op,i1,i2,j1,j2 in difflib.SequenceMatcher(None,a,b,autojunk=False).get_opcodes() if op!='equal']
for c in sys.argv[1:]:
    txt=open(f'{c}.txt').read(); best=None
    for k in range(4):
        out=f'{c}_t{k}.wav'
        subprocess.run(['curl','-s','-m','900','-X','POST','http://127.0.0.1:3900/generate','--form-string','text='+txt,'-F','profile_id=d9b69bea','-F','num_step=32','-F','speed=1.25','-F','language=Auto','-o',out])
        e=errs(txt,out); score=sum(len(x[1].split())+len(x[2].split()) for x in e)
        print(c,k,score,e,flush=True)
        if best is None or score<best[0]: best=(score,out)
        if score<=1: break
    shutil.copy(best[1],f'{c}.wav'); print(c,'KEEP',best,flush=True)
