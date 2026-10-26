# levels.py: loudness (BS.1770, 3 s blocks) of each stem and the sum at chosen times: the balance table
import sys, os, numpy as np, soundfile as sf
sys.path.insert(0, os.path.expanduser("~/.claude/skills/real-sound/scripts"))
from master import blocks
A = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1] if len(sys.argv) > 1 else "stems"
names = ["music", "ambience", "sfx", "synth"] if src == "stems" else ["music", "amb", "sfx"]
base = os.path.join(A, "stems") if src == "stems" else os.path.join(A, "work", "mix", "stems")
X = {n: sf.read(os.path.join(base, n + ".wav"), always_2d=True)[0] for n in names}
if src != "stems": X["synth"] = sf.read(os.path.join(A, "work", "synth.wav"), always_2d=True)[0]
X["SUM"] = sum(X.values())
T = [float(t) for t in (sys.argv[2].split(",") if len(sys.argv) > 2 else
     "3,10,20,30,40,50,60,70,75,85,95,105,120,140,160,175,183,190,200,210,220,230,240,250,260,270,280,290,300,320,340,355,370,390,410,430,445,455,462,466,468.3,469,472,480,490,496,500,505".split(","))]
bl = {n: blocks(x, 3.0, 0.1) for n, x in X.items()}
print("t      " + " ".join(f"{n:>8s}" for n in X))
for t in T:
    row = []
    for n in X:
        tm, L = bl[n]; i = np.argmin(np.abs(tm - t)); row.append(f"{L[i]:8.1f}")
    print(f"{t:6.1f} " + " ".join(row))
