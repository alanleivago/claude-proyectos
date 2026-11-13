#!/bin/zsh
# final 1080x1920 frames, ONE fresh Blender per shot (beats.json ranges), 4 in parallel; skips frames already rendered
cd "$(dirname "$0")/../../.."
B=/Applications/Blender.app/Contents/MacOS/Blender; LOG=pieces/zaw-dog-06/review/logs; mkdir -p $LOG
J=pieces/zaw-dog-06/review/beats.json
for row in $(python3 -c "import json,sys;b=json.load(open('$J'));sel=sys.argv[1:];[print(f'{k}:{v[0]}:{v[1]}') for k,v in b.items() if not sel or k in sel]" "$@"); do
  n=${row%%:*}; r=${row#*:}; a=${r%%:*}; z=${r#*:}
  ( $B -b -P pieces/zaw-dog-05/build.py -- exec pieces/zaw-dog-06/shots.py final $a $z > $LOG/final_$n.log 2>&1
    grep -q Traceback $LOG/final_$n.log && { echo "ERR $n"; grep -A12 Traceback $LOG/final_$n.log | tail -4; } ; echo "done $n" ) &
  while (( $(jobs -r | wc -l) >= 4 )); do sleep 2; done
done
wait
