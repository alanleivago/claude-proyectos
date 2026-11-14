# ep8 (granja): fotos de Flow aisladas (photos/<name>/<view>.jpg) -> recorte PNG sin fondo (photos/_cut/<name>[_view].png),
# texturas PS1 (<=128 px, 32 colores, sin dither; RGBA si el modelo usa recorte alfa) en tex/ y perfiles en rows/*.json.
# python -I tools/prep_ep8.py
import numpy as np, os, json
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage
H = os.path.dirname(os.path.abspath(__file__)) + "/.."; P = H + "/photos"; T = H + "/tex"; RW = H + "/rows"; CUT = P + "/_cut"
for d in (T, RW, CUT): os.makedirs(d, exist_ok=True)


def mask(im, tol=22, holes=False):
    """fondo = pixeles parecidos al color del borde, conectados al borde (flood fill); holes=True: tambien los huecos
    cerrados grandes (manija, arco del candado, marco abierto)"""
    a = np.asarray(im, float); bg = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), 0)
    e = (np.abs(a - bg).max(-1) > tol).astype(np.uint8) * 255
    E = np.pad(np.asarray(Image.fromarray(e).filter(ImageFilter.MaxFilter(3))) > 0, 2); lab, _ = ndimage.label(~E)
    m = (lab != lab[0, 0])
    if holes:
        sz = ndimage.sum(~E, lab, range(1, lab.max() + 1))
        for i, s_ in enumerate(sz):
            if s_ > E.size * 0.0012: m[lab == i + 1] = False
    m = m[2:-2, 2:-2]
    return np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5))) > 127


def crop(name, view, tol=22, out=None, holes=False):
    im = Image.open(f"{P}/{name}/{view}.jpg").convert("RGB"); m = mask(im, tol, holes)
    lab, n = ndimage.label(m)   # fuera las motas sueltas (antena, pelusas): solo componentes > 0.5 % del mayor
    if n > 1:
        sz = ndimage.sum(m, lab, range(1, n + 1)); keep = [i + 1 for i, s in enumerate(sz) if s > sz.max() * 0.005]; m = np.isin(lab, keep)
    ys, xs = np.where(m); box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    im, m = im.crop(box), m[box[1]:box[3], box[0]:box[2]]
    Image.fromarray(np.dstack([np.asarray(im), (m * 255).astype(np.uint8)]), "RGBA").save(f"{CUT}/{out or name}.png")
    return im, m, box


def ps1(im, w, h, name, n=32, m=None):
    """textura PS1; con m (mascara) sale RGBA con alfa binario (recorte, se exporta como MASK)"""
    if m is not None:   # borde del recorte: se come 2 px (halo blanco) y el RGB bajo el alfa toma el color del borde
        m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(5))) > 127; im = bleed(im, m)
    im2 = im.resize((w, h), Image.LANCZOS).quantize(n, method=Image.MEDIANCUT, dither=Image.NONE).convert("RGB")
    if m is not None:
        al = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)) > 110
        im2 = Image.fromarray(np.dstack([np.asarray(im2), (al * 255).astype(np.uint8)]), "RGBA")
    im2.save(f"{T}/{name}.png"); return im2


def bleed(im, m):   # fondo -> color del borde del objeto en esa fila (el UV del canto no muestrea blanco)
    a = np.array(im); m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(7))) > 127
    for y in range(a.shape[0]):
        xs = np.where(m[y])[0]
        if len(xs): a[y, :xs[0]] = a[y, xs[0]]; a[y, xs[-1] + 1:] = a[y, xs[-1]]
    return Image.fromarray(a)


def rows(m, name, n=24):
    Hh, W = m.shape; out = []
    for v in [k / n for k in range(n + 1)]:
        y = min(Hh - 1, int((1 - v) * (Hh - 1))); xs = np.where(m[y])[0]
        if not len(xs): xs = np.array([W // 2 - 1, W // 2])
        out.append([v, xs[0] / W, xs[-1] / W])
    json.dump(out, open(f"{RW}/{name}.json", "w")); return out


def runs(m, gy):
    """mascara -> tiras por fila (gy filas): [[v0, v1, [[u0,u1],...]], ...] en coords normalizadas (v=0 abajo)"""
    Hh, W = m.shape; gx = max(8, round(gy * W / Hh)); s = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((gx, gy), Image.BILINEAR)) > 100
    out = []
    for r in range(gy):
        row = s[r]; rr = []; x = 0
        while x < gx:
            if row[x]:
                x0 = x
                while x < gx and row[x]: x += 1
                rr.append([x0 / gx, x / gx])
            else: x += 1
        if rr: out.append([1 - (r + 1) / gy, 1 - r / gy, rr])
    return out


def aspect(im): return im.height / im.width


info = {}
# 1 GENERADOR: caja con recorte alfa (marco abierto): frente = lado largo con el panel, costado = lado del arranque
im, m, _ = crop("generator", "front", out="generator", holes=True); ps1(im, 128, round(128 * aspect(im)), "gen_front", m=m); info["gen_front"] = aspect(im)
im, m, _ = crop("generator", "side", out="generator_side", holes=True); ps1(im, 96, round(96 * aspect(im)), "gen_side", m=m); info["gen_side"] = aspect(im)
for v, a in (("front", ((0.09, 0.055, 0.94, 0.285), (0.12, 0.35, 0.93, 0.88))), ("side", ((0.10, 0.02, 0.89, 0.35), (0.11, 0.35, 0.92, 0.85)))):
    c0 = Image.open(f"{CUT}/generator{'' if v == 'front' else '_side'}.png"); c = Image.new("RGB", c0.size, (33, 33, 31)); c.paste(c0, (0, 0), c0); W, Hh = c.size   # nucleo macizo (tanque, motor) sobre fondo oscuro
    for nm, (x0, y0, x1, y1) in zip(("tank", "eng"), a): ps1(c.crop((int(x0 * W), int(y0 * Hh), int(x1 * W), int(y1 * Hh))), 64, 32 if nm == "tank" else 48, f"gen_{nm}_{v}")
# techo del generador pintado: tanque negro con tapa + tubos amarillos en los bordes, resto transparente
t = Image.new("RGBA", (64, 48), (0, 0, 0, 0)); d = ImageDraw.Draw(t)
d.rectangle((9, 6, 54, 41), fill=(38, 38, 36, 255)); d.rectangle((12, 9, 51, 38), fill=(52, 52, 49, 255)); d.ellipse((27, 18, 36, 27), fill=(24, 24, 24, 255))
for x0 in (0, 59): d.rectangle((x0, 0, x0 + 4, 47), fill=(196, 160, 40, 255))
t.save(f"{T}/gen_top.png")
# 2 BIDON (jerry can): contorno por filas extruido + alfa (el hueco de la manija se ve)
im, m, _ = crop("jerrycan", "front", holes=True); rows(m, "jerrycan", 32); ps1(im, 64, round(64 * aspect(im)), "jerrycan", m=m); info["jerrycan"] = aspect(im)
# 4 BOMBA DE MANO (foto de costado): poste = caja; cuerpo = loft; caño/palanca = tiras extruidas por filas; palanca aparte
im, m, box = crop("handpump", "side", out="handpump", holes=True); Hh, W = m.shape; info["handpump"] = aspect(im)
# el poste: filas de abajo (ancho casi constante). Su borde de arriba = primera fila (desde abajo) donde el ancho salta (brida)
pw = [np.ptp(np.where(m[y])[0]) if m[y].any() else 0 for y in range(Hh)]; base_w = np.median(pw[int(Hh * 0.8):int(Hh * 0.95)])
y = int(Hh * 0.9)
while y > 0 and abs(pw[y] - base_w) < base_w * 0.08: y -= 1
post_top = y + 1; xs = np.where(m[int(Hh * 0.85)])[0]; px0, px1 = xs[0], xs[-1]
pim = im.crop((px0, post_top, px1 + 1, Hh)); ps1(pim, 32, 64, "pump_post")
ps1(bleed(im, m), 96, round(96 * aspect(im)), "pump", m=m)
# barril: columna que contiene el centro del poste, entre la tapa y el poste
cx = (px0 + px1) // 2; bar = np.zeros_like(m)
for yy in range(post_top):
    xs = np.where(m[yy])[0]
    if not len(xs) or not m[yy, cx]: continue
    a = cx; b = cx
    while a > 0 and m[yy, a - 1]: a -= 1
    while b < W - 1 and m[yy, b + 1]: b += 1
    if (px1 - px0) * 0.45 < b - a < (px1 - px0) * 1.0: bar[yy, a:b + 1] = True
ys = np.where(bar.any(1))[0]; lab_, _ = ndimage.label(bar.any(1)); big = np.bincount(lab_[lab_ > 0]).argmax(); bar[lab_ != big] = False
ys = np.where(bar.any(1))[0]; bxs = np.where(bar.any(0))[0]; bx0, bx1_ = bxs[0], bxs[-1]; yy = ys[0] - 1
while yy > 0 and m[yy, bx0:bx1_ + 1].mean() > 0.6: bar[yy, bx0:bx1_ + 1] = m[yy, bx0:bx1_ + 1]; yy -= 1   # sube por el tramo del caño hasta la tapa
ys = np.where(bar.any(1))[0]; bar_top = ys[0]
# palanca = lo que queda a la derecha del barril o por encima de la tapa; cuerpo (caño) = el resto sobre el poste
bx1 = max(np.where(bar[yy])[0][-1] for yy in ys); hm = m.copy(); hm[post_top:] = False; body = hm.copy()
H_ = np.zeros_like(m); H_[:bar_top + 4] = True; H_[:, bx1 + 6:] = True; hand = hm & H_; body = hm & ~H_
hy, hx = np.where(hand);
# pivote de la palanca: el punto de la palanca mas cercano al borde derecho del barril, arriba
cand = [(abs(x - bx1) + abs(y - bar_top) * 0.5, x, y) for y, x in zip(hy[::7], hx[::7])]; _, pvx, pvy = min(cand)
info["pump"] = {"W": W, "H": Hh, "post": [int(px0), int(px1), int(post_top)], "bar_top": int(bar_top), "pivot": [int(pvx), int(pvy)],
                "body_runs": runs(body[:post_top], 40), "hand_runs": runs(hand, 48)}
json.dump(rows(bar[bar_top:post_top], "pump_barrel", 16), open(f"{RW}/pump_barrel.json", "w"))
ps1(im.crop((0, bar_top, W, post_top)), 96, 48, "pump_barrel")
info["pump"]["bar_x"] = [int(np.where(bar.any(0))[0][0]), int(np.where(bar.any(0))[0][-1])]
# 5 CANDADO: cuerpo = caja con la foto (parte de abajo); arco (shackle) en codigo
im, m, _ = crop("padlock", "front", holes=True); Hh, W = m.shape; wd = m.sum(1); yb = next(y for y in range(Hh) if wd[y] > W * 0.85)
ps1(im.crop((0, yb, W, Hh)), 64, round(64 * (Hh - yb) / W), "padlock_body"); bra = np.asarray(im)[yb:][m[yb:]].mean(0) / 255; info["padlock"] = {"W": W, "H": Hh, "body_top": int(yb)}
sh = np.asarray(im)[: yb][m[:yb]]; info["padlock"]["steel"] = (sh.mean(0) / 255).round(3).tolist()
legs = np.where(m[int(yb * 0.8)])[0]; info["padlock"]["leg_row"] = [int(legs[0]), int(legs[-1])]
gaps = np.where(~m[int(yb * 0.8), legs[0]:legs[-1]])[0]; info["padlock"]["gap"] = [int(legs[0] + gaps[0]), int(legs[0] + gaps[-1])]
info["padlock"]["brass"] = bra.round(3).tolist(); info["padlock"]["top"] = int(np.where(m.any(1))[0][0])
# 6 PICKUP: costado (perfil por columnas, ruedas aparte), frente y cola
im, m, box = crop("pickup", "side", out="pickup"); Hh, W = m.shape; info["pickup_side"] = {"W": W, "H": Hh, "box": [int(b) for b in box]}
for k, (wx, wy, wr) in enumerate(((280, 520, 92), (1055, 520, 92))):   # ruedas en la foto (px absolutos) -> textura de la llanta
    ps1(im.crop((wx - wr - box[0], wy - wr - box[1], wx + wr - box[0], wy + wr - box[1])), 32, 32, f"pickup_wheel{k}")
info["pickup_side"]["wheels"] = [[280 - box[0], 520 - box[1], 92], [1055 - box[0], 520 - box[1], 92]]
ps1(bleed(im, m), 256, round(256 * aspect(im)), "pickup_side")
im2, m2, b2 = crop("pickup", "front", out="pickup_front"); info["pickup_front_box"] = [int(b) for b in b2]; ps1(bleed(im2, m2), 128, round(128 * aspect(im2)), "pickup_front"); info["pickup_front"] = {"W": m2.shape[1], "H": m2.shape[0]}
im3, m3, b3 = crop("pickup", "back", out="pickup_back"); info["pickup_back_box"] = [int(b) for b in b3]; ps1(bleed(im3, m3), 128, round(128 * aspect(im3)), "pickup_back"); info["pickup_back"] = {"W": m3.shape[1], "H": m3.shape[0]}
cols = []
for k in range(64):
    x = min(W - 1, int((k + 0.5) / 64 * W)); ys = np.where(m[:, x])[0]; cols.append([int(ys[0]), int(ys[-1])] if len(ys) else None)
info["pickup_side"]["cols"] = cols
# 7 FARDO: frente (lado largo) + punta; el cuerpo sin las pajas sueltas (recorte al 6 %)
for v, w in (("front", 128), ("side", 64)):
    im, m, _ = crop("haybale", v, out="haybale" if v == "front" else "haybale_side"); Hh, W = m.shape
    wd = m.sum(1); hs = np.where(wd > W * 0.7)[0]; ws = np.where(m.sum(0) > Hh * 0.7)[0]
    ix, iy = int((ws[-1] - ws[0]) * 0.03), int((hs[-1] - hs[0]) * 0.03); b = (ws[0] + ix, hs[0] + iy, ws[-1] + 1 - ix, hs[-1] + 1 - iy); c = im.crop(b); ps1(c, w, round(w * aspect(c)), f"hay_{v}"); info[f"hay_{v}"] = aspect(c)
im, m, _ = crop("haybale_round", "front"); Hh, W = m.shape
a = np.array(im); a[~m] = np.asarray(im)[m].mean(0).astype(np.uint8); ps1(Image.fromarray(a), 64, 64, "hayr_face")
# 8 SACO de alimento: loft por filas (seccion eliptica en el build)
im, m, _ = crop("feedsack", "front", tol=12); rows(m, "feedsack", 24); ps1(bleed(im, m), 64, round(64 * aspect(im)), "feedsack"); info["feedsack"] = aspect(im)
json.dump(info, open(f"{RW}/_info.json", "w"), indent=1, default=int); print({k: (v if not isinstance(v, dict) else {kk: vv for kk, vv in v.items() if "runs" not in kk and kk != "cols"}) for k, v in info.items()})
