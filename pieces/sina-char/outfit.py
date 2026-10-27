"""Repaints NETO's colour layer as the construction-worker outfit (hi-vis vest, navy shirt, khaki cargo, boots,
knee pads, brown hair) using the per-texel part/3D maps from uvmap_neto.py. Writes work/sina256.png."""
import numpy as np
from PIL import Image
from compose import load, compose

obj = np.load("work/uvmap_obj.npy"); P = np.load("work/uvmap_pos.npy"); Nn = np.load("work/uvmap_nrm.npy")
names = dict(l.split(" ", 1) for l in open("work/uvmap_objs.txt").read().splitlines())
ID = {v: int(k) for k, v in names.items()}
x, y, z = P[..., 0], P[..., 1], P[..., 2]
front = Nn[..., 1] < -0.25                      # Blender front is -Y
orig = load("color")
clothes = orig[..., 3] > 0.5

C = {
    "navy": (0.13, 0.17, 0.38), "vest": (0.80, 1.00, 0.10), "reflect": (0.82, 0.84, 0.86), "zip": (0.25, 0.27, 0.3),
    "khaki": (0.74, 0.64, 0.46), "boot": (0.52, 0.36, 0.20), "sole": (0.20, 0.16, 0.12), "pad": (0.17, 0.19, 0.25),
    "hair": (0.46, 0.27, 0.15), "skin": (1.0, 0.82, 0.78),
    "pocket": (0.66, 0.56, 0.38), "khaki_dk": (0.45, 0.37, 0.24), "belt": (0.36, 0.22, 0.12), "buckle": (0.85, 0.85, 0.82),
    "lace": (0.9, 0.85, 0.7),
}
col = np.zeros((256, 256, 4), np.float32)


def paint(mask, name):
    col[mask, :3] = C[name]; col[mask, 3] = 1


up, belly, low = obj == ID["upper-body"], obj == ID["belly"], obj == ID["lower-body"]
hair = (obj == ID["hair-general"]) | (obj == ID["hair-front"])
torso_z = z[up & clothes]
print("upper clothes z", torso_z.min(), torso_z.max(), "|x| max", np.abs(x[up & clothes]).max())

from scipy import ndimage
isl, n_isl = ndimage.label(up & clothes)              # one UV island = one garment piece
sleeve = np.zeros_like(clothes)
for i in range(1, n_isl + 1):
    m = isl == i
    if np.abs(x[m]).mean() > 0.15:                    # islands that sit out on the arms
        sleeve |= m
torso = (up & clothes & ~sleeve) | belly
skin = up & ~clothes
paint(skin, "skin")
paint(skin & (z < 1.335) & (np.abs(x) < 0.3), "navy")          # shirt covers shoulders and chest (no off-shoulder)
paint(sleeve, "navy")
top = torso_z.max()
VEST_LO, COLLAR = 1.045, top - 0.012
vest = torso & (z > VEST_LO) & (z < COLLAR)                     # short vest: ends well above the belt
paint(torso, "navy")                                             # shirt everywhere else on the torso
paint(vest, "vest")
paint(vest & (np.abs(np.abs(x) - 0.058) < 0.013), "reflect")     # vertical straps, front and back
paint(vest & (np.abs(z - 1.1) < 0.012), "reflect")               # band near the hem
paint(vest & front & (np.abs(x) < 0.011), "zip")                 # open front, dark zip

legs = low & (clothes | (z < 0.22))
paint(legs, "khaki")
side = (np.abs(Nn[..., 0]) > 0.55) & (np.sign(Nn[..., 0]) == np.sign(x))
paint(low & side & (z > 0.52) & (z < 0.68), "pocket")            # cargo pocket on the outer thigh
paint(low & side & (np.abs(z - 0.665) < 0.01), "khaki_dk")       # pocket flap line
paint(low & front & (z > 0.40) & (z < 0.50), "pad")
paint(low & (z > 0.94), "belt")
paint(low & (z > 0.94) & front & (np.abs(x) < 0.02), "buckle")
paint(low & (z < 0.22), "boot")
paint(low & (z < 0.22) & front & (np.abs(x - np.sign(x) * 0.09) < 0.012) & ((z * 100).astype(int) % 3 == 0), "lace")
paint(low & (z < 0.035), "sole")
paint(hair, "hair")

mult = load("multiply"); mult[..., 3] *= 0.35
out = compose(col, mult=mult, high=np.zeros((256, 256, 4), np.float32), tint=True)
Image.fromarray((out * 255).astype(np.uint8)).save("work/sina256.png")
Image.fromarray((out * 255).astype(np.uint8)).resize((512, 512), Image.NEAREST).save("work/sina256_big.png")
print("ok")
