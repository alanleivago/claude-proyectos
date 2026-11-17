#!/bin/bash
# quick look: bash tools/anim/qs.sh clip1,clip2 [n] [views] [glb]  -> scratchpad/qs.png
cd "$(dirname "$0")/../.."
S="C:/Users/ALANLE~1/AppData/Local/Temp/claude/c026b2981c42eeb2/b19cd1d9-332a-4ffd-91ff-b618e0ca55df/scratchpad"
N=${2:-6}; V=${3:-3q,front}; G=${4:-_t_bare.glb}
GLB=$G node tools/anim/render2.mjs sheet $1 $N $V 300 480 >/dev/null && python tools/anim/sheet2.py $S/qs.png $1 $V $N 0.55
