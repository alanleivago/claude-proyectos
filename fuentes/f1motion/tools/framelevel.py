"""12 fps frame-level analysis of EVERY graphics shot of the 4 reels (API credits), checked against the catalogue entry of its type.
Writes fuentes/f1motion/reels/<id>/framelevel/g_XXX.md and framelevel.json (per-shot corrections / additions)."""
import base64, json, re, subprocess, sys, tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from analyze_reel import key
import anthropic

ROOT = Path(r"f:\Claude Proyectos")
REELS = {"KIMI": "DfNzJyXtRpJ", "CHG": "Deje_IEhM8c", "MUSE": "DdyxpSRBWIT", "BTS": "Dc_K1gSx5id"}
CAT = (ROOT / "styles/f1motion/CATALOGO.md").read_text(encoding="utf-8")
ENTRIES = {int(m.group(1)): m.group(0) for m in re.finditer(r"^### (\d+)\..*?(?=^### |\Z|^## )", CAT, re.M | re.S)}
client = anthropic.Anthropic(api_key=key())
P = """These are ALL frames (12 fps, every 2nd frame at 24 fps) of {n} consecutive motion-graphics shot(s) from a vertical explainer reel, labeled with time and shot number.
Shots: {shots}
Catalogue entries for the assigned types:
{entries}
For EACH shot answer in English, terse, with numbers (px at 1080x1920, % of frame, hex, frames):
- shot n [start-end] type N (confirm or correct: give the right type number or NEW: name)
- exact elements and layout, text strings, fonts (thin sans / wide display / script / bold sans), sizes
- motion frame by frame: what enters/exits on which frame, eases, camera moves, holds; note steps (12 fps)
- transition in / out
- WRONG or VAGUE in the catalogue entry: list concrete corrections, or 'none'
- NEW detail worth adding to the catalogue (variant, numbers), or 'none'
End with a JSON line: {{"shots": [{{"shot": n, "type": <number or "NEW: name">, "corrections": "...", "additions": "..."}}]}}"""

def frames(v, a, b, d):
    subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", str(v), "-vf", "fps=12,scale=300:-2", "-q:v", "5", str(Path(d) / "f%04d.jpg")], check=True)
    return [(a + i / 12, p) for i, p in enumerate(sorted(Path(d).glob("f*.jpg")))]

for nick, rid in REELS.items():
    base = ROOT / "fuentes/f1motion/reels" / rid; v = base / "reel.mp4"
    rows = [r for r in json.loads((base / "coverage.json").read_text(encoding="utf-8")) if r["kind"] == "graphics"]
    od = base / "framelevel"; od.mkdir(exist_ok=True)
    # group consecutive graphics shots into windows of <= 7 s (<= 84 frames)
    groups, cur = [], []
    for r in rows:
        if cur and (r["shot"] != cur[-1]["shot"] + 1 or r["end"] - cur[0]["start"] > 7.0):
            groups.append(cur); cur = []
        cur.append(r)
    if cur: groups.append(cur)
    allj = []
    for g in groups:
        out = od / f"g_{g[0]['shot']:03d}.md"
        if not out.exists():
            with tempfile.TemporaryDirectory() as d:
                content = []
                for t, p in frames(v, g[0]["start"], g[-1]["end"], d):
                    sh = next((r["shot"] for r in g if r["start"] <= t < r["end"]), g[-1]["shot"])
                    content += [{"type": "text", "text": f"[{t:.2f}s shot {sh}]"},
                                {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": base64.b64encode(p.read_bytes()).decode()}}]
            types = sorted({r["type"] for r in g if isinstance(r["type"], int)})
            ent = "\n\n".join(ENTRIES.get(t, "")[:2500] for t in types) or "(none)"
            shots = "; ".join(f"shot {r['shot']} {r['start']:.2f}-{r['end']:.2f}s type {r['type']} ({r['note']})" for r in g)
            content.append({"type": "text", "text": P.format(n=len(g), shots=shots, entries=ent)})
            for _ in range(3):
                try:
                    with client.messages.stream(model="claude-sonnet-5-5", max_tokens=16000, messages=[{"role": "user", "content": content}]) as s:
                        r = s.get_final_message()
                    out.write_text("".join(x.text for x in r.content if x.type == "text"), encoding="utf-8"); break
                except Exception as e:
                    print("retry", e, flush=True)
            print(nick, g[0]["shot"], "->", g[-1]["shot"], flush=True)
        t = out.read_text(encoding="utf-8")
        try:
            allj += json.loads(t[t.rindex('{"shots"'):].strip().splitlines()[0])["shots"]
        except Exception:
            pass
    (base / "framelevel.json").write_text(json.dumps(allj, indent=1, ensure_ascii=False), encoding="utf-8")
    print("FIN", nick, len(groups), len(allj), flush=True)
