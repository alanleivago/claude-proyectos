# prep.py: every Flow image -> native grid (native.py flat) -> assets/. The creature (nureS_*) is keyed (satkey.py),
# floating specks dropped, and each expression variant is shifted onto the base (best alpha match) and only its face
# box is pasted over the base, so a swap changes the face and nothing else (no jump).
import subprocess, sys, numpy as np
from PIL import Image
from scipy import ndimage
PY, D = sys.executable, '/Users/alanleiva/claude-proyectos/pieces/nure-onna/'
run = lambda *a: subprocess.run([PY, *a], check=True, cwd=D, env={'PATH': '/usr/bin:/bin:/opt/homebrew/bin'}, timeout=300)
for n in ['seaplate', 'grandma', 'grandma_ecu', 'shore', 'ots', 'smile_a', 'smile_b', 'stone', 'reveal', 'reveal_pre', 'tower', 'oldman']:
    run('tools/native.py', f'gen/{n}.jpg', f'assets/{n}.png', 'flat')
def main_body(d):
    a = d[..., 3] > 0; lab, k = ndimage.label(a)
    if k > 1:
        big = np.argmax(ndimage.sum(a, lab, range(1, k + 1))) + 1; d[lab != big] = 0
    return d
V = {}
for n in ['nureS_base', 'nureS_blink', 'nureS_side', 'nureS_wide']:
    run('tools/satkey.py', f'gen/{n}.jpg', f'gen/{n}_key.png')
    run('tools/native.py', f'gen/{n}_key.png', f'native/{n}.png', 'flat', '--norim')
    V[n] = main_body(np.asarray(Image.open(D + f'native/{n}.png')).copy())
B = V['nureS_base']
def thin_lips(d):   # the grey lip band around the slit goes white, so the B&W pass can't thicken it into a dark mouth
    m = d[100:126, 38:100]; g = (m[..., 3] > 0) & (m[..., 0] > 60) & (m[..., 0] < 200); m[g, :3] = 253; return d
B = thin_lips(B); Image.fromarray(B).save(D + 'assets/nureS_base.png')
FY, FX = slice(50, 143), slice(33, 104)   # the face box (native cells)
for n in ['nureS_blink', 'nureS_side', 'nureS_wide']:
    v = V[n]; best = (-1, 0, 0)
    for dy in range(-4, 5):
        for dx in range(-4, 5):
            s = np.roll(v, (dy, dx), (0, 1))
            m = ((s[..., 3] > 0) == (B[..., 3] > 0)).mean() + (np.abs(s[..., 0].astype(int) - B[..., 0]) < 5)[B[..., 3] > 0].mean()
            if m > best[0]: best = (m, dy, dx)
    s = np.roll(v, best[1:], (0, 1)); out = B.copy(); out[FY, FX] = s[FY, FX]
    out[FY, FX, 3] = np.maximum(out[FY, FX, 3], B[FY, FX, 3])   # the silhouette stays the base's
    Image.fromarray(thin_lips(main_body(out))).save(D + f'assets/{n}.png'); print(n, 'shift', best[1:], 'match %.3f' % best[0])
# the smile close-up: only the mouth band of smile_b goes over smile_a (no drift of eyes, hair or drops on the swap)
sa = np.asarray(Image.open(D + 'assets/smile_a.png')).copy(); sb = np.asarray(Image.open(D + 'assets/smile_b.png'))
sa[132:172, 8:128] = sb[132:172, 8:128]; Image.fromarray(sa).save(D + 'assets/smile_b.png'); print('smile_b: mouth band only')
# the hook's caption band: the sea plate is calm (no wave crests) in rows 184-203, so no white line crosses the text
sp = np.asarray(Image.open(D + 'assets/seaplate.png')).copy(); band = sp[176:204, :, :3]
band[band.max(2) > 60] = 0; sp[176:204, :, :3] = band; Image.fromarray(sp).save(D + 'assets/seaplate.png'); print('seaplate: calm caption band')
# smile_b: no leftover lower-lip line under the slit (plain skin to the chin)
sb = np.asarray(Image.open(D + 'assets/smile_b.png')).copy(); sb[165:171, 45:96, :3] = 253; Image.fromarray(sb).save(D + 'assets/smile_b.png')
# reveal_pre: the humps on the horizon are erased (the silence shot must not show any of her body); the horizon row stays
rp = np.asarray(Image.open(D + 'assets/reveal_pre.png')).copy(); band = rp[78:102, :, 0]
hz = 78 + int(np.argmax(((band > 60) & (band < 200)).sum(1)))
for r in range(78, 102):
    if r != hz: rp[r, :, :3] = 0
Image.fromarray(rp).save(D + 'assets/reveal_pre.png'); print('reveal_pre: humps erased, horizon row', hz)
# oldman: Flow's loose halo -> a white cell with flat grey floor on both sides (left/right or up/down) is floor again
om = np.asarray(Image.open(D + 'assets/oldman.png')).copy(); L0 = om[..., 0].astype(int); n = 0
for _ in range(2):
    for y in range(110, 195):
        for x in range(25, 125):
            if L0[y, x] > 200 and ((L0[y, x - 1] == 142 and L0[y, x + 1] == 142) or (L0[y - 1, x] == 142 and L0[y + 1, x] == 142)):
                om[y, x, :3] = 142; L0[y, x] = 142; n += 1
Image.fromarray(om).save(D + 'assets/oldman.png'); print('oldman: halo cells cleared', n)
# expression variants made by Flow edits: only their face box is pasted over the base (no jump on the swap)
def face_variant(base, var, out, rows, cols, extra=None):
    run('tools/native.py', f'gen/{var}.jpg', f'native/{var}.png', 'flat')
    b = np.asarray(Image.open(D + f'assets/{base}.png')).copy(); v = np.asarray(Image.open(D + f'native/{var}.png'))
    if extra: v = extra(v.copy())
    b[rows, cols] = v[rows, cols]; Image.fromarray(b).save(D + f'assets/{out}.png'); print(out, 'from', var)
face_variant('grandma', 'grandma_frown', 'grandma_frown', slice(43, 99), slice(31, 106))
face_variant('ots', 'ots_face', 'ots', slice(66, 103), slice(78, 104))          # the woman's face, eerier (same pose)
face_variant('oldman', 'oldman_up', 'oldman_up', slice(86, 118), slice(64, 92))
# round 3 (user): new shots so no image repeats across beats
for n in ('kneel', 'stone_old', 'grandpa'): run('tools/native.py', f'gen/{n}.jpg', f'assets/{n}.png', 'flat')
face_variant('grandpa', 'grandpa_scream', 'grandpa_scream', slice(22, 127), slice(35, 113))
