# python tools/sdf_body.py <stalker_dir>  -> src/<parte>.npz (verts, faces) en metros, Z arriba, mira a -Y
# v2: las partes organicas del Stalker como campos de distancia (uniones suaves + restas + desplazamiento de pliegues)
# y marching cubes (skimage). build.py las decima a PS1, agrega lo duro (dientes, grapas, caja, tubos) y riggea.
import sys, os, numpy as np
from skimage.measure import marching_cubes
from scipy.ndimage import gaussian_filter
D = sys.argv[1]; os.makedirs(f"{D}/src", exist_ok=True)
G = {}

def grid(lo, hi, h):
    ax = [np.arange(lo[i], hi[i] + h, h, dtype=np.float32) for i in range(3)]
    G["X"], G["Y"], G["Z"] = np.meshgrid(*ax, indexing="ij"); G["lo"], G["h"] = np.array(lo, np.float32), h
def P(): return G["X"], G["Y"], G["Z"]
def sph(c, r):
    X, Y, Z = P(); return np.sqrt((X - c[0]) ** 2 + (Y - c[1]) ** 2 + (Z - c[2]) ** 2) - r
def ell(c, r):
    X, Y, Z = P(); qx, qy, qz = (X - c[0]) / r[0], (Y - c[1]) / r[1], (Z - c[2]) / r[2]
    k0 = np.sqrt(qx ** 2 + qy ** 2 + qz ** 2); k1 = np.sqrt((qx / r[0]) ** 2 + (qy / r[1]) ** 2 + (qz / r[2]) ** 2)
    return k0 * (k0 - 1) / np.maximum(k1, 1e-6)
def cone(a, b, ra, rb, sz=1.0):
    """capsula de radio variable a->b; sz aplana en z (pies)"""
    X, Y, Z = P(); a, b = np.array(a, np.float32), np.array(b, np.float32); ba = b - a
    px, py, pz = X - a[0], Y - a[1], (Z - a[2])
    t = np.clip((px * ba[0] + py * ba[1] + pz * ba[2]) / ba.dot(ba), 0, 1)
    dx, dy, dz = px - ba[0] * t, py - ba[1] * t, (pz - ba[2] * t) / sz
    return np.sqrt(dx ** 2 + dy ** 2 + dz ** 2) - (ra + (rb - ra) * t)
def torus(c, R, r):
    X, Y, Z = P(); q = np.sqrt((X - c[0]) ** 2 + (Y - c[1]) ** 2) - R; return np.sqrt(q ** 2 + (Z - c[2]) ** 2) - r
def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1); return b + (a - b) * h - k * h * (1 - h)
def ssub(a, b, k): return -smin(-a, b, k)
def U(ds, k):
    d = ds[0]
    for e in ds[1:]: d = smin(d, e, k)
    return d
RNG = np.random.default_rng(3); DIRS = RNG.standard_normal((8, 3)); DIRS /= np.linalg.norm(DIRS, axis=1)[:, None]; PH = RNG.uniform(0, 6.28, 8)
def nz(f, seed=0):
    X, Y, Z = P(); o = np.zeros_like(X)
    for k in range(8):
        d = DIRS[(k + seed) % 8]; o += np.sin((X * d[0] + Y * d[1] + Z * d[2]) * f * (1 + 0.37 * k) + PH[(k + 3 * seed) % 8]) / (1 + 0.5 * k)
    return o / 2.2
def sstep(e0, e1, x): t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
def save(name, d, blur=0.0):
    if blur: d = gaussian_filter(d, blur)   # suaviza el campo: sin bordes peludos tras el decimado
    v, f, _, _ = marching_cubes(d, 0.0, spacing=(G["h"],) * 3); v += G["lo"]
    np.savez_compressed(f"{D}/src/{name}.npz", verts=v.astype(np.float32), faces=f.astype(np.int32)); print(name, len(v), "verts", len(f), "tris")

# ---------------- cabeza + cuello corto y grueso ----------------
grid((-0.17, -0.25, 2.02), (0.17, 0.14, 2.64), 0.0035); X, Y, Z = P()
skull = ell((0, -0.025, 2.495), (0.102, 0.122, 0.108))
brow = cone((-0.075, -0.118, 2.512), (0.075, -0.118, 2.512), 0.026, 0.026)
frown = sph((0, -0.13, 2.50), 0.024)                                     # ceño
cheek = U([sph((s * 0.068, -0.105, 2.44), 0.034) for s in (1, -1)], 0.02)
jaw = ell((0, -0.095, 2.355), (0.083, 0.072, 0.09))                      # mandibula larga y caida
chin = sph((0, -0.13, 2.29), 0.04)
neck = cone((0, 0.0, 2.04), (0, -0.035, 2.37), 0.125, 0.088)
head = U([skull, brow, frown, cheek, jaw, chin], 0.035); head = smin(head, neck, 0.06)
veins = U([cone((s * 0.06 + 0.01 * k, -0.07 + 0.03 * k, 2.10), (s * 0.05, -0.08 + 0.02 * k, 2.32), 0.009, 0.006) for s in (1, -1) for k in range(2)], 0.01)
head = smin(head, veins, 0.012)
head = ssub(head, sph((-0.046, -0.13, 2.468), 0.032), 0.012)            # cuenca hundida (grapas)
head = ssub(head, sph((0.046, -0.135, 2.468), 0.024), 0.008)            # cuenca del ojo lechoso
head = ssub(head, sph((0, -0.16, 2.425), 0.018), 0.012)                 # nariz: hueco
head = ssub(head, U([ell((s * 0.011, -0.15, 2.42), (0.008, 0.02, 0.012)) for s in (1, -1)], 0.004), 0.004)
head = ssub(head, ell((0, -0.155, 2.335), (0.062, 0.05, 0.05)), 0.012)  # boca sin labios (hueco para encias y dientes)
wr = 0.0028 * np.sin(Z * 170 + 2.2 * nz(18, 1)) * sstep(2.47, 2.53, Z) + 0.0035 * np.sin(np.arctan2(Y + 0.03, X) * 16 + 2 * nz(14, 2)) * (1 - sstep(2.22, 2.30, Z))
head = head + wr + 0.0025 * nz(40, 4)
save("head", head, 0.8)
gums = ell((0, -0.118, 2.34), (0.06, 0.048, 0.052)); save("gums", gums)

# ---------------- torso, hombros y mangas (goma negra con pliegues gruesos y placas) ----------------
grid((-1.04, -0.46, 0.98), (1.04, 0.44, 2.36), 0.009); X, Y, Z = P()
parts = [ell((0, 0.0, 1.90), (0.50, 0.29, 0.30)), U([ell((s * 0.2, -0.16, 1.93), (0.21, 0.15, 0.15)) for s in (1, -1)], 0.05),
         cone((0, 0.0, 1.30), (0, 0.0, 1.76), 0.25, 0.37), cone((0, 0.01, 1.62), (0, -0.05, 1.62), 0.33, 0.33)]
for s in (1, -1):
    parts += [ell((s * 0.60, 0.02, 2.0), (0.27, 0.25, 0.23)), cone((s * 0.14, 0.03, 2.13), (s * 0.46, 0.02, 2.07), 0.12, 0.12),
              cone((s * 0.66, 0.02, 1.96), (s * 0.79, 0.02, 1.52), 0.18, 0.125), ell((s * 0.73, -0.02, 1.76), (0.15, 0.16, 0.2)),
              cone((s * 0.79, 0.02, 1.52), (s * 0.83, -0.03, 1.13), 0.13, 0.095), sph((s * 0.81, -0.01, 1.40), 0.135)]
coat = U(parts, 0.07)
coat = smin(coat, torus((0, -0.01, 2.165), 0.15, 0.06), 0.04)            # cuello del abrigo enrollado
coat = np.maximum(coat, 1.235 - Z)                                        # corta abajo (sigue la falda)
th = np.arctan2(Y, X)
fold = 0.014 * np.sin(Z * 38 + 2.8 * nz(3.5, 5) + 0.6 * np.cos(th * 3)) + 0.014 * np.exp(-(nz(4, 6) / 0.16) ** 2) - 0.01 * np.exp(-(nz(3, 7) / 0.12) ** 2)
fold += 0.002 * nz(9, 8)
waist = sstep(1.42, 1.34, Z) * (0.018 * np.abs(np.sin(th * 14 + 0.5 * nz(6, 9))))   # cintura fruncida
coat = coat + fold - waist
save("coatT", coat, 1.0)

# ---------------- falda larga plisada, abre desde la cintura ----------------
grid((-0.72, -0.68, 0.0), (0.72, 0.66, 1.36), 0.009); X, Y, Z = P()
th = np.arctan2(Y, X); r = np.sqrt(X ** 2 + (Y - 0.01) ** 2)
t = np.clip((1.30 - Z) / 1.25, 0, 1)
R0 = 0.265 + 0.36 * t ** 1.3; amp = 0.025 + 0.07 * t
pleat = np.abs(np.sin(th * (13 if True else 0) + 0.7 * nz(2.5, 10))) * 2 - 1
gather = (1 - sstep(1.12, 1.26, Z)) * 0 + sstep(1.12, 1.28, Z) * 0.012 * np.sin(th * 30)
R = R0 * (1 + amp * pleat) + gather + 0.012 * nz(5, 11)
skirt = np.abs(r - R) - 0.018
hem = 0.04 + 0.17 * np.maximum(0, -np.sin(th)) ** 3 + 0.02 * nz(6, 12)
skirt = np.maximum(skirt, np.maximum(hem - Z, Z - 1.33))
save("coat", skirt, 0.8)

# ---------------- manos ENORMES (garra relajada, palma hacia el cuerpo) ----------------
for s, nm in ((1, "handL"), (-1, "handR")):
    x0, y0 = s * 0.83, -0.03
    grid((x0 - 0.2, y0 - 0.2, 0.66), (x0 + 0.17, y0 + 0.18, 1.22), 0.004)
    q = lambda dx, dy, z: (x0 + s * dx, y0 + dy, z)
    parts = [cone(q(0, 0, 1.20), q(0, 0, 1.10), 0.085, 0.078), ell(q(-0.005, 0, 1.02), (0.06, 0.105, 0.085))]
    for k, (dy, ln, r0) in enumerate(((-0.075, 0.9, 0.031), (-0.026, 1.0, 0.033), (0.024, 0.97, 0.032), (0.07, 0.82, 0.029))):
        j0, j1, j2, j3 = q(-0.01, dy, 0.955), q(-0.02, dy * 1.05, 0.955 - 0.085 * ln), q(-0.055, dy * 1.08, 0.955 - 0.155 * ln), q(-0.095, dy * 1.08, 0.955 - 0.19 * ln)
        parts += [sph(j0, r0 * 1.1), cone(j0, j1, r0, r0 * 0.92), cone(j1, j2, r0 * 0.92, r0 * 0.8), cone(j2, j3, r0 * 0.8, r0 * 0.6)]
    t0, t1, t2 = q(-0.04, -0.085, 1.06), q(-0.06, -0.13, 0.98), q(-0.085, -0.125, 0.91)
    parts += [cone(t0, t1, 0.036, 0.031), cone(t1, t2, 0.031, 0.022)]
    hand = U(parts[:2], 0.03)
    for p in parts[2:]: hand = smin(hand, p, 0.012)
    hand = hand + 0.002 * nz(50, 13)
    save(nm, hand)

# ---------------- pies descalzos gigantes + pantorrillas ----------------
for s, nm in ((1, "footL"), (-1, "footR")):
    xf = s * 0.2
    grid((xf - 0.16, -0.40, 0.0), (xf + 0.16, 0.2, 0.78), 0.005); X, Y, Z = P()
    parts = [cone((xf, 0.02, 0.76), (xf, 0.03, 0.34), 0.115, 0.09), cone((xf, 0.03, 0.34), (xf, 0.05, 0.10), 0.09, 0.075), sph((xf, 0.07, 0.065), 0.068),
             cone((xf, 0.05, 0.06), (xf + s * 0.01, -0.19, 0.045), 0.07, 0.068, sz=0.7)]
    foot = U(parts, 0.04)
    for k in range(5):
        tx = xf + s * (-0.075 + 0.037 * k) * -1; big = 1.3 if k == 0 else 1.0 - 0.06 * k
        foot = smin(foot, cone((tx, -0.2, 0.035), (tx, -0.29 - 0.012 * big, 0.026), 0.024 * big, 0.019 * big), 0.012)
    foot = np.maximum(foot, -Z) + 0.002 * nz(40, 14)
    save(nm, foot)
