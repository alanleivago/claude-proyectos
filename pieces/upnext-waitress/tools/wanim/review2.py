"""v2 review sheets (scene in engine units: metres x S, floor at -9).  python -I tools/wanim/review2.py <turntable|waist|quick> """
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, "tools")); sys.path.insert(0, HERE)
import review as RV
import rig as RG

S = RG.S_ENGINE
u = lambda c: [c[0] * S, c[1] * S, c[2] * S + RG.FLOOR]
BODY = dict(ctr=u([0, 0, 0.88]), ext=1.9 * S)
BL = {o: os.path.join(ROOT, "ref", f"w2_{o}.blend") for o in "BC"}
VIEWS = [("front", "front"), ("3q", "3/4"), ("side", "side"), ("back", "back")]
cr = lambda i: (64, 0, i.width - 64, i.height)


def turntable(blends=None, out="waitress_v2_turntable.png", title=None):
    blends = blends or BL; rows = []
    for o in "BC":
        s = [dict(out=os.path.join(RV.TMP, f"t2{o}_{v}.png"), view=v, **BODY) for v, _ in VIEWS]
        RV.run(blends[o], s); rows.append([x["out"] for x in s])
    RV.grid(rows, os.path.join(ROOT, "review", out), ["B high-waist\nshorts", "C cropped\nslim jeans"], [l for _, l in VIEWS],
            title or "Waitress v2 (smaller shoes and hands, curvier hips, new corset-to-waist join), flat unlit", cr)


def waist(blends=None):
    blends = blends or BL; rows = []
    for o in "BC":
        s = [dict(out=os.path.join(RV.TMP, f"w2{o}_{v}.png"), view=v, ctr=u([0, 0, 1.0]), ext=0.55 * S, elev=e)
             for v, e in (("front", 0), ("3q", 10), ("side", 0), ("3qb", 10), ("back", 0), ("front", -35))]
        RV.run(blends[o], s, size=360); rows.append([x["out"] for x in s])
    RV.grid(rows, os.path.join(ROOT, "review", "_waist_v2.png"), ["B", "C"], ["front", "3/4", "side", "3/4 back", "back", "low"],
            "Corset -> waistband join, close-up")


if __name__ == "__main__":
    globals()[sys.argv[1]]()
