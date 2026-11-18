"""v2 keyframe DSL: animlib keys/arms/legs + a whole-clip solve with secondary motion.
clip = Clip2(name, frames, loop) ; .k(frame, **channels) ; .add = f(frame, P) additive ; .post = f(frame, P) before the final solve
secondary motion (applied over the whole clip, loops are simulated to steady state):
  .follow  = {channel: (hz, zeta)}   damped spring on a numeric channel (head / neck / chest lag behind the body = overlap)
  .drag    = {"L": k, "R": k}        hands lag behind their world path by k (0 = pinned contact, 1 = full spring lag)
  .wrdrag  = {"L": k, "R": k}        the wrist flops against the hand's acceleration (follow-through), deg per (m/s^2)
  .skirt   = gain                    skirt panels swing against the pelvis motion (lag + flare) and twist with the hips
Faces: by default taken from the v1 clip of the same name (the face-expression work lives in clips*.py)."""
import numpy as np
from scipy.interpolate import PchipInterpolator
import core as C
from animlib import REST_A, IDLE_F, foot_ank, BOOT, NONBOOT, NUM, wave, breathe
import animlib as _AL


class A(_AL.A):
    """arm key: wrist target t in space sp, elbow pole (chest space), wr = wrist euler offset, hand = (fingers, palm)
    directions in the target space (rotated with it); with hand set, wr is an extra offset in the forearm frame"""
    def __init__(self, t, sp="chest", pole=(0.6, 0.6, -0.2), wr=(0, 0, 0), hand=None):
        super().__init__(t, sp, pole, wr)
        self.hand = None if hand is None else (C.nrm(np.asarray(hand[0], float)), C.nrm(np.asarray(hand[1], float)))


# his_idle's right fist, moved slightly out from the (rebuilt, full) bust so it rests on it instead of sinking in;
# same fist orientation as his_idle (the whole fist translates)
BUST_GAIN, BUST_CAP, BUST_ARM = 0.45, 10.0, 0.12     # spring gain, soft cap (deg), coupling to the same-side hand
FIST_OUT = np.array([0.004, -0.032, 0.006])
REST_OUT_R = A(REST_A["R"].t + FIST_OUT, "chest", REST_A["R"].pole, (0, 0, 0), C.HAND0["R"])

FPS = 30.0
DEFAULT_FOLLOW = {"hx": (2.6, 0.55), "hy": (2.4, 0.5), "hz": (2.6, 0.55), "nx": (3.2, 0.6), "ny": (3.0, 0.6), "nz": (3.2, 0.6),
                  "cx": (4.0, 0.7), "cy": (3.6, 0.65), "cz": (4.0, 0.7), "clL_up": (3.5, 0.55), "clR_up": (3.5, 0.55)}


def spring(x, hz, zeta, loop, x0=None):
    """critically-ish damped follower of signal x (frames); loops: run 3 periods, keep the last"""
    x = np.asarray(x, float); n = len(x)
    w = 2 * np.pi * hz; dt = 1.0 / FPS
    seq = np.concatenate([x[:-1]] * 3 + [x]) if loop else x
    y = (seq[0] if x0 is None else x0) * np.ones_like(seq[0]); v = np.zeros_like(y); out = []
    for s in seq:
        for _ in range(4):                                   # 4 substeps (semi-implicit Euler)
            a = w * w * (s - y) - 2 * zeta * w * v; v = v + a * dt / 4; y = y + v * dt / 4
        out.append(y.copy() if hasattr(y, "copy") else y)
    out = np.array(out)
    return out[-n:]


class Clip2:
    def __init__(self, name, frames, loop=False, note=""):
        self.name, self.N, self.loop, self.note = name, frames, loop, note
        self.keys = []; self.faces = []; self.add = None; self.post = None; self.own_faces = False
        self.follow = dict(DEFAULT_FOLLOW); self.drag = {"L": 0.5, "R": 0.5}; self.wrdrag = {"L": 1.2, "R": 1.2}
        self.skirt = 1.0; self.ground = False; self.face_map = None
        self.bust = 1.0; self.bust_press = {}                 # bust spring gain; press = apex pushed back (m) e.g. by a fist
        self.press = 0.0                                       # Press.R pitch (deg): his_idle's fist pressing the right bust
        self.skirt_k = None                                    # (front, back) thigh-follow gains of the skirt panels (sits: low)

    def k(self, f, **ch):
        self.keys.append((f, ch)); return self

    def face(self, f, eyes, mouth):
        self.own_faces = True; self.faces.append([int(f) + 1, eyes, mouth]); return self

    def _states(self):
        st = {n: 0.0 for n in NUM}
        st.update(aL=REST_A["L"], aR=REST_A["R"], fL=IDLE_F["L"], fR=IDLE_F["R"], kL=None, kR=None)
        out = []
        for f, ch in sorted(self.keys, key=lambda x: x[0]):
            st = dict(st); st.update(ch); out.append((f, st))
        return out

    def _interp(self, xs, ys, f):
        xs = np.asarray(xs, float); ys = np.asarray(ys, float)
        if len(xs) == 1: return ys[0]
        if self.loop:
            N = self.N; xs2 = np.r_[xs[-3:] - N, xs, xs[:3] + N]; ys2 = np.concatenate([ys[-3:], ys, ys[:3]])
            _, u = np.unique(xs2, return_index=True); xs2, ys2 = xs2[u], ys2[u]
            return PchipInterpolator(xs2, ys2, axis=0)(f % N)
        f = np.clip(f, xs[0], xs[-1]); return PchipInterpolator(xs, ys, axis=0)(f)

    def _chan(self, name, default):
        """per-channel keys: only the keys that set this channel (so foot-only keys never put holds in the body)"""
        if not hasattr(self, "_cc"): self._cc = {}
        if name in self._cc: return self._cc[name]
        xs, ys = [], []
        for f, ch in sorted(self.keys, key=lambda x: x[0]):
            if name in ch and ch[name] is not None: xs.append(f); ys.append(ch[name])
        if not xs: xs, ys = [0], [default]
        if self.loop and len(xs) > 1 and xs[-1] == self.N: xs, ys = xs[:-1], ys[:-1]
        self._cc[name] = (xs, ys); return xs, ys

    def pose(self, f):
        P = {}
        for n in NUM:
            xs, ys = self._chan(n, 0.0); P[n] = float(self._interp(xs, ys, f))
        for s in "LR":
            xs, ys = self._chan("f" + s, IDLE_F[s]); P["_f" + s] = self._interp(xs, [np.asarray(y, float) for y in ys], f)
            xs, ys = self._chan("k" + s, None)
            P["_kdef" + s] = ys[0] is None
            P["_k" + s] = np.zeros(3) if ys[0] is None else self._interp(xs, [np.asarray(y, float) for y in ys], f)
            xs, ys = self._chan("a" + s, REST_OUT_R if s == "R" else REST_A[s]); P["_a" + s] = list(ys); P["_xa" + s] = list(xs)
        if self.add: self.add(f, P)
        return P

    def frames(self):
        return range(0, self.N + 1)

    # ------------------------------------------------------------------ whole-clip solve
    def _arm_targets(self, P, Q, H):
        out = {}
        for s in "LR":
            xs = P["_xa" + s]
            Ts, Ps, Ws, Hs = [], [], [], []
            R_, _, _ = C.space_xform("chest", Q, H)
            for a in P["_a" + s]:
                Ts.append(C.to_world(a.sp, a.t, Q, H)); Ps.append(R_ @ a.pole); Ws.append(a.wr)
                h = getattr(a, "hand", None)
                if h is not None: Rs, _, _ = C.space_xform(a.sp, Q, H); h = (Rs @ h[0], Rs @ h[1])
                Hs.append(h)
            xa, Ta = list(xs), list(Ts)
            if len(xs) > 1:                                   # arcs: big hand moves bow outward / forward
                Rn, _, _ = C.space_xform("chestN", Q, H); sg = 1 if s == "L" else -1
                xa, Ta = [xs[0]], [Ts[0]]
                for i in range(1, len(xs)):
                    d = np.linalg.norm(Ts[i] - Ts[i - 1])
                    if d > 0.12 and xs[i] - xs[i - 1] >= 4:
                        xa.append(0.5 * (xs[i - 1] + xs[i])); Ta.append(0.5 * (Ts[i - 1] + Ts[i]) + Rn @ np.array([sg * 0.06, -0.08, 0.02]) * min(1.0, d / 0.3))
                    xa.append(xs[i]); Ta.append(Ts[i])
            f = P["_f"]
            t = self._interp(xa, Ta, f); pole = self._interp(xs, Ps, f); wr = self._interp(xs, Ws, f) * ((1, 1, 1) if s == "L" else (-1, 1, -1))
            if "_dt" + s in P:
                d = np.asarray(P["_dt" + s], float)
                if P.get("_dtsp" + s) == "chestN": Rn, _, _ = C.space_xform("chestN", Q, H); d = Rn @ d
                t = t + d
            if "_dwr" + s in P: wr = wr + P["_dwr" + s]
            hand = None
            if any(h is not None for h in Hs):
                ok = [i for i, h in enumerate(Hs) if h is not None]
                Hs = [Hs[i] if Hs[i] is not None else Hs[min(ok, key=lambda j: abs(j - i))] for i in range(len(Hs))]
                fd = C.nrm(self._interp(xs, [h[0] for h in Hs], f)); pd = self._interp(xs, [h[1] for h in Hs], f)
                hand = (fd, C.nrm(pd - (pd @ fd) * fd))
                wr = np.zeros(3) + (P["_dwr" + s] if "_dwr" + s in P else 0)
            out[s] = dict(t=t, pole=pole, wr=np.asarray(wr, float), hand=hand)
        return out

    def solve_all(self):
        fr = list(self.frames()); n = len(fr)
        Ps = []
        for f in fr:
            P = self.pose(f); P["_f"] = f; Ps.append(P)
        # 1. overlap: springs on numeric channels
        for ch, (hz, z) in self.follow.items():
            x = np.array([P[ch] for P in Ps]); y = spring(x, hz, z, self.loop)
            for P, v in zip(Ps, y): P[ch] = float(v)
        # 2. body pass + arm targets
        arms = []
        for P in Ps:
            if self.press: P["_pressR"] = self.press(P["_f"]) if callable(self.press) else self.press
            for s in "LR":
                fs = P["_f" + s]; P["leg" + s] = dict(ank=foot_ank(s, fs), yaw=fs[2], heel=fs[3], pole=C.IDLE_POLE[s]); P["arm" + s] = None
            Q, H = C.solve(P); Qp = Q[C.BI["Pelvis"]]
            for s in "LR":
                P["leg" + s]["pole"] = C.IDLE_POLE[s] if P["_kdef" + s] else Qp @ C.nrm(P["_k" + s])
            arms.append(self._arm_targets(P, Q, H))
        # 3. drag + wrist follow-through
        for s in "LR":
            T = np.array([a[s]["t"] for a in arms])
            k = self.drag.get(s, 0.0)
            if k > 0:
                Ts = spring(T, 3.2, 0.6, self.loop); T = T + k * (Ts - T)
            acc = np.gradient(np.gradient(T, axis=0), axis=0) * FPS * FPS          # m/s^2
            if self.loop: acc = (np.roll(T, -1, 0) - 2 * T + np.roll(T, 1, 0)) * FPS * FPS
            accs = spring(acc, 4.0, 0.7, self.loop)
            for i, a in enumerate(arms):
                a[s]["t"] = T[i]
                if self.wrdrag.get(s, 0):
                    # flop: wrist flexes against the vertical acceleration and deviates against the sideways one
                    wk = self.wrdrag[s]; a[s]["wr"] = a[s]["wr"] + np.clip(np.array([0, -wk * accs[i][2], -wk * 0.6 * accs[i][0] * (1 if s == "L" else -1)]), -25, 25)
        out = []
        for P, a in zip(Ps, arms):
            for s in "LR": P["arm" + s] = a[s]
            if self.post: self.post(P["_f"], P)
            Q, H = C.solve(P)
            if self.ground:
                for _ in range(4):
                    V = C.skin(Q, H)
                    for s in "LR":
                        m = V[BOOT[s], 2].min()
                        if m < -0.004: P["leg" + s]["ank"] = P["leg" + s]["ank"] + [0, 0, -0.004 - m]
                    Q, H = C.solve(P); V = C.skin(Q, H)
                    body = V[NONBOOT, 2].min()
                    if body < -0.004: P["pz"] = P.get("pz", 0) + (-0.004 - body); Q, H = C.solve(P)
            out.append([P, Q, H])
        # 4a. bust: two spring bones lag behind the chest (very light), optional static press (fist on the chest)
        if "Bust.L" in C.BI and (self.bust or self.bust_press):
            ic = C.BI["Chest"]
            for s in "LR":
                ib = C.BI[f"Bust.{s}"]; ar, hr = C.Tr[ib], C.Hr[ib]; L = np.linalg.norm(ar - hr); u = C.nrm(ar - hr)
                apw = np.array([H[ic] + Q[ic] @ (ar - C.Hr[ic]) for _, Q, H in out])
                ih = C.BI[f"Hand.{s}"]                                 # arm gestures tug the bust a little (pectoral)
                wrel = np.array([Q[ic].T @ (H[ih] - H[ic]) for _, Q, H in out]); wrel -= wrel.mean(0)
                drv = apw + np.array([Q[ic] @ (BUST_ARM * w) for w, (_, Q, H) in zip(wrel, out)])
                sp_ = spring(drv, 2.3, 0.16, self.loop)          # soft spring: visible lag, a little overshoot, settles
                for i, (P, Q, H) in enumerate(out):
                    d = Q[ic].T @ (sp_[i] - drv[i]) * self.bust * BUST_GAIN * np.array([0.8, 0.8, 1.35])   # vertical bounce reads most
                    d = d + np.array([0, 1.0, 0.25]) * self.bust_press.get(s, 0.0)
                    dp = d - (d @ u) * u; ang = np.degrees(np.linalg.norm(dp) / L)
                    cap = BUST_CAP + 40 * self.bust_press.get(s, 0.0)
                    P["_bust" + s] = C.axang(np.cross(u, dp), cap * np.tanh(ang / cap))          # soft limit, no hard stop
                    P["_bustraw" + s] = ang
        # 4. skirt: swings against the pelvis (lag of a spring-follower of the pelvis hem point), twist lag, bounce flare
        if self.skirt or "Bust.L" in C.BI:
            ip = C.BI["Pelvis"]
            hem = np.array([H[ip] + Q[ip] @ np.array([0, 0, -0.17]) for _, Q, H in out])
            yaw = np.unwrap(np.array([np.arctan2(Q[ip][1, 0], Q[ip][0, 0]) for _, Q, H in out]))
            hs = spring(hem, 1.8, 0.32, self.loop); ys = spring(yaw, 2.0, 0.35, self.loop)
            for i, (P, Q, H) in enumerate(out):
                Qp = Q[ip]; d = Qp.T @ (hs[i] - hem[i])           # lag in pelvis frame
                d = np.clip(d, -0.06, 0.06)
                ax = np.cross([0, 0, 1.0], d); ang = np.degrees(np.linalg.norm(d) / 0.17) * 0.9 * self.skirt
                Rx = C.axang(ax, ang) @ C.axang([0, 0, 1], np.degrees(ys[i] - yaw[i]) * 0.6 * self.skirt)
                P["_skirt"] = dict(R=Rx, flare=float(np.clip(d[2] * 260 * self.skirt, -4, 9)))
                if self.skirt_k: P["_skirt"]["kf"], P["_skirt"]["kb"] = self.skirt_k
            for i, (P, Q, H) in enumerate(out):
                Q2, H2 = C.solve(P); out[i] = [P, Q2, H2]
        return [(Q, H) for _, Q, H in out]

    def solve(self, f):
        if not hasattr(self, "_cache"): self._cache = self.solve_all()
        return self._cache[int(f)]
