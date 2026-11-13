#!/bin/zsh
# every frame of every shot at 270x480 (review/anim/<beat>/), one fresh Blender per shot, 4 in parallel.  tools/anim_all.sh [beat ...]
cd "$(dirname "$0")/../../.."
B=/Applications/Blender.app/Contents/MacOS/Blender; LOG=pieces/zaw-dog-07/review/logs; mkdir -p $LOG
beats=(01a 01b 02a 02b 03a 03b 04a 04b 04c 05a 05b 06a 06b 06c)
(( $# )) && beats=("$@")
for b in $beats; do
  ( $B -b -P pieces/zaw-dog-05/build.py -- exec pieces/zaw-dog-07/shots.py frames $b > $LOG/frames_$b.log 2>&1
    grep -q Traceback $LOG/frames_$b.log && { echo "ERR $b"; grep -A12 Traceback $LOG/frames_$b.log | tail -4; }; echo "done $b" ) &
  while (( $(jobs -r | wc -l) >= 4 )); do sleep 2; done
done
wait
