import json,sys,subprocess,os
seeds=[int(s) for s in sys.argv[1].split(',')]
only=sys.argv[2].split(',') if len(sys.argv)>2 else None
ref=open('takes/ref.txt').read().strip()
for id,text in json.load(open('lines.json')):
    if only and id not in only: continue
    for s in seeds:
        out=f'takes/{id}_s{s}.wav'
        if os.path.exists(out): continue
        r=subprocess.run(['curl','-s','-f','-m','300','-o',out,'-X','POST','http://127.0.0.1:3900/generate',
          '-F',f'text={text}','-F','ref_audio=@takes/ref_clean.wav','-F',f'ref_text={ref}',
          '-F','language=English','-F',f'seed={s}','-F','speed=0.75'])
        print(id,s,r.returncode,flush=True)
