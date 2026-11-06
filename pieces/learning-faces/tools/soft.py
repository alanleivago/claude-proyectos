# soft.py (round 11, the user's approved look, review/flow_board_final_optionD.png col 4): the Flow output IS the look.
# Only snapped to the 4-px grid (median of each 4x4 cell of the image at 1920x1072) and quantized to 7 tones
# (0 .18 .34 .50 .66 .84 1.0). No few-tone corrections, no speck passes, no highlight curve. -> assets/<n>.png 480x268
import sys, numpy as np
from PIL import Image, ImageDraw
D = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'
LV = np.array([0.0, 0.18, 0.34, 0.50, 0.66, 0.84, 1.0]); T7 = np.round(LV * 255).astype(np.uint8)   # 0 46 87 128 168 214 255
def soft(src):
    a = np.asarray(Image.open(src).convert('L').resize((1920, 1072), Image.LANCZOS), np.float32) / 255
    c = 4; h, w = 1072 // c, 1920 // c
    g = np.median(a.reshape(h, c, w, c).transpose(0, 2, 1, 3).reshape(h, w, c * c), axis=2)
    return T7[np.abs(g[..., None] - LV).argmin(-1)]
def poly(pts):   # Flow px polygon -> grid mask
    pm = Image.new('L', (480, 268)); ImageDraw.Draw(pm).polygon([(x * 480 / 1376, y * 268 / 768) for x, y in pts], fill=255); return np.asarray(pm) > 0
if __name__ == '__main__':
    import re, os
    for n in sys.argv[1:]:
        v = soft(D + f'gen/{n}.jpg')
        base = re.sub(r'_[bc]$', '', n)
        if base != n and os.path.exists(D + f'gen/{base}.jpg'):   # an expression variant: its tones matched to the base image
            b = soft(D + f'gen/{base}.jpg'); T = np.array(T7, float)  # (rank match of the whole frame, same framing)
            order = np.argsort(v.ravel(), kind='stable'); out = np.empty(v.size, np.uint8); out[order] = np.sort(b.ravel()); v = out.reshape(v.shape)
        if n == 'b05_lights':   # Flow's blocky beam removed (the beams are drawn in code)
            v[poly([(612, 300), (1376, 290), (1376, 720), (505, 575), (515, 520), (612, 488)])] = 0
        if n == 'd5_smile':     # Flow's sun rays (impossible at 10 km) -> black water outside the figure
            v[~poly([(560, 40), (820, 40), (860, 300), (830, 450), (1000, 560), (1130, 640), (1180, 768), (220, 768), (280, 640), (420, 560), (560, 450), (520, 300)])] = 0
        if n in ('alt23_dutch', 'b22_turn_candidate', 'b23_smilingc', 'b23_smilingc_b', 'f24_q'):   # round 15: the cameraman's outline
            from scipy import ndimage as nd                                          # (Flow drew it heavy, spiky) -> a subtle grey line
            for _ in range(2):
                w_ = v >= 168; blk = nd.uniform_filter((v == 0).astype(float), 3) * 9; wn = nd.uniform_filter(w_.astype(float), 3) * 9
                v = np.where(w_ & (blk >= 2) & (wn <= 5), 87, v).astype(np.uint8)
        Image.fromarray(np.dstack([v, v, v, np.full_like(v, 255)]), 'RGBA').save(D + f'assets/{n}.png'); print(n)
