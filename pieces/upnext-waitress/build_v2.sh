#!/bin/bash
# Waitress v2 (shorts / jeans): geometry + textures + face atlases -> retarget Ashley's clips -> GLBs, checks
set -e
cd "$(dirname "$0")"
BL="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
W=$(cygpath -wa .)
python -I tools/geom2.py all
python -I tools/face_atlas.py
python -I tools/wanim/retarget.py > ref/retarget_log.txt
python -I tools/wanim/mesh_check.py > /dev/null
"$BL" -b --factory-startup --python tools/wanim/bl_build2.py -- "$W\ref\build2_B.json" "$W\ref\anim_w.npz" "$W\out\waitress_shorts.glb" 2>&1 | grep -E "BUILD|Error|Trace"
"$BL" -b --factory-startup --python tools/wanim/bl_build2.py -- "$W\ref\build2_C.json" "$W\ref\anim_w.npz" "$W\out\waitress_jeans.glb" 2>&1 | grep -E "BUILD|Error|Trace"
for O in B C; do "$BL" -b --factory-startup --python tools/wanim/bl_build2.py -- "$W\ref\build2_$O.json" - "$W\ref\w2_$O.blend" 2>&1 | grep -E "Error|Trace" || true; done
python -I tools/wanim/jitter.py > ref/jitter_log.txt
