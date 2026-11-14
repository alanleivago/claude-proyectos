"""Shot-level coverage of the 4 extra reels against CATALOGO.md (API credits).
For every detected shot: key frames -> Claude classifies kind (graphics / talking-head / broll / screen) and catalogue type
(or NEW: name). Saves a key frame per shot to styles/f1motion/ref_frames/<reel>/shots/ and writes coverage.json per reel."""
import base64, io, json, re, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from analyze_reel import key
import anthropic
from PIL import Image

ROOT = Path(r"f:\Claude Proyectos")
REELS = {"KIMI": "DfNzJyXtRpJ", "CHG": "Deje_IEhM8c", "MUSE": "DdyxpSRBWIT", "BTS": "Dc_K1gSx5id"}
CAT = (ROOT / "styles/f1motion/CATALOGO.md").read_text(encoding="utf-8")
TYPES = re.findall(r"^### (\d+)\. (.+)$", CAT, re.M)
TYPE_LIST = "\n".join(f"{n}. {t}" for n, t in TYPES)
client = anthropic.Anthropic(api_key=key())

def dur(v):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(v)], capture_output=True, text=True).stdout)

def frame(v, t, w=540):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(v), "-frames:v", "1", "-vf", f"scale={w}:-2", "-f", "image2", "-c:v", "mjpeg", "-q:v", "4", "-"], capture_output=True).stdout
    return raw

def shots_for(rid):
    d = ROOT / "fuentes/f1motion/reels" / rid; v = d / "reel.mp4"; D = dur(v)
    cuts = [float(x) for x in (d / "scenes.txt").read_text().split()]
    pts = [0.0] + [c for c in cuts if 0.05 < c < D - 0.05] + [D]
    shots = []
    for a, b in zip(pts[:-1], pts[1:]):
        if b - a < 0.04: continue
        shots.append((round(a, 3), round(b, 3)))
    return v, shots

PROMPT = """Each shot below comes from a vertical explainer reel (motion-graphics style). For every shot you get 2 frames (near start, middle).
Classify each shot:
- kind: "graphics" (designed motion graphics: white/coloured backgrounds, cutouts, type, sprites, cards, UI mocks), "talking-head", "broll" (found footage / photos, B&W or colour), "screen" (screen recording / screenshot page), "flash" (<0.2 s flash/whip frame).
- type: the number of the closest catalogue type below, or "NEW: <short name>" if none fits.
- note: 6-15 words of what is on screen (objects, text) and any detail the catalogue entry lacks.
Catalogue types:
{types}
Reply ONLY with a JSON array: [{{"shot": <n>, "kind": "...", "type": <number or "NEW: name">, "note": "..."}}]"""

def classify(v, shots, offset):
    content = []
    for k, (a, b) in enumerate(shots):
        n = offset + k
        content.append({"type": "text", "text": f"--- shot {n} ({a:.2f}-{b:.2f}s)"})
        for t in (a + min(0.12, (b - a) * 0.25), (a + b) / 2):
            content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": base64.b64encode(frame(v, t, 320)).decode()}})
    content.append({"type": "text", "text": PROMPT.format(types=TYPE_LIST)})
    for _ in range(3):
        try:
            with client.messages.stream(model="claude-sonnet-5-5", max_tokens=16000, messages=[{"role": "user", "content": content}]) as s:
                r = s.get_final_message()
            t = "".join(x.text for x in r.content if x.type == "text")
            return json.loads(t[t.index("["): t.rindex("]") + 1])
        except Exception as e:
            print("retry", e, flush=True)
    return []

for nick, rid in REELS.items():
    out = ROOT / "fuentes/f1motion/reels" / rid / "coverage.json"
    if out.exists():
        continue
    v, shots = shots_for(rid)
    sd = ROOT / "styles/f1motion/ref_frames" / rid / "shots"; sd.mkdir(parents=True, exist_ok=True)
    res = []
    for i in range(0, len(shots), 30):
        res += classify(v, shots[i:i + 30], i + 1)
        print(nick, i, len(shots), flush=True)
    by = {r["shot"]: r for r in res}
    rows = []
    for n, (a, b) in enumerate(shots, 1):
        r = by.get(n, {"kind": "?", "type": "?", "note": ""})
        f = sd / f"s{n:03d}_{a:.2f}.jpg"
        f.write_bytes(frame(v, (a + b) / 2))
        rows.append({"shot": n, "start": a, "end": b, "kind": r.get("kind"), "type": r.get("type"), "note": r.get("note", ""),
                     "frame": str(f.relative_to(ROOT / "styles/f1motion")).replace("\\", "/")})
    out.write_text(json.dumps(rows, indent=1, ensure_ascii=False), encoding="utf-8")
    print("FIN", nick, len(rows), flush=True)
