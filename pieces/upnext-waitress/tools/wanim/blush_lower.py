"""Before / after of the lower blush. python -I tools/wanim/blush_lower.py -> review/blush_lower.png"""
import os, sys, json
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import anim_review as AR

B4 = os.path.join(ROOT, "ref", "v7_before")
MB = json.load(open(os.path.join(B4, "face_meta.json"))); MA = json.load(open(os.path.join(ROOT, "ref", "face_meta.json")))
AR.META = MB
combos = [("happy+blush", "sweetSmile+blush"), ("shy+blush", "softSmile+blush"), ("sideEyeL+blush", "smirk+blush"),
          ("open+blush", "parted+blush"), ("hearts+blush", "kiss+blush"), ("smug+blush", "cat+blush")]


def shots(tag):
    return [dict(out=os.path.join(AR.TMP, f"bl_{tag}_{i}.png"), clip=None, frame=1, view="front", ctr=AR.u([0, 0, 1.585]), ext=0.36 * AR.S, eyes=e, mouth=m)
            for i, (e, m) in enumerate(combos)]


def main():
    AR.META = MB; AR.render(os.path.join(ROOT, "ref", "cmp", "old.blend"), shots("b"), 280)
    AR.META = MA; AR.render(os.path.join(ROOT, "ref", "cmp", "new.blend"), shots("a"), 280)
    W = 280; im = Image.new("RGB", (len(combos) * (W + 10) + 10, 46 + 2 * (W + 26)), (34, 36, 42)); d = ImageDraw.Draw(im)
    d.text((10, 10), "Blush moved down onto the cheeks, clear gap below the lower lashes (top = before, bottom = after); everything else identical",
           fill=(240, 240, 240), font=AR.font(19))
    for i, (e, m) in enumerate(combos):
        x = 10 + i * (W + 10)
        im.paste(Image.open(os.path.join(AR.TMP, f"bl_b_{i}.png")).convert("RGB"), (x, 46))
        im.paste(Image.open(os.path.join(AR.TMP, f"bl_a_{i}.png")).convert("RGB"), (x, 46 + W + 26))
        d.text((x + 4, 46 + W + 4), f"{e} / {m}", fill=(210, 210, 210), font=AR.font(13))
    im.save(os.path.join(ROOT, "review", "blush_lower.png")); print("BLUSH", im.size)


if __name__ == "__main__":
    main()
