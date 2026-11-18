"""Before / after sheet for the v7 lashes + full lips. python -I tools/wanim/lashes_lips.py -> review/lashes_lips.png"""
import os, sys, json
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import anim_review as AR

B4 = os.path.join(ROOT, "ref", "v6_before")
MB = json.load(open(os.path.join(B4, "face_meta.json"))); MA = json.load(open(os.path.join(ROOT, "ref", "face_meta.json")))


def cell(sheet, meta, key, name, z=1.4):
    if name not in meta[key]: return None
    k = meta[key].index(name); cw, ch = sheet.width // 16, sheet.height // 4
    c = sheet.crop(((k % 16) * cw, (k // 16) * ch, (k % 16 + 1) * cw, (k // 16 + 1) * ch))
    return c.resize((int(cw * z), int(ch * z)), Image.NEAREST)


def main():
    EB, EA = Image.open(os.path.join(B4, "face_eyes.png")), Image.open(os.path.join(ROOT, "tex", "face_eyes.png"))
    MBs, MAs = Image.open(os.path.join(B4, "face_mouth.png")), Image.open(os.path.join(ROOT, "tex", "face_mouth.png"))
    eyes = ["open", "half", "bedroom", "smug", "sideEyeL", "sideEyeR", "adoring", "challenge", "blink", "happy", "winkR", "relaxed"]
    mouths = ["softSmile", "sweetSmile", "smirk", "cat", "kiss", "pout", "parted", "ahTongue"]
    combos = [("bedroom", "kiss"), ("smug", "cat"), ("sideEyeR", "smirk"), ("adoring", "sweetSmile"), ("open", "parted"), ("bedroom", "ahTongue"),
              ("half", "softSmile"), ("winkR", "smirk")]
    shots = [dict(out=os.path.join(AR.TMP, f"ll_{i}.png"), clip=None, frame=1, view="front", ctr=AR.u([0, 0, 1.585]), ext=0.36 * AR.S, eyes=e, mouth=m)
             for i, (e, m) in enumerate(combos)]
    AR.render(AR.GLB["B"], shots, 280)
    F = AR.font(20); F2 = AR.font(14)
    ew, eh = int(EB.width // 16 * 1.4), int(EB.height // 4 * 1.4); mw, mh = int(MBs.width // 16 * 2.4), int(MBs.height // 4 * 2.4)
    W = 2 * 6 * (ew + 10) + 40
    im = Image.new("RGB", (max(W, 8 * 290 + 20), 40 + 2 * (2 * eh + 40) + 50 + 2 * (mh + 26) + 60 + 300 + 30), (34, 36, 42)); d = ImageDraw.Draw(im)
    y = 10; d.text((10, y), "1 Lashes: thicker upper lash line + outer flicks + small lower flick, every eye cell (top = before, bottom = after)", fill=(240, 240, 240), font=F); y += 32
    for row in (eyes[:6], eyes[6:]):
        for j, n in enumerate(row):
            x = 10 + j * 2 * (ew + 10) // 1
            b = cell(EB, MB, "face_eyes", n, 1.4); a = cell(EA, MA, "face_eyes", n, 1.4)
            if b: im.paste(b, (x, y))
            im.paste(a, (x, y + eh + 4)); d.text((x + 2, y + 2 * eh + 6), n, fill=(210, 210, 210), font=F2)
        y += 2 * eh + 30
    y += 10; d.text((10, y), "2 Full lips: her own painted lips deformed (smile / smirk / squeeze / part), not thin lines (top = before, bottom = after)", fill=(240, 240, 240), font=F); y += 32
    for j, n in enumerate(mouths):
        x = 10 + j * (mw + 14)
        b = cell(MBs, MB, "face_mouth", n, 2.4); a = cell(MAs, MA, "face_mouth", n, 2.4)
        if b: im.paste(b, (x, y))
        else: d.text((x + 8, y + mh // 2 - 8), "(new cell)", fill=(180, 180, 180), font=F2)
        im.paste(a, (x, y + mh + 4)); d.text((x + 2, y + 2 * mh + 6), n, fill=(210, 210, 210), font=F2)
    y += 2 * mh + 34
    d.text((10, y), "On the model (after): eyes / mouth", fill=(240, 240, 240), font=F); y += 30
    for i, (e, m) in enumerate(combos):
        im.paste(Image.open(os.path.join(AR.TMP, f"ll_{i}.png")).convert("RGB"), (10 + i * 290, y)); d.text((14 + i * 290, y + 282), f"{e} / {m}", fill=(210, 210, 210), font=F2)
    im = im.crop((0, 0, im.width, y + 305))
    im.save(os.path.join(ROOT, "review", "lashes_lips.png")); print("LL", im.size)


if __name__ == "__main__":
    main()
