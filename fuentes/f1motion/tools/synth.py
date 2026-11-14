import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from analyze_reel import key, REF
import anthropic
txt = "\n\n".join(f"=== WINDOW {p.stem} ===\n" + p.read_text(encoding="utf-8") for p in sorted((REF / "analysis").glob("w_*.md")))
P = """Below is a shot-by-shot breakdown (10 windows) of a 181 s vertical Instagram reel: a female presenter explains Formula 1 with motion-graphics scenes (face cutouts on vector bodies/cars, wide futuristic display type, thin lowercase sans, teal tabs, gold pills, pixel sprites, calendar sticky notes, red scenes, UI cards).
Write a compact STYLE SPEC for a motion designer who will replicate this style for a different topic. English, markdown, numbers everywhere, max ~1800 words. Sections:
1. Rhythm stats: shot count, median/mean shot length, % talking-head vs full-graphics time, how talking-head shots are used (length, captions, framing), what each graphic scene is triggered by in speech.
2. Palette (hex) and backgrounds (white + halftone floors, gradients, red scenes): exact recipes.
3. Typography system: roles (thin lead-in, wide display, captions, labels, outline stack, script), sizes px at 1080 wide, colors, alignment, positions (y %), line spacing, reveal animations (frames, eases).
4. Ornaments: teal tabs, gold pills, chevrons, hand-drawn circles, page curls, speed lines, light beams, checkered strips — geometry and motion.
5. Face cutouts: treatments (grayscale? outline? frame shapes), where the face goes (vehicle, body, visor, polygon), motion (bob amplitude/period, rotation, squash), size % of frame.
6. Entry/exit animation vocabulary with frame counts and eases, camera moves (push-in %, zoom-out settle, pull-back), and the TRANSITION vocabulary with frequency (hard cut %, blur rack, flash cuts, whip, pixel dissolve...).
7. Reusable scene types (name each, 1-3 lines each with layout + motion), list ~12.
8. Things to avoid / what makes it look like this reel and not generic.
Only output the spec."""
c = anthropic.Anthropic(api_key=key())
with c.messages.stream(model="claude-sonnet-5-5", max_tokens=16000, messages=[{"role": "user", "content": txt + "\n\n" + P}]) as s:
    r = s.get_final_message()
(REF / "SPEC_api.md").write_text("".join(b.text for b in r.content if b.type == "text"), encoding="utf-8")
print(r.usage.input_tokens, r.usage.output_tokens)
