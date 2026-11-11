import sys, math
B = "/Users/alanleiva/claude-proyectos/pieces/zaw-dog-01/build.py"
sys.argv = ["blender", "--", "none"]
g = {"__file__": B, "__name__": "__main__"}
exec(compile(open(B).read(), B, "exec"), g)
out = "/Users/alanleiva/claude-proyectos/pieces/zaw-dog-01/review/people/"
import os; os.makedirs(out, exist_ok=True)
g["reset"](); O, F = g["OWNER"], g["FRIEND"]
O.show(True, (0.3, -0.7, 0), math.radians(-15)); O.arms_down()
g["cam"]((0.5, -2.15, 1.05), (0.3, -0.7, 0.95), 26); g["render"](out + "owner_full.png", (540, 960))
g["cam"]((0.42, -1.25, 1.68), (0.3, -0.7, 1.64), 30); g["render"](out + "owner_face.png", (540, 960))
O.show(True, (0.3, -0.7, 0), math.radians(160)); O.walk(0.35, 0.7)
g["cam"]((0.35, -2.1, 1.05), (0.3, -0.7, 0.95), 26); g["render"](out + "owner_back_walk.png", (540, 960))
O.show(False); F.show(True, (0.3, -0.7, 0), math.radians(-15)); F.arms_down()
g["cam"]((0.5, -2.15, 1.0), (0.3, -0.7, 0.9), 26); g["render"](out + "friend_full.png", (540, 960))
