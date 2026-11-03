"""venv: renders/frames/#####.png -> renders/post/#####.png with the LPS captions of video #1 (yellow
#F5EB30, lowercase, black stroke, Arial Bold 60, baseline at 67.5% H, 1 line, blocks from timing.json "captions"). The caption
hides while a 3D number is on screen (NUMBERS).  python post.py [a,b]"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

H = os.path.dirname(os.path.abspath(__file__))
TIM = json.load(open(os.path.join(H, "voice", "timing.json")))
FPS = 30
CUT = [max(0, round((s - 0.15) * FPS)) if i else 0 for i, s in enumerate(TIM["starts"])]
END = round(TIM["end"] * FPS)
FONT = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 60)
SRC, DST = os.path.join(H, "renders", "frames"), os.path.join(H, "renders", "post")
os.makedirs(DST, exist_ok=True)


def W(line, prefix):
    return next(w for w in TIM["words"] if w["line"] == line and w["w"].strip(".,!?-").lower().startswith(prefix))["s"]


T0 = [c / FPS for c in CUT]
T1 = T0[1:] + [END / FPS]
# seconds while a 3D number (Letters3D in build.py) is on screen: the caption hides (LPS rule)
NUMBERS = [(W(0, "29") - 0.05, T1[0]),                       # s01 "29" (v3: beside the face, fully in frame)
           (W(16, "29") - 0.05, T1[16] - 0.5 + 0.3),          # s17 "29" (spins out at d - 0.5)
           (T0[1] + 0.05, T1[1]),                            # s02 "1944"
           (T0[3], T1[3]),                                   # s04 "1945"
           (W(7, "one"), T1[7]),                             # s08 1946 / 1955 / 1965
           (T0[9] + 0.05, T1[9])]                            # s10 "1974"
CAP_Y = {1: 0.86, 5: 0.88, 10: 0.88}   # shot index -> caption baseline (H fraction): below the LUBANG label (s02), the leaflet (s06), the posters and checklist (s11)
HIDE = "spoken"   # "spoken": hide the caption block that says the number while it is on screen (the 3D number replaces it)
#                  "all": hide every caption while any 3D number is on screen (~14 s of speech uncaptioned); "off"


def caption_at(t):
    cur = None
    for c in TIM["captions"]:
        if c["s"] - 0.05 <= t:
            cur = c
    if not cur:
        return ""
    on = any(a <= t < b for a, b in NUMBERS)
    if on and (HIDE == "all" or (HIDE == "spoken" and any(ch.isdigit() for ch in cur["text"]))):
        return ""
    return cur["text"]


def frame(f):
    im = Image.open(os.path.join(SRC, f"{f:05d}.png")).convert("RGB")
    W_, Hh = im.size; t = f / FPS; shot = max(i for i, c in enumerate(CUT) if c <= f)
    txt = caption_at(t)
    if txt:
        d = ImageDraw.Draw(im)
        d.text((W_ / 2, Hh * (0.86 if shot == 13 and t >= W(13, 'flew') else CAP_Y.get(shot, 0.675))), txt, font=FONT, fill=(245, 235, 48), anchor="ms", stroke_width=5, stroke_fill=(0, 0, 0))
    im.save(os.path.join(DST, f"{f:05d}.png"))


a, b = (int(x) for x in sys.argv[1].split(",")) if len(sys.argv) > 1 else (0, END - 1)
for f in range(a, b + 1):
    frame(f)
print("post", a, b)
