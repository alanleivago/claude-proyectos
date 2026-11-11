"""Batch text-to-motion with NVIDIA Kimodo (official repo nv-tlabs/kimodo) -> one BVH per prompt.

Runs on the Windows PC with an NVIDIA GPU (see styles/zawdog/KIMODO_PC.md).

    python styles/zawdog/tools/kimodo_batch.py
    python styles/zawdog/tools/kimodo_batch.py --prompts styles/zawdog/motions/kimodo/prompts.txt --seed 7 --only wave_hello
    python styles/zawdog/tools/kimodo_batch.py --cli      # fallback: one kimodo_gen call per prompt (reloads the model each time)

prompts file: one "name | prompt | seconds" per line, '#' lines ignored.
Writes <out>/<name>.bvh (SOMA 77-joint BVH, the same export as `kimodo_gen --bvh`) and <name>.npz.
The model loads once and is reused for every prompt (API route mirrors kimodo/scripts/generate.py).
"""
import argparse
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DEFAULT_PROMPTS = ROOT / "styles/zawdog/motions/kimodo/prompts.txt"
DEFAULT_OUT = ROOT / "styles/zawdog/motions/kimodo"
MODEL = "Kimodo-SOMA-SEED-v1.1"  # NVIDIA Open Model License (commercial OK). Never SMPLX-RP (R&D only).


def read_prompts(path):
    rows = []
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        name, prompt, secs = [p.strip() for p in line.split("|")]
        rows.append((name, prompt, float(secs)))
    return rows


def run_cli(rows, out, args):
    for name, prompt, secs in rows:
        cmd = ["kimodo_gen", prompt, "--model", args.model, "--duration", str(secs),
               "--diffusion_steps", str(args.steps), "--seed", str(args.seed),
               "--output", str(out / name), "--bvh"]
        if args.standard_tpose:
            cmd.append("--bvh_standard_tpose")
        print(">", " ".join(cmd), flush=True)
        subprocess.run(cmd, check=True)


def run_api(rows, out, args):
    import torch
    from kimodo import load_model
    from kimodo.exports.bvh import save_motion_bvh
    from kimodo.exports.motion_io import save_kimodo_npz
    from kimodo.skeleton import SOMASkeleton30, global_rots_to_local_rots
    from kimodo.tools import seed_everything

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    print("device:", device, flush=True)
    model = load_model(args.model, device=device, default_family="Kimodo")
    skeleton = model.skeleton
    if isinstance(skeleton, SOMASkeleton30):  # output is already expanded to somaskel77 inside the model
        skeleton = skeleton.somaskel77.to(device)

    for name, prompt, secs in rows:
        seed_everything(args.seed)
        nf = int(secs * model.fps)
        print(f"[{name}] {nf} frames: {prompt}", flush=True)
        output = model([prompt], [nf], num_denoising_steps=args.steps, num_samples=1,
                       multi_prompt=True, post_processing=True, return_numpy=True)
        single = {k: (v[0] if hasattr(v, "shape") and len(v.shape) > 0 and v.shape[0] == 1 else v)
                  for k, v in output.items()}
        save_kimodo_npz(str(out / f"{name}.npz"), single)
        joints_pos = torch.from_numpy(output["posed_joints"][0]).to(device)
        joints_rot = torch.from_numpy(output["global_rot_mats"][0]).to(device)
        local_rot_mats = global_rots_to_local_rots(joints_rot, skeleton)
        root_positions = joints_pos[:, skeleton.root_idx, :]
        save_motion_bvh(out / f"{name}.bvh", local_rot_mats, root_positions, skeleton=skeleton,
                        fps=model.fps, standard_tpose=args.standard_tpose)
        print("  ->", out / f"{name}.bvh", flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompts", default=str(DEFAULT_PROMPTS))
    ap.add_argument("--out", default=str(DEFAULT_OUT))
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--steps", type=int, default=100)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--only", nargs="*", help="names to (re)generate")
    ap.add_argument("--standard_tpose", action="store_true", help="BVH rest pose = standard T-pose")
    ap.add_argument("--cli", action="store_true", help="use kimodo_gen per prompt instead of the Python API")
    args = ap.parse_args()

    if "SMPLX" in args.model.upper():
        sys.exit("SMPL-X RP is R&D-only (no commercial use). Use Kimodo-SOMA-SEED-v1.1 or Kimodo-SOMA-RP-v1.x.")
    rows = read_prompts(args.prompts)
    if args.only:
        rows = [r for r in rows if r[0] in set(args.only)]
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    (run_cli if args.cli else run_api)(rows, out, args)


if __name__ == "__main__":
    main()
