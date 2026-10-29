import numpy as np
from PIL import Image
from scipy.ndimage import label, binary_dilation
im = np.array(Image.open('/Users/alanleiva/claude-proyectos/Ref 1 bit pixelated junji ito madfable/ref miniaturas/borde encima.jpeg').convert('RGB')).astype(float)
lo = np.minimum(im[..., 0], im[..., 2])                       # green screen: R ~ 90, B ~ 100; the white line: ~250
alpha = np.clip((lo - 125) / (215 - 125), 0, 1)
A = Image.fromarray((alpha * 255).astype(np.uint8)).resize((1280, 720), Image.LANCZOS)
a = np.array(A).astype(float) / 255
line = a > 0.35
lab, n = label(~line); outside = lab == lab[0, 0]            # the region outside the drawn frame (as in the refs: black)
out = np.zeros((720, 1280, 4), np.uint8)
out[..., :3] = 255; out[..., 3] = (np.clip(a * 1.6, 0, 1) * 255).astype(np.uint8)   # pure white line (despilled: no green)
out[outside & ~binary_dilation(line, iterations=1)] = (0, 0, 0, 255)
Image.fromarray(out, 'RGBA').save('/Users/alanleiva/claude-proyectos/pieces/lost-second/thumbs/border_1280.png')
print('outside share %.3f' % outside.mean(), n)
