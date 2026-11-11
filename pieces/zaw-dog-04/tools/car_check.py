"""Blender: review/car_check_*.png - the v2 car close (3/4 front, side), parked on the road."""
import sys
B = "/Users/alanleiva/claude-proyectos/pieces/zaw-dog-01/build.py"
sys.argv = ["blender", "--", "none"]
g = {"__file__": B, "__name__": "__main__"}
exec(compile(open(B).read(), B, "exec"), g)
out = "/Users/alanleiva/claude-proyectos/pieces/zaw-dog-01/review/"
g["reset"](); g["CAR"].location = (0, 10.6, -0.04)
g["cam"]((-4.2, 6.6, 1.5), (0, 10.6, 0.7), 26); g["render"](out + "car_check_34.png", (540, 960))
g["cam"]((0.3, 6.0, 1.2), (0, 10.6, 0.8), 26); g["render"](out + "car_check_side.png", (540, 960))
