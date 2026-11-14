"""Per-frame mean abs diff (gray 135x240) of reel_yt.mp4 -> diffs.json, cuts.txt, cadence per second."""
import json,subprocess
from pathlib import Path
import numpy as np
D=Path(r"F:\Claude Proyectos\fuentes\ali-abdaal-2"); V=D/"reel_yt.mp4"
W,H=135,240
raw=subprocess.run(["ffmpeg","-v","error","-i",str(V),"-vf",f"scale={W}:{H},format=gray","-f","rawvideo","-"],capture_output=True).stdout
fr=np.frombuffer(raw,np.uint8).reshape(-1,H,W).astype(np.int16)
df=[0.0]+[float(np.abs(fr[i]-fr[i-1]).mean()) for i in range(1,len(fr))]
(D/"diffs.json").write_text(json.dumps([round(x,3) for x in df]))
fps=30000/1001
cuts=[i for i in range(1,len(df)) if df[i]>14 and df[i]>=max(df[max(0,i-3):i+4])]
(D/"cuts.txt").write_text(" ".join(f"{i/fps:.3f}" for i in cuts))
print("frames",len(df)); print("cuts",len(cuts)); print(" ".join(f"{i}:{i/fps:.2f}({df[i]:.0f})" for i in cuts))
