"""Taubin (non-shrinking) smoothing of chosen parts. python tools/taubin.py <in.npz> <out.npz> hair,face [iters] [lam]"""
import sys, numpy as np
D = dict(np.load(sys.argv[1], allow_pickle=True)); V = D["V"].copy(); F = D["F"]; P = D["P"]; names = list(D["names"])
parts = sys.argv[3].split(","); it = int(sys.argv[4]) if len(sys.argv) > 4 else 20; lam = float(sys.argv[5]) if len(sys.argv) > 5 else 0.5
mov = np.zeros(len(V), bool)
for fi in np.nonzero(np.isin(P, [names.index(p) for p in parts]))[0]: mov[F[fi]] = True
E = np.unique(np.sort(np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]]), 1), axis=0)
I = np.concatenate([E[:, 0], E[:, 1]]); J = np.concatenate([E[:, 1], E[:, 0]]); deg = np.bincount(I, minlength=len(V)).astype(float)
for _ in range(it):
    for l in (lam, -lam * 1.06):
        ns = np.zeros_like(V); np.add.at(ns, I, V[J]); L = ns / np.maximum(deg, 1)[:, None] - V; L[~mov] = 0; V += l * L
D["V"] = V; np.savez(sys.argv[2], **D); print("taubin", parts, it, "iters; max move mm", np.abs(V - D["V"]).max() * 1000 if False else np.abs(V - np.load(sys.argv[1])["V"]).max() * 1000)
