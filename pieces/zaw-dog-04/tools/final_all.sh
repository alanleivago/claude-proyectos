#!/bin/zsh
# full 1080x1920 frames, ONE FRESH BLENDER PROCESS PER SHOT (4 shots at a time) -> renders/frames/
cd "$(dirname "$0")/.."
B=/Applications/Blender.app/Contents/MacOS/Blender; mkdir -p review/logs
python3 -c "import json; b=json.load(open('review/beats.json')); [print(k, v[0], v[1]) for k, v in b.items()]" | \
  xargs -P 4 -L 1 sh -c "$B -b -P build.py -- final \$1 \$2 > review/logs/final_\$0.log 2>&1 || echo FAIL \$0"
grep -l Traceback review/logs/final_*.log
ls renders/frames | wc -l
