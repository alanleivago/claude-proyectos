"""Body build check: torso width / face width (face box from YuNet, torso = alpha/person width 1.6-2.4 face heights below the chin)."""
import sys, cv2, numpy as np
sys.path.insert(0, 'styles/gta6/tools'); import face_id as fi, gta_parse as gp
def ratio(img, mask):
    f = max(fi.faces(img, 0.5), key=lambda f: f[-1]); x, y, w, h = f[:4]
    ws = []
    for k in np.linspace(0.3, 1.0, 8):
        yy = int(y + h + k * h)
        if yy >= mask.shape[0]: break
        xs = np.nonzero(mask[yy])[0]
        if len(xs): ws.append(xs.max() - xs.min())
    return np.median(ws) / w if ws else float('nan')
for p in sys.argv[1:]:
    im = cv2.imread(p, cv2.IMREAD_UNCHANGED)
    if im.shape[2] == 4:
        al = im[..., 3:] / 255.; im = (im[..., :3] * al + 200 * (1 - al)).astype(np.uint8)
    pr = gp.segformer('clothes', cv2.cvtColor(im, cv2.COLOR_BGR2RGB))
    m = np.isin(pr.argmax(0), [4, 7, 14, 15])          # upper clothes + arms = torso silhouette
    print(f'{p.split("/")[-1]:40s} torso/face {ratio(im, m):.2f}')
