#!/bin/bash
# quick look: bash tools/anim/qs.sh clip1,clip2 [n] [views] [glb]  -> scratchpad/qs.png
cd "$(dirname "$0")/../.."
S="/private/tmp/upnext-scratch"
N=${2:-6}; V=${3:-3q,front}; G=${4:-_t_bare.glb}
GLB=$G node tools/anim/render2.mjs sheet $1 $N $V 300 480 >/dev/null && python tools/anim/sheet2.py $S/qs.png $1 $V $N 0.55
