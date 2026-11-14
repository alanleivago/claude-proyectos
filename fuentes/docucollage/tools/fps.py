"""Unique-frame measurement: per frame mean abs diff vs previous (gray 135x240). Writes diffs.json per reel and prints per-second unique counts."""
import json,subprocess,sys
from pathlib import Path
import numpy as np
for d in sorted(Path(sys.argv[1]).iterdir()):
    W,H=135,240
    raw=subprocess.run(["ffmpeg","-v","error","-i",str(d/"reel.mp4"),"-vf",f"scale={W}:{H},format=gray","-f","rawvideo","-"],capture_output=True).stdout
    fr=np.frombuffer(raw,np.uint8).reshape(-1,H,W).astype(np.int16)
    df=[0.0]+[float(np.abs(fr[i]-fr[i-1]).mean()) for i in range(1,len(fr))]
    (d/"diffs.json").write_text(json.dumps([round(x,3) for x in df]))
    fps=25; n=len(df)
    line=[]
    for s in range(0,n//fps):
        seg=df[s*fps:(s+1)*fps]; u=sum(1 for x in seg if x>0.15)
        line.append(u)
    print(d.name, " ".join(map(str,line)))
