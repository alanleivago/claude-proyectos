"""Cortes + fotograma central por plano + mosaicos -> clasificación de encuadre con Claude (API)."""
import base64, io, json, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageStat

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(r"F:\Claude Proyectos")
OUT = ROOT / "fuentes/atrium-vista/encuadres"
OUT.mkdir(parents=True, exist_ok=True)
V = ROOT / "fuentes/atrium-vista"
ATRIUM = [V / "velocidad/videos" / f"{i}.mp4" for i in ("7707710905521327391", "7706934219510975774", "7706344565933985054", "7706316327023119647")] + \
         [V / "videos" / f"{i}.mp4" for i in ("7707034442048507166", "7706934829392203039", "7706270980758441247", "7706224426399829279")]
OURS = [ROOT / f"pieces/{p}/renders/share.mp4" for p in ("jipi-becal", "sarape-saltillo", "baul-sanmiguel-p2", "garrafon-bernal", "cantera-huichapan", "aserrin-huamantla")]
W, H, COLS, ROWS = 270, 480, 5, 3
FONT = ImageFont.truetype("arialbd.ttf", 40)


def load_key():
    for line in (ROOT / ".env").read_text(encoding="utf-8-sig").splitlines():
        k, s, v = line.strip().partition("=")
        if s and k.strip() == "ANTHROPIC_API_KEY":
            return v.strip().strip('"').strip("'")


def dur(v):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(v)],
                                capture_output=True, text=True).stdout.strip())


def cuts(v):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(v), "-vf", "scale=180:-2,select='gt(scene,0.3)',showinfo", "-an", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    return [float(m) for m in re.findall(r"pts_time:([\d.]+)", r.stderr)]


def frame(v, t):
    r = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(v), "-frames:v", "1", "-vf", f"scale={W}:{H}", "-f", "image2pipe", "-vcodec", "png", "-"],
                       capture_output=True)
    return Image.open(io.BytesIO(r.stdout)).convert("RGB")


def shots(v):
    d = dur(v)
    b = [0.0] + [c for c in cuts(v) if c > 0.2] + [d]
    out = []
    for a, z in zip(b, b[1:]):
        if z - a < 0.25:
            continue
        im = frame(v, (a + z) / 2)
        if ImageStat.Stat(im.convert("L")).mean[0] < 14:  # negro
            continue
        out.append({"t0": round(a, 2), "t1": round(z, 2), "im": im})
    return d, out


def mosaics(sh, tag):
    per = COLS * ROWS
    res = []
    for k in range(0, len(sh), per):
        m = Image.new("RGB", (COLS * W, ROWS * H), "black")
        dr = ImageDraw.Draw(m)
        for j, s in enumerate(sh[k:k + per]):
            x, y = (j % COLS) * W, (j // COLS) * H
            m.paste(s["im"], (x, y))
            n = k + j + 1
            dr.rectangle([x, y, x + 70, y + 48], fill="black")
            dr.text((x + 6, y + 2), str(n), fill="yellow", font=FONT)
            dr.rectangle([x, y, x + W - 1, y + H - 1], outline="white", width=2)
        p = OUT / f"{tag}_m{k // per + 1}.jpg"
        m.save(p, quality=82)
        res.append(p)
    return res


PROMPT = """Son los fotogramas centrales de cada plano (numerados en amarillo, en orden) de un short vertical de telenovela mexicana hecha con IA.
Ignora textos sobrepuestos (marca de agua, subtítulos). Clasifica CADA plano numerado. Responde SOLO un array JSON, un objeto por plano:
{"n": numero, "p": personas visibles (0, 1, 2 o 3 = tres o más; cuenta también a alguien de espaldas/hombro en primer plano si se reconoce como persona),
 "s": tamaño de plano: "CU" (primer plano / close-up, cabeza y hombros o más cerrado), "PM" (plano medio, cintura/pecho hacia arriba), "PMA" (plano medio abierto o americano, rodillas/muslos hacia arriba), "PG" (plano general, cuerpo entero o más),
 "t": tipo: "single" (un personaje solo en cuadro, a cámara o lateral), "two" (two-shot: dos personajes visibles de frente/perfil, ninguno de espaldas al lente), "ots" (sobre el hombro: alguien de espaldas o su hombro/nuca en primer plano y otro de frente), "grupo" (3 o más personas como sujeto), "inserto" (objeto, manos, lugar, sin cara como sujeto),
 "cam": true si el personaje mira directo a cámara,
 "m": momento narrativo probable en 1-3 palabras (p. ej. "gancho", "confrontación", "llegada figura poder", "reacción grupo", "revelación", "CTA") }"""


def classify(client, tag, ms):
    content = []
    for p in ms:
        content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": base64.b64encode(p.read_bytes()).decode()}})
    content.append({"type": "text", "text": PROMPT})
    with client.messages.stream(model="claude-sonnet-5-5", max_tokens=16000, messages=[{"role": "user", "content": content}]) as s:
        r = s.get_final_message()
    txt = "".join(b.text for b in r.content if b.type == "text")
    j = json.loads(txt[txt.index("["): txt.rindex("]") + 1])
    print(tag, "tokens", r.usage.input_tokens, r.usage.output_tokens, flush=True)
    return j


def run(item):
    import anthropic
    grp, v = item
    tag = ("atr_" if grp == "atrium" else "our_") + (v.stem if grp == "atrium" else v.parents[1].name)
    d, sh = shots(v)
    ms = mosaics(sh, tag)
    cl = classify(anthropic.Anthropic(api_key=load_key(), timeout=600), tag, ms)
    byn = {c["n"]: c for c in cl}
    rows = [{**{k: s[k] for k in ("t0", "t1")}, **byn.get(i + 1, {})} for i, s in enumerate(sh)]
    return {"grp": grp, "tag": tag, "dur": d, "shots": rows}


if __name__ == "__main__":
    items = [("atrium", v) for v in ATRIUM] + [("ours", v) for v in OURS]
    with ThreadPoolExecutor(5) as ex:
        res = list(ex.map(run, items))
    (OUT / "datos.json").write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    print("FIN")
