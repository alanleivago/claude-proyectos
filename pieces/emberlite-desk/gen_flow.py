"""Generate the photo-style textures with the Flow CLI; saves each as tex/flow/<name>.jpg. Skips existing ones."""
import subprocess, os, shutil, sys

CLI_DIR = r"F:\Claude Proyectos\tools\srzGoogleFlowMCP\srzGoogleFlowMCP"
OUT = r"F:\Claude Proyectos\pieces\emberlite-desk\tex\flow"
FLAT = ", orthographic straight-on view, evenly lit, flat game texture from a 2003 PC video game, fills the whole frame, no background"
T = {
    "wall": ("Seamless texture of painted drywall, slightly dirty pale grey-blue paint, faint stains and scuffs" + FLAT, "1:1"),
    "carpet": ("Close-up surface of a dark blue rug material with small speckles, top-down" + FLAT, "1:1"),
    "plastic": ("Seamless texture of light grey matte computer case plastic, slightly scuffed and dusty" + FLAT, "1:1"),
    "pc_front": ("Front panel of a 2004 silver and black desktop tower computer: two CD-ROM drive bays at the top, a floppy drive, round power button, two USB ports, small speaker grille" + FLAT, "9:16"),
    "keyboard": ("Top-down view of a 2003 black and silver multimedia PC keyboard with a row of extra media buttons above the keys, full layout with numpad, light grey keycaps" + FLAT, "16:9"),
    "phone": ("Front of a dark blue cordless home phone handset: small green backlit LCD near the top, number keypad, speaker holes" + FLAT, "9:16"),
    "ipod": ("Front of a blue aluminium iPod mini: small grey LCD screen at the top, light grey click wheel below" + FLAT, "9:16"),
    "cd_spines": ("A tall stack of about 30 music CD jewel cases seen from the spine side, stacked horizontally, colorful 2000s album spines with tiny printed text" + FLAT, "9:16"),
    "game_spines": ("Five big-box PC strategy and fantasy games from 2002 standing side by side, showing their tall spines with vertical titles and logos" + FLAT, "1:1"),
    "game_box": ("Front cover of a 2004 PC life simulation game box titled 'The Sams 2', group of smiling cartoon-realistic characters, green diamond floating above, PC CD-ROM strip at the bottom" + FLAT, "3:4"),
    "poster": ("Motivational office poster with thick black border: photo of a mountain lake at sunset, below it the serif word 'EXCELLENCE' and a small slogan line" + FLAT, "4:3"),
    "desktop": ("Screenshot of a cluttered Windows XP desktop from 2004: tropical beach wallpaper with a palm tree islet and turquoise water, dozens of small program icons in columns on the left, an AIM-style buddy list window on the right, blue taskbar with green start button, no monitor frame, fills the frame", "4:3"),
    "browser": ("Screenshot of a Windows XP desktop from 2004 with an Internet Explorer window open showing a colorful kids online games portal with a cartoon penguin game banner and game thumbnails, desktop icons on the left, blue taskbar, no monitor frame, fills the frame", "4:3"),
    "city": ("Night city skyline seen from an apartment window, many lit office windows, deep blue and purple sky with a few stars, a street lamp" + FLAT, "16:9"),
    "chair_fabric": ("Close-up surface of dark blue woven upholstery cloth pattern" + FLAT, "1:1"),
    "mouse": ("Top-down view of a black and silver optical computer mouse from 2004 with scroll wheel" + FLAT, "9:16"),
    "monitor_bezel": ("Front view of a silver 17 inch LCD monitor from 2004, plain black screen area, small logo and buttons on the bottom bezel" + FLAT, "4:3"),
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
        print("FAIL", name, (r.stderr or r.stdout)[-300:], flush=True)
        continue
    shutil.move(path, dst)
    print("ok", name, flush=True)
