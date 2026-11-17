"""Keyframe DSL on top of core.solve.
clip = Clip(name, frames, loop) ; clip.k(frame, **channels) ; clip.add = f(frame, P) additive ; clip.face(frame, eyes, mouth)
numeric channels: px py pz prx pry prz | sx sy sz | cx cy cz | nx ny nz | hx hy hz | clL_up clL_fw clR_up clR_fw
arms:  aL / aR = A(target, space, pole, wr)  (pole = direction in chest space; wr = wrist twist/flex/dev deg)
legs:  fL / fR = (x, y, yaw, heel, lift)  ankle xy for a flat foot, yaw deg vs his_idle, heel deg raise (pivot on the ball), lift m
       kL / kR = knee pole direction in pelvis space
Interpolation: monotone cubic (PCHIP) per channel across keys (periodic for loops); a key's channels persist until changed."""
import numpy as np
from scipy.interpolate import PchipInterpolator
import core as C

FPS = 30


class A:
    def __init__(self, t, sp="chest", pole=(0.6, 0.6, -0.2), wr=(0, 0, 0)):
        self.t, self.sp, self.pole, self.wr = np.asarray(t, float), sp, np.asarray(pole, float), np.asarray(wr, float)


# rest arm (his_idle arm) as an IK spec
def rest_arm(s):
    iu, il, ih = C.BI[f"UpperArm.{s}"], C.BI[f"Forearm.{s}"], C.BI[f"Hand.{s}"]
    sh, el, wr = C.Hr[iu], C.Hr[il], C.Hr[ih]; u = C.nrm(wr - sh); pole = (el - sh) - ((el - sh) @ u) * u
    return A(wr, "chest", C.nrm(pole), (0, 0, 0))


REST_A = {s: rest_arm(s) for s in "LR"}
# his_idle feet as foot specs
IDLE_F = {s: (C.IDLE_ANK[s][0], C.IDLE_ANK[s][1], 0.0, 0.0, 0.0, 0.0) for s in "LR"}


def _sole_pts():
    V = C.G["V"]; out = {}
    for s in "LR":
        idx = np.nonzero(np.isin(C.LAB, [c for c, d in C.CDOM.items() if d == "Calf." + s]))[0]; P = V[idx]
        low = P[P[:, 2] < 0.02]; t = (low[:, :2] - C.IDLE_ANK[s][:2]) @ C.FOOTDIR[s][:2]
        toe = low[t.argmax()].copy(); heel = low[t.argmin()].copy(); toe[2] = heel[2] = 0.0
        out[s] = (toe, heel)
    return out


SOLEPT = _sole_pts()
BOOT = {s: np.nonzero(np.isin(C.LAB, [c for c, d in C.CDOM.items() if d == "Calf." + s]))[0] for s in "LR"}
NONBOOT = np.setdiff1d(np.arange(len(C.Vr)), np.r_[BOOT["L"], BOOT["R"]])


def foot_ank(s, spec):
    """ankle target for a foot spec; a heel raise pivots on the toe tip, a toe raise (heel < 0) on the heel"""
    x, y, yaw, heel, lift = spec[:5]
    if len(spec) > 5 and spec[5] > 0.5: return np.array([x, y, lift])     # absolute ankle, foot pitched about the ankle
    ank0 = C.IDLE_ANK[s]; piv0 = SOLEPT[s][0] if heel >= 0 else SOLEPT[s][1]
    Rz = C.axang([0, 0, 1], yaw); lat = C.nrm(np.cross(C.FOOTDIR[s], [0, 0, 1]))
    flat_ank = np.array([x, y, ank0[2] + lift])
    piv = flat_ank + Rz @ (piv0 - ank0)
    return piv + Rz @ C.axang(lat, -heel) @ (ank0 - piv0)


NUM = "px py pz prx pry prz sx sy sz cx cy cz nx ny nz hx hy hz clL_up clL_fw clR_up clR_fw".split()


class Clip:
    def __init__(self, name, frames, loop=False, note=""):
        self.name, self.N, self.loop, self.note = name, frames, loop, note
        self.keys = []; self.faces = []; self.add = None; self.post = None

    def k(self, f, **ch):
        self.keys.append((f, ch)); return self

    def face(self, f, eyes, mouth):
        self.faces.append([int(f) + 1, eyes, mouth]); return self

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

    def pose(self, f):
        S = self._states(); xs = [s[0] for s in S]
        if self.loop and xs[-1] == self.N: S = S[:-1]; xs = xs[:-1]       # key at N == key at 0
        P = {n: float(self._interp(xs, [s[1][n] for s in S], f)) for n in NUM}
        for s in "LR":
            P["_f" + s] = self._interp(xs, [np.asarray(st["f" + s], float) for _, st in S], f)
            kp = [st["k" + s] if st["k" + s] is not None else (0, 0, 0) for _, st in S]
            P["_k" + s] = self._interp(xs, kp, f); P["_kdef" + s] = all(st["k" + s] is None for _, st in S)
            P["_a" + s] = [st["a" + s] for _, st in S]
        P["_xs"] = xs
        if self.add: self.add(f, P)
        return P

    def solve(self, f):
        P = self.pose(f); xs = P["_xs"]
        for s in "LR":
            fs = P["_f" + s]
            P["leg" + s] = dict(ank=foot_ank(s, fs), yaw=fs[2], heel=fs[3], pole=None)
        # body pass (pelvis frame for knee poles, chest frame for arm targets)
        for s in "LR":
            P["leg" + s]["pole"] = C.IDLE_POLE[s]
            P["arm" + s] = None
        Q, H = C.solve(P)
        Qp = Q[C.BI["Pelvis"]]
        for s in "LR":
            P["leg" + s]["pole"] = C.IDLE_POLE[s] if P["_kdef" + s] else Qp @ C.nrm(P["_k" + s])
            Ts, Ps, Ws = [], [], []
            for a in P["_a" + s]:
                Ts.append(C.to_world(a.sp, a.t, Q, H)); R_, _, _ = C.space_xform("chest", Q, H); Ps.append(R_ @ a.pole); Ws.append(a.wr)
            # arcs: a big hand move between two keys bows outward / forward (in the chest frame) so it never cuts through
            # the skirt or the body on the way
            xa, Ta = list(xs), list(Ts)
            if len(xs) > 1:
                R_, _, _ = C.space_xform("chestN", Q, H); sg = 1 if s == "L" else -1
                xa, Ta = [xs[0]], [Ts[0]]
                for i in range(1, len(xs)):
                    d = np.linalg.norm(Ts[i] - Ts[i - 1])
                    if d > 0.12 and xs[i] - xs[i - 1] >= 4:
                        xa.append(0.5 * (xs[i - 1] + xs[i])); Ta.append(0.5 * (Ts[i - 1] + Ts[i]) + R_ @ np.array([sg * 0.06, -0.08, 0]) * min(1.0, d / 0.3))
                    xa.append(xs[i]); Ta.append(Ts[i])
            t = self._interp(xa, Ta, f); pole = self._interp(xs, Ps, f); wr = self._interp(xs, Ws, f) * ((1, 1, 1) if s == "L" else (-1, 1, -1))
            if "_dt" + s in P: t = t + P["_dt" + s]
            if "_dwr" + s in P: wr = wr + P["_dwr" + s]
            P["arm" + s] = dict(t=t, pole=pole, wr=wr)
        if self.post: self.post(f, P)
        Q, H = C.solve(P)
        if getattr(self, "ground", False):          # keep every part of her above the floor (feet first, then the pelvis)
            for _ in range(2):
                V = C.skin(Q, H); dz = 0.0
                for s in "LR":
                    m = V[BOOT[s], 2].min()
                    if m < -0.004: P["leg" + s]["ank"] = P["leg" + s]["ank"] + [0, 0, -0.004 - m]
                Q, H = C.solve(P); V = C.skin(Q, H)
                body = V[NONBOOT, 2].min()
                if body < -0.004: P["pz"] = P.get("pz", 0) + (-0.004 - body); Q, H = C.solve(P)
        return Q, H

    def frames(self):
        return range(0, self.N + 1)


def wave(f, period, phase=0.0):
    return np.sin(2 * np.pi * (f / period + phase))


def breathe(P, f, period=90, amt=1.0):
    w = wave(f, period)
    P["cx"] -= 1.2 * amt * w; P["sx"] += 0.4 * amt * w; P["clL_up"] += 1.2 * amt * w; P["clR_up"] += 1.2 * amt * w; P["hx"] += 0.6 * amt * w
