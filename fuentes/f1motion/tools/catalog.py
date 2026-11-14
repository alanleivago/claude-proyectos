"""Catalogue every motion-graphic scene type across the 4 extra reels (+ the first) with the API (credits).
Writes fuentes/f1motion/reels/CATALOGO_api.md and catalog_frames.json (representative timestamps per scene type)."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from analyze_reel import key
import anthropic
R = Path(r"f:\Claude Proyectos\fuentes\f1motion")
txt = ""
for d in sorted((R / "reels").iterdir()):
    if not (d / "analysis").exists(): continue
    txt += f"\n\n######## REEL {d.name} ########\n"
    for p in sorted((d / "analysis").glob("w_*.md")):
        txt += f"\n=== {d.name} window {p.stem} ===\n" + p.read_text(encoding="utf-8")
known = (R / "ref/SPEC_api.md").read_text(encoding="utf-8")
P = """Above: shot-by-shot breakdowns of 4 vertical explainer reels (same style family) plus the style spec of a first reel we already replicated (SPEC section).
Build a CATALOGUE of EVERY distinct motion-graphic scene type that appears across the 4 reels (merge duplicates; include the types already known from the first reel only if they reappear, and mark them 'known').
Reply with TWO parts.

PART 1 — markdown (English), heading '## Scene types', then one '### N. <short name>' per type with these bullets (numbers everywhere, terse):
- Seen in: reel id + timestamps (s)
- What it shows / when it is used (trigger in speech)
- Layout (positions in % or px at 1080x1920, sizes, safe zone)
- Colors (hex) and type (role, font style, size px, case)
- Motion: entry / hold / exit with durations (frames at 24 fps; graphics step on twos = 12 fps), eases, camera moves
- Transition in/out
- SFX per event (pop, whoosh, sub drop, glockenspiel/celesta note, click, swell...)
- B-roll treatment if any
- Re-theme for Stimulus (soccer / custom jerseys) and for any other topic
- Build: which assets need generated art (Google Flow: vehicles, objects, characters, emoji hands) vs code (type, tabs, pills, grids, lines, pixel mosaics)
After the types add '## Cross-cutting rules' (rhythm, transitions mix, fonts, colors, SFX/music habits) and '## New building blocks' (reusable components worth coding once).

PART 2 — after a line containing only ===JSON===, a JSON array: [{"type": "<short name>", "reel": "<id>", "t": <seconds of the most representative frame>}] with 1-2 entries per type.
"""
c = anthropic.Anthropic(api_key=key())
with c.messages.stream(model="claude-sonnet-5-5", max_tokens=32000,
                       messages=[{"role": "user", "content": txt + "\n\n######## SPEC (first reel) ########\n" + known + "\n\n" + P}]) as s:
    r = s.get_final_message()
out = "".join(b.text for b in r.content if b.type == "text")
md, _, js = out.partition("===JSON===")
(R / "reels/CATALOGO_api.md").write_text(md.strip(), encoding="utf-8")
js = js[js.index("["): js.rindex("]") + 1]
(R / "reels/catalog_frames.json").write_text(js, encoding="utf-8")
print(r.usage.input_tokens, r.usage.output_tokens, len(json.loads(js)))
