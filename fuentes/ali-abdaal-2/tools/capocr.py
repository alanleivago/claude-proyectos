"""OCR of the caption box across the whole ref (every 3rd frame, band y 1320-1450) via API credits -> captions_ocr.md (chunk text + first frame)"""
import base64, io, subprocess, numpy as np
from pathlib import Path
from PIL import Image, ImageDraw
import anthropic
ROOT = Path(r"F:\Claude Proyectos"); D = ROOT / "fuentes/ali-abdaal-2"
def key():
    for line in (ROOT / ".env").read_text(encoding="utf-8-sig").splitlines():
        k, s, v = line.strip().partition("=")
        if s and k.strip() == "ANTHROPIC_API_KEY": return v.strip().strip('"').strip("'")
W = 1080; BH = 130
p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(D / "reel_yt.mp4"), "-vf", f"crop=1080:{BH}:0:1320", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
crops = []; i = 0
while True:
    b = p.stdout.read(W * BH * 3)
    if len(b) < W * BH * 3: break
    if i % 3 == 0: crops.append((i, Image.fromarray(np.frombuffer(b, np.uint8).reshape(BH, W, 3)).resize((540, 65))))
    i += 1
tiles = []
for k in range(0, len(crops), 24):
    grp = crops[k:k + 24]; T = Image.new("RGB", (540, 80 * len(grp)), "black"); d = ImageDraw.Draw(T)
    for j, (f, im) in enumerate(grp): T.paste(im, (0, 80 * j + 15)); d.text((4, 80 * j + 1), f"f{f}", fill=(255, 255, 0))
    buf = io.BytesIO(); T.save(buf, "JPEG", quality=88); tiles.append(base64.b64encode(buf.getvalue()).decode())
content = []
for t in tiles: content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": t}})
content.append({"type": "text", "text": "These strips are the caption band of a vertical video, every 3rd frame, labelled with the frame number (29.97 fps). A caption is a grey translucent box with 2-5 white words (unsaid words are dimmer but still readable). Some frames have no caption, or show orange/blue chat bubbles or other graphics instead (ignore those). List EVERY distinct caption chunk in order as lines 'first_frame | last_frame | exact text (all words, including dim ones)'. Merge consecutive frames showing the same chunk. Output only the list."})
c = anthropic.Anthropic(api_key=key(), timeout=600)
with c.messages.stream(model="claude-sonnet-5-5", max_tokens=16000, messages=[{"role": "user", "content": content}]) as s:
    r = s.get_final_message()
(D / "captions_ocr.md").write_text("".join(x.text for x in r.content if x.type == "text"), encoding="utf-8"); print("ok", len(tiles))
