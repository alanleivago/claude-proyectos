"""Step 3 of the gta6 character recipe: finish a Flow render pass into a clean full-frame RGBA layer.

  python finish_character.py styles/gta6/characters/barman.json painted.jpg [out.png]

The painted image is the Flow NB2 edit of `<out>_flat.jpg` (the code block-in on a flat key colour).
  1. alpha     flood-fill the flat background from the image border (the dark silhouette line stops it,
               so a lilac jacket on a lilac key survives), feathered
  2. relight   Photoshop-style adjustment layers, in code (Antonio Stappaerts / Rising67 tutorials):
               a multiply layer of magenta-violet over the designed shadow shapes (dual split lighting
               pushed back if Flow flattened it), a screen layer of cream on the sun-side light shapes
  3. line      thick silhouette line, heavier on the side away from the sun
  4. rim       cream glow just inside the sun-side edge
  5. grade     saturation x1.25 (Lab chroma), warm yellow-pink gradient map + a little noise ("duplicate everything and add noise")
"""
import json
import os
import sys
import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_character import hexc, blur, clean_mask, ROOT, load_cfg


def main(cfg_path, painted, out=None):
    cfg = load_cfg(cfg_path)
    rel = lambda p: p if os.path.isabs(p) else os.path.join(ROOT, p)
    fin = cfg.get('finish', {})
    out = out or os.path.splitext(rel(cfg['out']))[0] + '_final.png'
    src = cv2.imread(rel(painted))
    Ht = fin.get('height', 1920)
    s = Ht / src.shape[0]
    img = cv2.resize(src, None, fx=s, fy=s, interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
    H, W = img.shape[:2]
    u = H / 1920.0

    # ---- 1. alpha: flood the key colour from the border
    lab = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
    corners = np.concatenate([lab[:20, :20].reshape(-1, 3), lab[:20, -20:].reshape(-1, 3)])
    key = np.median(corners, 0)
    # a figure touching a top corner (close-ups) spoils the median: use the corner patch nearest the flat key
    fk = cv2.cvtColor(np.uint8([[hexc(cfg.get('flat_bg', '#D8B4E0'))[::-1]]]), cv2.COLOR_BGR2LAB)[0, 0].astype(np.float32)
    patches = [np.median(p.reshape(-1, 3), 0) for p in (lab[:20, :20], lab[:20, -20:], lab[-20:, :20], lab[-20:, -20:])]
    best = min(patches, key=lambda p: np.linalg.norm(p - fk))
    if np.linalg.norm(key - fk) > np.linalg.norm(best - fk) + 6:
        key = best
    d = np.linalg.norm(lab - key, axis=2)
    near = (d < fin.get('key_tol', 14)).astype(np.uint8)
    n, lbl = cv2.connectedComponents(near, connectivity=4)
    border = set(np.unique(np.concatenate([lbl[0], lbl[-1], lbl[:, 0], lbl[:, -1]]))) - {0}
    bg = np.isin(lbl, list(border))
    # the block-in's own alpha protects the figure where it touches the key colour at the frame edge
    bi = cv2.imread(os.path.splitext(rel(cfg['out']))[0] + '.png', cv2.IMREAD_UNCHANGED)
    if bi is not None:
        prior = cv2.resize((bi[..., 3] > 128).astype(np.uint8), (W, H), interpolation=cv2.INTER_NEAREST)
        prior = cv2.erode(prior, np.ones((3, 3), np.uint8), iterations=int(fin.get('prior_erode', 14) * u))
        bg &= prior == 0
    else:
        prior = np.ones((H, W), np.uint8)
    # flat key-colour patches anywhere are background: enclosed pockets (arm-head gaps, inside railings)
    # and patches Flow painted over block-in props
    pk = fin.get('prior_key_tol', 9)
    if pk > 0:
        flatk = clean_mask(d < pk, 1.5 * u, int(400 * u * u))
        bg |= flatk.astype(bool)
    if True:
        pab = fin.get('prior_key_ab', 0)                  # same hue as the key at any lightness (painted key shadows)
        if pab > 0:
            dab = np.linalg.norm(lab[..., 1:] - key[1:], axis=2)
            bg |= clean_mask((dab < pab) & (lab[..., 0] > 110) & (prior > 0), 2 * u, int(1500 * u * u)).astype(bool)
    fig = clean_mask(~bg, 1.5 * u, int(800 * u * u))
    fig = cv2.erode(fig, np.ones((3, 3), np.uint8), iterations=1)
    alpha = blur(fig.astype(np.float32), 0.8 * u)

    # ---- 2. relight with adjustment layers on designed shapes
    sx = -1.0 if cfg.get('sun', 'left') == 'left' else 1.0
    L = lab[..., 0] / 255.0
    Ls = L.copy()
    for _ in range(3):
        Ls = cv2.bilateralFilter(Ls, 9, 0.08, 6 * u)
    ramp = (np.arange(W, dtype=np.float32)[None, :] / W - 0.5) * sx     # >0 towards the sun
    form = blur(Ls, 3 * u) + fin.get('split_bias', 0.12) * ramp
    m = fig > 0
    t_sh = np.quantile(form[m], fin.get('shadow_frac', 0.42))
    t_li = np.quantile(form[m], 1 - fin.get('light_frac', 0.18))
    sh = blur(clean_mask((form < t_sh) & m, 5 * u, int(900 * u * u), 2 * u).astype(np.float32), 1.2 * u)
    li = blur(clean_mask((form > t_li) & m, 4 * u, int(600 * u * u), 2 * u).astype(np.float32), 1.2 * u)
    mul = hexc(fin.get('shadow_color', '#C77BB8'))[::-1] / 255.0          # multiply layer colour (BGR)
    k = fin.get('shadow', 0.45)
    img = img * (1 - k * sh[..., None]) + img * mul * (k * sh[..., None])
    scr = hexc(fin.get('light_color', '#FFE9C2'))[::-1]
    kl = fin.get('light', 0.22)
    img = img + (255 - img) * (scr / 255.0) * (kl * li[..., None])

    # ---- 3. silhouette line + 4. rim
    gyA, gxA = np.gradient(blur(alpha, 3 * u))
    nA = np.sqrt(gxA ** 2 + gyA ** 2) + 1e-6
    sunward = np.clip(-gxA * sx / nA, 0, 1)
    edge = (fig - cv2.erode(fig, np.ones((3, 3), np.uint8))).astype(np.uint8)
    dist = cv2.distanceTransform(1 - edge, cv2.DIST_L2, 5)
    sw = fin.get('silhouette', [2.5, 5.0])
    wmap = (sw[0] + (sw[1] - sw[0]) * blur(1 - sunward, 8 * u)) * u
    sil = np.clip(wmap / 2 - dist + 0.5, 0, 1) * (alpha > 0.02)
    inner = np.clip(alpha - blur(cv2.erode(alpha, np.ones((3, 3), np.uint8), iterations=int(7 * u)), 3 * u), 0, 1)
    rim = blur(sunward, 5 * u) * inner * fin.get('rim', 0.4)
    img = img * (1 - rim[..., None]) + hexc(fin.get('rim_color', '#FFF1C4'))[::-1] * rim[..., None]
    ink = hexc(cfg.get('lines', {}).get('color', '#22161F'))[::-1]
    img = img * (1 - sil[..., None]) + ink * sil[..., None]

    # ---- 5. saturation (user default 2026-11-13: more saturated than the refs) + grade + noise
    from cut_layer import saturate
    img = saturate(np.clip(img, 0, 255), fin.get('saturation', 1.25)).astype(np.float32)
    g = fin.get('grade', 0.12)
    stops = np.array([[0.00, 0x2E, 0x18, 0x3A], [0.30, 0x7A, 0x3E, 0x7E], [0.55, 0xC9, 0x7A, 0xA6],
                      [0.78, 0xF0, 0xC0, 0xA8], [1.00, 0xFB, 0xF4, 0xCC]], np.float32)
    Y = (0.114 * img[..., 0] + 0.587 * img[..., 1] + 0.299 * img[..., 2]) / 255
    gm = np.dstack([np.interp(Y, stops[:, 0], stops[:, c]) for c in (3, 2, 1)])
    img = (1 - g) * img + g * gm
    rng = np.random.default_rng(3)
    img += rng.normal(0, fin.get('noise', 3.0), (H, W, 1)).astype(np.float32)
    rgba = np.dstack([np.clip(img, 0, 255), alpha * 255]).astype(np.uint8)
    cv2.imwrite(out, rgba)
    print('wrote', os.path.relpath(out, ROOT), f'{W}x{H}')
    # automatic cutout QA: residual key, fringes, islands -> fixed in place + check sheet over black/white/green
    import subprocess
    qa = [sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'qa_cutout.py'), out, '--fix',
          '--sheet', os.path.splitext(out)[0] + '_qa.jpg', '--fringe-side', 'right' if sx < 0 else 'left']
    if fin.get('qa_no_band'):
        qa.append('--no-band')
    r = subprocess.run(qa, capture_output=True, text=True)
    print(r.stdout.strip().splitlines()[0] if r.stdout.strip() else r.stderr[-300:])
    bak = out[:-4] + '.bak.png'
    if os.path.exists(bak):
        os.remove(bak)


if __name__ == '__main__':
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    main(*a)
