"""One-off: v4 parts -> v5/pieces.json (one entry per rigid piece, his outliner breakdown). Run in Blender."""
import bpy, json
src = open(r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl/build.py").read().split('if __name__ == "__main__" or True:')[0]
exec(src, globals())
B = build_mesh(); bm = B.bm
bm.verts.index_update()
groups = {}
for f in bm.faces:
    part = B.names[f[B.part]]
    c = f.calc_center_median()
    if part.startswith("leg"): part = ("LegUpper." if c.z > -4.3 else "LegLower.") + part[-1]
    elif part.startswith("boot"): part = "Boot." + part[-1]
    elif part.startswith("foot"): part = "Foot." + part[-1]
    elif part.startswith("arm"): part = ("UpperArm." if abs(c.x) < 2.5 else "Forearm.") + part[-1]
    elif part.startswith("hand"): part = "Hand." + part[-1]
    elif part == "ear": part = "Ears"
    else: part = {"head": "Head", "hair": "Hair", "nose": "Nose", "top": "Torso", "skirt": "Skirt", "scarf": "Neck",
                  "shawl": "Sleeves"}[part]
    groups.setdefault(part, []).append(f)
BONE = {"Head": "Head", "Hair": "Head", "Nose": "Head", "Ears": "Head", "Neck": "Neck", "Torso": "Chest", "Sleeves": "Chest",
        "Skirt": "Pelvis"}
out = {}
for name, fs in groups.items():
    vid = {}; verts = []; faces = []
    for f in fs:
        row = []
        for v in f.verts:
            if v.index not in vid: vid[v.index] = len(verts); verts.append([round(x, 4) for x in v.co])
            row.append(vid[v.index])
        faces.append(row)
    s = name.split(".")
    bone = BONE.get(name) or {"LegUpper": "Thigh", "LegLower": "Calf", "Boot": "Calf", "Foot": "Foot", "UpperArm": "UpperArm",
                              "Forearm": "Forearm", "Hand": "Hand"}[s[0]] + "." + s[1]
    out[name] = dict(bone=bone, verts=verts, faces=faces)
json.dump(out, open(r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl/v5/pieces.json", "w"), indent=0)
print({k: (v["bone"], len(v["verts"]), len(v["faces"])) for k, v in out.items()})
