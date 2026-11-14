"""grab.py outdir f1 f2 a-b ... (frame numbers, 30fps) -> PNG 1080x1920 f####.png (streams rawvideo)"""
import sys,subprocess,numpy as np
from PIL import Image
from pathlib import Path
D=Path(r"F:\Claude Proyectos\fuentes\ali-abdaal-2"); out=D/sys.argv[1]; out.mkdir(parents=True,exist_ok=True)
fs=set()
for a in sys.argv[2:]:
    if "-" in a: x,y=map(int,a.split("-")); fs|=set(range(x,y+1))
    else: fs.add(int(a))
W,H=1080,1920; n=W*H*3; mx=max(fs)
p=subprocess.Popen(["ffmpeg","-v","error","-i",str(D/"reel_yt.mp4"),"-f","rawvideo","-pix_fmt","rgb24","-"],stdout=subprocess.PIPE)
for i in range(mx+1):
    b=p.stdout.read(n)
    if len(b)<n: break
    if i in fs: Image.fromarray(np.frombuffer(b,np.uint8).reshape(H,W,3)).save(out/f"f{i:04d}.png")
p.kill(); print(len(fs))
