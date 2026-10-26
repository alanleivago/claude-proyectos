"""Photo-style textures for the sina-test scenes via the Flow CLI -> tex/<name>.jpg (skips existing)."""
import subprocess, os, shutil

CLI_DIR = r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP"
OUT = r"F:\Claude Proyectos\pieces\sina-test\tex"
FLAT = ", flat orthographic texture, evenly lit, fills the whole frame, texture for a low poly PlayStation 1 game"
KEY = ", single object centered and fully visible, isolated on a pure flat bright green #00FF00 background, no shadow"
T = {
    "wallpaper": ("Vintage pale green wallpaper with thin darker green vertical stripes and small vine pattern" + FLAT, "1:1"),
    "floor": ("Light brown wooden floorboards, top-down" + FLAT, "1:1"),
    "sofa": ("Pink floral upholstery fabric with faded roses pattern" + FLAT, "1:1"),
    "window": ("White wooden double window with frosted glass panes, bright winter daylight, front view" + FLAT, "3:4"),
    "curtain": ("Dark pink velvet curtain fabric with vertical folds" + FLAT, "9:16"),
    "roof": ("Dark brown asphalt roof shingles" + FLAT, "1:1"),
    "siding": ("Light grey painted horizontal wooden siding boards" + FLAT, "1:1"),
    "soil": ("Cross-section of reddish brown soil with small stones and pebbles" + FLAT, "1:1"),
    "gravel": ("Dark grey brown gravel and dirt ground" + FLAT, "1:1"),
    "snow": ("Fresh white snow surface with soft bumps" + FLAT, "1:1"),
    "bedroom": ("Front view of a small bedroom wall: light blue walls, white window with curtains, a wooden bed with blue blanket, cosy" + FLAT, "4:3"),
    "basement": ("Grey blue concrete basement wall" + FLAT, "1:1"),
    "attic": ("Dark old wooden planks of an attic wall, vertical boards" + FLAT, "1:1"),
    "fence": ("Weathered grey wooden plank" + FLAT, "1:1"),
    "pine1": ("A tall snowy pine tree" + KEY, "9:16"),
    "pine2": ("A dark green fir tree with snow on its branches" + KEY, "9:16"),
    "bare": ("A bare leafless winter tree with thin branches" + KEY, "9:16"),
    "vest": ("Front of a fluorescent yellow-green high visibility safety vest with two silver reflective stripes and a zipper" + FLAT, "3:4"),
    "pants": ("Khaki beige work cargo pants fabric with a cargo pocket and stitching" + FLAT, "3:4"),
    "face": ("Front view of the face of a cute anime girl for a low poly game character texture: big dark eyes, small mouth, light skin, soft blush, no hair covering the eyes, flat cel shading" + FLAT, "1:1"),
    "hair": ("Brown anime hair texture with chunky strands" + FLAT, "1:1"),
}

os.makedirs(OUT, exist_ok=True)
for name, (prompt, aspect) in T.items():
    dst = os.path.join(OUT, name + ".jpg")
    if os.path.exists(dst):
        continue
    r = subprocess.run(["node", "src/cli.js", prompt, "--aspect", aspect, "--out", OUT],
                       cwd=CLI_DIR, capture_output=True, text=True, encoding="utf-8")
    path = (r.stdout.strip().splitlines() or [""])[-1].strip()
    if r.returncode or not os.path.exists(path):
        print("FAIL", name, (r.stderr or r.stdout)[-200:], flush=True)
        continue
    shutil.move(path, dst)
    print("ok", name, flush=True)
