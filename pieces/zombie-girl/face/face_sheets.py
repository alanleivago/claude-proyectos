# Expresiones de la heroina: atlas face_eyes / face_mouth de 16 celdas (mismo orden que zero-fem, el motor
# cambia material.map.offset.x = celda/16). Cada celda = la textura completa de Head re-proyectada desde una hoja
# con los ojos (ediciones de Flow en gen/eyes_*) o la boca (pintada aqui en pixel art) cambiados.
# blender -b ../model/out/heroine_tex.blend --python face.py  -> ../model/out/heroine_face.blend + face_eyes.png/face_mouth.png
import os, glob, numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SHEET = np.asarray(Image.open(os.path.join(HERE, '..', 'ref', 'sheet3.jpg')).convert('RGB'))
CX0, CY0 = 236, 66                       # recorte de la cara que se edito en Flow (112x128)

EYES = ['open', 'half', 'blink', 'happy', 'surprised', 'angry', 'sad', 'wink', 'hearts', 'shocked',
        'dizzy', 'relaxed', 'disgust', 'free13', 'free14', 'free15']
MOUTH = ['neutral', 'smile', 'smileOpen', 'talkA', 'talkO', 'surprised', 'frown', 'shout', 'blep', 'cat',
         'gasp', 'bigShock', 'disgust', 'free13', 'free14', 'free15']
EYE_SRC = {'half': 'half', 'blink': 'blink', 'happy': 'happy', 'surprised': 'surprised', 'angry': 'angry',
           'sad': 'sad', 'wink': 'wink', 'shocked': 'shocked', 'relaxed': 'relaxed',
           'disgust': 'angry'}       # TODO: disgust propio cuando Flow vuelva a dejar generar

def eyes_sheet(name):
    a = SHEET.copy()
    if name not in EYE_SRC: return a
    f = sorted(glob.glob(os.path.join(HERE, 'gen', f'eyes_{EYE_SRC[name]}', '*.jpg')))[0]
    g = Image.open(f).convert('RGB').resize((1024, 1024), Image.LANCZOS).crop((64, 0, 960, 1024))
    g = np.asarray(g.resize((112, 128), Image.LANCZOS))
    y0, y1, x0, x1 = 112, 150, 252, 332            # banda de cejas y ojos completa
    o = a[y0:y1, x0:x1].astype(int); e = g[y0 - CY0:y1 - CY0, x0 - CX0:x1 - CX0]
    r, gg, b = o[..., 0], o[..., 1], o[..., 2]
    hair = (b < 0.48 * r) & (gg > 0.6 * r) & (r > 90)  # mechones de la hoja: se quedan los originales
    a[y0:y1, x0:x1] = np.where(hair[..., None], o, e).astype(np.uint8)
    return a

# boca en pixel art, 13 px de ancho (x 285..297), filas desde y 155
COL = {'d': (140, 92, 66), 'm': (198, 150, 120), 'i': (96, 38, 36), 't': (242, 232, 222), 'p': (196, 92, 92)}
GRID = {
    'smile':     ["", "d...........d", ".d.........d.", "..ddddddddd..", "...mmmmmmm..."],
    'smileOpen': ["", "ddddddddddddd", ".dtttttttttd.", "..diiiiiiid..", "...dipppid...", "....ddddd...."],
    'talkA':     ["", "..ddddddddd..", ".diiiiiiiiid.", "..diipppiid..", "...ddddddd..."],
    'talkO':     ["", "....ddddd....", "...diiiiid...", "...diiiiid...", "....ddddd...."],
    'surprised': ["....ddddd....", "...diiiiid...", "..diiiiiiid..", "..diiiiiiid..", "...diiiiid...", "....ddddd...."],
    'frown':     ["", "", "...ddddddd...", "..d.......d..", ".d.........d."],
    'shout':     ["..ddddddddd..", ".dtttttttttd.", "diiiiiiiiiiid", "diiiipppiiiid", ".diiiiiiiiid.", "..ddddddddd.."],
    'gasp':      ["", "", ".....ddd.....", "....diiid....", ".....ddd....."],
    'bigShock':  ["...ddddddd...", "..diiiiiiid..", "..diiiiiiid..", "..diiiiiiid..", "..diiipiiid..", "...diiiiid...", "....ddddd...."],
    'disgust':   ["", ".dd.....ddd..", "d..ddddd...d.", "..........pd.", ""],
    'blep':      ["", "d...........d", ".d.........d.", "..ddddddddd..", "......ppp....", "......pp....."],
    'cat':       ["", "", "..d...d...d..", "...d.d.d.d...", "....d...d...."],
}
def mouth_sheet(name):
    a = SHEET.copy()
    if name not in GRID: return a
    skin = a[153:155, 283:302].reshape(-1, 3).mean(0) * 0.5 + a[164:166, 283:302].reshape(-1, 3).mean(0) * 0.5
    a[155:164, 283:302] = skin.astype(np.uint8)                     # borra la boca original
    for r, row in enumerate(GRID[name]):
        for c, ch in enumerate(row):
            if ch in COL: a[155 + r, 285 + c] = COL[ch]
    return a


os.makedirs(os.path.join(HERE, 'variants'), exist_ok=True)
for n in EYES: Image.fromarray(eyes_sheet(n)).save(os.path.join(HERE, 'variants', f'eyes_{n}.png'))
for n in MOUTH: Image.fromarray(mouth_sheet(n)).save(os.path.join(HERE, 'variants', f'mouth_{n}.png'))
print('variants', len(EYES) + len(MOUTH))
