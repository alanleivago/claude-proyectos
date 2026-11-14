"""v3 S4 document, made in code so the fine print is real, legible text (the lens magnifies a sharp 2x copy).
python prep/doc3.py -> assets/img3/doc_hi.png (1800x2400, 2x of the 900 px on-screen doc) + doc_meta.json (clause box in 1x px)."""
import json, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
R = Path(__file__).resolve().parent.parent; O = R / "assets/img3"; FD = R / "assets/fonts"; WF = Path("C:/Windows/Fonts")
S = 2; W, H = 900 * S, 1200 * S
paper = Image.open(R / "flow/v3/paper.jpg").convert("RGB")
pw, ph = paper.size; c = min(pw / W, ph / H)
paper = paper.crop(((pw - W * c) / 2, (ph - H * c) / 2, (pw + W * c) / 2, (ph + H * c) / 2)).resize((W, H), Image.LANCZOS)
d = ImageDraw.Draw(paper)
INK, RED = (46, 34, 24), (120, 30, 26)
def F(name, size, wght=None):
    f = ImageFont.truetype(str(name), size * S)
    if wght: f.set_variation_by_axes([wght])
    return f
head = F(FD / "Besley.ttf", 44, 800); sub = F(FD / "Besley.ttf", 22, 600); small = F(WF / "times.ttf", 15); smallb = F(WF / "timesbd.ttf", 15)
lab = F(WF / "timesi.ttf", 18)
def ctext(y, t, f, col=INK):
    w = d.textlength(t, font=f); d.text(((W - w) / 2, y * S), t, font=f, fill=col)
ctext(70, "FUNDRAISING AGREEMENT", head)
ctext(140, "UNIFORM SUPPLY & CLUB FUNDRAISING PROGRAM", sub, (90, 70, 50))
d.line([(80 * S, 182 * S), (820 * S, 182 * S)], fill=INK, width=3 * S); d.line([(80 * S, 189 * S), (820 * S, 189 * S)], fill=INK, width=1 * S)
d.text((80 * S, 214 * S), "Club:", font=lab, fill=INK); d.line([(132 * S, 234 * S), (520 * S, 234 * S)], fill=INK, width=S)
d.text((540 * S, 214 * S), "Season:", font=lab, fill=INK); d.line([(612 * S, 234 * S), (820 * S, 234 * S)], fill=INK, width=S)
clauses = [
    ("1. PURPOSE.", "The Company agrees to supply uniforms, warm-ups and team apparel to the Club and to provide fundraising support in the amount stated in Schedule A, subject to the terms below."),
    ("2. FUNDRAISING AMOUNT.", "The Club shall be credited a fundraising amount of five thousand dollars ($5,000.00) upon signature of this Agreement and confirmation of the minimum order."),
    ("3. MINIMUM ORDER.", "The Club agrees to purchase a minimum of one hundred and fifty (150) complete uniform kits per season at the Company's current catalogue prices."),
    ("4. TERM.", "This Agreement shall remain in force for three (3) consecutive seasons and renews automatically unless cancelled in writing ninety (90) days before the renewal date."),
    ("5. PRICING.", "Catalogue prices may be revised once per season. The Club shall be notified of any revision no less than thirty (30) days before it takes effect."),
    ("6. EXCLUSIVITY.", "During the term the Club shall not purchase uniforms, warm-ups or apparel from any other supplier, including for camps, tournaments and events."),
    ("7. PAYMENT OF FUNDS.", "All fundraising funds are PAID AS STORE CREDIT ONLY, redeemable exclusively for merchandise at the Company's store. Funds have no cash value and may not be transferred or withdrawn."),
    ("8. EXPIRY.", "Store credit not redeemed within twelve (12) months of issue shall expire without refund or compensation to the Club."),
    ("9. BRANDING.", "The Company's logo shall appear on all uniforms supplied under this Agreement, in a size and position chosen by the Company."),
    ("10. NOTICES.", "Any notice under this Agreement must be given in writing and delivered by hand or by registered mail to the address stated in Schedule A."),
    ("11. ENTIRE AGREEMENT.", "This Agreement and its Schedules form the entire agreement between the parties and replace any prior offer, proposal or understanding."),
    ("12. GOVERNING LAW.", "This Agreement is governed by the laws of the state in which the Company is registered."),
]
x0, x1, y = 80 * S, 820 * S, 272 * S
meta = {}
def wrap(words, f, first, width):
    lines, cur = [], first
    for w in words:
        t = (cur + " " + w).strip() if cur else w
        if d.textlength(t, font=f) > width and cur: lines.append(cur); cur = w
        else: cur = t
    lines.append(cur); return lines
for k, (ttl, body) in enumerate(clauses):
    tw = d.textlength(ttl + " ", font=smallb)
    d.text((x0, y), ttl, font=smallb, fill=INK)
    words = body.split(); lines = []; cur = ""; avail = x1 - x0 - tw; first = True
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=small) > avail and cur:
            lines.append((cur, first)); cur = w; first = False; avail = x1 - x0
        else: cur = t
    lines.append((cur, first))
    ys = y
    for ln, fst in lines:
        xx = x0 + tw if fst else x0
        if "STORE CREDIT ONLY" in ln:
            a, b = ln.split("PAID AS STORE CREDIT ONLY") if "PAID AS STORE CREDIT ONLY" in ln else (ln, "")
            d.text((xx, y), a, font=small, fill=INK); xa = xx + d.textlength(a, font=small)
            d.text((xa, y), "PAID AS STORE CREDIT ONLY", font=smallb, fill=INK)
            xb = xa + d.textlength("PAID AS STORE CREDIT ONLY", font=smallb)
            meta["clause"] = [round(xa / S), round(y / S), round(xb / S), round(y / S) + 18]
            d.text((xb, y), b, font=small, fill=INK)
        else:
            d.text((xx, y), ln, font=small, fill=INK)
        y += 22 * S
    if k == 6: meta["clause7"] = [80, round(ys / S), 820, round(y / S)]
    y += 14 * S
# signature block
y = 1040 * S
d.text((80 * S, y), "Signature:", font=lab, fill=INK); d.line([(170 * S, y + 22 * S), (440 * S, y + 22 * S)], fill=INK, width=S)
d.text((480 * S, y), "Date:", font=lab, fill=INK); d.line([(530 * S, y + 22 * S), (820 * S, y + 22 * S)], fill=INK, width=S)
d.text((80 * S, y + 60 * S), "Uniform Supply Co. — Authorized Representative", font=lab, fill=(90, 70, 50))
# light ink texture so it reads printed, not digital
noise = Image.effect_noise((W, H), 30).convert("L").point(lambda v: 255 if v > 120 else 230)
paper = Image.composite(paper, Image.new("RGB", (W, H), (236, 222, 196)), noise.filter(ImageFilter.GaussianBlur(0.6)))
paper.save(O / "doc_hi.png"); paper.resize((900, 1200), Image.LANCZOS).save(O / "doc.png")
(O / "doc_meta.json").write_text(json.dumps(meta)); print(meta)
