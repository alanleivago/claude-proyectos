#!/bin/zsh
# full rebuild: geometry -> UV -> atlas -> assembled ownerf.blend
set -e
cd /Users/alanleiva/claude-proyectos
BL=/Applications/Blender.app/Contents/MacOS/Blender; T=styles/zawdog/humans/ownerf/tools; W=styles/zawdog/humans/ownerf/work
$BL -b -P $T/geo.py 2>&1 | grep -iE "^tris|error|traceback|line [0-9]" || true
test $T/geo.py -ot $W/geo.blend || { echo "geo.blend not updated"; exit 1; }
$BL -b $W/geo.blend -P $T/uv.py 2>&1 | grep -iE "uv done|error|traceback|line [0-9]" || true
.venv/bin/python $T/tex.py 2>&1 | grep -iE "atlas written|error|traceback" || true
$BL -b $W/uv.blend -P $T/final.py 2>&1 | grep -iE "ownerf:|error|traceback|line [0-9]" || true
