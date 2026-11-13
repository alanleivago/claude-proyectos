#!/bin/zsh
# one fresh Blender per shot (kit rule), 3 in parallel.  tools/board_all.sh [mode] [beat ...]
cd "$(dirname "$0")/../../.."
B=/Applications/Blender.app/Contents/MacOS/Blender; LOG=pieces/zaw-dog-06/review/logs; mkdir -p $LOG
MODE=${MODE:-board}
beats=(01a 01b 02a 02b 03a 03b 04 05 06a 06b 07a 07b 08 09 10 11a 11b 12a 12b 13 14a 14b)
(( $# )) && beats=("$@")
for b in $beats; do
  ( $B -b -P pieces/zaw-dog-05/build.py -- exec pieces/zaw-dog-06/shots.py $MODE $b > $LOG/${MODE}_$b.log 2>&1
    grep -q "Traceback" $LOG/${MODE}_$b.log && { echo "ERR $b"; grep -A12 Traceback $LOG/${MODE}_$b.log | tail -5; } ) &
  while (( $(jobs -r | wc -l) >= 3 )); do sleep 1; done
done
wait
