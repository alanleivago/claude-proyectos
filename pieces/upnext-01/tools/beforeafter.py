"""storyboard v2 review sheets: storyboard/ba_<item>.png = BEFORE (v1, storyboard/v1/) | AFTER (v2) per fix item,
plus the face check (v1 face | v2 face | her approved viewer render) and the bloom check (ref | ours no bloom | ours bloom).
usage: python tools/beforeafter.py"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

PIECE = Path(__file__).resolve().parents[1]
SB = PIECE / 'storyboard'
ENG = PIECE / 'engine'
FONT = str(ENG / 'fonts' / 'PixelifySans.ttf')
TW, TH = 432, 768


def font(n):
    f = ImageFont.truetype(FONT, n)
    try:
        f.set_variation_by_name(b'Bold')
    except Exception:
        pass
    return f


def sheet(name, title, cols):
    """cols = [(label, PIL image)] -> one row"""
    W = len(cols) * (TW + 16) + 16
    im = Image.new('RGB', (W, TH + 110), (16, 16, 20)); d = ImageDraw.Draw(im)
    d.text((16, 12), title, font=font(26), fill=(240, 240, 240))
    for k, (lab, a) in enumerate(cols):
        x = 16 + k * (TW + 16)
        im.paste(a.convert('RGB').resize((TW, TH)), (x, 90))
        d.text((x, 56), lab, font=font(22), fill=(255, 220, 120) if 'AFTER' in lab or 'ours' in lab else (200, 200, 200))
    im.save(SB / f'ba_{name}.png'); return im


def shot(v, sid):
    return Image.open(SB / ('v1' if v == 1 else '.') / f'shot_{sid}.png')


def main():
    items = [
        ('02_hand_phone', 'Shot 02: her hand + phone in the foreground (like the reel)', ['02']),
        ('ceiling', 'Ceiling in 09 / 10 / 19: reframed + crown moulding (S10 camera was inside the desk)', ['09', '10a', '19']),
        ('19_face', 'Shot 19: her face reads (mid-lean, lower camera)', ['19']),
        ('new_clips', 'New clips (her pipeline): lie_phone (01), sit_up_bed (04), sit_reach_side (11)', ['01', '04', '11']),
        ('11_arm', 'Shot 11: right arm no longer through the chest (sit_chair -> sit_reach_side, hands clear of the bust)', ['11']),
        ('04_bed', 'Shot 04: modelled bed (posts, slatted headboard, rounded mattress, pillow, draped quilt with folds + overhang)', ['04', '16']),
    ]
    for name, title, ids in items:
        cols = []
        for sid in ids:
            cols += [(f'BEFORE  {sid}', shot(1, sid)), (f'AFTER  {sid}', shot(2, sid))]
        sheet(name, title, cols)
    # face: crop the head of shot 06 (close-up) v1 vs v2 + her approved review render (face_angles_v3, yaw 0, open/neutral)
    def crop06(v):
        a = shot(v, '06'); return a.crop((240, 120, 840, 1186))
    her = Image.open(PIECE.parent / 'upnext-girl2' / 'review' / 'face_angles_v3.png').convert('RGB')
    cw = (her.width - 120) // 10
    her_c = her.crop((120, 30, 120 + cw, 30 + int(cw * 1.0)))
    sheet('face', 'Face: v1 lit (Lambert + face cells re-cloned without the light mix / snap) -> v2 UNLIT like her viewer',
          [('BEFORE  shot 06', crop06(1)), ('AFTER  shot 06', crop06(2)), ('her approved render', her_c)])
    # bloom: ref | ours without bloom | ours with bloom, shots 02 / 13 / 21
    ids = ['02', '13', '21']; idx = {'02': 1, '13': 13, '21': 21}
    cols = []
    for sid in ids:
        f = f'f_{(idx[sid] * 3 + 1) * 30:04d}.png'
        cols += [(f'ref  {sid}', Image.open(SB / 'ref' / f'r_{sid}.png')), (f'no bloom  {sid}', Image.open(ENG / 'stills' / 'nobloom' / f)), (f'ours bloom  {sid}', Image.open(ENG / 'stills' / 'v18' / f))]
    sheet('bloom', 'Bloom: emissive-only, 2 gaussians (sigma 6 + 18 px @1080) fitted to the ref LED / door halos', cols)
    print('ok')


if __name__ == '__main__':
    main()
