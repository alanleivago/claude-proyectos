"""ref/<mesh>.npz (fitted + textured) -> ref/rig_in.npz for bl_rig.py (joints + weights + absolute texture paths)"""
import sys, os, json, numpy as np
sys.path.insert(0, "tools")
import joints as JT
D = dict(np.load(sys.argv[1], allow_pickle=True))
if 'joints' in D: J = {k: np.array(v) for k, v in json.loads(str(D['joints'])).items()}
else:
    J = JT.estimate(D)
    for k_, v_ in json.loads(str(D['hips'])).items(): J[k_] = np.array(v_)
    J["pelvis"] = 0.5 * (J["hipL"] + J["hipR"]) + [0, 0, -0.035]
W = JT.weights(D, J)
for k, v in J.items(): print(f"{k:10s}", np.round(v, 3))
root = os.path.abspath(".").replace("\\", "/")
tex = np.array([f"{root}/tex/body.jpg", f"{root}/tex/face_eyes.png", f"{root}/tex/face_mouth.png"])
np.savez(sys.argv[2], V=D["V"], F=D["F"], FUV=D["FUV"], FMAT=D["FMAT"], joints=json.dumps({k: v.tolist() for k, v in J.items()}),
         weights=json.dumps(W), tex=tex)
print("rig_in written", sys.argv[2])
