# python tools/make_tex.py <stalker_dir>
# Texturas PS1 del Stalker: 128 px, 32 colores, ruido periodico (tilea). Paleta de largo3/gigante.md.
import sys, numpy as np
from PIL import Image
D = sys.argv[1]; N = 128
rng = np.random.default_rng(7)

def noise(sigma, seed=None):
    r = np.random.default_rng(seed) if seed is not None else rng
    f = np.fft.fft2(r.standard_normal((N, N)))
    k = np.fft.fftfreq(N)[:, None] ** 2 + np.fft.fftfreq(N)[None, :] ** 2
    n = np.real(np.fft.ifft2(f * np.exp(-k * (N / sigma) ** 2 * 0.5 * 4)))
    return (n - n.min()) / (n.max() - n.min())

def hexc(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)
def mix(a, b, t): return a * (1 - t[..., None]) + b * t[..., None]
def save(name, img):
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), "RGB").quantize(32, method=Image.Quantize.MEDIANCUT).convert("RGB")
    im.save(f"{D}/tex/{name}.png"); print("tex", name)
U, V = np.meshgrid(np.arange(N) / N, np.arange(N) / N)

# piel carne-violeta arrugada (v2: sin puntitos; arrugas anchas y suaves, manchas grandes violaceas)
n1, n2, n3 = noise(6), noise(10), noise(3)
img = mix(hexc("#a8898e"), hexc("#bb9e9c"), n3)
wr = 0.5 + 0.5 * np.sin(2 * np.pi * (V * 6 + 1.6 * n1 + 0.4 * n2))
img = mix(img, hexc("#6e4a55"), np.clip((wr - 0.72) / 0.28, 0, 1) * 0.75)
img = mix(img, hexc("#cdb2ad"), np.clip((0.22 - wr) / 0.22, 0, 1) * 0.35)
img = mix(img, hexc("#8a5d6c"), np.clip((n2 - 0.6) / 0.3, 0, 1) * 0.6)
save("skin", img)

# abrigo de goma negra: pliegues verticales, brillo apenas, rajas mostaza
n1, n2, n3 = noise(5, 11), noise(14, 12), noise(3, 13)
pl = 0.5 + 0.5 * np.sin(2 * np.pi * (U * 16 + 0.5 * n1))
img = mix(hexc("#0c0a0b"), hexc("#242022"), pl * 0.7 + n2 * 0.3)
img = mix(img, hexc("#4a4446"), np.clip((pl - 0.93) / 0.07, 0, 1) * 0.8)   # brillo en la cresta del pliegue
wr = np.abs(np.sin(2 * np.pi * (V * 7 + 1.8 * n2)))
img = mix(img, hexc("#0a0809"), np.clip(1 - wr / 0.12, 0, 1) * 0.8)
seam = (np.abs(n1 - 0.5) < 0.012) & (n3 > 0.62)                      # rajas mostaza pocas
img = mix(img, hexc("#c99a1a"), seam * 1.0)
save("coat", img)

# abrigo de arriba (torso, hombros, mangas): goma negra grumosa, sin pliegues verticales
n1, n2, n3 = noise(5, 14), noise(12, 15), noise(3, 16)
img = mix(hexc("#121011"), hexc("#2e292b"), n2)
wr = np.abs(np.sin(2 * np.pi * (V * 6 + U * 2 + 2.5 * n1)))
img = mix(img, hexc("#3e3739"), np.clip(1 - wr / 0.1, 0, 1) * 0.7)
img = mix(img, hexc("#050405"), (np.abs(n2 - 0.5) < 0.03) * 0.9)
img = mix(img, hexc("#c99a1a"), ((np.abs(n1 - 0.5) < 0.01) & (n3 > 0.7)) * 1.0)
save("coatT", img)

# dientes amarillentos con manchas
n1 = noise(8, 21)
img = mix(hexc("#d8c9a0"), hexc("#a8925e"), np.clip(V * 1.2 - 0.2, 0, 1) * 0.7 + n1 * 0.3)
img = mix(img, hexc("#6a5030"), (np.abs(np.sin(np.pi * U * 4)) < 0.08) * 0.6)
save("teeth", img)

# encias rojas sangrantes
n1, n2 = noise(8, 31), noise(20, 32)
img = mix(hexc("#7a1018"), hexc("#a8202a"), n2 * 0.7)
img = mix(img, hexc("#3a0508"), (np.abs(n1 - 0.5) < 0.04) * 0.8)
save("gums", img)

# ojo blanco lechoso
n1 = noise(10, 41)
img = mix(hexc("#e8e4d8"), hexc("#c8c0b4"), n1 * 0.6)
img = mix(img, hexc("#9a6a6a"), (np.abs(n1 - 0.5) < 0.015) * 0.6)
save("eye", img)

# grapas metalicas brillantes
n1 = noise(12, 51)
img = mix(hexc("#d8dadc"), hexc("#6c7076"), n1)
save("metal", img)

# hierro oxidado (caja hexagonal)
n1, n2 = noise(6, 61), noise(18, 62)
img = mix(hexc("#3a2a22"), hexc("#7a4a2a"), n1)
img = mix(img, hexc("#a8602a"), (n2 > 0.72) * 0.7)
img = mix(img, hexc("#1c1612"), (np.abs(U - 0.5) > 0.46) | (np.abs(V - 0.5) > 0.46))   # borde de la placa
save("rust", img)

# tubos rojo vino con anillos
n1 = noise(10, 71)
img = mix(hexc("#8a2a3c"), hexc("#5a1424"), (np.sin(2 * np.pi * V * 12) > 0.6) * 0.6 + n1 * 0.3)
img = mix(img, hexc("#b04a5c"), (np.abs(U - 0.25) < 0.06) * 0.6)    # brillo a lo largo
save("tubes", img)

# amarillo mostaza (costuras y abrazaderas)
n1 = noise(10, 81)
img = mix(hexc("#d4a820"), hexc("#8a6410"), n1 * 0.7)
save("yellow", img)

# luz verde tenue
img = mix(hexc("#48d070"), hexc("#a0ffb8"), np.clip(1 - np.hypot(U - 0.5, V - 0.5) * 2.2, 0, 1))
save("green", img)
