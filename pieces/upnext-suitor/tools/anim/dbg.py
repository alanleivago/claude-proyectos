"""python -I tools/anim/dbg.py clip frame : worst arm verts and the body part they enter"""
import sys, numpy as np
sys.path.insert(0, __import__("os").path.dirname(__file__))
import check as C, author as A, clips as CL
c = CL.CLIPS[sys.argv[1]]; f = int(sys.argv[2])
res = A.run_clip(c); Q, H = res[f]; V = A.skin(Q, H)
for s in "LR":
    for part in C.BODY_PARTS:
        BF = C.F[C.FP == part]
        if not len(BF): continue
        d = C.sdepth(V, C.ARMV[s], BF)
        if d.max() > 0.002:
            j = d.argmax(); v = C.ARMV[s][j]
            print(s, part, f"{d.max()*1000:.1f}mm", "vert", v, A.VPART[v], "rest", np.round(A.Vr[v], 3), "now", np.round(V[v], 3), "n", int((d > 0.002).sum()))
    o = "R" if s == "L" else "L"; d = C.sdepth(V, C.LOWARM[s], C.ARMF[o], maxd=0.05)
    if d.max() > 0.002: v = C.LOWARM[s][d.argmax()]; print(s, "into arm", o, f"{d.max()*1000:.1f}mm", A.VPART[v], "now", np.round(V[v], 3))
for s in "LR": print(s, "wrist", np.round(H[A.BI[f"Hand.{s}"]], 3), "elbow", np.round(H[A.BI[f"Forearm.{s}"]], 3))
