"""sheet.py start dur cols out [w=180] [step=1] -> labelled contact sheet of every `step`-th frame (30 fps)"""
import sys,subprocess,numpy as np
from PIL import Image,ImageDraw
from pathlib import Path
D=Path(r"F:\Claude Proyectos\fuentes\ali-abdaal-2")
a,dur,cols,out=float(sys.argv[1]),float(sys.argv[2]),int(sys.argv[3]),sys.argv[4]
w=int(sys.argv[5]) if len(sys.argv)>5 else 180; step=int(sys.argv[6]) if len(sys.argv)>6 else 1
h=w*16//9; fps=30000/1001
raw=subprocess.run(["ffmpeg","-v","error","-ss",f"{a:.3f}","-t",f"{dur:.3f}","-i",str(D/"reel_yt.mp4"),"-vf",f"scale={w}:{h}","-f","rawvideo","-pix_fmt","rgb24","-"],capture_output=True).stdout
fr=np.frombuffer(raw,np.uint8).reshape(-1,h,w,3)[::step]
f0=round(a*fps); rows=(len(fr)+cols-1)//cols
S=Image.new("RGB",(cols*w,rows*h),"white"); d=ImageDraw.Draw(S)
for i,f in enumerate(fr):
    x,y=(i%cols)*w,(i//cols)*h; S.paste(Image.fromarray(f),(x,y))
    n=f0+i*step; d.rectangle([x,y,x+78,y+14],fill="black"); d.text((x+2,y+1),f"{n} {n/fps:.2f}",fill=(255,60,60))
S.save(D/"sheets"/f"{out}.jpg",quality=85); print(out,len(fr))
