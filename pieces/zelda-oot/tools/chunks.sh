#!/bin/zsh
# render in chunks (disk is small): frames -> pop-scan diffs -> x264 segment -> delete frames
cd /Users/alanleiva/claude-proyectos/pieces/zelda-oot
export PATH=/opt/homebrew/opt/ffmpeg-full/bin:$PATH
N=34916; C=3000
for ((a=0; a<N; a+=C)); do
  b=$((a+C)); [ $b -gt $N ] && b=$N
  seg=renders/segs/seg_$(printf %05d $a).mp4
  [ -f $seg ] && continue
  have=$(ls frames 2>/dev/null | awk -F'[f.]' -v a=$a -v b=$b '$2+0>=a && $2+0<b' | wc -l)
  if [ $have -lt $((b-a)) ]; then node ~/.claude/skills/animate/tools/export.mjs . --from $a --to $((b-1)) --no-audio --no-captions --workers 6 > /dev/null 2>>renders/chunks.err || { echo FAIL $a; exit 1; }; fi
  /Users/alanleiva/claude-proyectos/.venv/bin/python tools/diffs.py $a $b
  ffmpeg -v error -y -framerate 24 -start_number $a -i frames/f%04d.png -frames:v $((b-a)) -c:v libx264 -preset medium -crf 15 -pix_fmt yuv420p -r 24 $seg || { echo ENCFAIL $a; exit 1; }
  last=$(printf "frames/f%04d.png" $((b-1))); cp $last /tmp/zoot_last.png
  ls frames | awk -F'[f.]' -v a=$a -v b=$((b-1)) '$2+0>=a && $2+0<b' | sed 's#^#frames/#' | xargs rm -f
  echo done $a $b
done
echo ALLDONE
