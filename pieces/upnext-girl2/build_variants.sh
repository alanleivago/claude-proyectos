#!/bin/bash
# V2 (curvy, bare legs) and V3 (curvy, tights) from the V1 build (run build_final.sh first)
set -e
cd "$(dirname "$0")"
BL="/Applications/Blender.app/Contents/MacOS/Blender"
python tools/variants.py ref/final_tex.npz ref/rig_in.npz
"$BL" -b --factory-startup --python tools/bl_rig.py -- ref/rig_in_v2.npz out/girl2_curvy_bare.glb 2>&1 | grep RIG
"$BL" -b --factory-startup --python tools/bl_rig.py -- ref/rig_in_v3.npz out/girl2_curvy_tights.glb 2>&1 | grep RIG
node tools/render_engine.mjs his 0,42,84,125
GLB=girl2_curvy_bare.glb PREFIX=v2_ node tools/render_engine.mjs his 0,42,84,125
GLB=girl2_curvy_tights.glb PREFIX=v3_ node tools/render_engine.mjs his 0,42,84,125
for V in "girl2_anim.glb:" "girl2_curvy_bare.glb:v2_" "girl2_curvy_tights.glb:v3_"; do
  GLB=${V%%:*} PREFIX=${V##*:} node tools/render_engine.mjs anim walk,run,sit_floor 5 3q,side
done
python tools/variant_sheet.py
