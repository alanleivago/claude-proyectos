"""UV unwrap (Blender smart project) + face materials + body texture baked from his 250 frames + face atlases.
python tools/texture.py <fit.npz> <out_mesh.npz> [--ts 2048] [--step 1]
writes tex/body.png, tex/face_eyes.png, tex/face_mouth.png"""
import sys, os, json, argparse, subprocess, numpy as np
from PIL import Image
sys.path.insert(0, "tools")
from bake import bake, fill
import face as FC
ap = argparse.ArgumentParser(); ap.add_argument("inp"); ap.add_argument("out")
ap.add_argument("--ts", type=int, default=2048); ap.add_argument("--step", type=int, default=1)
ap.add_argument("--power", type=float, default=30.0); ap.add_argument("--uv", default="")
a = ap.parse_args()
BL = r"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"
D = dict(np.load(a.inp, allow_pickle=True)); V, F, C, P = D["V"], D["F"], D["C"], D["P"]; names = list(D["names"])
cam = json.loads(str(D["cam"])); A = D["alphas"]
uvf = a.uv or "ref/_uv.npz"
if not a.uv:
    subprocess.run([BL, "-b", "--factory-startup", "--python", "tools/bl_uv.py", "--", a.inp, uvf], check=True, capture_output=True,
                   timeout=900, env=dict(os.environ))
FUV = np.load(uvf)["FUV"]; FMAT = np.zeros(len(F), int)
FUV, FMAT = FC.assign(V, F, C, P, names, FUV, FMAT, cam, A)
os.makedirs("tex", exist_ok=True)
body = np.nonzero(FMAT == 0)[0]
tex, W, pix, fid = bake(V, F, FUV, cam, A, list(range(0, 250, a.step)), a.ts, faces=body, power=a.power, FC=C)
print("baked texels", (W > 0).sum(), "of", len(pix))
# never-seen texels (under the skirt, inside joints): the part's own median colour, so animations never show stray colours
tflat = tex.reshape(-1, 3); wflat = W.reshape(-1); tpart = P[fid]
for p in np.unique(tpart):
    m = tpart == p; seen = m & (wflat[pix] > 0)
    if seen.any():
        med = np.median(tflat[pix[seen]], 0); un = m & ~(wflat[pix] > 0)
        tflat[pix[un]] = med; wflat[pix[un]] = 1e-9
tex = fill(tflat.reshape(tex.shape), wflat.reshape(W.shape))
from scipy import ndimage as ndi
tex = np.stack([ndi.median_filter(tex[..., c], size=3) for c in range(3)], -1)   # kills compression specks, keeps edges
Image.fromarray(np.clip(tex, 0, 255).astype(np.uint8)).save("tex/body.png"); Image.fromarray(np.clip(tex, 0, 255).astype(np.uint8)).save("tex/body.jpg", quality=94)
D.update(FUV=FUV, FMAT=FMAT); np.savez(a.out, **D)
print("saved", a.out)
