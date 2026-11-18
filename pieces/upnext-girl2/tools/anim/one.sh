#!/bin/bash
# quick: bash tools/anim/one.sh clip frame views camR camH out
cd "$(dirname "$0")/../.."
python tools/anim/build_anims.py $1 --tag t --nocheck --variants bare 2>&1 | grep -E "FAILED|rror|Trace"
GLB=_t_bare.glb NOCAM=1 CAMR=${4:-16} CAMH=${5:--6.5} node tools/anim/render2.mjs shots $1:$2 0 $3 340 340 >/dev/null
python tools/anim/shots.py "/private/tmp/upnext-scratch/${6:-one}.png" $1:$2 $3 0.75
