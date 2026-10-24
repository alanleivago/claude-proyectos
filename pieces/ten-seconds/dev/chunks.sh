#!/bin/bash
# export in chunks (render PNGs, encode, delete), concat, then the score (+ stems) and the share copy
set -e
P=/Users/alanleiva/claude-proyectos/pieces/ten-seconds
SK=/Users/alanleiva/.claude/skills/animate/tools
N=$(/usr/bin/python3 -c "import json;print(json.load(open('$P/piece.json'))['format']['frames'])")
mkdir -p $P/renders/chunks; cd /Users/alanleiva/claude-proyectos
for ((a=0; a<N; a+=1500)); do
  b=$((a+1499)); [ $b -ge $N ] && b=$((N-1)); out=$P/renders/chunks/c$(printf %05d $a).mp4
  [ -f $out ] && continue
  node $SK/export.mjs pieces/ten-seconds --from $a --to $b --workers 6 --no-audio --no-mux | grep -E "written" || true
  ffmpeg -y -hide_banner -loglevel error -framerate 24 -start_number $a -i $P/frames/f%04d.png -frames:v $((b-a+1)) -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p -r 24 $out
  rm -f $P/frames/f*.png; echo "chunk $a-$b done"
done
ls $P/renders/chunks/c*.mp4 | sed "s#^#file '#; s#\$#'#" > $P/renders/chunks/list.txt
ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i $P/renders/chunks/list.txt -c copy -movflags +faststart $P/renders/final.mp4
node $SK/export.mjs pieces/ten-seconds --only-audio --no-mux
echo ALL DONE
