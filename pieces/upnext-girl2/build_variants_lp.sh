#!/bin/bash
# V2 / V3 only (after build_lowpoly.sh made the base): variants, GLBs, renders, sheets
set -e
cd "$(dirname "$0")"
BL="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
python tools/variants.py ref/final_tex.npz ref/rig_in.npz
"$BL" -b --factory-startup --python tools/bl_rig.py -- ref/rig_in_v2.npz out/girl2_curvy_bare.glb 2>&1 | grep RIG
"$BL" -b --factory-startup --python tools/bl_rig.py -- ref/rig_in_v3.npz out/girl2_curvy_tights.glb 2>&1 | grep RIG
GLB=girl2_curvy_bare.glb PREFIX=v2_ node tools/render_engine.mjs his 0,42,84,125
GLB=girl2_curvy_tights.glb PREFIX=v3_ node tools/render_engine.mjs his 0,42,84,125
for V in "girl2_curvy_bare.glb:v2_" "girl2_curvy_tights.glb:v3_"; do
  GLB=${V%%:*} PREFIX=${V##*:} node tools/render_engine.mjs anim walk,run,sit_floor 5 3q,side
done
python tools/final_sheets.py
