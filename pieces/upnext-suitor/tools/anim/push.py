"""Clip-level arm push-out (no per-frame jitter): per frame the penetration of the arm into the body / the other arm gives a
correction of the wrist target (and the elbow pole when the sleeve is in), the corrections are spread in time with a peak-
keeping raised-cosine envelope + gaussian, applied, and the rounds repeat. Corrections live in the chest frame."""
import numpy as np
import author as A
import check as C


def gsmooth(arr, loop, sigma):
    arr = np.asarray(arr, float); n = len(arr)
    if sigma <= 0 or n < 3: return arr.copy()
    r = int(np.ceil(3 * sigma)); k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2); k /= k.sum(); out = np.zeros_like(arr)
    for j, w in zip(range(-r, r + 1), k):
        idx = (np.arange(n) + j) % n if loop else np.clip(np.arange(n) + j, 0, n - 1); out += w * arr[idx]
    return out


def envelope(V, loop, half=5, sigma=1.6):
    V = np.asarray(V, float); n = len(V); mag = np.linalg.norm(V, axis=1); E = np.zeros_like(V); best = np.zeros(n)
    for j in np.nonzero(mag > 1e-6)[0]:
        for k in range(-half, half + 1):
            i = (j + k) % n if loop else j + k
            if not (0 <= i < n): continue
            w = 0.5 * (1 + np.cos(np.pi * k / (half + 1)))
            if w * mag[j] > best[i]: best[i] = w * mag[j]; E[i] = w * V[j]
    return gsmooth(E, loop, sigma)


def frame_pen(V, s, BF_arm, BF_hand, other_faces, aa_allow=0.0, cuff_in=False):
    """worst inward depth and outward push direction for side s"""
    hv = np.union1d(C.HANDV[s], np.intersect1d(C.LOWARM[s], C.ARMV[s])) if cuff_in else C.HANDV[s]
    nonhand = np.setdiff1d(C.ARMV[s], hv); best = (0.0, None, False)
    for pts, faces, is_hand in ((nonhand, BF_arm, False), (hv, BF_hand, True), (C.LOWARM[s], other_faces, True)):
        d, nn = C.sdepth(V, pts, faces, maxd=0.10 if faces is not other_faces else 0.05, normals=True)
        if faces is other_faces: d = np.where(d > aa_allow, d - aa_allow, 0.0)
        m = d > 0.002
        if not m.any(): continue
        g = (nn[m] * d[m, None]).sum(0); dm = float(d.max())
        if dm > best[0]: best = (dm, g, not is_hand)
    return best


def push_clip(c, frames, rounds=5):
    """frames: list of (Q_body_legs, Hp, pv, targets) -> corrected targets / poles per frame"""
    loop = c.get("loop", False); n = len(frames); ic = A.BI["Chest"]
    allow = c.get("allow", {}); BF_arm = C.body_faces([]); BF_hand = C.body_faces(allow.get("hand_in", []))
    corr_t = {s: np.zeros((n, 3)) for s in "LR"}; corr_p = {s: np.zeros((n, 3)) for s in "LR"}
    worst = 0.0
    for rnd in range(rounds + 1):
        dt = {s: np.zeros((n, 3)) for s in "LR"}; dp = {s: np.zeros((n, 3)) for s in "LR"}; worst = 0.0
        out = []
        for f, (Qb, Hp, pv, tg) in enumerate(frames):
            Q, H, pv2, tg2 = apply(Qb, Hp, pv, tg, corr_t, corr_p, f)
            V = A.skin(Q, H); out.append((Q, H))
            if rnd == rounds: continue
            for s in "LR":
                o = "R" if s == "L" else "L"
                dm, g, upper = frame_pen(V, s, BF_arm, BF_hand, C.ARMF[o], allow.get("arm_arm", 0) / 1000, allow.get("cuff_in", False))
                worst = max(worst, dm)
                if dm <= 0.002: continue
                g = g / (np.linalg.norm(g) + 1e-12)
                if np.linalg.norm(g) < 0.3: g = Q[ic] @ np.array([0, -1.0, 0])
                step = Q[ic].T @ (g * (dm + 0.005))
                dt[s][f] = step
                if upper: dp[s][f] = step / (np.linalg.norm(step) + 1e-9) * min(1.0, dm * 20)
        if rnd == rounds or worst <= 0.002: break
        for s in "LR":
            corr_t[s] += envelope(dt[s], loop); corr_p[s] += envelope(dp[s], loop)
            mag = np.linalg.norm(corr_t[s], axis=1, keepdims=True)                 # > 6 cm = a design error: leave it to the checker
            corr_t[s] *= np.minimum(1.0, 0.06 / np.maximum(mag, 1e-9))
    return [apply(Qb, Hp, pv, tg, corr_t, corr_p, f)[:2] for f, (Qb, Hp, pv, tg) in enumerate(frames)]


def apply(Qb, Hp, pv, tg, corr_t, corr_p, f):
    Q = Qb.copy(); ic = A.BI["Chest"]; pv2 = dict(pv); tg2 = {}
    for s in "LR":
        tg2[s] = tg[s] + Q[ic] @ corr_t[s][f]
        if np.linalg.norm(corr_p[s][f]) > 1e-6:
            sg = 1 if s == "L" else -1; po = np.array(pv["pole" + s], float)
            cur = A.B(sg * po[0], po[1], po[2]); cur = cur / np.linalg.norm(cur) + np.clip(corr_p[s][f], -0.5, 0.5) * 0.8
            back = A.MX @ cur if s == "R" else cur                       # back to (out, fwd, up)
            pv2["pole" + s] = np.array([back[0], -back[1], back[2]])
    Q = A.solve_arms(Q, Hp, pv2, tg2)
    return Q, A.fk(Q, Hp), pv2, tg2
