"""Merge the 12 fps frame-level findings (all 102 graphics shots) into per-type corrections/additions for CATALOGO.md."""
import re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from analyze_reel import key
import anthropic
ROOT = Path(r"f:\Claude Proyectos")
NICK = {"DfNzJyXtRpJ": "KIMI", "Deje_IEhM8c": "CHG", "DdyxpSRBWIT": "MUSE", "Dc_K1gSx5id": "BTS"}
txt = ""
for rid, n in NICK.items():
    for p in sorted((ROOT / "fuentes/f1motion/reels" / rid / "framelevel").glob("g_*.md")):
        txt += f"\n\n#### {n} {p.stem}\n" + p.read_text(encoding="utf-8")
cat = (ROOT / "styles/f1motion/CATALOGO.md").read_text(encoding="utf-8")
types = "\n".join(f"{a}. {b}" for a, b in re.findall(r"^### (\d+)\. (.+)$", cat, re.M))
P = f"""Above: 12 fps frame-level analyses of every motion-graphics shot (102 shots) of 4 reels (KIMI, CHG, MUSE, BTS), each checked against a catalogue of scene types:
{types}
Write a markdown section '## Frame-level corrections and additions (12 fps, all graphics shots)' in English.
For each catalogue type that appears: '### <N>. <name>', then bullets:
- Shots: reel + shot numbers
- Corrections: what the catalogue entry got wrong or vague, now with exact numbers (frames, px, %, hex, eases)
- Additions / variants: new variants with numbers (name each variant)
Then '### New variants worth their own type' (only if truly distinct; give numbers), and '### Motion constants confirmed' (frame counts for pops, slides, cascades, holds, camera moves; all on twos).
Terse, numbers everywhere, no intro."""
c = anthropic.Anthropic(api_key=key())
with c.messages.stream(model="claude-sonnet-5-5", max_tokens=32000, messages=[{"role": "user", "content": txt + "\n\n" + P}]) as s:
    r = s.get_final_message()
(ROOT / "fuentes/f1motion/reels/FRAMELEVEL_api.md").write_text("".join(b.text for b in r.content if b.type == "text"), encoding="utf-8")
print(r.usage.input_tokens, r.usage.output_tokens, r.stop_reason)
