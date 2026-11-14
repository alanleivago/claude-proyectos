#!/usr/bin/env bash
# export_chunks.sh: render the picture in chunks of 300 frames (a long single export slows down), encode each chunk
# to renders/chunks/cNNN.mp4 (x264 CRF 12, near-lossless) and delete its PNGs. Skips chunks already encoded.
#   usage: bash tools/export_chunks.sh [first_chunk] [last_chunk]
set -e
P="$(cd "$(dirname "$0")/.." && pwd)"; S="C:/Users/Alan Leiva/.claude/skills/animate/tools"
N=15300; C=300; mkdir -p "$P/renders/chunks"
a=${1:-0}; b=${2:-$(( (N - 1) / C ))}
for k in $(seq $a $b); do
  out="$P/renders/chunks/c$(printf %03d $k).mp4"; [ -f "$out" ] && continue
  f0=$(( k * C )); f1=$(( f0 + C - 1 )); [ $f1 -ge $N ] && f1=$(( N - 1 ))
  node "$S/export.mjs" "$P" --from $f0 --to $f1 --workers 4 --no-audio --no-mux --no-captions | tail -1
  ffmpeg -y -hide_banner -loglevel error -framerate 30 -start_number $f0 -i "$P/frames/f%04d.png" -frames:v $(( f1 - f0 + 1 )) \
    -c:v libx264 -crf 12 -preset medium -pix_fmt yuv420p "$out.tmp.mp4" && mv "$out.tmp.mp4" "$out"
  [ -z "$KEEP" ] && for i in $(seq $f0 $f1); do rm -f "$P/frames/f$(printf %04d $i).png"; done
  echo "chunk $k ($f0..$f1) done $(date +%H:%M:%S)"
done
echo ALL CHUNKS DONE
