#!/bin/zsh
# one fresh Blender per shot (kit rule), 3 in parallel.  MODE=board|ends|feet tools/board_all.sh [beat ...]
cd "$(dirname "$0")/../../.."
B=/Applications/Blender.app/Contents/MacOS/Blender; LOG=pieces/zaw-dog-07/review/logs; mkdir -p $LOG
MODE=${MODE:-board}
beats=(01a 01b 02a 02b 03a 03b 04a 04b 04c 05a 05b 06a 06b 06c)
(( $# )) && beats=("$@")
for b in $beats; do
  ( $B -b -P pieces/zaw-dog-05/build.py -- exec pieces/zaw-dog-07/shots.py $MODE $b > $LOG/${MODE}_$b.log 2>&1
    grep -q "Traceback" $LOG/${MODE}_$b.log && { echo "ERR $b"; grep -A12 Traceback $LOG/${MODE}_$b.log | tail -5; } ) &
  while (( $(jobs -r | wc -l) >= 3 )); do sleep 1; done
done
wait
