"""user's dust-specks overlay (Overlays/a-dirty-film-texture...mp4, rotated to 9:16) -> only ink specks of the ref size (3-140 px), ref density"""
import numpy as np, glob, os
from PIL import Image
from scipy import ndimage
os.makedirs('assets/specks_clean', exist_ok=True)
for i, f in enumerate(sorted(glob.glob('assets/specks/s_*.png'))):
    a = np.asarray(Image.open(f).convert('L')).astype(np.float32) / 255
    dark = a < 0.6; lab, n = ndimage.label(dark); sizes = ndimage.sum(dark, lab, range(1, n + 1))
    keep = np.zeros(n + 1, bool); keep[1:] = (sizes >= 3) & (sizes <= 90) & (np.random.default_rng(i).random(n) < 0.6)
    km = ndimage.binary_dilation(keep[lab], iterations=1)
    Image.fromarray((np.clip(np.where(km, a, 1.0), 0, 1) * 255).astype(np.uint8)).save(f.replace('specks', 'specks_clean'))
