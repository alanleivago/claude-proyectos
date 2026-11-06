cd "$(dirname "$0")/.."
B=/Applications/Blender.app/Contents/MacOS/Blender
R=($(cat out/shots.txt))
work(){ for i in "$@"; do $B -b -P build.py -- --frames ${R[$i]} > out/render_s$((i+1)).log 2>&1; echo "shot $((i+1)) done $(date +%T)"; done; }
work 3 & work 9 & work 10 & work 11 &
wait; echo ALL DONE
