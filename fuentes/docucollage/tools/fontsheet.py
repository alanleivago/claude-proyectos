import sys
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
C=Path("fonts_cand"); U=Path(r"D:\Alan\Fiverr Upwork trabajo fotos y videos\Fuentes")
def F(p,size,w=None):
    f=ImageFont.truetype(str(p),size)
    if w:
        try:
            axes=f.get_variation_axes(); vals=[w if a['name'] in (b'Weight','Weight') else a['default'] for a in axes]; f.set_variation_by_axes(vals)
        except Exception as e: pass
    return f
text=sys.argv[1]; out=sys.argv[2]; refs=sys.argv[3].split(",")
cands=[("Playfair 900",C/"PlayfairDisplay[wght].ttf",900),("Playfair 700",C/"PlayfairDisplay[wght].ttf",700),("DM Serif Disp",C/"DMSerifDisplay-Regular.ttf",None),("Abril",C/"AbrilFatface-Regular.ttf",None),("OldStandard B",C/"OldStandard-Bold.ttf",None),("Rozha",C/"RozhaOne-Regular.ttf",None),("Gloock",C/"Gloock-Regular.ttf",None),("Lora Bold",U/"Lora-Bold.ttf",None),("Newsreader 800",U/"Newsreader/Newsreader-VariableFont_opsz,wght.ttf",800),("SourceSerif 900",C/"SourceSerif4[opsz,wght].ttf",900),("FrankRuhl 900",C/"FrankRuhlLibre[wght].ttf",900),("NotoSerifDisp 900",C/"NotoSerifDisplay[wdth,wght].ttf",900),("Georgia B",r"C:\Windows\Fonts\georgiab.ttf",None),("Times B",r"C:\Windows\Fonts\timesbd.ttf",None),("Century",r"C:\Windows\Fonts\CENTURY.TTF",None)]
if len(sys.argv)>4 and sys.argv[4]=="sans":
    cands=[("Bebas",U/"bebas_neue/BebasNeue-Regular.ttf",None),("Oswald 400",C/"Oswald[wght].ttf",400),("Oswald 500",C/"Oswald[wght].ttf",500),("Oswald 300",C/"Oswald[wght].ttf",300),("Montserrat ExB",U/"static/Montserrat-ExtraBold.ttf",None),("Montserrat Black",U/"static/Montserrat-Black.ttf",None),("Poppins Bold",C/"Poppins-Bold.ttf",None),("CourierPrime B",C/"CourierPrime-Bold.ttf",None),("SpecialElite",C/"SpecialElite-Regular.ttf",None),("MomsTypewriter",next((U/"moms_typewriter").glob("*.ttf")),None),("PermMarker",C/"PermanentMarker-Regular.ttf",None),("CaveatBrush",C/"CaveatBrush-Regular.ttf",None),("RockSalt",C/"RockSalt-Regular.ttf",None),("ShadowsLight",C/"ShadowsIntoLight.ttf",None),("Gaegu B",C/"Gaegu-Bold.ttf",None)]
W=1100; rows=[]
for r in refs:
    im=Image.open(r).convert("RGB"); im=im.resize((W,int(im.height*W/im.width))); rows.append(im)
for name,p,w in cands:
    im=Image.new("RGB",(W,120),"#2a2a2a"); d=ImageDraw.Draw(im)
    try:
        f=F(p,84,w); d.text((250,10),text,font=f,fill="#E9C67A")
    except Exception as e: d.text((250,10),str(e)[:40],fill="red")
    d.text((8,45),name,fill="white",font=ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf",26)); rows.append(im)
H=sum(r.height for r in rows); S=Image.new("RGB",(W,H)); y=0
for r in rows: S.paste(r,(0,y)); y+=r.height
S.save(out,quality=85)
