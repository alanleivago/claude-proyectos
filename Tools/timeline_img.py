"""Línea de tiempo (1920x1080) de una pieza a partir de su montaje REAL: EDL de edit.py + renders/p###.mov + audio real.
Uso: python tools/timeline_img.py pieces/<pieza> [--out ruta.png] [--title "..."] [--video renders/v1.mp4]
                                  [--music "tension:0-c16,calida:c16-c21,tension:c21-end"] [--playhead 63.5]
- V1: un bloque por segmento (p000.mov, p001.mov, ...) con el fotograma del medio del segmento y su ID de clip.
- A1: forma de onda del audio de voz (renders/raw.mov = audio de los clips antes de la música; si no existe, el del video final).
- A2: camas de música. Sin --music se leen de edit.py (marcadores t1, t2 = at("cX"), at("cY") y el orden de los mp3 en el filtro).
Es una visualización propia de la lista de cortes, no la captura de ningún programa."""
import argparse, re, runpy, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
sys.stdout.reconfigure(encoding="utf-8")

W, H = 1920, 1080
BG, PANEL, GRID, TXT, DIM = (24, 25, 29), (33, 35, 40), (52, 55, 62), (225, 228, 233), (140, 146, 156)
V1C, A1C, PLAY = (64, 110, 190), (70, 170, 120), (235, 70, 70)
MUSC = {"tension": (150, 70, 70), "calida": (190, 130, 50)}

def font(size, bold=False):
    for f in (["seguisb.ttf", "arialbd.ttf"] if bold else ["segoeui.ttf", "arial.ttf"]):
        try: return ImageFont.truetype(f"C:/Windows/Fonts/{f}", size)
        except OSError: pass
    return ImageFont.load_default(size)

def probe(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True).stdout)

FPS = 24
def frames(p):
    return int(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries", "stream=nb_read_packets",
                               "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout.strip().rstrip(","))

def frame(p, t, h):
    png = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", str(p), "-frames:v", "1", "-vf", f"scale=-2:{h}",
                          "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True).stdout
    from io import BytesIO
    return Image.open(BytesIO(png)).convert("RGB")

def envelope(p, n):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-vn", "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], capture_output=True).stdout
    a = np.abs(np.frombuffer(raw, np.int16).astype(np.float32) / 32768)
    chunks = np.array_split(a, n)
    pk = np.array([c.max() if len(c) else 0 for c in chunks]); rms = np.array([np.sqrt((c ** 2).mean()) if len(c) else 0 for c in chunks])
    m = max(pk.max(), 1e-6)
    return pk / m, rms / m

def music_from_edit(src, starts, dur):
    """Secciones (nombre, ini, fin) leídas del template de edit.py de las novelas."""
    mk = re.search(r"^\s*(\w+(?:\s*,\s*\w+)*)\s*=\s*(at\(\"[^\"]+\"\)(?:\s*,\s*at\(\"[^\"]+\"\))*)", src, re.M)
    if not mk: return []
    cuts = [starts[c] for c in re.findall(r'at\("([^"]+)"\)', mk.group(2)) if c in starts]
    ins = re.search(r"ins_m\s*=\s*\[(.*?)\]\s*$", src, re.M | re.S)
    mp3 = re.findall(r'M / "(\w+)\.mp3"', ins.group(1)) if ins else []  # entradas 1..n del filtro
    order = [int(k) for k in re.findall(r'\[(\d+):a\]atrim', src)]      # orden de las camas en el filtro
    names = [mp3[k - 1] for k in order if 0 < k <= len(mp3)]
    bounds = [0.0] + cuts + [dur]
    return [(names[i] if i < len(names) else f"cama {i + 1}", bounds[i], bounds[i + 1]) for i in range(len(bounds) - 1)]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("piece"); ap.add_argument("--out"); ap.add_argument("--title"); ap.add_argument("--video")
    ap.add_argument("--music"); ap.add_argument("--playhead", type=float)
    a = ap.parse_args()
    D = Path(a.piece).resolve(); R = D / "renders"
    edl = runpy.run_path(str(D / "edit.py"), run_name="timeline")["EDL"]
    segs, t, mt, mstarts = [], 0.0, 0.0, {}
    for i, (cid, *_rest) in enumerate(edl):
        p = R / f"p{i:03d}.mov"
        if not p.exists(): continue
        d = frames(p) / FPS; segs.append((cid, t, d, p)); t += d
        mstarts.setdefault(cid, mt); mt += probe(p)  # edit.py coloca la música con at() = suma de duraciones de contenedor
    dur = t
    starts = {}
    for cid, s, *_ in segs: starts.setdefault(cid, s)
    video = (D / a.video) if a.video else max(R.glob("v*.mp4"), key=lambda q: q.stat().st_mtime)
    voice = R / "raw.mov" if (R / "raw.mov").exists() else video
    src = (D / "edit.py").read_text(encoding="utf-8")
    if a.music:
        mus = []
        for part in a.music.split(","):
            name, rng = part.split(":"); x, y = rng.split("-")
            g = lambda v: dur if v == "end" else (starts[v] if v in starts else float(v))
            mus.append((name, g(x), g(y)))
    else:
        mus = music_from_edit(src, mstarts, dur)
    title = a.title or f"{D.name} — montaje"
    play = a.playhead if a.playhead is not None else (mus[1][1] if len(mus) > 1 else dur / 3)

    img = Image.new("RGB", (W, H), BG); dr = ImageDraw.Draw(img)
    fT, fB, fS, fXS = font(34, True), font(18, True), font(15), font(12)
    dr.text((40, 24), title, font=fT, fill=TXT)
    info = f"{len(segs)} segmentos · {dur:.1f} s · {video.name}"
    dr.text((W - 40 - dr.textlength(info, font=fS), 38), info, font=fS, fill=DIM)

    # dos pasadas apiladas (0..dur/2, dur/2..dur) para que cada plano tenga ancho legible
    X0, X1, HEAD = 110, W - 30, 82
    half = dur / 2
    bands = [(0.0, half, 90), (half, dur, 90 + 480)]
    pk, rms = envelope(voice, 2 * (X1 - X0)); vdur = probe(voice)
    for bi, (b0, b1, y0) in enumerate(bands):
        sx = lambda tt: X0 + (tt - b0) / (b1 - b0) * (X1 - X0)
        dr.rounded_rectangle((20, y0, W - 20, y0 + 460), 8, fill=PANEL)
        # regla de tiempo
        ry = y0 + 10
        for s in range(int(b0), int(b1) + 1):
            x = sx(s)
            if x < X0 - 1 or x > X1 + 1: continue
            big = s % 5 == 0
            dr.line((x, ry + (0 if big else 14), x, ry + 24), fill=DIM if big else GRID, width=1)
            if big: dr.text((x + 3, ry - 2), f"00:{s // 60:02d}:{s % 60:02d}", font=fXS, fill=DIM)
        # pistas
        ty = {"V1": (y0 + 44, 230), "A1": (y0 + 284, 90), "A2": (y0 + 384, 60)}
        for name, (yy, hh) in ty.items():
            dr.rectangle((30, yy, X0 - 8, yy + hh), fill=(42, 45, 51))
            dr.text((44, yy + hh / 2 - 11), name, font=fB, fill=TXT)
            dr.text((44, yy + hh / 2 + 9), {"V1": "video", "A1": "voz", "A2": "música"}[name], font=fXS, fill=DIM)
        # V1
        vy, vh = ty["V1"]
        for cid, s, d, p in segs:
            if s + d <= b0 or s >= b1: continue
            xa, xb = max(sx(s), X0), min(sx(s + d), X1)
            if cid == "BLACK":
                dr.rectangle((xa, vy, xb - 1, vy + vh), fill=(10, 10, 10), outline=GRID); continue
            dr.rectangle((xa, vy, xb - 1, vy + vh), fill=V1C)
            w = int(xb - xa) - 4
            if w > 6:
                fh = vh - 36; th = frame(p, d / 2, fh)  # fotograma del medio del segmento, a la altura de la pista
                strip = Image.new("RGB", (w, fh))
                for k in range(0, w, th.width): strip.paste(th, (k, 0))  # tira de fotogramas si el bloque es ancho
                if th.width > w: strip = th.crop(((th.width - w) // 2, 0, (th.width - w) // 2 + w, fh))
                img.paste(strip, (int(xa) + 2, vy + 4))
                # ID del clip, vertical si no cabe
                lab = cid.replace("old/", "")
                tl = Image.new("RGBA", (int(dr.textlength(lab, font=fS)) + 4, 20), (0, 0, 0, 0))
                ImageDraw.Draw(tl).text((2, 0), lab, font=fS, fill=TXT)
                if tl.width > w: tl = tl.rotate(90, expand=True)
                img.paste(tl, (int(xa) + 2 + max(0, (w - tl.width) // 2), vy + vh - tl.height - 4), tl)
            dr.line((xa, vy, xa, vy + vh), fill=BG, width=1)
        # A1 forma de onda real
        ay, ah = ty["A1"]; mid = ay + ah / 2
        dr.rectangle((X0, ay, X1, ay + ah), fill=(30, 52, 42))
        n = len(pk)
        for x in range(X0, X1):
            tt = b0 + (x - X0) / (X1 - X0) * (b1 - b0); k = min(n - 1, int(tt / vdur * n))
            dr.line((x, mid - pk[k] * ah * 0.47, x, mid + pk[k] * ah * 0.47), fill=(52, 120, 88))
            dr.line((x, mid - rms[k] * ah * 0.47, x, mid + rms[k] * ah * 0.47), fill=A1C)
        # A2 música
        my, mh = ty["A2"]
        for nm, s, e in mus:
            if e <= b0 or s >= b1: continue
            xa, xb = max(sx(s), X0), min(sx(e), X1)
            dr.rounded_rectangle((xa + 1, my, xb - 1, my + mh), 6, fill=MUSC.get(nm, (110, 90, 160)))
            dr.text((xa + 10, my + mh / 2 - 10), f"{nm}.mp3", font=fB, fill=TXT)
        # cabezal
        if b0 <= play < b1:
            x = sx(play)
            dr.polygon([(x - 8, ry), (x + 8, ry), (x, ry + 12)], fill=PLAY)
            dr.line((x, ry, x, y0 + 450), fill=PLAY, width=2)
            m, s = divmod(play, 60)
            dr.text((x + 10, ry + 12), f"{int(m):02d}:{s:05.2f}", font=fXS, fill=PLAY)
    foot = (f"Generado desde la EDL de {D.name}/edit.py y renders/p000–p{len(segs) - 1:03d}.mov · "
            f"A1 = {voice.name} · A2 = camas leídas del filtro de mezcla · fotogramas reales de cada segmento")
    dr.text((30, H - 22), foot, font=fXS, fill=DIM)
    out = Path(a.out) if a.out else D / "renders" / "linea_de_tiempo.png"
    out.parent.mkdir(parents=True, exist_ok=True); img.save(out)
    print(out, f"{len(segs)} segmentos, {dur:.2f} s, música:", [(n, round(s, 2), round(e, 2)) for n, s, e in mus])

if __name__ == "__main__":
    main()
