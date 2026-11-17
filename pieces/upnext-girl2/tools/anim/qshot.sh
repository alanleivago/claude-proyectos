#!/bin/bash
# close look: bash tools/anim/qshot.sh clip:f,clip:f [views] [glb] [r] [h] -> scratchpad/qshot.png
cd "$(dirname "$0")/../.."
S="C:/Users/ALANLE~1/AppData/Local/Temp/claude/c026b2981c42eeb2/b19cd1d9-332a-4ffd-91ff-b618e0ca55df/scratchpad"
V=${2:-3q,front}; G=${3:-_t_bare.glb}
GLB=$G CAMR=${4:-22} CAMH=${5:--2.4} node tools/anim/render2.mjs shots $1 0 $V 340 600 >/dev/null && python tools/anim/shots.py $S/qshot.png $1 $V 0.75
