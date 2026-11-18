"""python -I tools/glb_info.py out/suitor.glb : joints, animations, materials, mesh counts"""
import json, struct, sys
b = open(sys.argv[1], "rb").read(); n = struct.unpack("<I", b[12:16])[0]; J = json.loads(b[20:20 + n])
sk = J["skins"][0]; print("joints", len(sk["joints"]), [J["nodes"][j]["name"] for j in sk["joints"]])
print("animations", len(J["animations"])); print("materials", [m["name"] for m in J["materials"]])
print("meshes", [(m["name"], len(m["primitives"])) for m in J["meshes"]]); print("images", len(J.get("images", [])), "bytes", len(b))
