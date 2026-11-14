"""Serif candidates vs ref title (f0030 line 1 'if you don't', x-height 104 px, ink width 778 px).
Each candidate: size so x-height=104, tracking solved so ink width = 778. Prints tracking (em)."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import numpy as np
D=Path(r"F:\Claude Proyectos\fuentes\ali-abdaal-2"); C=D/"fonts_cand"; C0=Path(r"F:\Claude Proyectos\fuentes\docucollage\fonts_cand"); U=Path(r"D:\Alan\Fiverr Upwork trabajo fotos y videos\Fuentes")
def F(p,size,w=None,opsz=None):
    f=ImageFont.truetype(str(p),size)
    try:
        vals=[]
        for a in f.get_variation_axes():
            n=a['name'] if isinstance(a['name'],str) else a['name'].decode()
            v=a['default']
            if n=='Weight' and w: v=w
            if n in('Optical size','Optical Size','opsz') and opsz: v=min(max(opsz,a['minimum']),a['maximum'])
            vals.append(v)
        f.set_variation_by_axes(vals)
    except Exception: pass
    return f
cands0=[("Newsreader 500 opsz72",C/"Newsreader[opsz,wght].ttf",500,72),("Newsreader 400 opsz72",C/"Newsreader[opsz,wght].ttf",400,72),
("SourceSerif4 500 opsz60",C0/"SourceSerif4[opsz,wght].ttf",500,60),("Literata 500 opsz72",C/"Literata[opsz,wght].ttf",500,72),("Literata 400 opsz72",C/"Literata[opsz,wght].ttf",400,72),
("EBGaramond 500",C/"EBGaramond[wght].ttf",500,None),("EBGaramond 600",C/"EBGaramond[wght].ttf",600,None),("CormorantGaramond 600",C/"CormorantGaramond[wght].ttf",600,None),
("CrimsonPro 500",C0/"CrimsonPro[wght].ttf",500,None),("CrimsonText SB",C/"CrimsonText-SemiBold.ttf",None,None),("Petrona 500",C/"Petrona[wght].ttf",500,None),("Brygada 500",C/"Brygada1918[wght].ttf",500,None),
("LibreCaslonText 500",C/"LibreCaslonText[wght].ttf",500,None),("Baskervville 500",C/"Baskervville[wght].ttf",500,None),("LibreBaskerville 400",C/"LibreBaskerville[wght].ttf",400,None),
("Cardo",C/"Cardo-Regular.ttf",None,None),("SortsMillGoudy",C/"SortsMillGoudy-Regular.ttf",None,None),("Castoro",C/"Castoro-Regular.ttf",None,None),("Gelasio 500",C0/"Gelasio[wght].ttf",500,None),
("Fraunces 400 opsz144",C0/"Fraunces[SOFT,WONK,opsz,wght].ttf",400,144),("Playfair 500 opsz",C/"Playfair[opsz,wdth,wght].ttf",500,40),("InstrumentSerif",C/"InstrumentSerif-Regular.ttf",None,None),
("Radley",C/"Radley-Regular.ttf",None,None),("Lustria",C/"Lustria-Regular.ttf",None,None),("AbhayaLibre M",C/"AbhayaLibre-Medium.ttf",None,None),("Amiri",C/"Amiri-Regular.ttf",None,None),
("Georgia",r"C:\Windows\Fonts\georgia.ttf",None,None),("Times",r"C:\Windows\Fonts\times.ttf",None,None),("GLC Garamond",r"F:\Claude Proyectos\fonts\1689-glc-garamond-pro-normal.otf",None,None),("Newsreader 600 opsz72",C/"Newsreader[opsz,wght].ttf",600,72)]
cands=[("InstrumentSerif",C/"InstrumentSerif-Regular.ttf",None,None,0,1),("InstrumentSerif +2px",C/"InstrumentSerif-Regular.ttf",None,None,2,1),("InstrumentSerif +3px",C/"InstrumentSerif-Regular.ttf",None,None,3,1),("InstrumentSerif +4px",C/"InstrumentSerif-Regular.ttf",None,None,4,1),
("GildaDisplay",C/"GildaDisplay-Regular.ttf",None,None,0,1),("Ovo",C/"Ovo-Regular.ttf",None,None,0,1),("Rosarivo",C/"Rosarivo-Regular.ttf",None,None,0,1),("DMSerifText",C/"DMSerifText-Regular.ttf",None,None,0,1),
("Newsreader 500 x0.86",C/"Newsreader[opsz,wght].ttf",500,72,0,0.86),("Newsreader 400 x0.86",C/"Newsreader[opsz,wght].ttf",400,72,0,0.86),("Literata 400 x0.86",C/"Literata[opsz,wght].ttf",400,72,0,0.86),("SourceSerif 500 x0.88",C0/"SourceSerif4[opsz,wght].ttf",500,60,0,0.88),
("LibreCaslonText 400 x0.85",C/"LibreCaslonText[wght].ttf",400,None,0,0.85),("CrimsonPro 500 x0.86",C0/"CrimsonPro[wght].ttf",500,None,0,0.86),("EBGaramond 500 x0.86",C/"EBGaramond[wght].ttf",500,None,0,0.86),("Lustria x0.88",C/"Lustria-Regular.ttf",None,None,0,0.88),("Georgia x0.86",r"C:\Windows\Fonts\georgia.ttf",None,None,0,0.86),("Gelasio 500 x0.86",C0/"Gelasio[wght].ttf",500,None,0,0.86)]
TXT="if you don\u2019t"; XH=104; WREF=778
def ink(f,tr,sw=0,sq=1):
    W,H=2000,420; im=Image.new("L",(W,H),0); d=ImageDraw.Draw(im); x=40
    for ch in TXT: d.text((x,60),ch,font=f,fill=255,stroke_width=sw,stroke_fill=255); x+=f.getlength(ch)+tr
    if sq!=1: im=im.resize((int(W*sq),H),Image.LANCZOS)
    a=np.asarray(im)>128; xs=np.where(a.any(0))[0]; ys=np.where(a.any(1))[0]; return im,xs,ys
ref=Image.open(D/"hi/f0030.png").crop((100,985,1000,1215)).resize((900,230))
rows=[]; lab=ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf",22)
for name,p,w,o,sw,sq in cands:
    try:
        f=F(p,200,w,o); bb=f.getbbox("x",stroke_width=sw); xh=bb[3]-bb[1]-0; s=200*XH/xh; f=F(p,int(round(s)),w,o)
        lo,hi=-0.3*s,0.3*s
        for _ in range(30):
            tr=(lo+hi)/2; _,xs,_=ink(f,tr,sw,sq); 
            if xs.max()-xs.min()>WREF: hi=tr
            else: lo=tr
        im,xs,ys=ink(f,tr,sw,sq)
        crop=im.crop((xs.min()-51,ys.min()-30,xs.min()-51+900,ys.min()-30+230))
        r=Image.new("RGB",(900,230),(14,18,30)); r.paste((255,255,255),(0,0),crop)
        ImageDraw.Draw(r).text((6,200),f"{name}  size {s:.0f}  track {tr/s:+.3f}em",font=lab,fill=(255,200,60))
        rows.append(r)
    except Exception as e: print(name,e)
# pair ref + candidate side-by-side rows of 2
out=[]
for r in rows:
    pair=Image.new("RGB",(1800,230)); pair.paste(ref,(0,0)); pair.paste(r,(900,0)); out.append(pair)
for k in range(0,len(out),10):
    S=Image.new("RGB",(1800,230*len(out[k:k+10])))
    for i,r in enumerate(out[k:k+10]): S.paste(r,(0,230*i))
    S.save(D/"sheets"/f"fonts_serifB_{k//10}.jpg",quality=88)
print("ok",len(rows))
