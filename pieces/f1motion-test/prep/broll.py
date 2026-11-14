"""B&W b-roll shots like the reel: 9:16 crop, grayscale, contrast, grain, static vertical line screen
(period 8 px, sine, +-10 %, measured in the reel) and a 2-frame blur-in. -> assets/broll/bN.mp4"""
import subprocess
from pathlib import Path
R = Path(__file__).resolve().parent.parent; S = R / "broll/src"; O = R / "assets/broll"
SHOTS = [  # name, source, ss, duration, crop centre x (0-1), inner vertical (pillarboxed 9:16 source)
    ("b1", "IMP8l175So.webm", 58.2, 0.67, 0.55, False),
    ("b2", "MehUc7OcEw0.webm", 69.0, 1.06, 0.50, True),
    ("b3", "jAekGHiJIsg.webm", 22.0, 0.84, 0.55, False),
    ("b4", "gKNjCYLfgxQ.webm", 14.3, 0.88, 0.30, False),
    ("b5", "GQpd5ZqL4zo.webm", 46.0, 0.88, 0.60, False),
    ("b6", "MehUc7OcEw0.webm", 20.0, 0.72, 0.50, True),
    ("b7", "nzEeLx_koDs.mp4", 0.3, 0.74, 0.37, False),
    ("b8", "MehUc7OcEw0.webm", 30.0, 1.26, 0.50, True),
]
for name, src, ss, d, cx, inner in SHOTS:
    if inner:   # 9:16 video pillarboxed in 16:9 with a watermark at its bottom: take the inner frame minus bottom 12 %
        crop = "crop=ih*9/16*0.88:ih*0.88:(iw-ih*9/16*0.88)/2:0"
    else:
        crop = f"crop=ih*9/16:ih:(iw-ih*9/16)*{cx}:0"
    vf = (f"{crop},scale=1150:2044:flags=lanczos,crop=1080:1920,fps=24,format=gray,eq=contrast=1.3:brightness=-0.02,"
          r"noise=alls=7:allf=t,geq=lum='clip(lum(X\,Y)*(1+0.10*sin(2*PI*(X+2)/8))\,0\,255)',"
          r"boxblur=24:enable='lt(t\,0.084)',format=yuv420p,hue=s=0,setsar=1")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-t", str(d + 0.1), "-i", str(S / src), "-an", "-vf", vf,
                    "-c:v", "libx264", "-crf", "16", "-preset", "medium", str(O / f"{name}.mp4")], check=True)
    print(name, "ok")
