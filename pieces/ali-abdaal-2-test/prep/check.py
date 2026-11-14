"""check.py out.jpg img1 img2 ... -> montage at height 640 with size labels"""
import sys
from PIL import Image,ImageDraw
ims=[Image.open(f).convert("RGB") for f in sys.argv[2:]]; h=640
row=[i.resize((max(1,int(i.width*h/i.height)),h)) for i in ims]
S=Image.new("RGB",(sum(r.width for r in row)+10*len(row),h+16),"white"); x=0; d=ImageDraw.Draw(S)
for r,i in zip(row,ims): S.paste(r,(x,16)); d.text((x+2,2),f"{i.size}",fill="red"); x+=r.width+10
S.save(sys.argv[1],quality=85)
