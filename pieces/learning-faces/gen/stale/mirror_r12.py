# mirror.py: the thing outside the porthole in the dive-3 mirror scene (beat 9), composited at Flow resolution in the
# f09_pilot frame's coordinates. Flow would not swap the creature inside @{pilotshot} (it redrew the pilot) nor add a
# hand to @{membrane} (came back unchanged), so: the dive-2 membrane with its pressed-in face (d2_imprint) fills the
# glass's right side, and the stalk-hand (d3_hand) rises at the left of the glass, its fingers stretched 1.5x long
# (Flow gave a normal hand), mirroring the pilot's. Round 3: seven drawn fingers, the membrane dimmed and smaller. Lighten-composite on black, clipped to the glass circle.
import numpy as np
from PIL import Image
D = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'
FW, FH, GC, GR = 1376, 768, (905, 330), 292
out = np.zeros((FH, FW), np.float32)
from scipy import ndimage
def paste(img, x, y, key=False, over=False, dim=1.0):
    a = np.asarray(img.convert('L')).astype(np.float32); h, w = a.shape
    if key:   # the membrane only: its flesh (light, holes filled), not Flow's dark-grey halftone water
        k = ndimage.binary_fill_holes(ndimage.median_filter(a, 7) > 90); k = ndimage.binary_opening(k, iterations=3)
        # its crop edges (Flow's frame top/bottom) dissolve into ragged strands instead of a straight cut
        rng = np.random.default_rng(3); nx = np.convolve(rng.random(w + 80), np.ones(31) / 31, 'same')[40:40 + w]
        sx = np.convolve(rng.random(w + 80), np.ones(25) / 25, 'same')[40:40 + w]
        r = np.arange(h)[:, None]   # round 4: no ragged cut (it read as a comb): the top and bottom fade into the dark instead
        c_ = np.arange(w)[None]   # a soft wavy torn edge (long waves, no fine teeth); a fade posterised into stripes
        k = k & (r > 30 + 45 * (1 + np.sin(c_ / 70 + 1) * 0.8 + np.sin(c_ / 23) * 0.2)) & (r < h - 30 - 55 * (1 + np.sin(c_ / 90 + 2.3) * 0.8 + np.sin(c_ / 29 + 1) * 0.2))
        a = a * k * dim   # dimmed: the membrane sits back in the dark, the hand reads first
    x0, y0 = max(0, x), max(0, y); x1, y1 = min(FW, x + w), min(FH, y + h)
    if over:   # the hand covers what is behind it (its own outline-closed silhouette)
        k = ndimage.binary_fill_holes(ndimage.binary_closing(a > 60, iterations=6))[y0 - y:y1 - y, x0 - x:x1 - x]
        fa = np.asarray(Image.fromarray((FADE * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)).astype(np.float32)[y0 - y:y1 - y, x0 - x:x1 - x] / 255
        A_ = a[y0 - y:y1 - y, x0 - x:x1 - x]; O_ = out[y0:y1, x0:x1]
        out[y0:y1, x0:x1] = np.where(k, np.where(fa >= 0.99, A_, np.maximum(A_, O_)), O_); return   # the wrist sinks into the membrane   # the wrist fades into what is behind
    out[y0:y1, x0:x1] = np.maximum(out[y0:y1, x0:x1], a[y0 - y:y1 - y, x0 - x:x1 - x])
m = Image.open(D + 'gen/d2_imprint.jpg').crop((500, 0, 1320, 768)); MS = 0.55; m = m.resize((round(m.width * MS), round(m.height * MS)), Image.LANCZOS)
paste(m, 1080 - round(405 * MS), 430 - round(370 * MS), key=True, dim=1.0)   # bigger than the glass: the circle crops its edges         # its face (crop 405,370) at the glass's right
# round 3b: gen/d3_hand7.jpg (Flow: a clean pale hand, the last finger bent back at a wrong angle) is widened to SEVEN
# digits by inserting two more copies of its middle-finger column strip; its white frame is cropped off; the wrist fades
# out toward the bottom (it rises out of the dark, the stalk lost below)
h = np.asarray(Image.open(D + 'gen/d3_hand7.jpg').convert('L').crop((440, 12, 940, 768))).astype(np.float32)
st = h[:, 655 - 440:745 - 440]; cut_ = 745 - 440
h = np.concatenate([h[:, :cut_], st, st, h[:, cut_:]], 1)
_c = np.arange(h.shape[1])[None]; FADE = ((np.arange(h.shape[0])[:, None]) < h.shape[0] - 110 + 18 * np.sin(_c / 23.0) + 10 * np.sin(_c / 9.0 + 1)).astype(np.float32)   # the wrist ends in an uneven torn line (no fade band)
h *= FADE
hand = Image.fromarray(h.astype(np.uint8))
HS = 0.42; hh = hand.resize((round(hand.width * HS), round(hand.height * HS)), Image.LANCZOS)
paste(hh, 930 - hh.width // 2, 70, over=True)   # up and right in the glass, clear of the pilot's own hand   # the palm (~170, 560 in the new canvas) beside the pilot's
yy, xx = np.mgrid[:FH, :FW]; out[(xx - GC[0]) ** 2 + (yy - GC[1]) ** 2 > GR ** 2] = 0
Image.fromarray(out.astype(np.uint8)).convert('RGB').save(D + 'gen/d3_out.jpg', quality=95); print('d3_out composed')
