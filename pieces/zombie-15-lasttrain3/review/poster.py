# Poster vertical 1080x1920 (estilo fijo de miniaturas desde el ep15: poster de cine tipo RE3). Compone las capas del motor
# (review/poster/l_bg.png: tunel + el cazador + zombis; l_ava.png: Ava + pistola sobre verde; l_hud.png: HUD real sobre negro;
# ./poster_layers.sh las renderiza) con niebla volumetrica, luz de luna fria, contraluz, reflejo del piso mojado y profundidad de campo.
# python poster.py [salida.png]
import sys, os, numpy as np
from PIL import Image, ImageFilter, ImageChops
H = os.path.dirname(os.path.abspath(__file__)); D = f"{H}/poster"
W_, H_ = 1080, 1920; rng = np.random.default_rng(15)
bg = Image.open(f"{D}/l_bg.png").convert("RGB"); ava = Image.open(f"{D}/l_ava.png").convert("RGB"); hud = Image.open(f"{D}/l_hud.png").convert("RGB")
f = lambda im: np.asarray(im).astype(np.float32) / 255
# --- fondo: profundidad de campo (los costados y abajo mas borrosos; la cabeza del cazador nitida) ---
B0 = f(bg); B1 = f(bg.filter(ImageFilter.GaussianBlur(3))); B2 = f(bg.filter(ImageFilter.GaussianBlur(9)))
yy, xx = np.mgrid[0:H_, 0:W_] / np.array([H_, W_])[:, None, None]
side = np.clip((np.abs(xx - 0.5) - 0.16) / 0.25, 0, 1); low = np.clip((yy - 0.42) / 0.4, 0, 1)
k2 = np.clip(side * 0.9 + low * 0.5, 0, 1)[..., None]; k1 = np.clip(0.55 + 0 * yy, 0, 1)[..., None] * (yy > 0.33)[..., None]
img = B0 * (1 - k1) + B1 * k1; img = img * (1 - k2) + B2 * k2
# --- reflejo del piso mojado: lo de arriba de la linea del piso, espejado, borroso y frio ---
yF = int(0.86 * H_); src = img[yF - 420:yF][::-1]; n = min(len(src), H_ - yF)
refl = np.asarray(Image.fromarray((src[:n] * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255
ra = (0.32 * np.linspace(1, 0.2, n))[:, None, None]; img[yF:yF + n] = img[yF:yF + n] * (1 - ra) + refl * np.array([0.7, 0.85, 1.1]) * ra
# --- grado frio + luna ---
lum = img.mean(2, keepdims=True); img = img * 0.55 + lum * np.array([0.32, 0.42, 0.62]) * 0.9
moon = np.exp(-(((xx - 0.25) / 0.35) ** 2 + ((yy - 0.02) / 0.22) ** 2))[..., None] * np.array([0.35, 0.45, 0.65])
img = img + moon * 0.55
# --- niebla volumetrica (ruido fractal, mas densa abajo y alrededor del cuerpo del cazador) ---
def fbm(sc):
    out = np.zeros((H_, W_), np.float32)
    for o, a in ((30, 0.5), (60, 0.35), (120, 0.15)):
        z = rng.random((H_ // (sc * o) + 2, W_ // (sc * o) + 2)).astype(np.float32)
        out += a * np.asarray(Image.fromarray((z * 255).astype(np.uint8)).resize((W_, H_), Image.BICUBIC)).astype(np.float32) / 255
    return out
fog = fbm(1); fog = (fog - fog.min()) / (fog.max() - fog.min())
dens = 0.14 + 0.5 * np.clip((yy - 0.42) / 0.5, 0, 1) - 0.12 * np.exp(-(((np.abs(xx - 0.5) - 0.33) / 0.1) ** 2 + ((yy - 0.55) / 0.12) ** 2)) + 0.25 * np.exp(-(((xx - 0.5) / 0.3) ** 2 + ((yy - 0.55) / 0.12) ** 2)) - 0.18 * np.exp(-(((xx - 0.5) / 0.18) ** 2 + ((yy - 0.2) / 0.1) ** 2))
fa = np.clip(dens * (0.45 + 0.75 * fog), 0, 0.85)[..., None]; fogc = np.array([0.50, 0.58, 0.72])
img = img * (1 - fa) + fogc * fa
# --- Ava: recorte del verde, un poco mas grande y arriba para que el HUD quede debajo; contraluz frio en el borde ---
A = f(ava); g = (A[..., 1] > 0.55) & (A[..., 0] < 0.45) & (A[..., 2] < 0.45); al = (~g).astype(np.float32)
A[..., 1] = np.minimum(A[..., 1], np.maximum(A[..., 0], A[..., 2]) + 0.06)   # sin borde verde
S, DY = float(os.environ.get("AS") or 0.98), int(os.environ.get("ADY") or -200)
ai = Image.fromarray((A * 255).astype(np.uint8)); am = Image.fromarray((al * 255).astype(np.uint8))
nw, nh = int(W_ * S), int(H_ * S); ai = ai.resize((nw, nh), Image.NEAREST); am = am.resize((nw, nh), Image.NEAREST)
ox = (W_ - nw) // 2; canvA = Image.new("RGB", (W_, H_)); canvM = Image.new("L", (W_, H_)); canvA.paste(ai, (ox, DY + (H_ - nh) // 2)); canvM.paste(am, (ox, DY + (H_ - nh) // 2))
A2 = f(canvA); M = f(canvM)[..., None]
legs = np.clip((yy - 0.79) / 0.07, 0, 1)[..., None]; M = M * (1 - legs)   # se pierde en la niebla bajo las rodillas
edge = np.clip(f(canvM) - f(ImageChops.offset(canvM, 5, 4)), 0, 1)[..., None] * (1 - legs)   # contraluz solo del lado de la luna (arriba-izq)
A2 = A2 * 0.92 + np.array([0.02, 0.03, 0.06])
img = img * (1 - M) + A2 * M + edge * np.array([0.55, 0.68, 0.95]) * 0.35
# fina capa de niebla delante (abajo) + vineta
front = np.clip((yy - 0.80) / 0.15, 0, 1)[..., None] * (0.35 + 0.4 * fog[..., None]); img = img * (1 - front) + fogc * front
vig = np.clip(1 - 0.75 * (((xx - 0.5) / 0.62) ** 2 + ((yy - 0.48) / 0.75) ** 2), 0.25, 1)[..., None]; img *= vig
img += rng.normal(0, 0.005, img.shape).astype(np.float32)   # grano
# --- HUD real (nitido, nearest), abajo al centro, debajo de Ava ---
Hd = f(hud); hm = (Hd.max(2) > 0.04)[..., None].astype(np.float32); img = img * (1 - hm) + Hd * hm
out = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
dst = sys.argv[1] if len(sys.argv) > 1 else f"{H}/poster_v1.png"; out.save(dst); print(dst, out.size)
