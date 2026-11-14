# qc_sheets.py VIDEO OUTDIR [fps] -> hojas de control (8x6 cuadros a 5 fps) de los planos nuevos/cambiados del LARGO 2.
import json, os, sys, subprocess, glob
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); E = os.path.join(H, "..", "engine")
VID, OUT = sys.argv[1], sys.argv[2]; FPS = float(sys.argv[3]) if len(sys.argv) > 3 else 5
os.makedirs(OUT, exist_ok=True)
cuts = json.load(open(f"{H}/cuts.json")); C = cuts["cuts"]; END = {k: (C[i + 1][1] if i + 1 < len(C) else cuts["dur"]) for i, (k, _) in enumerate(C)}
SET = {s[0]: s[1] for s in json.load(open(f"{E}/shots.json", encoding="utf8"))}
EXTRA = {"07_lit_lobby", "08_lighthouse", "09_count80", "16_dark", "17_turnaway", "91_sunset", "92_lights_on", "95_stopped", "04_dawn_knock", "06_whatsleft", "11_cross"}
ids = [k for k, _ in C if SET.get(k) == "p2new" or k in EXTRA]
F = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 13)
frames = []
for k in ids:
    t0, t1 = dict(C)[k], END[k]; d = f"{OUT}/f_{k}"; os.makedirs(d, exist_ok=True)
    if not glob.glob(f"{d}/*.jpg"):
        subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t0 + 0.05:.3f}", "-t", f"{t1 - t0 - 0.1:.3f}", "-i", VID, "-vf", f"fps={FPS},scale=240:135", "-q:v", "4", f"{d}/%04d.jpg"])
    for i, f in enumerate(sorted(glob.glob(f"{d}/*.jpg"))): frames.append((k, t0 + 0.05 + i / FPS, f))
COLS, ROWS, W, Hh = 8, 6, 240, 135
for p in range(0, len(frames), COLS * ROWS):
    pg = frames[p:p + COLS * ROWS]; sh = Image.new("RGB", (COLS * W, ROWS * (Hh + 16)), (16, 16, 16)); d = ImageDraw.Draw(sh)
    for j, (k, t, f) in enumerate(pg):
        x, y = (j % COLS) * W, (j // COLS) * (Hh + 16); sh.paste(Image.open(f), (x, y + 16)); d.text((x + 3, y + 1), f"{k[:16]} {t:.1f}", font=F, fill=(255, 230, 90))
    sh.save(f"{OUT}/qc_{p // (COLS * ROWS) + 1:02d}.jpg", quality=85)
print(len(frames), "frames", (len(frames) + 47) // 48, "sheets")
