import sys, numpy as np; sys.path.insert(0, "tools")
from PIL import Image
from scipy import ndimage as nd
d = np.load("ref/labels.npz"); L = d["L"]; lo, ST = d["lo"], float(d["step"])
LUT = np.array([(60, 60, 60), (255, 190, 170), (220, 170, 60), (180, 90, 20), (40, 160, 40), (140, 60, 200), (90, 50, 20)], np.uint8)
def view(axis_perm, flip):
    occ = L >= 0
    # orthographic: first occupied voxel along the view axis
    Lp = np.transpose(L, axis_perm); o = Lp >= 0
    if flip: Lp, o = Lp[:, ::-1], o[:, ::-1]
    first = o.argmax(1); has = o.any(1)
    img = np.take_along_axis(Lp, first[:, None, :], 1)[:, 0, :]
    out = np.zeros(img.shape + (3,), np.uint8); out[has] = LUT[np.clip(img[has], 0, 6)]
    return out[:, ::-1].transpose(1, 0, 2)[::-1, :] if True else out
fr = view((0, 1, 2), False)        # look along +y (from -y = front): rows x, cols z
sd = view((1, 0, 2), True)          # from +x (her left side)
bk = view((0, 1, 2), True)
def fix(a): return np.ascontiguousarray(a)
ims = [fix(view((0, 1, 2), False)), fix(view((1, 0, 2), False)), fix(view((0, 1, 2), True)), fix(view((1, 0, 2), True))]
H = max(i.shape[0] for i in ims); ims = [np.pad(i, ((0, H - i.shape[0]), (0, 10), (0, 0))) for i in ims]
Image.fromarray(np.concatenate(ims, 1)).resize((sum(i.shape[1] for i in ims) * 2 // 1, H * 2 // 1), Image.NEAREST).save("review/_labels.png")
