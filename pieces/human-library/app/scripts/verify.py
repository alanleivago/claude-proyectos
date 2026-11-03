# Look verifier (the template's step 9 "Opus max verifier", run through the API credits per the project CLAUDE.md):
# sends 1-3 side-by-side sheets (row 1 ours, row 2 reference frames) and gets back scores per area out of 10 plus a
# numbered fix list with frame numbers, <= 200 words. Writes <out>.md and prints it.
# usage: python -I scripts/verify.py out.md sheet1.jpg [sheet2.jpg sheet3.jpg] [--frames "a,b,c | d,e,f"]
import base64, io, sys
from pathlib import Path
import anthropic
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]  # repo root (.env with ANTHROPIC_API_KEY)
key = next((l.split("=", 1)[1].strip().strip('"') for l in (ROOT / ".env").read_text(encoding="utf-8").splitlines() if l.startswith("ANTHROPIC_API_KEY=")), None)
args = sys.argv[1:]
out, frames = Path(args[0]), ""
if "--frames" in args:
    i = args.index("--frames"); frames = args[i + 1]; args = args[:i] + args[i + 2:]
sheets = args[1:]

def img(p):
    im = Image.open(p).convert("RGB")
    im.thumbnail((2400, 1600))
    b = io.BytesIO(); im.save(b, "JPEG", quality=85)
    return {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": base64.b64encode(b.getvalue()).decode()}}

BRIEF = f"""You are the look verifier for a vertical cartoon short in the "2D bean-head characters in a colourful 3D toon world" style.
Each sheet: TOP row = our frames, BOTTOM row = reference frames of the target style. Our frame numbers (30 fps), sheet by sheet: {frames or "in order"}.
Measured targets: world ink ~3 px near-black on silhouettes/creases; day median luma ~.57, no crushed blacks, lit chroma rich but not neon;
fog = horizon colour; lens blur on close-ups/medium shots only, focus on the eyes, wides sharp; characters ~3.5 head-heights, plum ink,
stick limbs, faces bright; every shot readable at phone size; subjects not cut by the frame edge; text cards readable.
One-word white subtitles are intentional (ignore them). Score out of 10: colour, lighting, ink, textures, characters, depth, composition.
Then a numbered fix list (most important first), each with the frame number and a concrete change. 200 words max, no preamble."""

client = anthropic.Anthropic(api_key=key)
content = [img(s) for s in sheets] + [{"type": "text", "text": BRIEF}]
with client.messages.stream(model="claude-opus-5-5", max_tokens=16000, messages=[{"role": "user", "content": content}]) as st:
    msg = st.get_final_message()
text = "\n".join(b.text for b in msg.content if b.type == "text").strip()
out.write_text(text + "\n", encoding="utf-8")
print(text)
