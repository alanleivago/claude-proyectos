"""Subtítulos quemados para las novelas (pedido del usuario 2026-11-16, como la ref @alisorxomrb): amarillo, sans-serif negrita con contorno oscuro,
centrados en el tercio inferior (encima de la interfaz de TikTok), 1-2 líneas, cambian por frase y van sincronizados al tramo de la EDL donde se dice la frase.
Texto = lines.json (ortografía correcta), alineado palabra por palabra con las frases de Whisper de renders/phr.json. Los tramos mudos (r*, i*, BLACK) no llevan texto,
así que el subtítulo nunca queda sobre alguien que no habla.

Uso desde edit.py (lienzo 720x1280):
    from _subs import subs_filter
    ins, chain = subs_filter(D, EDL, durs, SPEED, R / "subs", first_input=3)
    # ins = ["-i", png, ...]; chain("[w0]") -> "...[v]" (overlays con enable entre los tiempos de cada frase)
"""
import json, re, difflib
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 720, 1280
Y_CENTER = 880          # centro del bloque de texto (≈ y 1320 en 1920): tercio inferior, encima de la UI de TikTok
FONT = r"C:\Windows\Fonts\arialbd.ttf"
SIZE = 38  # usuario: "bajales ligeramente el tamaño" (antes 42)
STROKE = 4
YELLOW = (255, 226, 0, 255)
MAXLINE = 24            # caracteres por línea
MAXCHUNK = 2 * MAXLINE  # si la frase es más larga, se parte en dos subtítulos seguidos

norm = lambda w: re.sub(r"[^a-z0-9ñ]", "", w.lower().translate(str.maketrans("áéíóúü", "aeiouu")))

def _correct_phrases(asr_phr, lines):
    """Asigna a cada frase de Whisper (texto con errores) su tramo del texto correcto de lines.json."""
    good = " ".join(lines).split()
    asr = [w for p in asr_phr for w in p["t"].split()]
    owner = [i for i, p in enumerate(asr_phr) for _ in p["t"].split()]
    if not good or not asr: return [""] * len(asr_phr)
    sm = difflib.SequenceMatcher(None, [norm(w) for w in asr], [norm(w) for w in good], autojunk=False)
    gmap = {}
    for a, b, n in sm.get_matching_blocks():
        for k in range(n): gmap[b + k] = owner[a + k]
    # palabras correctas sin pareja: se quedan con la frase de la palabra anterior (o la siguiente)
    if gmap and len(good) - 1 - max(gmap) >= 3:  # el clip no dijo el final de la línea (Omni la cortó): no subtitular lo que no se oye
        good = good[:max(gmap) + 1]
    assign = []
    for j in range(len(good)):
        if j in gmap: assign.append(gmap[j])
        elif assign and not good[j - 1].endswith((".", "?", "!")): assign.append(assign[-1])
        elif assign: assign.append(next((gmap[k] for k in range(j, len(good)) if k in gmap), assign[-1]))
        else: assign.append(next((gmap[k] for k in range(len(good)) if k in gmap), 0))
    out = [[] for _ in asr_phr]
    for w, i in zip(good, assign): out[i].append(w)
    return [" ".join(x) for x in out]

def _wrap(text):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > MAXLINE: lines.append(cur); cur = w
        else: cur = f"{cur} {w}".strip()
    if cur: lines.append(cur)
    return lines

def _soft_pairs(clips_py):
    """Pares (original, suave) de la tabla SOFT de clips.py que tocan el diálogo (frases en español)."""
    import ast
    try:
        tree = ast.parse(Path(clips_py).read_text(encoding="utf-8"))
        for node in tree.body:
            if isinstance(node, ast.Assign) and getattr(node.targets[0], "id", "") == "SOFT":
                pairs = [tuple(ast.literal_eval(e)) for e in node.value.elts]
                return [(a, b) for a, b in pairs if any(c in a for c in "¿¡áéíóúñ") or a[:1].isupper()]
    except Exception:
        pass
    return []

def _apply(line, pairs):
    for a, b in pairs: line = line.replace(a, b)
    return line

def _chunks(text):
    """Parte una frase larga en n trozos parecidos (≤ 2 líneas cada uno), cortando entre palabras."""
    import math
    if len(text) <= MAXCHUNK: return [text]
    cuts = [m.end() for m in re.finditer(r"[,.?!;] ", text)]
    good = [c for c in cuts if len(text[:c].strip()) <= MAXCHUNK + 8 and len(text[c:].strip()) <= MAXCHUNK + 8]
    if good:
        strong = [c for c in good if text[c - 2] in ".?!"]  # preferir fin de oración sobre coma
        c = min(strong or good, key=lambda c: abs(c - len(text) / 2)); return [text[:c].strip(), text[c:].strip()]
    n = math.ceil(len(text) / MAXCHUNK); words = text.split(); target = len(text) / n; out, cur = [], ""
    for w in words:
        if cur and len(cur) >= target and len(out) < n - 1: out.append(cur); cur = w
        else: cur = f"{cur} {w}".strip()
    if cur: out.append(cur)
    return out

def _fit(text):
    """Corta en líneas por ancho real en píxeles (máx. 640 px); si no cabe en 2 líneas, baja el tamaño de letra."""
    for size in (SIZE, 35, 32, 28):
        font = ImageFont.truetype(FONT, size); d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
        lines, cur = [], ""
        for w in text.split():
            t = f"{cur} {w}".strip()
            if cur and d.textlength(t, font=font) + 2 * STROKE > 640: lines.append(cur); cur = w
            else: cur = t
        if cur: lines.append(cur)
        if len(lines) == 2:  # equilibrar: el corte que deja las dos líneas de ancho parecido
            ws = text.split()
            k = min(range(1, len(ws)), key=lambda k: max(d.textlength(" ".join(ws[:k]), font=font), d.textlength(" ".join(ws[k:]), font=font)))
            lines = [" ".join(ws[:k]), " ".join(ws[k:])]
        if len(lines) <= 2: return font, size, lines
    return font, size, lines

_WCACHE = {}
def _words_in(D, cid, ft, a0, b0, s, e):
    """Texto correcto (ft) de una frase que va de a0 a b0, recortado a las palabras dichas entre s y e (alineadas con Whisper por palabra)."""
    import subprocess, wave, numpy as np
    if cid not in _WCACHE:
        from faster_whisper import WhisperModel
        wav = Path(D) / "renders" / "subs" / "w.wav"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(Path(D) / "clips" / f"{cid}.mp4"), "-ac", "1", "-ar", "16000", str(wav)], check=True)
        w = wave.open(str(wav)); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768; w.close()
        segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(a, language="es", word_timestamps=True)
        _WCACHE[cid] = [(float(x.start), float(x.end), x.word.strip()) for sg in segs for x in sg.words]
    asr = [x for x in _WCACHE[cid] if s - 0.05 <= (x[0] + x[1]) / 2 <= e + 0.05]  # solo lo que se oye en este tramo
    good = ft.split()
    if not asr: return ""
    rev = e >= b0 - 0.05 and s > a0 + 0.05  # tramo final: alinear desde el final
    A = [norm(x[2]) for x in asr]; G = [norm(w) for w in good]
    if rev: A, G = A[::-1], G[::-1]
    sm = difflib.SequenceMatcher(None, A, G, autojunk=False)
    js = [j + k for i, j, n in sm.get_matching_blocks() for k in range(n)]
    if not js: return ""
    j0, j1 = min(js), max(js)
    if rev: j0, j1 = len(good) - 1 - j1, len(good) - 1 - j0
    return " ".join(good[j0:j1 + 1])

def _png(text, path):
    font, size, lines = _fit(text)
    lh = size + 10
    img = Image.new("RGBA", (W, lh * len(lines) + 2 * STROKE + 6), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for k, ln in enumerate(lines):
        tw = d.textlength(ln, font=font)
        d.text(((W - tw) / 2, STROKE + k * lh), ln, font=font, fill=YELLOW, stroke_width=STROKE, stroke_fill=(0, 0, 0, 255))
    img.save(path)
    return img.size[1]

def subs_filter(D, EDL, durs, SPEED, outdir, first_input=3):
    """durs = duración real (s) de cada parte de la EDL antes de acelerar (mismo orden que EDL, BLACK incluido)."""
    D, outdir = Path(D), Path(outdir); outdir.mkdir(parents=True, exist_ok=True)
    for f in outdir.glob("*.png"): f.unlink()
    L = json.loads((D / "lines.json").read_text(encoding="utf-8"))
    P = json.loads((D / "renders" / "phr.json").read_text(encoding="utf-8"))
    soft = _soft_pairs(D / "clips.py")
    fixed = {}
    for cid in L:
        if cid not in P or not L[cid]: continue
        # si el clip salió con la redacción suavizada (SOFT de clips.py), el texto correcto es esa versión
        cands = [L[cid], [_apply(l, soft) for l in L[cid]]]
        asr = " ".join(x["t"] for x in P[cid]["phr"])
        best = max(cands, key=lambda c: difflib.SequenceMatcher(None, norm(" ".join(c)), norm(asr)).ratio())
        fixed[cid] = _correct_phrases(P[cid]["phr"], best)
    t, events = 0.0, []
    for i, (cid, x, *pre) in enumerate(EDL):
        d = durs[i] / SPEED
        if cid != "BLACK" and L.get(cid) and cid in fixed and not (len(pre) > 1 and pre[1] == 0):
            s, e = x
            parts_txt = []
            for p, ft in zip(P[cid]["phr"], fixed[cid]):
                if not ft: continue
                a0, b0 = p["v"]; ov = min(b0, e) - max(a0, s)
                if ov <= 0: continue
                if a0 >= s - 0.05 and b0 <= e + 0.05: parts_txt.append(ft); continue
                # frase partida entre tramos (corte dentro de la frase): palabras correctas cuyo tiempo (Whisper por palabra) cae en este tramo
                sel = _words_in(D, cid, ft, a0, b0, s, e)
                if sel: parts_txt.append(sel)
            txt = " ".join(parts_txt).strip()
            if txt:
                parts = _chunks(txt); tot = sum(len(p) for p in parts); a = t + 0.04
                for p in parts:
                    b = a + (d - 0.08) * len(p) / tot
                    events.append((a, b, p)); a = b
        t += d
    ins, fc = [], []
    for k, (a, b, txt) in enumerate(events):
        png = outdir / f"s{k:03d}.png"; h = _png(txt, png)
        ins += ["-i", str(png)]
        fc.append((first_input + k, a, b, Y_CENTER - h // 2))
    (outdir / "subs.json").write_text(json.dumps([{"a": round(a, 2), "b": round(b, 2), "t": x} for a, b, x in events], ensure_ascii=False, indent=1), encoding="utf-8")

    def chain(src):
        if not fc: return f"{src}null[v]"
        out, prev = [], src
        for n, (idx, a, b, y) in enumerate(fc):
            lab = "[v]" if n == len(fc) - 1 else f"[sb{n}]"
            out.append(f"{prev}[{idx}:v]overlay=x=0:y={y}:enable='between(t,{a:.3f},{b:.3f})'{lab}")
            prev = lab
        return ";".join(out)
    return ins, chain
