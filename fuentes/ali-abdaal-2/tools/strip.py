"""strip.py out x0 y0 x1 y1 cols scale f1 f2 a-b... -> labelled grid of crops from hi/f####.png"""
import sys
from PIL import Image,ImageDraw
from pathlib import Path
D=Path(r"F:\Claude Proyectos\fuentes\ali-abdaal-2")
out=sys.argv[1]; x0,y0,x1,y1,cols=map(int,sys.argv[2:7]); sc=float(sys.argv[7])
fs=[]
for a in sys.argv[8:]:
    if "-" in a: x,y=map(int,a.split("-")); fs+=range(x,y+1)
    else: fs.append(int(a))
w,h=int((x1-x0)*sc),int((y1-y0)*sc); rows=(len(fs)+cols-1)//cols
S=Image.new("RGB",(cols*w,rows*h),"white"); d=ImageDraw.Draw(S)
for i,f in enumerate(fs):
    im=Image.open(D/"hi"/f"f{f:04d}.png").crop((x0,y0,x1,y1)).resize((w,h),Image.LANCZOS)
    x,y=(i%cols)*w,(i//cols)*h; S.paste(im,(x,y)); d.rectangle([x,y,x+60,y+13],fill="black"); d.text((x+2,y+1),f"f{f} {f*1001/30000:.2f}",fill=(255,80,80))
(D/"sheets").mkdir(exist_ok=True); S.save(D/"sheets"/f"{out}.jpg",quality=88); print(S.size)
