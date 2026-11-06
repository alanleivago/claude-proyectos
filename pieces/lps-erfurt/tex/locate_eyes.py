"""venv: eye centres of every tex/flow/face_*.jpg via the Claude API (Max-plan credits) -> tex/flow/eyes.json."""
import base64, glob, json, os, re
from pathlib import Path
import anthropic
from PIL import Image

H = Path(__file__).resolve().parent
for p in [H, *H.parents]:
    if (p / ".env").exists():
        for l in open(p / ".env"):
            if l.startswith("ANTHROPIC_API_KEY="):
                os.environ["ANTHROPIC_API_KEY"] = l.split("=", 1)[1].strip().strip('"')
        break
cl = anthropic.Anthropic(); out = {}
for f in sorted(glob.glob(str(H / "flow" / "face_*.jpg"))):
    im = Image.open(f).convert("RGB"); w, h = im.size
    import io; buf = io.BytesIO(); im.save(buf, "PNG")                   # Flow saves webp under .jpg names
    msg = cl.messages.create(model="claude-sonnet-5-5", max_tokens=16000, messages=[{"role": "user", "content": [
        {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": base64.b64encode(buf.getvalue()).decode()}},
        {"type": "text", "text": f"This image is {w}x{h} px. Give the pixel coordinates of the centre of the pupil of the person's "
                                 "LEFT eye (the one on the image's left) and RIGHT eye. Answer only JSON: {\"l\":[x,y],\"r\":[x,y]}"}]}])
    txt = "".join(b.text for b in msg.content if b.type == "text")
    out[Path(f).stem] = json.loads(re.search(r"\{.*\}", txt, re.S).group(0)) | {"size": [w, h]}
    print(Path(f).stem, out[Path(f).stem])
json.dump(out, open(H / "flow" / "eyes.json", "w"), indent=1)
