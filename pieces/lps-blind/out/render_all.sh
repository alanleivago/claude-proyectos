# renders every shot in its own fresh Blender process (no state carried across shots); 2 workers
cd "$(dirname "$0")/.."
B=/Applications/Blender.app/Contents/MacOS/Blender
R=($(cat out/shots.txt))
work(){ for i in "$@"; do $B -b -P build.py -- --frames ${R[$i]} > out/render_s$((i+1)).log 2>&1; echo "shot $((i+1)) done $(date +%T)"; done; }
work 0 2 4 6 8 &
work 1 3 5 7 9 &
wait; echo ALL DONE
