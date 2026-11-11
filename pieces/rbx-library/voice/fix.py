import subprocess, numpy as np, re, difflib, sys, shutil
from faster_whisper import WhisperModel
m=WhisperModel('large-v3',device='cpu',compute_type='int8')
n=lambda s:[re.sub(r"[^a-z0-9]","",x.lower()) for x in s.replace('-',' ').split() if re.sub(r"[^a-z0-9]","",x.lower())]
# number-to-words table for this script (Whisper may write digits either way)
PH=[(r'\b11[:.]59\b','eleven fifty nine'),(r'\b11[:.]58\b','eleven fifty eight'),(r'\b1979\b','nineteen seventy nine'),
    (r'\b212\b','two hundred and twelve'),(r'\btwo hundred twelve\b','two hundred and twelve'),
    (r'\ba 100\b','a hundred'),(r'\bone hundred\b','a hundred'),(r'\b100\b','a hundred'),
    (r'\b7\b','seven'),(r'\b3\b','three'),(r'\b9\b','nine'),(r'\b5\b','five'),(r'\b2\b','two'),(r'\b1\b','one'),
    (r'\bmetres\b','meters'),(r'\bgray\b','grey'),(r'\bniko\b','Nico'),(r'\bdropbox\b','drop box'),(r'\beveryone\b','every one'),(r'\bthunks?\b',lambda mm:mm.group(0))]
def num(s):
    s=s.replace('-',' ')
    for p,r in PH: s=re.sub(p,r,s,flags=re.I)
    return s
def tr(f):
    a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout,np.float32)
    return ' '.join(s.text for s in m.transcribe(a,language='en',beam_size=5,condition_on_previous_text=False)[0])
def errs(txt,f):
    a=n(num(txt)); b=n(num(tr(f)))
    return [(op,' '.join(a[i1:i2]),' '.join(b[j1:j2])) for op,i1,i2,j1,j2 in difflib.SequenceMatcher(None,a,b,autojunk=False).get_opcodes() if op!='equal']
if __name__=='__main__':
  for c in sys.argv[1:]:
    txt=open(f'{c}.txt').read(); best=None
    for k in range(4):
        out=f'{c}_t{k}.wav'
        subprocess.run(['curl','-s','-m','900','-X','POST','http://127.0.0.1:3900/generate','--form-string','text='+txt,'-F','profile_id=227af074','-F','num_step=32','-F','speed=1.25','-F','language=Auto','-o',out])
        e=errs(txt,out); score=sum(len(x[1].split())+len(x[2].split()) for x in e)
        print(c,k,score,e,flush=True)
        if best is None or score<best[0]: best=(score,out)
        if score==0: break
    shutil.copy(best[1],f'{c}.wav'); print(c,'KEEP',best,flush=True)
