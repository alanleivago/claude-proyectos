"""upnext-01: extra clips for Ashley (upnext-girl2) built with HER pipeline (anim2lib Clip2 + core solve + checks +
bl_build2.py), written ONLY into pieces/upnext-01 (her out/ and ref/ deliverables are read, never written).
  lie_phone      lying on her back in bed, both hands hold the phone up over her chest, head raised on the pillow looking at it
  sit_up_bed     lying on her back -> props on the elbows -> sits up with the legs out (in bed), tired slump (holds)
  sit_reach_side seated on a bed edge: leans to her right and sets something down on a nightstand beside her (holds), comes back
usage (any cwd): python tools/girl_clips.py [--noglb]
out: engine/models/upnext/anim2_up01.npz, girl_up01_tights.glb, girl_face_tracks.json (+ new clips), girl_up01_actions.json
"""
import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np

PIECE = Path(__file__).resolve().parents[1]
GIRL = PIECE.parent / 'upnext-girl2'
OUT = PIECE / 'engine' / 'models' / 'upnext'
os.chdir(GIRL)                                   # her tools read ref/*.npz relative to her piece
sys.path.insert(0, str(GIRL / 'tools' / 'anim'))
import core as C                                  # noqa: E402
from anim2lib import Clip2                        # noqa: E402
from v2_floor import M, W, FA, HD, LB, SEAT, PH, H_LAP, addf, br, osc, CX   # noqa: E402,F401
from checks import check_clip                     # noqa: E402

CL = []


def clip(name, frames, loop=False, note=''):
    c = Clip2(name, frames, loop, note); CL.append(c); return c


# ---------------------------------------------------------------- lie_phone (UpNext Dd2Y #1-#3)
# lie_back body (prx -88 = on her back) with both legs long under a quilt, phone_look arms (chestN = they ride with the chest)
# pushed a bit further from the chest and up toward the face, head raised on the pillow (hx +) looking at the phone
c = clip('lie_phone', 120, loop=True, note='lying on her back in bed, legs long, both hands hold the phone up over the chest, head raised on the pillow looking at it, thumb scrolling')
c.ground = True; c.cam = (24, -7.6, 1.35, 9.0)
LP = M(LB, hx=20, hz=-4, hy=0, nx=6,
       fL=FA(CX + 0.12, -0.60, 0.075, 16, -62), fR=FA(CX - 0.12, -0.60, 0.075, -16, -62), kL=(0.2, -1, 0), kR=(-0.2, -1, 0),
       aR=W('R', 0.055, -0.36, 1.04, pole=(-1, 0.2, -0.6), hand=((0, -0.35, 0.95), (-1, 0, 0))),
       aL=W('L', 0.055, -0.36, 1.04, pole=(1, 0.2, -0.6), hand=((0, -0.35, 0.95), (-1, 0, 0))))
c.k(0, **LP)
c.drag = {'L': 0.0, 'R': 0.0}
c.add = addf(br(75, 1.0), lambda f, P: (P.__setitem__('_dtL', np.array([0.006 * np.sign(np.sin(f / 12 * np.pi)), 0, 0.004 * max(0, np.sin(f / 6 * np.pi))])), P.__setitem__('_dtspL', 'chestN')))
c.face(0, 'half', 'neutral'); c.face(50, 'blink', 'neutral'); c.face(53, 'half', 'neutral')

# ---------------------------------------------------------------- sit_up_bed (UpNext Dd2Y #3 -> #4)
c = clip('sit_up_bed', 54, note='in bed: lying on her back -> props up on the elbows -> sits up with the legs out under the quilt, tired slump, hands on the thighs (holds)')
c.ground = True; c.cam = (24, -7.0, 1.0, 9.0)
LEGS = dict(fL=FA(CX + 0.12, -0.62, 0.075, 14, -60), fR=FA(CX - 0.12, -0.62, 0.075, -14, -60), kL=(0.2, -1, 0.1), kR=(-0.2, -1, 0.1))
LIE0 = M(LB, hx=6, hz=-6, hy=0, **LEGS,
         aR=W('R', 0.25, 0.02, 0.86, pole=(-1, 0.3, 0), hand=((0.1, -0.2, -1), (-1, 0.1, 0))),
         aL=W('L', 0.25, 0.02, 0.86, pole=(1, 0.3, 0), hand=((0.1, -0.2, -1), (-1, 0.1, 0))))
ELB = M(LIE0, prx=-58, pz=-0.67, sx=10, cx=10, hx=14,
        aR=W('R', 0.22, 0.10, 0.12, 'world', pole=(-1, 0.6, 0.6), hand=((0.2, -1, 0), (0, 0, -1))),
        aL=W('L', 0.22, 0.10, 0.12, 'world', pole=(1, 0.6, 0.6), hand=((0.2, -1, 0), (0, 0, -1))))
SITB = M(LIE0, prx=-12, pz=-0.70, py=0.04, sx=14, cx=12, hx=16, hy=-6, hz=4, clL_up=-4, clR_up=-4,
         aR=W('R', 0.17, -0.30, 0.30, 'world', pole=(-1, 0.5, -0.3), hand=((-0.2, -0.8, -0.6), (0, 0.15, -1))),
         aL=W('L', 0.17, -0.30, 0.30, 'world', pole=(1, 0.5, -0.3), hand=((-0.2, -0.8, -0.6), (0, 0.15, -1))))
MID = M(ELB, prx=-34, pz=-0.69, sx=12, cx=11, hx=15,
        aR=W('R', 0.24, -0.12, 0.36, 'world', pole=(-1, 0.5, -0.1), hand=((0, -0.6, -0.8), (0, 0.3, -1))),
        aL=W('L', 0.24, -0.12, 0.36, 'world', pole=(1, 0.5, -0.1), hand=((0, -0.6, -0.8), (0, 0.3, -1))))
c.k(0, **LIE0).k(4, **LIE0).k(18, **ELB).k(27, **MID).k(36, **SITB).k(42, **M(SITB, sx=16, hx=19)).k(54, **SITB)
c.drag = {'L': 0.2, 'R': 0.2}
c.add = br(60, 0.8)
c.face(0, 'half', 'neutral'); c.face(16, 'sulk', 'neutral'); c.face(40, 'sulk', 'pout')

# ---------------------------------------------------------------- sit_reach_side (UpNext Dd2Y #11)
# sitting (sit_chair base, root at the feet); her right hand sets a phone on a surface to her right at ~0.58 m,
# 0.46 m out from the centre line and 0.12 m ahead of the feet; the trunk leans right so the arm is never at full stretch
c = clip('sit_reach_side', 48, note='seated on a bed edge: leans to her right and sets something down on a nightstand beside her (palm down, holds), then sits back with the hands on the lap')
c.cam = (24, -4.6)
c.skirt_k = (0.62, 0.3)
SEAT2 = M(SEAT, aL=W('L', 0.095, -0.07, 0.60, 'world', pole=(1, 0.3, -0.5), hand=H_LAP), aR=W('R', 0.075, -0.05, 0.61, 'world', pole=(-1, 0.3, -0.5), hand=H_LAP))   # hands wider on the lap: upper arms clear the bust
R_UP = W('R', 0.40, -0.14, 0.70, 'world', pole=(-1, 0.4, -0.4), hand=((0.25, -1, -0.2), (0, 0.1, -1)))
R_SET = W('R', 0.46, -0.12, 0.585, 'world', pole=(-1, 0.4, -0.4), hand=((0.25, -1, -0.15), (0, 0, -1)))
LEAN = M(SEAT2, sy=-12, cy=-8, prz=-2, hy=6, hz=-18, cz=-6, clR_up=4, aR=R_UP)
SET = M(LEAN, sy=-15, cy=-10, hz=-22, aR=R_SET)
c.k(0, **SEAT2).k(4, **SEAT2).k(14, **LEAN).k(20, **SET).k(28, **SET).k(34, **M(LEAN, aR=R_UP)).k(44, **SEAT2).k(48, **SEAT2)
c.drag = {'L': 0.0, 'R': 0.15}
c.add = br(60, 0.8)
c.face(0, 'soft', 'neutral'); c.face(12, 'gazeR', 'neutral'); c.face(30, 'soft', 'softSmile')


def main():
    data, acts, faces, report = {}, {}, {}, []
    for c in CL:
        qs, ls, Vs, Hs = [], [], [], []
        for f in c.frames():
            Q, H = c.solve(f); q, l = C.local_basis(Q, H); qs.append(q); ls.append(l); Hs.append(H); Vs.append(C.skin(Q, H))
        data['q_' + c.name] = np.array(qs); data['l_' + c.name] = np.array(ls)
        acts[c.name] = dict(frames=c.N, fps=30, seconds=round(c.N / 30, 3), loop=c.loop, note=c.note)
        tr = sorted(c.faces, key=lambda x: x[0]) or [[1, 'open', 'neutral']]
        if tr[0][0] > 1: tr = [[1, 'open', 'neutral']] + tr
        faces[c.name] = tr
        report.append(check_clip(c, np.array(Vs), Hs))
    base = np.load(GIRL / 'ref' / 'anim2.npz', allow_pickle=True)   # her 46 clips, unchanged
    for k in base.files:
        if k != 'clips' and k not in data: data[k] = base[k]
    names = sorted(k[2:] for k in data if k.startswith('q_'))
    anpz = OUT / 'anim2_up01.npz'
    np.savez(anpz, clips=json.dumps(names), **data)
    ft = json.load(open(GIRL / 'out' / 'face_tracks.json')); ft.update(faces)
    json.dump(ft, open(OUT / 'girl_face_tracks.json', 'w'), indent=1)
    ac = json.load(open(GIRL / 'out' / 'actions.json')); ac.update(acts)
    json.dump(ac, open(OUT / 'girl_up01_actions.json', 'w'), indent=1)
    for r in report: print(r)
    if '--noglb' in sys.argv: return
    BL = r'/Applications/Blender.app/Contents/MacOS/Blender'
    out = OUT / 'girl_up01_tights.glb'
    p = subprocess.run([BL, '-b', '--factory-startup', '--python', 'tools/anim/bl_build2.py', '--', 'ref/rig2.npz', str(anpz), 'tights', str(out)], capture_output=True, text=True)
    print('\n'.join(l for l in p.stdout.splitlines() if 'BUILD' in l or 'rror' in l)[-2000:])
    if p.returncode or 'exported' not in p.stdout: print('BLENDER FAILED', p.returncode, p.stderr[-2000:], p.stdout[-1200:])


if __name__ == '__main__':
    main()
