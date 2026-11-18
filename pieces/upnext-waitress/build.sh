#!/bin/bash
# Waitress rebuild: geometry+textures (numpy/PIL) -> Blender rig/actions -> glb. Review sheets via tools/review.py
set -e
cd "$(dirname "$0")"
BL="/Applications/Blender.app/Contents/MacOS/Blender"
W=$(cygpath -wa .)
python -I tools/geom.py all
for O in A B C; do
  "$BL" -b --factory-startup --python tools/bl_build.py -- "$W\ref\build_$O.json" "$W\ref\waitress_$O.blend" "$W\out\waitress_$O.glb" 2>&1 | grep -E "BUILD|Error|Traceback"
done
cp out/waitress_A.glb out/waitress.glb
