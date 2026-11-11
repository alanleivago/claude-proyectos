# 8 new takes of the opening: k0-5 one chunk, k6-7 as "In this town," + "you can't return..." joined by a 0.12 s pause.
import subprocess, sys, os, numpy as np, soundfile as sf
sys.argv=[sys.argv[0]]; os.chdir(os.path.dirname(os.path.abspath(__file__))+'/..'); sys.path.insert(0,os.getcwd())
from fix import errs
T="In this town, you can't return a library book late."
def gen(txt,out):
    subprocess.run(['curl','-s','-m','900','-X','POST','http://127.0.0.1:3900/generate','--form-string','text='+txt,'-F','profile_id=227af074','-F','num_step=32','-F','speed=1.25','-F','language=Auto','-o',out])
def tight(y,sr,db=-45):  # strip leading/trailing silence
    h=int(0.005*sr); e=np.array([20*np.log10(np.sqrt((y[i:i+h]**2).mean())+1e-9) for i in range(0,len(y)-h,h)]); v=np.where(e>db)[0]
    return y[max(0,v[0]*h-h):min(len(y),(v[-1]+3)*h)]
for k in range(8):
    out=f'open0/v3/t{k}.wav'
    if k<6: gen(T,out)
    else:
        gen("In this town,",'open0/v3/pa.wav'); gen("you can't return a library book late.",'open0/v3/pb.wav')
        a,sr=sf.read('open0/v3/pa.wav',dtype='float32'); b,_=sf.read('open0/v3/pb.wav',dtype='float32')
        sf.write(out,np.concatenate([tight(a,sr),np.zeros(int(0.12*sr),'float32'),tight(b,sr),np.zeros(int(0.25*sr),'float32')]),sr)
    print(k,errs(T,out),flush=True)
