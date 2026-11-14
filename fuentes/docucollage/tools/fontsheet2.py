import sys
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
C=Path("fonts_cand"); U=Path(r"D:\Alan\Fiverr Upwork trabajo fotos y videos\Fuentes")
def F(p,size,w=None,wd=None):
    f=ImageFont.truetype(str(p),size)
    try:
        axes=f.get_variation_axes(); vals=[]
        for a in axes:
            n=a['name'] if isinstance(a['name'],str) else a['name'].decode()
            vals.append(w if n=='Weight' and w else (wd if n=='Width' and wd else a['default']))
        f.set_variation_by_axes(vals)
    except Exception: pass
    return f
text,out,ref,mode=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4]
serif=[("Besley 800",C/"Besley[wght].ttf",800),("Besley 900",C/"Besley[wght].ttf",900),("Cinzel 900",C/"Cinzel[wght].ttf",900),("Prata",C/"Prata-Regular.ttf",None),("Rufina B",C/"Rufina-Bold.ttf",None),("Domine 700",C/"Domine[wght].ttf",700),("Sanchez",C/"Sanchez-Regular.ttf",None),("Rokkitt 800",C/"Rokkitt[wght].ttf",800),("Volkhov B",C/"Volkhov-Bold.ttf",None),("Merriweather 900",C/"Merriweather[opsz,wdth,wght].ttf",900),("CrimsonPro 900",C/"CrimsonPro[wght].ttf",900),("Gelasio 700",C/"Gelasio[wght].ttf",700),("Bitter 800",C/"Bitter[wght].ttf",800),("PTSerif B",C/"PT_Serif-Web-Bold.ttf",None),("Yeseva",C/"YesevaOne-Regular.ttf",None),("Abhaya XB",C/"AbhayaLibre-ExtraBold.ttf",None),("Fraunces 800",C/"Fraunces[SOFT,WONK,opsz,wght].ttf",800),("OldStd B",C/"OldStandard-Bold.ttf",None),("EBGaramond 800",C/"EBGaramond[wght].ttf",800),("Libertinus B",C/"LibertinusSerif-Bold.ttf",None),("Spectral XB",C/"Spectral-ExtraBold.ttf",None),("Lora B",U/"Lora-Bold.ttf",None),("Playfair 800",C/"PlayfairDisplay[wght].ttf",800),("Century",r"C:\Windows\Fonts\CENTURY.TTF",None),("Cambria B",r"C:\Windows\Fonts\cambriab.ttf",None),("Georgia B",r"C:\Windows\Fonts\georgiab.ttf",None)]
cond=[("Bebas",U/"bebas_neue/BebasNeue-Regular.ttf",None),("Oswald 500",C/"Oswald[wght].ttf",500),("Oswald 400",C/"Oswald[wght].ttf",400),("LeagueGothic",C/"LeagueGothic[wdth].ttf",None),("Antonio 600",C/"Antonio[wght].ttf",600),("Antonio 500",C/"Antonio[wght].ttf",500),("Fjalla",C/"FjallaOne-Regular.ttf",None),("PathwayGothic",C/"PathwayGothicOne-Regular.ttf",None),("BigShoulders 700",C/"BigShouldersDisplay[wght].ttf",700),("Teko 500",C/"Teko[wght].ttf",500),("SairaXC SB",C/"SairaExtraCondensed-SemiBold.ttf",None),("BarlowC SB",C/"BarlowCondensed-SemiBold.ttf",None),("Francois",C/"FrancoisOne-Regular.ttf",None),("Mohave 600",C/"Mohave[wght].ttf",600),("SofiaXC 700",C/"SofiaSansExtraCondensed[wght].ttf",700),("Anton",C/"Anton-Regular.ttf",None),("DugasPro BoldCond",U/"DUGAS PRO ttf/DugasPro-BoldCondensed.ttf",None),("FFGoodXC Bold",U/"FF good pro extra condensed/FFGoodProXCond-Bold.ttf",None),("CraftGothic",U/"CraftGothic-SemiCondensed/CraftGothic-SemiCondensed.ttf",None)]
cands=serif if mode=="serif" else cond
W=1100; im=Image.open(ref).convert("RGB"); im=im.resize((W,int(im.height*W/im.width))); rows=[im]
for name,p,w in cands:
    r=Image.new("RGB",(W,130),"#5a4632"); d=ImageDraw.Draw(r)
    try:
        f=F(p,110 if mode=="serif" else 120,w); 
        x=240
        for ch in text:
            d.text((x,8),ch,font=f,fill="#F6CF8E"); x+=f.getlength(ch)+(0 if mode=="serif" else 22)
    except Exception as e: d.text((250,10),str(e)[:60],fill="red")
    d.text((6,50),name,fill="white",font=ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf",24)); rows.append(r)
S=Image.new("RGB",(W,sum(r.height for r in rows))); y=0
for r in rows: S.paste(r,(0,y)); y+=r.height
S.save(out,quality=85)
