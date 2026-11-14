"""Synthesize the scene-type catalogue from all frame-level windows of the 4 reels + assign every shot a type (API credits)."""
import json
from pathlib import Path
import anthropic
ROOT = Path(r"F:\Claude Proyectos"); R = ROOT / "fuentes/docucollage/reels"
def key():
    for line in (ROOT / ".env").read_text(encoding="utf-8-sig").splitlines():
        k, s, v = line.strip().partition("=")
        if s and k.strip() == "ANTHROPIC_API_KEY": return v.strip().strip('"').strip("'")
NICK = {"DIV6ZPFIx3y": "GOLD", "DHt949poQGJ": "JAM", "DHgssOYoF6v": "DK", "DF0jP-vIYlk": "ARR"}
txt = ""; shots = []
for rid, n in NICK.items():
    txt += f"\n\n######## REEL {n} ({rid}) ########\n"
    for p in sorted((R / rid / "framelevel").glob("w_*.md")):
        txt += f"\n=== {n} window {p.stem} ===\n" + p.read_text(encoding="utf-8")
    for s in json.loads((R / rid / "shots.json").read_text(encoding="utf-8")):
        shots.append({"id": len(shots) + 1, "reel": n, **s})
SL = "\n".join(f'{s["id"]}. {s["reel"]} {s["start"]}-{s["end"]} [{s["kind"]}] {s["type"]}: {s["note"]}' for s in shots)
FACTS = """MEASURED FACTS (trust these over the breakdowns):
- All 4 reels are 25 fps (GOLD 608x1080, JAM 720x1280, DK 1080x1920, ARR 608x1080). Frame-difference cadence in graphics/collage shots is strictly x__x_ (a change every 3,2,3,2 frames) = motion graphics animated at 10 fps; talking-head footage is 25 fps.
- Audio: -14.3..-14.5 LUFS, LRA 1.8-2.3 LU; music bed quiet, 'inspirational corporate / tech house, vocal chop, confident and cool', no steady beat felt; SFX sparse: soft bubble pops on element pops, whip whooshes on transitions, risers/uplifters before reveals, typewriter key clicks under typed text, punchy hits on some cuts. 88-97% of cuts have an onset within 100 ms.
- Caption pill fill #FDF9ED (cream), height ~103 px, radius ~16 px, Poppins Bold ~54 px; spoken words #000, current word #3C3830, upcoming #CFCAC0; pill centre y≈1390 (72%).
- Fonts identified: condensed tracked caps = Bebas Neue (tracking ~0.2em); bold serif = Lora Bold (gold gradient + dark drop shadow, sometimes bevel); name serif = Lora Bold + italic; heavy geometric sans = Montserrat ExtraBold; typewriter = Courier Prime Bold; handwriting/marker = Gaegu Bold; captions = Poppins Bold."""
P = """Above: frame-level breakdowns (every 2nd frame) of 4 vertical Instagram reels by the same creator: psychology/self-improvement explainers, host talks to camera, editorial collage graphics (old photos, cutouts, censor bars, typed serif titles, torn paper, halftone). Then a numbered list of every shot.
Reply with TWO parts.

PART 1 - markdown in English. Heading '## Scene types', then one '### N. <short name>' per DISTINCT motion-graphic scene/element type (merge duplicates; include talking-head treatments, caption system, title systems, transitions and photo treatments as their own types when they recur). Bullets per type, numbers everywhere, terse:
- Seen in: reel nick + timestamps
- Use / trigger in speech
- Layout (px at 1080x1920 or %, z-order, safe zone)
- Colors (hex), photo treatment, type (font from the facts list, size px, tracking, case, effects such as gradient/shadow)
- Motion: entry / hold / exit with durations in frames at 25 fps AND steps at 10 fps, eases, distances, camera push %/s
- Transition in/out
- SFX per event
- Re-theme for Stimulus (custom soccer jerseys / club directors / team stores) and for any other topic
- Build: Google Flow image (objects, people, props, scenes, vintage photos) vs code (type, pills, shapes, halftone, torn edges, censor bars, marks)
After the types: '## Cross-cutting rules' (rhythm: shots/min and mean shot length per kind; share of talking-head vs graphics; transition mix with %; colour palettes per reel; title rules; SFX/music habits) and '## New building blocks' (components worth coding once).

PART 2 - after a line containing only ===JSON===, a JSON array with one object per shot of the list: {"id": n, "graphics": true|false (true if any designed motion graphics beyond the caption pill: titles, collage, photos with treatment, overlays, transitions), "type": <main type number>, "also": [other type numbers]}.
"""
c = anthropic.Anthropic(api_key=key())
with c.messages.stream(model="claude-sonnet-5-5", max_tokens=64000, messages=[{"role": "user", "content": txt + "\n\n" + FACTS + "\n\n######## SHOTS ########\n" + SL + "\n\n" + P}]) as s:
    r = s.get_final_message()
out = "".join(b.text for b in r.content if b.type == "text")
md, _, js = out.partition("===JSON===")
(R.parent / "CATALOGO_api.md").write_text(md.strip(), encoding="utf-8")
js = json.loads(js[js.index("["): js.rindex("]") + 1])
by = {j["id"]: j for j in js}
for s in shots: s.update({k: by.get(s["id"], {}).get(k) for k in ("graphics", "type", "also")})
(R.parent / "shots_all.json").write_text(json.dumps(shots, indent=1, ensure_ascii=False), encoding="utf-8")
print(r.usage.input_tokens, r.usage.output_tokens, r.stop_reason, len(js), len(shots))
