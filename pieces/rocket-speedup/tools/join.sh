#!/usr/bin/env bash
# join.sh: concat renders/chunks/c*.mp4 (stream copy) + audio/final.wav (AAC 320k) -> renders/final.mp4; CRF 24 copy -> renders/share.mp4
set -e
P="$(cd "$(dirname "$0")/.." && pwd -W)"; R="$P/renders"
ls "$R"/chunks/c*.mp4 | sort | sed "s#^#file '#; s#\$#'#" > "$R/chunks/list.txt"
[ $(wc -l < "$R/chunks/list.txt") -eq 51 ] || { echo "expected 51 chunks"; exit 1; }
ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i "$R/chunks/list.txt" -c copy "$R/video.mp4"
ffmpeg -y -hide_banner -loglevel error -i "$R/video.mp4" -i "$P/audio/final.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -t 510 -movflags +faststart "$R/final.mp4"
ffmpeg -y -hide_banner -loglevel error -i "$R/final.mp4" -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart "$R/share.mp4"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,nb_frames -of compact "$R/final.mp4"
ffmpeg -hide_banner -nostats -i "$R/final.mp4" -map 0:a -af ebur128=peak=true -f null - 2>&1 | grep -A12 "Summary" | grep -E "I:|Peak:|LRA:"
