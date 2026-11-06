# renders every shot in its own fresh Blender process (no state carried across shots); 3 workers
cd "$(dirname "$0")/.."
B=/Applications/Blender.app/Contents/MacOS/Blender
R=($(cat out/shots.txt))
work(){ for i in "$@"; do $B -b -P build.py -- --frames ${R[$i]} > out/render_s$((i+1)).log 2>&1; echo "shot $((i+1)) done $(date +%T)"; done; }
work 0 3 6 9 12 &
work 1 4 7 10 &
work 2 5 8 11 &
wait; echo ALL DONE
