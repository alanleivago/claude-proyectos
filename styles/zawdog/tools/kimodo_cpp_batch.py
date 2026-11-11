"""Option A (no Hugging Face login): prompts.txt -> BVH with kimodo.cpp (public GGUF weights) + Blender.
Works on the Mac (CPU) and on Windows (Vulkan on the NVIDIA card, else CPU). Python 3 standard library only.
    python styles/zawdog/tools/kimodo_cpp_batch.py --kimodo <kimodo.cpp folder> --blender <blender executable>
           [--prompts styles/zawdog/motions/kimodo/prompts.txt] [--text Llama-3-Kimodo-Q8_0.gguf] [--steps 100] [--seed 42] [--only name1,name2]
prompts.txt: one "name | prompt | seconds" per line (# = comment). Output: styles/zawdog/motions/kimodo/<name>.bvh
(30 fps, Y up, metres, SOMA 30 joints), then on the Mac: Blender -b -P styles/zawdog/tools/retarget.py -- <bvh> <action>."""
import argparse
import glob
import os
import subprocess
import sys

ZD = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
ap = argparse.ArgumentParser()
ap.add_argument("--kimodo", required=True, help="kimodo.cpp folder (built, weights downloaded into it)")
ap.add_argument("--blender", required=True, help="Blender executable (blender.exe on Windows)")
ap.add_argument("--prompts", default=os.path.join(ZD, "motions", "kimodo", "prompts.txt"))
ap.add_argument("--text", default=None, help="text encoder GGUF (default: the first Llama-3-Kimodo-*.gguf found)")
ap.add_argument("--steps", type=int, default=100)
ap.add_argument("--seed", type=int, default=42)
ap.add_argument("--only", default="")
a = ap.parse_args()

K = os.path.abspath(a.kimodo)
exe = next((p for p in glob.glob(os.path.join(K, "build", "**", "kmd-generate*"), recursive=True)
            if os.path.isfile(p) and not p.endswith((".d", ".o", ".obj", ".pdb"))), None)
motion = next(iter(glob.glob(os.path.join(K, "models", "kimodo-soma-seed-*.gguf"))), None)
text = a.text or next(iter(sorted(glob.glob(os.path.join(K, "Llama-3-Kimodo-*.gguf")))), None)
if not (exe and motion and text):
    sys.exit(f"missing: kmd-generate={exe} motion={motion} text={text}")
if "rp" in os.path.basename(motion).lower() or "smplx" in os.path.basename(motion).lower():
    sys.exit("only the SOMA-SEED model (commercial-OK) is allowed here")
out_dir = os.path.join(ZD, "motions", "kimodo"); work = os.path.join(K, "out"); os.makedirs(work, exist_ok=True)
only = {x.strip() for x in a.only.split(",") if x.strip()}
for line in open(a.prompts, encoding="utf-8"):
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    name, prompt, secs = [x.strip() for x in line.split("|")]
    if only and name not in only:
        continue
    d = os.path.join(work, name); os.makedirs(d, exist_ok=True)
    pf = os.path.join(d, "prompt.txt"); open(pf, "w", encoding="utf-8").write(prompt)
    frames = max(30, round(float(secs) * 30))
    print(f"[{name}] {prompt} ({frames} frames)", flush=True)
    subprocess.run([exe, motion, text, pf, str(frames), str(a.steps), str(a.seed), d], check=True)
    bvh = os.path.join(out_dir, name + ".bvh")
    subprocess.run([a.blender, "-b", "--python", os.path.join(ZD, "tools", "kimodo_cpp_to_bvh.py"), "--", d, bvh,
                    os.path.join(K, "scripts", "export_glb.py")], check=True)
    print("  ->", bvh, flush=True)
