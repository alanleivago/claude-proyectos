import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine", "d06_body.js")
s = open(p, encoding="utf-8").read()
R = [
# stews: her face above the caption band
("[[0.1, 1.4, 3.2], [0.08, 1.38, 3.0]], SIDE ? [[0.05, 0.8, 0.1]] : [[0.0, 1.2, 0.0]], 48);", "[[0.1, 1.15, 3.2], [0.08, 1.13, 3.0]], SIDE ? [[0.05, 0.8, 0.1]] : [[0.0, 0.8, 0.0]], 48);"),
# CLOSED on the wall between her and Henry (the tub sign was hidden behind her)
("{ size: 0.1, x: -0.95, y: 0.86, z: 0.35,", "{ size: 0.16, x: -0.6, y: 2.0, z: -1.7,"),
# bigger strigil
("sg.scale.setScalar(1.25);", "sg.scale.setScalar(1.6);"),
]
for a, b in R:
    assert s.count(a) == 1, a[:70]
    s = s.replace(a, b)
open(p, "w", encoding="utf-8").write(s); print("ok")
