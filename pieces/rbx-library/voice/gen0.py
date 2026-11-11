import subprocess, sys
sys.argv=[sys.argv[0]]
from fix import errs
txt=open('c0.txt').read()
for k in range(4):
    out=f'c0_t{k}.wav'
    subprocess.run(['curl','-s','-m','900','-X','POST','http://127.0.0.1:3900/generate','--form-string','text='+txt,'-F','profile_id=227af074','-F','num_step=32','-F','speed=1.25','-F','language=Auto','-o',out])
    d=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',out],capture_output=True,text=True).stdout)
    print(k,round(d,2),errs(txt,out),flush=True)
