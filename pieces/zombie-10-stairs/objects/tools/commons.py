# Google Images no responde sin navegador (pagina de bloqueo) y Bing da basura a los bots: fotos de Wikimedia Commons.
# python commons.py name "query" [N] -> ../photos/<name>/c_k.jpg + _sheet.jpg
import sys, os, json, urllib.request, urllib.parse
from PIL import Image, ImageDraw
name, q = sys.argv[1], sys.argv[2]; N = int(sys.argv[3]) if len(sys.argv) > 3 else 16
UA = {"User-Agent": "AvaRestfieldBot/1.0 (alanleivago research)"}
api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "format": "json", "generator": "search", "gsrsearch": "filetype:bitmap " + q, "gsrnamespace": 6, "gsrlimit": N, "prop": "imageinfo", "iiprop": "url", "iiurlwidth": 1024})
d = json.load(urllib.request.urlopen(urllib.request.Request(api, headers=UA), timeout=30))
pages = sorted(d.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "photos", name); os.makedirs(out, exist_ok=True)
got = []
for p in pages:
    try:
        u = p["imageinfo"][0]["thumburl"]; f = f"{out}/c_{len(got)}.jpg"
        open(f + ".tmp", "wb").write(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=20).read())
        Image.open(f + ".tmp").convert("RGB").save(f, quality=92); os.remove(f + ".tmp"); got.append((f, p["title"]))
    except Exception as e: print("x", e)
open(f"{out}/urls.txt", "a", encoding="utf8").write("\n".join(f"{os.path.basename(a)} {b}" for a, b in got) + "\n")
S = 200; cols = 4; rows = max(1, (len(got) + cols - 1) // cols)
sh = Image.new("RGB", (S * cols, (S + 14) * rows), (20, 20, 20)); dr = ImageDraw.Draw(sh)
for i, (f, _) in enumerate(got):
    im = Image.open(f); im.thumbnail((S, S)); x, y = (i % cols) * S, (i // cols) * (S + 14); sh.paste(im, (x, y + 14)); dr.text((x + 3, y), str(i), fill=(255, 255, 0))
sh.save(f"{out}/_sheet.jpg"); print(name, len(got))
