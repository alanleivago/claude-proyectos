"""API vision helper (Max-plan API credits, key from the repo .env; never printed).
    .venv/bin/python styles/zawdog/humans/ownerf/tools/ask.py --prompt prompt.txt --out out.md [--max 1568] img1 [img2 ...]
Images are downscaled to --max px on the long side and sent in order, each preceded by its file name."""
import argparse, base64, io, sys
from pathlib import Path
import anthropic
from PIL import Image

MODEL = "claude-sonnet-5-5"


def key():
    for folder in [Path.cwd(), *Path.cwd().parents, Path(__file__).resolve().parents[5]]:
        env = folder / ".env"
        if env.is_file():
            for line in env.read_text(encoding="utf-8-sig").splitlines():
                k, sep, v = line.strip().partition("=")
                v = v.strip().strip('"').strip("'")
                if sep and v and k.strip() == "ANTHROPIC_API_KEY":
                    return v
    sys.exit("ANTHROPIC_API_KEY not found in any .env")


def img_block(p, mx):
    im = Image.open(p).convert("RGB")
    s = mx / max(im.size)
    if s < 1:
        im = im.resize((round(im.size[0] * s), round(im.size[1] * s)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, "JPEG", quality=90)
    return {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": base64.b64encode(b.getvalue()).decode()}}


ap = argparse.ArgumentParser()
ap.add_argument("--prompt", required=True); ap.add_argument("--out", required=True); ap.add_argument("--max", type=int, default=1568)
ap.add_argument("--model", default=MODEL); ap.add_argument("imgs", nargs="+")
a = ap.parse_args()
content = []
for p in a.imgs:
    content.append({"type": "text", "text": f"[image: {Path(p).name}]"}); content.append(img_block(p, a.max))
content.append({"type": "text", "text": Path(a.prompt).read_text()})
client = anthropic.Anthropic(api_key=key())
with client.messages.stream(model=a.model, max_tokens=32000, messages=[{"role": "user", "content": content}]) as st:
    msg = st.get_final_message()
txt = "\n".join(b.text for b in msg.content if b.type == "text")
Path(a.out).write_text(txt)
print(f"{a.out}: {len(txt)} chars, in={msg.usage.input_tokens} out={msg.usage.output_tokens}")
