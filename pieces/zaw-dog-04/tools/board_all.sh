#!/bin/zsh
# one fresh Blender process per shot (user rule: a long single session left skin-coloured planes in 03)
cd "$(dirname "$0")/.."
B=/Applications/Blender.app/Contents/MacOS/Blender; LOG=${LOG:-review/logs}; mkdir -p $LOG
beats=(01a 01b 02 03 04 05a 05b 05c 06 07 08 09 10 11a 11b 12 13a 13b 14)
(( $# )) && beats=("$@")
for b in $beats; do
  $B -b -P build.py -- board $b > $LOG/$b.log 2>&1 || echo "FAIL $b"
  grep -q "Traceback" $LOG/$b.log && { echo "ERR $b"; grep -A8 Traceback $LOG/$b.log | tail -6; }
done
