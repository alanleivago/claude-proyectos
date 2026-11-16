# python tools/compose.py <stalker_dir> -> compare.png (concepto de Flow | ref | 4 stills PS1 escalados sin filtro)
import sys
from PIL import Image
D = sys.argv[1]
ref = Image.open(f"{D}/../ref/gigante_ref_tile.jpg").convert("RGB").resize((960, 1280), Image.LANCZOS)
names = ["s1_front_low", "s2_34", "s3_head", "s4_bust_low"]
def onsky(f):   # fondo gris de cielo nublado como la ref (el render sale con alfa)
    im = Image.open(f).convert("RGBA"); bg = Image.linear_gradient("L").resize(im.size).point(lambda v: 34 - v // 12)
    bg = Image.merge("RGB", (bg, bg, bg)).convert("RGBA"); bg.alpha_composite(im); return bg.convert("RGB")
st = [onsky(f"{D}/renders/{n}.png").resize((360, 640), Image.NEAREST) for n in names]
import glob
cs = sorted(glob.glob(f"{D}/concept/*front-view*-2.jpg"))
con = Image.open(cs[0]).convert("RGB") if cs else Image.new("RGB", (960, 1280))
con = con.resize((int(con.width * 1280 / con.height), 1280), Image.LANCZOS)
out = Image.new("RGB", (con.width + 960 + 720, 1280), (17, 17, 17)); out.paste(con, (0, 0)); out.paste(ref, (con.width, 0))   # concepto | ref | v3
for i, im in enumerate(st): out.paste(im, (con.width + 960 + (i % 2) * 360, (i // 2) * 640))
out.save(f"{D}/compare.png"); print("ok")
