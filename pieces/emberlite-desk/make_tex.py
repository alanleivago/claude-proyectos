"""Procedural PS2-era textures for the emberlite desk scene. Low-res on purpose."""
import random, math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tex")
os.makedirs(OUT, exist_ok=True)
F = r"C:\Windows\Fonts"
def font(name, size): return ImageFont.truetype(os.path.join(F, name), size)
R = random.Random(7)
ICON_COLS = [(230, 60, 40), (40, 120, 230), (250, 200, 40), (60, 180, 70), (240, 240, 240),
             (160, 80, 200), (250, 130, 30), (30, 200, 210), (200, 30, 120)]


def sky_sea(w, h):
    im = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(im)
    hz = int(h * 0.58)
    for y in range(hz):
        t = y / hz
        d.line([(0, y), (w, y)], fill=(int(40 + 120 * t), int(120 + 100 * t), int(230 + 20 * t)))
    for y in range(hz, h):
        t = (y - hz) / (h - hz)
        d.line([(0, y), (w, y)], fill=(int(30 + 40 * t), int(200 - 30 * t), int(210 - 20 * t)))
    for _ in range(9):  # clouds
        cx, cy = R.randint(0, w), R.randint(20, hz - 60)
        for _ in range(7):
            r = R.randint(18, 40)
            ox, oy = R.randint(-50, 50), R.randint(-12, 12)
            d.ellipse([cx + ox - r, cy + oy - r * 0.6, cx + ox + r, cy + oy + r * 0.6], fill=(250, 250, 255))
    im = im.filter(ImageFilter.GaussianBlur(1.2))
    d = ImageDraw.Draw(im)
    ix, iy = int(w * 0.7), hz + 30  # islet + palm
    d.ellipse([ix - 70, iy - 10, ix + 70, iy + 14], fill=(240, 225, 170))
    d.line([(ix, iy), (ix - 12, iy - 90)], fill=(110, 80, 40), width=6)
    for a in range(0, 360, 50):
        x2 = ix - 12 + 55 * math.cos(math.radians(a))
        y2 = iy - 90 + 22 * math.sin(math.radians(a)) + 12
        d.line([(ix - 12, iy - 90), (x2, y2)], fill=(30, 120, 40), width=7)
    return im


def taskbar(im):
    w, h = im.size
    d = ImageDraw.Draw(im)
    d.rectangle([0, h - 30, w, h], fill=(36, 94, 220))
    d.line([(0, h - 30), (w, h - 30)], fill=(90, 150, 250), width=2)
    d.rounded_rectangle([0, h - 30, 95, h], 10, fill=(60, 160, 60))
    d.text((22, h - 25), "start", font=font("trebucbi.ttf", 18), fill="white")
    d.rectangle([w - 90, h - 30, w, h], fill=(20, 130, 230))
    d.text((w - 62, h - 23), "1:47 AM", font=font("tahoma.ttf", 12), fill="white")


def icons(im, cols, rows, x0=8, y0=8, dx=56, dy=58):
    d = ImageDraw.Draw(im)
    f = font("tahoma.ttf", 9)
    for c in range(cols):
        for r in range(rows):
            if R.random() < 0.12: continue
            x, y = x0 + c * dx, y0 + r * dy
            col = R.choice(ICON_COLS)
            d.rectangle([x + 14, y, x + 40, y + 26], fill=col, outline=(20, 20, 20))
            d.rectangle([x + 18, y + 4, x + 30, y + 12], fill=tuple(min(255, v + 70) for v in col))
            d.rectangle([x + 2, y + 30, x + 52, y + 42], fill=(20, 60, 160))
            d.text((x + 4, y + 30), R.choice(["Kazaa", "LimeWire", "My Pics", "Doom 3", "AIM", "song.mp3",
                                              "WinAmp", "New Fld", "pics(2)", "Halo", "homework", "RuneSc"]), font=f, fill="white")


def window(im, box, title, body_fn):
    d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = box
    d.rectangle(box, fill=(236, 233, 216), outline=(0, 60, 200), width=3)
    d.rectangle([x0, y0, x1, y0 + 22], fill=(0, 84, 227))
    d.text((x0 + 6, y0 + 4), title, font=font("tahomabd.ttf", 12), fill="white")
    d.rectangle([x1 - 20, y0 + 3, x1 - 4, y0 + 19], fill=(225, 80, 50), outline="white")
    body_fn(d, (x0 + 4, y0 + 26, x1 - 4, y1 - 4))


def desktop():
    im = sky_sea(640, 480)
    icons(im, 6, 7)
    def buddy(d, b):
        d.rectangle(b, fill="white")
        x0, y0, x1, y1 = b
        d.rectangle([x0, y0, x1, y0 + 70], fill=(255, 210, 0))
        d.ellipse([x0 + 40, y0 + 8, x0 + 56, y0 + 24], fill="black")
        d.line([(x0 + 48, y0 + 24), (x0 + 42, y0 + 50), (x0 + 34, y0 + 64)], fill="black", width=5)
        d.line([(x0 + 42, y0 + 50), (x0 + 56, y0 + 64)], fill="black", width=5)
        f = font("tahoma.ttf", 11)
        for i, n in enumerate(["Buddies (4/19)", "  xXsk8rXx", "  sparkle_gurl", "  dan0k", "Family (1/3)", "Co-Workers"]):
            d.text((x0 + 4, y0 + 78 + i * 16), n, font=f, fill=(0, 0, 140) if n.startswith(" ") else "black")
    window(im, (470, 150, 600, 400), "Buddy List", buddy)
    taskbar(im)
    return im


def browser():
    im = desktop()
    def page(d, b):
        x0, y0, x1, y1 = b
        d.rectangle(b, fill="white")
        d.rectangle([x0, y0, x1, y0 + 18], fill=(245, 245, 240))
        d.rectangle([x0 + 40, y0 + 3, x1 - 10, y0 + 15], fill="white", outline=(120, 120, 120))
        d.text((x0 + 44, y0 + 3), "http://www.miniplay.com/games", font=font("tahoma.ttf", 10), fill="black")
        d.rectangle([x0, y0 + 20, x1, y0 + 56], fill=(250, 180, 30))
        d.text((x0 + 10, y0 + 24), "MINIPLAY", font=font("impact.ttf", 26), fill=(200, 20, 20))
        boxes = [(30, 120, 220), (230, 90, 40), (60, 170, 60), (240, 200, 40), (150, 60, 200), (40, 190, 210)]
        for i, c in enumerate(boxes):
            bx, by = x0 + 10 + (i % 3) * 120, y0 + 66 + (i // 3) * 110
            d.rectangle([bx, by, bx + 110, by + 96], fill=c, outline="black", width=2)
            d.rectangle([bx + 8, by + 8, bx + 102, by + 60], fill=tuple(min(255, v + 60) for v in c))
            d.text((bx + 8, by + 68), ["CLUB PENGWIN", "BLOONS", "TANKS", "GOLD MINER", "SNOWBALL", "BMX"][i],
                   font=font("arialbd.ttf", 11), fill="white")
    window(im, (150, 50, 540, 440), "Miniplay - Free Online Games - Microsoft Internet Explorer", page)
    taskbar(im)
    return im


def boot():
    im = Image.new("RGB", (640, 480), (90, 126, 220))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 640, 60], fill=(0, 48, 160))
    d.rectangle([0, 420, 640, 480], fill=(0, 48, 160))
    d.line([(0, 61), (640, 61)], fill=(230, 140, 60), width=3)
    cx, cy = 280, 210  # four-color flag
    for (ox, oy, c) in [(0, 0, (240, 80, 30)), (24, 0, (100, 190, 40)), (0, 24, (30, 140, 240)), (24, 24, (250, 200, 0))]:
        d.rectangle([cx + ox, cy + oy, cx + ox + 21, cy + oy + 21], fill=c)
    d.text((330, 208), "Emberlite", font=font("trebucbd.ttf", 30), fill="white")
    d.text((500, 205), "xp", font=font("trebucbi.ttf", 16), fill=(250, 130, 40))
    d.text((300, 262), "you can never go back...", font=font("tahoma.ttf", 15), fill="white")
    return im


def cd_spines(n=34, w=256, h=512):
    im = Image.new("RGB", (w, h), (20, 20, 25))
    d = ImageDraw.Draw(im)
    sh = h / n
    f = font("arialbd.ttf", 9)
    for i in range(n):
        y = int(i * sh)
        c = (R.randint(20, 255), R.randint(20, 220), R.randint(40, 255))
        d.rectangle([0, y, w, y + sh - 2], fill=c)
        d.rectangle([0, y, 30, y + sh - 2], fill=tuple(v // 2 for v in c))
        d.text((40, y + 2), R.choice(["NOW 14", "Blink-182", "Linkin Park", "Gorillaz", "Green Day", "Eminem", "Mix 2003",
                                      "Usher", "Daft Punk", "No Doubt", "Outkast", "Weezer", "Burned CD #7"]),
               font=f, fill=(255, 255, 255) if sum(c) < 400 else (0, 0, 0))
    return im


def game_spines():
    im = Image.new("RGB", (256, 512), (15, 15, 20))
    d = ImageDraw.Draw(im)
    titles = [("STARCRAFT", (30, 60, 120)), ("WARCRAFT III", (70, 40, 20)), ("BROOD WAR", (20, 70, 40)),
              ("INSURRECTION", (15, 15, 15)), ("DIABLO II", (110, 20, 20))]
    bw = 256 // len(titles)
    for i, (t, c) in enumerate(titles):
        x = i * bw
        d.rectangle([x, 0, x + bw - 3, 512], fill=c)
        d.rectangle([x + 4, 420, x + bw - 7, 500], fill=tuple(min(255, v + 80) for v in c))
        tx = Image.new("RGBA", (400, bw - 8), (0, 0, 0, 0))
        ImageDraw.Draw(tx).text((6, 8), t, font=font("timesbd.ttf", 30), fill=(230, 230, 200))
        im.paste(tx.rotate(90, expand=True), (x + 2, 20), tx.rotate(90, expand=True))
    return im


def poster():
    im = Image.new("RGB", (512, 384), (5, 5, 5))
    d = ImageDraw.Draw(im)
    for y in range(40, 250):  # sunset landscape
        t = (y - 40) / 210
        d.line([(30, y), (482, y)], fill=(int(60 + 190 * t), int(60 + 90 * t), int(170 - 120 * t)))
    for x in range(30, 482, 6):
        hgt = 40 + 30 * math.sin(x / 40) + R.randint(0, 8)
        d.rectangle([x, 250 - hgt, x + 6, 250], fill=(20, 40, 30))
    d.text((256, 296), "EXCELLENCE", font=font("times.ttf", 52), fill=(200, 170, 120), anchor="mm")
    d.text((256, 340), "THE PURSUIT OF EXCELLENCE IS NEVER FINISHED", font=font("times.ttf", 13), fill=(200, 200, 200), anchor="mm")
    return im


def game_box():  # the life-sim box lying on the desk
    im = Image.new("RGB", (384, 512), (120, 200, 60))
    d = ImageDraw.Draw(im)
    for y in range(512):
        t = y / 512
        d.line([(0, y), (384, y)], fill=(int(140 - 60 * t), int(210 - 40 * t), int(80 + 60 * t)))
    for i in range(7):  # little people
        x, y = 30 + i * 48, 250 + (i % 2) * 40
        c = R.choice(ICON_COLS)
        d.ellipse([x, y, x + 30, y + 30], fill=(240, 200, 160))
        d.rectangle([x - 4, y + 30, x + 34, y + 130], fill=c)
    d.text((40, 40), "The", font=font("comicbd.ttf", 34), fill="white")
    d.text((40, 70), "Sams", font=font("comicbd.ttf", 96), fill=(255, 255, 255), stroke_width=4, stroke_fill=(30, 60, 30))
    d.text((280, 70), "2", font=font("comicbd.ttf", 120), fill=(250, 220, 40), stroke_width=4, stroke_fill=(30, 60, 30))
    d.polygon([(320, 30), (345, 0), (370, 30), (345, 60)], fill=(60, 230, 60), outline=(0, 90, 0))
    d.rectangle([0, 470, 384, 512], fill=(20, 20, 20))
    d.text((12, 480), "PC CD-ROM", font=font("arialbd.ttf", 18), fill="white")
    return im


def keyboard():
    im = Image.new("RGB", (512, 192), (40, 44, 55))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 512, 28], fill=(150, 155, 170))
    for i in range(16):
        d.ellipse([60 + i * 24, 8, 72 + i * 24, 20], fill=(30, 30, 40))
    rows = [(14, 0), (14, 0), (13, 8), (12, 14), (10, 22)]
    for r, (n, off) in enumerate(rows):
        for k in range(n):
            x, y = 14 + off + k * 25, 36 + r * 28
            d.rectangle([x, y, x + 21, y + 23], fill=(205, 210, 220), outline=(90, 95, 110))
    d.rectangle([110, 36 + 5 * 28, 290, 36 + 5 * 28 + 10], fill=(205, 210, 220))
    for k in range(4):
        for r in range(4):
            x, y = 400 + k * 25, 64 + r * 28
            d.rectangle([x, y, x + 21, y + 23], fill=(205, 210, 220), outline=(90, 95, 110))
    return im


def sticky():
    im = Image.new("RGB", (128, 128), (250, 245, 170))
    d = ImageDraw.Draw(im)
    d.text((64, 44), "DO NOT", font=font("comicbd.ttf", 22), fill=(20, 20, 60), anchor="mm")
    d.text((64, 78), "TURN OFF!", font=font("comicbd.ttf", 19), fill=(20, 20, 60), anchor="mm")
    return im


def ipod_screen():
    im = Image.new("RGB", (128, 96), (170, 200, 150))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 128, 14], fill=(140, 170, 130))
    d.text((4, 1), "Now Playing", font=font("tahoma.ttf", 10), fill="black")
    d.ellipse([46, 26, 82, 62], outline="black", width=4)
    d.line([(52, 56), (76, 32)], fill="black", width=4)
    d.text((64, 78), "Do not disconnect.", font=font("tahoma.ttf", 9), fill="black", anchor="mm")
    return im


def phone_screen():
    im = Image.new("RGB", (64, 32), (120, 220, 90))
    ImageDraw.Draw(im).text((4, 8), "01:47", font=font("arialbd.ttf", 14), fill=(20, 50, 20))
    return im


def city():
    im = Image.new("RGB", (1024, 512))
    d = ImageDraw.Draw(im)
    for y in range(512):
        t = y / 512
        d.line([(0, y), (1024, y)], fill=(int(20 + 120 * t ** 3), int(15 + 40 * t ** 2), int(60 + 60 * t)))
    for _ in range(140):
        x, y = R.randint(0, 1024), R.randint(0, 250)
        d.point((x, y), fill=(220, 220, 255))
    x = 0
    while x < 1024:
        bw, bh = R.randint(40, 110), R.randint(120, 380)
        shade = R.randint(10, 30)
        d.rectangle([x, 512 - bh, x + bw, 512], fill=(shade, shade, shade + 18))
        for wy in range(512 - bh + 8, 512, 12):
            for wx in range(x + 5, x + bw - 6, 9):
                if R.random() < 0.35:
                    d.rectangle([wx, wy, wx + 4, wy + 5], fill=R.choice([(255, 220, 140), (255, 240, 200), (180, 210, 255)]))
        x += bw + R.randint(0, 6)
    return im


def wood():
    im = Image.new("RGB", (512, 512))
    d = ImageDraw.Draw(im)
    for y in range(512):
        v = 0.5 + 0.25 * math.sin(y * 0.35 + 3 * math.sin(y * 0.05)) + R.uniform(-0.12, 0.12)
        d.line([(0, y), (512, y)], fill=(int(70 + 60 * v), int(60 + 50 * v), int(55 + 40 * v)))
    for _ in range(60):  # grain streaks
        y = R.randint(0, 512)
        x = R.randint(0, 400)
        d.line([(x, y), (x + R.randint(60, 200), y + R.randint(-2, 2))], fill=(50, 42, 38), width=1)
    return im.filter(ImageFilter.GaussianBlur(0.6))


for name, fn in [("wood", wood), ("desktop", desktop), ("browser", browser), ("boot", boot), ("cd_spines", cd_spines),
                 ("game_spines", game_spines), ("poster", poster), ("game_box", game_box), ("keyboard", keyboard),
                 ("sticky", sticky), ("ipod_screen", ipod_screen), ("phone_screen", phone_screen), ("city", city)]:
    fn().save(os.path.join(OUT, name + ".png"))
print("ok")
