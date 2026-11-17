#!/bin/bash
# full-resolution refinement rounds: contour fit (all parts) + camera/angles
cd "f:/Claude Proyectos/pieces/upnext-girl2"
IN=$1; N=$2; TAG=$3
cp $IN ref/${TAG}_0.npz
for i in $(seq 1 $N); do
  p=ref/${TAG}_$((i-1)).npz
  python tools/cfit.py $p ref/_f1.npz --iters 8 --scale 1.0 --views 40 --maxpx 2.5 --smooth 0.15 2>&1 | tail -1 || exit 1
  python tools/camfit.py ref/_f1.npz ref/${TAG}_$i.npz --rounds 1 --scale 0.5 2>&1 | grep round || exit 1
done
