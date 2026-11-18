#!/bin/bash
# Suitor v3: original Artillery geometry (minus bag + holster), recoloured original texture (forest green), 1.67 m,
# smaller fists, welded knees, green collar island, pocket openings -> face atlases -> authored clips -> checks -> out/suitor.glb
set -e
cd "$(dirname "$0")"
BL="/Applications/Blender.app/Contents/MacOS/Blender"
W=$(cygpath -wa .)
python -I tools/geom.py wine > /dev/null          # v1 pass: writes tex/body.png (skin recolour) used by the face atlases
python -I tools/face_atlas.py
python -I tools/geom3.py forest
python -I tools/anim/author.py
python -I tools/anim/check.py > /dev/null
"$BL" -b --factory-startup --python tools/anim/bl_build.py -- "$W/ref/build3_forest.json" "$W/ref/anim.npz" "$W/out/suitor.glb" 2>&1 | grep -E "BUILD exported|Error|Trace|not valid" || true
"$BL" -b --factory-startup --python tools/anim/bl_build.py -- "$W/ref/build3_forest.json" - "$W/ref/s3_forest.blend" 2>&1 | grep -E "Error|Trace" || true
cp out/suitor.blend ref/a_wine.blend
