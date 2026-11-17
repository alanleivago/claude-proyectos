# TTF -> three.js typeface JSON (A-Z, a-z, 0-9, punctuation)
import json, os
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
D = os.path.dirname(os.path.abspath(__file__))
f = TTFont(os.path.join(D, 'LuckiestGuy-Regular.ttf')); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
class P(BasePen):
    def __init__(s, gs): super().__init__(gs); s.o = []
    def _moveTo(s, p): s.o += ['m', round(p[0]), round(p[1])]
    def _lineTo(s, p): s.o += ['l', round(p[0]), round(p[1])]
    def _qCurveToOne(s, c, p): s.o += ['q', round(p[0]), round(p[1]), round(c[0]), round(c[1])]
    def _curveToOne(s, c1, c2, p): s.o += ['b', round(p[0]), round(p[1]), round(c1[0]), round(c1[1]), round(c2[0]), round(c2[1])]
    def _closePath(s): pass
glyphs = {}
for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789?.,:'- ":
    g = cmap.get(ord(ch))
    if not g: continue
    p = P(gs); gs[g].draw(p); glyphs[ch] = dict(ha=gs[g].width, x_min=0, x_max=gs[g].width, o=' '.join(map(str, p.o)))
hh = f['hhea']
json.dump(dict(glyphs=glyphs, familyName='Luckiest Guy', ascender=hh.ascent, descender=hh.descent, underlinePosition=-100, underlineThickness=50, boundingBox=dict(yMin=hh.descent, xMin=0, yMax=hh.ascent, xMax=upm), resolution=upm, original_font_information={}), open(os.path.join(D, 'luckiest_typeface.json'), 'w'))
print(len(glyphs))
