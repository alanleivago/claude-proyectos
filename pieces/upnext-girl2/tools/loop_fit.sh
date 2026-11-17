#!/bin/bash
cd "f:/Claude Proyectos/pieces/upnext-girl2"
IN=$1; N=$2; TAG=$3; VOTE=${4:-neck}
cp $IN ref/${TAG}_0.npz
for i in $(seq 1 $N); do
  p=ref/${TAG}_$((i-1)).npz
  rm -f ref/_t1.npz ref/_t2.npz
  python tools/cfit.py $p ref/_t1.npz --iters 10 --scale 0.5 --views 40 --maxpx 4 2>&1 | tail -1 || exit 1
  python tools/revote.py ref/_t1.npz ref/_t2.npz $VOTE > /dev/null 2>&1 || cp ref/_t1.npz ref/_t2.npz
  python tools/camfit.py ref/_t2.npz ref/${TAG}_$i.npz --rounds 1 2>&1 | grep "round" || exit 1
  python tools/cmp_cls.py ref/${TAG}_$i.npz review/_cmp_${TAG}_$i.png 0.25 | tail -1
done
