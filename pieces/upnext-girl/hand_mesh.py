"""Hand-placed pieces of his Ashley, piece breakdown as in his outliner (10:40): Head, Ears, Hair (Cone), Neck,
Torso, Sleeves (shawl), Waist, Skirt, LegsUpper, LegsLower (boots), Arms. Every vertex below was read off his frames
(rest pose in his viewport 11:29-11:37: side t689, front t691/t697; turntable 12:14-12:44 for widths and the back),
in model units (sole z = -9, top of hair z = 4.24, she faces -Y, +X = her left). Used by build.py (exec'd there)."""


def piece(B, part, verts, faces, mirror=False):
    """verts: list of (x, y, z); faces: index tuples. mirror=True adds the -X copy with flipped winding."""
    bm = B.bm; pi = B.pid(part)
    for sgn in ((1, -1) if mirror else (1,)):
        vs = [bm.verts.new((x * sgn, y, z)) for x, y, z in verts]
        for f in faces:
            idx = f if sgn > 0 else f[::-1]
            bm.faces.new([vs[i] for i in idx])[B.part] = pi


def ring_faces(nrows, n, skip=()):
    out = []
    for i in range(nrows - 1):
        for j in range(n):
            if (i, j) in skip: continue
            out.append((i * n + j, i * n + (j + 1) % n, (i + 1) * n + (j + 1) % n, (i + 1) * n + j))
    return out


def full_ring(right4):
    """right half (x>=0) of an 8-vert ring, ordered front, side-front, side-back, back -> full ring
    in loft order: 0 front-R, 1 side-front-R, 2 side-back-R, 3 back-R, 4 back-L, 5 side-back-L, 6 side-front-L, 7 front-L"""
    (fx, fy, fz), (sx, sy, sz), (bx, by, bz), (kx, ky, kz) = right4
    return [(fx, fy, fz), (sx, sy, sz), (bx, by, bz), (kx, ky, kz), (-kx, ky, kz), (-bx, by, bz), (-sx, sy, sz), (-fx, fy, fz)]


def hand_pieces(B, FACE_K, FZ0, FZ1, FACE_SPLIT_Z):
    # ---------------- HEAD (his Cube.008): face plane in front (his 51x55 cell), jaw, chin, skull inside the hair
    W = 1.02
    k = FACE_K / W
    B.loft("head", [(FZ0, 0, -0.62, 0.30, 0.14), (1.74, 0, -0.16, 0.84, 0.82), (FACE_SPLIT_Z, 0, -0.10, W, 0.92),
                    (FZ1, 0, -0.06, W, 0.96), (3.55, 0, 0.0, 0.98, 1.00), (4.02, 0, 0.10, 0.70, 0.80)],
           n=8, k=k, cap0=True, cap1=True)
    # nose: the pointed profile of his side view (tip y -1.13 at z 2.27)
    piece(B, "nose", [(0.0, -1.13, 2.27), (0.11, -1.00, 2.42), (0.11, -1.00, 2.16), (-0.11, -1.00, 2.16), (-0.11, -1.00, 2.42)],
          [(0, 1, 4), (0, 2, 1), (0, 3, 2), (0, 4, 3)])
    # ears (his "Ears" object): skin flaps in front of the hair side, z 2.17-2.93, y -0.02..0.42
    piece(B, "ear", [(1.03, -0.02, 2.88), (1.18, 0.42, 2.93), (1.16, 0.40, 2.17), (1.02, -0.02, 2.26)], [(0, 1, 2, 3)], mirror=True)

    # ---------------- HAIR (his Cone): traced rows (z, right half: front, side-front, side-back, back)
    R = [
        full_ring([(0.10, 0.08, 4.24), (0.16, 0.40, 4.24), (0.16, 0.78, 4.22), (0.10, 1.00, 4.20)]),          # crown ridge
        full_ring([(0.36, -0.78, 4.05), (0.62, -0.30, 4.08), (0.62, 0.62, 4.08), (0.36, 1.13, 4.05)]),
        full_ring([(0.60, -1.04, 3.62), (1.12, -0.62, 3.65), (1.12, 0.95, 3.65), (0.60, 1.38, 3.62)]),
        full_ring([(0.66, -1.17, 3.15), (1.26, -0.60, 3.10), (1.26, 1.05, 3.12), (0.66, 1.44, 3.12)]),
        full_ring([(0.70, -1.08, 2.86), (1.33, 0.30, 2.86), (1.32, 1.08, 2.86), (0.68, 1.47, 2.86)]),          # fringe edge; temple open above the ear
        full_ring([(0.70, 0.40, 2.45), (1.31, 0.42, 2.45), (1.31, 1.12, 2.45), (0.68, 1.49, 2.45)]),           # side panel behind the ear
        full_ring([(0.70, 0.21, 2.08), (1.24, 0.21, 2.08), (1.25, 1.12, 2.08), (0.66, 1.51, 2.08)]),           # lower (salmon) tier
        full_ring([(0.70, 0.22, 1.70), (1.12, 0.22, 1.70), (1.13, 1.02, 1.70), (0.60, 1.40, 1.70)]),
        full_ring([(0.60, 0.15, 1.40), (0.94, 0.14, 1.40), (0.94, 0.82, 1.40), (0.50, 1.05, 1.40)]),
    ]
    # fringe parts high over her right eye and sweeps low over her left one
    R[4][7] = (-0.70, -1.10, 2.98); R[4][0] = (0.70, -1.06, 2.82)
    verts = [v for row in R for v in row]
    skip = {(i, j) for i in range(4, len(R) - 1) for j in (7, 0, 6)}
    faces = ring_faces(len(R), 8, skip) + [tuple(range(8))[::-1]]
    piece(B, "hair", verts, faces)
