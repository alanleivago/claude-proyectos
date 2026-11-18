#!/bin/bash
# True low-poly final pass (V2 curvy bare legs + V3 curvy tights), from the dense fitted+fixed mesh ref/final_fix.npz:
#   bash build_lowpoly.sh            (fit stages skipped when ref/lp_fit.npz exists; pass "refit" to redo them)
set -e
cd "$(dirname "$0")"
BL="/Applications/Blender.app/Contents/MacOS/Blender"
if [ ! -f ref/lp_fit.npz ] || [ "$1" == "refit" ]; then
  "$BL" -b --factory-startup --python tools/bl_lowpoly.py -- ref/final_fix.npz ref/lp_parts.npz 2>&1 | grep LOWPOLY
  python tools/lowpoly.py ref/final_fix.npz ref/lp_parts.npz ref/lp0.npz
  python tools/cfit.py ref/lp0.npz ref/lp1.npz --iters 12 --scale 1.0 --views 50 --maxpx 3 --smooth 0 --lam 0.6 | tail -1
  python tools/cfit.py ref/lp1.npz ref/lp2.npz --iters 10 --scale 1.0 --views 60 --maxpx 2 --smooth 0 --lam 0.4 --parts farmL,farmR,uarmL,uarmR | tail -1
  python tools/rehair.py ref/lp2.npz ref/lp_fit.npz
fi
# base low poly (his tights, no curves) -> texture from his frames, face atlases, rig; verified against his frames
python tools/texture.py ref/lp_fit.npz ref/final_tex.npz --ts 4096 --step 1 --power 150
python tools/face_cells.py ref/final_tex.npz
python tools/make_rig_in.py ref/final_tex.npz ref/rig_in.npz
"$BL" -b --factory-startup --python tools/bl_rig.py -- ref/rig_in.npz ref/base_lowpoly.glb 2>&1 | grep RIG
python tools/export_meta.py ref/rig_in.npz ref/final_tex.npz
F12=0,21,42,63,84,105,125,146,167,188,209,230
GLB=../ref/base_lowpoly.glb node tools/render_engine.mjs his $F12
python tools/sheets.py ref/final_tex.npz --renders review/engine --frames $F12
# V2 / V3
python tools/variants.py ref/final_tex.npz ref/rig_in.npz
"$BL" -b --factory-startup --python tools/bl_rig.py -- ref/rig_in_v2.npz out/girl2_curvy_bare.glb 2>&1 | grep RIG
"$BL" -b --factory-startup --python tools/bl_rig.py -- ref/rig_in_v3.npz out/girl2_curvy_tights.glb 2>&1 | grep RIG
GLB=girl2_curvy_bare.glb PREFIX=v2_ node tools/render_engine.mjs his 0,42,84,125
GLB=girl2_curvy_tights.glb PREFIX=v3_ node tools/render_engine.mjs his 0,42,84,125
for V in "girl2_curvy_bare.glb:v2_" "girl2_curvy_tights.glb:v3_"; do
  GLB=${V%%:*} PREFIX=${V##*:} node tools/render_engine.mjs anim walk,run,sit_floor 5 3q,side
done
python tools/final_sheets.py
