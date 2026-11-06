# mirror.py (round 13): the thing outside the porthole in beat 9 is ONE Flow image (gen/d3_creature_v3.jpg: the membrane
# with its crude pressed-in face and the arm and hand growing out of it in one piece), scaled into the glass circle of
# the f09_pilot frame (Flow px), half lost in the dark (a soft falloff from the hand), black outside the glass.
# No patchwork. The whole creature layer moves for the 1-s mimic lag (scenes.js).
import numpy as np
from PIL import Image
D = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'
FW, FH, GC, GR = 1376, 768, (905, 330), 292
S = 0.40   # round 15: larger than r13, the face inside the glass, the hand beside the pilot's
c = Image.open(D + 'gen/d3_creature_v3.jpg').convert('L'); c = c.resize((round(c.width * S), round(c.height * S)), Image.LANCZOS)
a = np.asarray(c).astype(np.float32); h, w = a.shape
r_ = np.arange(h)[:, None]; c_ = np.arange(w)[None]   # the source frame's own edges dissolve into the water (no straight cut)
a *= np.clip((h - r_) / (0.28 * h), 0, 1) * np.clip((w - c_) / (0.1 * w), 0, 1)
x0, y0 = 680, 130   # the hand sits beside the pilot's, clear of it
out = np.zeros((FH, FW), np.float32); out[y0:y0 + h, x0:x0 + w] = a
yy, xx = np.mgrid[:FH, :FW]
hx, hy = x0 + 250 * S, y0 + 250 * S            # the hand (source px 250, 250)
fall = np.clip(1.4 - np.hypot(xx - hx, (yy - hy) * 1.1) / 560, 0.62, 1.0)
out *= fall; out[(xx - GC[0]) ** 2 + (yy - GC[1]) ** 2 > GR ** 2] = 0
Image.fromarray(out.astype(np.uint8)).convert('RGB').save(D + 'gen/d3_out.jpg', quality=95); print('d3_out: one creature image')
