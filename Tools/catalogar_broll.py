"""Catalog every b-roll clip in a folder with the API (credits): duration, resolution, orientation,
description from frames, usable segments, topics. Writes CATALOGO.md + catalogo.json in that folder.

  python tools/catalogar_broll.py "Ref videos Dariel/Stimulus/broll"
Already-cataloged clips (in catalogo.json) are skipped.
"""
import base64, json, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from revisar_render import load_env_key
import anthropic

MODEL = "claude-sonnet-5-5"
EXT = {".mp4", ".mov", ".m4v", ".mxf", ".avi", ".mkv", ".mts"}
ROOT = Path(sys.argv[1]).resolve()
OUTJ = ROOT / "catalogo.json"
client = anthropic.Anthropic(api_key=load_env_key(), timeout=600)

PROMPT = """These are {n} frames from one b-roll clip (timestamps in seconds: {ts}; clip length {dur:.1f} s, {w}x{h} {orient}).
The b-roll is for vertical talking-head reels of Stimulus Athletic, a custom sports uniform company (youth soccer clubs, coaches, club directors, fundraising, jerseys).
Return ONLY a JSON object:
{{"description": "2-3 sentences: what is shown, setting, people, action, camera movement",
 "usable": [[start_s, end_s, "why / notes"]],   // segments that look steady (frames similar = no strong shake), no on-screen text/graphics, no blur; based on the frames
 "avoid": "shaky / text / blurry parts, if any, else ''",
 "topics": ["short tags from: jerseys, jersey close-up, team store, kids playing, soccer match, training, coach, parents/families, delivery, unboxing, design, mockup/screen, printing/production, warehouse, office, team photo, celebration, money/payment, fundraising, sizing, product shot, logo, other: ..."],
 "vertical_crop": "good | ok | poor  (how well the main subject survives a centered 9:16 crop)",
 "crop_x": 0.5  // best horizontal center for a 9:16 crop, 0..1
}}"""


def probe(p):
    o = json.loads(subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(p)],
                                  capture_output=True, text=True).stdout or "{}")
    v = next((s for s in o.get("streams", []) if s.get("codec_type") == "video"), None)
    if not v: return None
    w, h = int(v["width"]), int(v["height"])
    rot = 0
    for sd in v.get("side_data_list", []):
        if "rotation" in sd: rot = int(sd["rotation"])
    rot = int(v.get("tags", {}).get("rotate", rot))
    if abs(rot) % 180 == 90: w, h = h, w
    dur = float(o["format"].get("duration") or v.get("duration") or 0)
    fps = v.get("avg_frame_rate", "0/1")
    return dict(w=w, h=h, dur=dur, fps=fps, codec=v.get("codec_name"))


def frames(p, dur, n=6):
    ts = [round(dur * (k + 0.5) / n, 2) for k in range(n)]
    out = []
    with tempfile.TemporaryDirectory() as td:
        for k, t in enumerate(ts):
            f = Path(td) / f"{k}.jpg"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", str(p), "-frames:v", "1",
                            "-vf", "scale='if(gt(iw,ih),640,-2)':'if(gt(iw,ih),-2,640)'", "-q:v", "4", str(f)])
            if f.exists(): out.append(base64.b64encode(f.read_bytes()).decode())
    return ts, out


def one(p):
    info = probe(p)
    if not info or info["dur"] <= 0: return str(p.relative_to(ROOT)), {"error": "not a readable video"}
    orient = "vertical" if info["h"] > info["w"] else "horizontal" if info["w"] > info["h"] else "square"
    ts, imgs = frames(p, info["dur"])
    content = [{"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": b}} for b in imgs]
    content.append({"type": "text", "text": PROMPT.format(n=len(imgs), ts=ts, dur=info["dur"], w=info["w"], h=info["h"], orient=orient)})
    txt = ""
    with client.messages.stream(model=MODEL, max_tokens=16000, messages=[{"role": "user", "content": content}]) as s:
        msg = s.get_final_message()
    txt = "".join(b.text for b in msg.content if b.type == "text").strip()
    a, b = txt.find("{"), txt.rfind("}")
    try: res = json.loads(txt[a:b + 1])
    except Exception: res = {"description": txt, "usable": [], "topics": []}
    res.update(info, orientation=orient)
    return str(p.relative_to(ROOT)).replace("\\", "/"), res


def main():
    cat = json.loads(OUTJ.read_text(encoding="utf-8")) if OUTJ.exists() else {}
    clips = sorted(p for p in ROOT.rglob("*") if p.suffix.lower() in EXT and p.is_file()
                   and str(p.relative_to(ROOT)).replace("\\", "/") not in cat)
    print(len(clips), "clips to catalog")
    with ThreadPoolExecutor(6) as ex:
        for k, (rel, res) in enumerate(ex.map(one, clips)):
            cat[rel] = res
            print(k + 1, rel, res.get("topics", res.get("error")))
            OUTJ.write_text(json.dumps(cat, indent=1, ensure_ascii=False), encoding="utf-8")
    md = ["# Catálogo b-roll Stimulus", "", f"{len(cat)} clips. Generado con tools/catalogar_broll.py (API). Segmentos en segundos del clip.", ""]
    for rel in sorted(cat):
        r = cat[rel]
        if "error" in r:
            md += [f"## {rel}", f"- ERROR: {r['error']}", ""]; continue
        md += [f"## {rel}",
               f"- {r['dur']:.1f} s · {r['w']}x{r['h']} · {r['orientation']} · {r.get('fps')} · crop 9:16: {r.get('vertical_crop', '?')} (x {r.get('crop_x', 0.5)})",
               f"- {r.get('description', '')}",
               "- Usable: " + ("; ".join(f"{u[0]}–{u[1]} s ({u[2]})" for u in r.get("usable", []) if len(u) >= 3) or "—"),
               *([f"- Evitar: {r['avoid']}"] if r.get("avoid") else []),
               "- Temas: " + ", ".join(r.get("topics", [])), ""]
    (ROOT / "CATALOGO.md").write_text("\n".join(md), encoding="utf-8")
    print("CATALOGO.md", len(cat))


if __name__ == "__main__":
    main()
