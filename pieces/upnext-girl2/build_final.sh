#!/bin/bash
# upnext-girl2: from a fitted mesh npz to the delivered GLB + review sheets.
#   bash build_final.sh ref/<fit>.npz [texture size]
# Full pipeline from scratch (see README-like notes at the top of each tool):
#   python tools/masks.py; python tools/classes.py; python tools/fix_cls.py   (his masks / class maps)
#   python tools/calib3.py; python tools/refine_alpha.py --fresh; python tools/calib4.py   (turntable camera)
#   python tools/hull_mesh.py; python tools/label_voxels.py; python tools/build_init.py    (hull -> part tubes)
#   python tools/cfit.py ... / tools/camfit.py ... (tools/loop_fit.sh), tools/split_head.py, tools/subdiv.py
set -e
cd "$(dirname "$0")"
FIT=$1; TS=${2:-4096}
BL="/Applications/Blender.app/Contents/MacOS/Blender"
python tools/fixup.py $FIT ref/final_fix.npz
python tools/texture.py ref/final_fix.npz ref/final_tex.npz --ts $TS --step ${3:-2}
python tools/face_cells.py ref/final_tex.npz
python tools/make_rig_in.py ref/final_tex.npz ref/rig_in.npz
"$BL" -b --factory-startup --python tools/bl_rig.py -- ref/rig_in.npz out/girl2_anim.glb 2>&1 | grep RIG
python tools/export_meta.py ref/rig_in.npz ref/final_tex.npz
F12=0,21,42,63,84,105,125,146,167,188,209,230
node tools/render_engine.mjs his $F12,29 open neutral
node tools/render_engine.mjs his 29 blink neutral
python tools/sheets.py ref/final_tex.npz --renders review/engine --frames $F12
