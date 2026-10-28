"""Preview: each hair/hat glued on the kit head with the kit's math (HAIR table entry: [sprite, kw, hl, x])."""
import json, sys
from PIL import Image, ImageDraw
P = "../sprites/png/"
def compose(entry, face="face_neutral"):
    head = Image.open(P + "head_white.png").convert("RGBA"); S = 300; head = head.resize((S, int(S * head.height / head.width)))
    D = 0.915 * S; cx, cy = S, S   # canvas 2S x 2S, head centre at the middle
    can = Image.new("RGBA", (2 * S, 2 * S), (90, 150, 200, 255)); can.alpha_composite(head, (cx - head.width // 2, cy - head.height // 2))
    try:
        f = Image.open(P + face + ".png").convert("RGBA").resize((int(S * 1.2), int(S * 1.2))); can.alpha_composite(f, (cx - f.width // 2, cy - f.height // 2))
    except FileNotFoundError: pass
    img, kw, hl, x = entry[:4]; h = Image.open(P + img + ".png").convert("RGBA"); hw = D * kw; hh = hw * h.height / h.width
    h = h.resize((int(hw), int(hh))); yc = D * 0.24 + hl * hh - hh / 2   # up from head centre
    can.alpha_composite(h, (int(cx + D * x - hw / 2), int(cy - yc - hh / 2)))
    return can
if __name__ == "__main__":
    T = json.loads(open(sys.argv[1]).read()); names = list(T)
    cols = 8; out = Image.new("RGB", (cols * 220, ((len(names) + cols - 1) // cols) * 240), "white"); d = ImageDraw.Draw(out)
    for i, n in enumerate(names):
        c = compose(T[n]).crop((60, 0, 540, 520)).resize((210, 228)); out.paste(c, ((i % cols) * 220, (i // cols) * 240)); d.text(((i % cols) * 220 + 4, (i // cols) * 240 + 228), n, fill="black")
    out.save(sys.argv[2])
