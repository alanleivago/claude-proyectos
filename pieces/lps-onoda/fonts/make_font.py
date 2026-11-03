"""venv: builds fonts/PunkPoly-Black.ttf, our own heavy logo face drawn after the LowPolyShorts title
(fat faceted sans, chamfered corners, square stroke ends, tall x-height, oval o with a narrow counter, straight-tailed y).
Glyphs are thick centre-line strokes (shapely buffers) unioned and written as TrueType outlines.
Covers the title letters: L P S h k l n o r s t u w y + space.  python fonts/make_font.py"""
import math
import os

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from shapely import affinity
from shapely.geometry import LineString, Point, Polygon, box
from shapely.ops import unary_union

H = os.path.dirname(os.path.abspath(__file__))
CAP, XH, ASC, DESC, W = 730, 560, 780, -230, 205        # cap height, x-height, l height, descender, stroke


def stroke(pts, w=W, cap=2):                            # cap 2 = flat, 3 = square
    return LineString(pts).buffer(w / 2, cap_style=cap, join_style=2, mitre_limit=3)


def arc(cx, cy, rx, ry, a0, a1, n=None):
    n = n or max(2, round(abs(a1 - a0) / 40))           # faceted: ~40 deg per segment (low-poly curves)
    return [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def ell(cx, cy, rx, ry):
    return affinity.scale(Point(cx, cy).buffer(1, quad_segs=2), rx, ry)   # octagon


def clip(g, y0=-10_000, y1=10_000):
    return g.intersection(box(-10_000, y0, 10_000, y1))


def bowl_arch(x0, x1, top, y_bottom, open_down=True):
    """n/h/u style arch: two stems joined by a half-ellipse (centre line)."""
    cx, rx = (x0 + x1) / 2, (x1 - x0) / 2
    ry = rx * 0.95
    cy = top - W / 2 - ry
    if open_down:
        return clip(stroke([(x0, y_bottom)] + arc(cx, cy, rx, ry, 180, 0) + [(x1, y_bottom)]), y_bottom, top)
    cy = y_bottom + W / 2 + ry
    return clip(stroke([(x0, top)] + arc(cx, cy, rx, ry, 180, 360) + [(x1, top)]), y_bottom, top)


G = {}
G["L"] = unary_union([box(0, 0, W, CAP), box(0, 0, 470, W * 0.95)])
G["P"] = unary_union([box(0, 0, W, CAP), box(0, CAP - 390, 250, CAP).union(ell(250, CAP - 195, 250, 195))]).difference(
    unary_union([box(W - 5, CAP - 195 - 85, 250, CAP - 195 + 85), ell(250, CAP - 195, 80, 85)]))
G["o"] = ell(285, XH / 2, 285, XH / 2 + 6).difference(ell(285, XH / 2, 72, 150))
G["l"] = box(0, 0, W + 5, ASC)
G["y"] = clip(unary_union([stroke([(70, XH + 200), (300, 60)], W * 1.0), stroke([(520, XH + 200), (150, DESC - 200)], W * 1.0)]), DESC, XH)
G["n"] = unary_union([box(0, 0, W, XH), bowl_arch(W / 2, 470, XH, 0)])
G["h"] = unary_union([box(0, 0, W, ASC), bowl_arch(W / 2, 470, XH, 0)])
G["u"] = unary_union([box(470 - W / 2, 0, 470 + W / 2, XH), bowl_arch(W / 2, 470, XH, 0, open_down=False)])
G["r"] = unary_union([box(0, 0, W, XH), clip(stroke([(W / 2, 200)] + arc(W / 2 + 150, XH - W / 2 - 140, 150, 140, 180, 60), W), 0, XH)])
G["k"] = unary_union([box(0, 0, W, ASC), clip(unary_union([stroke([(W - 20, 170), (560, XH + 120)]), stroke([(W + 60, 290), (520, -100)])]), 0, XH)])
G["t"] = unary_union([box(80, 0, 80 + W, CAP - 60), box(0, XH - 170, 400, XH)]).difference(
    Polygon([(60, CAP - 60), (80 + W + 20, CAP + 30), (80 + W + 20, CAP + 200), (60, CAP + 200)]))
G["w"] = clip(unary_union([stroke([(50, XH + 150), (210, -60), (365, XH - 60), (520, -60), (680, XH + 150)], W * 0.92)]), 0, XH)


def s_shape(h, wdt, w=W):
    span = (h - w) / 2                                   # r1 + r2: the two bowls meet exactly in the middle
    r1, r2 = span * 0.47, span * 0.53
    cx, rx = wdt / 2, wdt / 2 - w / 2
    top = arc(cx, h - w / 2 - r1, rx, r1, 25, 270)
    bot = arc(cx, w / 2 + r2, rx, r2, 90, -155)
    return clip(stroke(top + bot, w), 0, h)


G["S"] = s_shape(CAP + 10, 600, W * 0.9)
G["s"] = s_shape(XH, 500, W * 0.78)

SB = 25                                                  # tight side bearings, like the LPS title
UPM = 1000


def glyph(geom):
    geom = geom.buffer(-14, join_style=2).buffer(14, join_style=3)   # chamfered corners
    minx = geom.bounds[0]
    geom = affinity.translate(geom, -minx + SB, 0)
    pen = TTGlyphPen(None)
    polys = list(geom.geoms) if geom.geom_type == "MultiPolygon" else [geom]
    for p in polys:
        p = p.simplify(2)
        for ring, cw in [(p.exterior, True)] + [(r, False) for r in p.interiors]:
            pts = [(round(x), round(y)) for x, y in ring.coords[:-1]]
            if LinearRingCW(pts) != cw:
                pts = pts[::-1]
            pen.moveTo(pts[0])
            for q in pts[1:]:
                pen.lineTo(q)
            pen.closePath()
    return pen.glyph(), round(geom.bounds[2] + SB)


def LinearRingCW(pts):
    return sum((x2 - x1) * (y2 + y1) for (x1, y1), (x2, y2) in zip(pts, pts[1:] + pts[:1])) > 0


names = [".notdef", "space"] + sorted(G)
fb = FontBuilder(UPM, isTTF=True)
fb.setupGlyphOrder(names)
fb.setupCharacterMap({32: "space", **{ord(c): c for c in G}})
glyphs, metrics = {".notdef": TTGlyphPen(None).glyph(), "space": TTGlyphPen(None).glyph()}, {".notdef": (500, 0), "space": (260, 0)}
for c, g in G.items():
    gl, adv = glyph(g)
    glyphs[c] = gl; metrics[c] = (adv, SB)
fb.setupGlyf(glyphs)
fb.setupHorizontalMetrics(metrics)
fb.setupHorizontalHeader(ascent=900, descent=-300)
fb.setupNameTable({"familyName": "PunkPoly", "styleName": "Black"})
fb.setupOS2(sTypoAscender=900, sTypoDescender=-300, usWinAscent=900, usWinDescent=300)
fb.setupPost()
out = os.path.join(H, "PunkPoly-Black.ttf")
fb.save(out)
print(out)
