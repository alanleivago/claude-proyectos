#!/bin/sh
# renders/video_only.mp4 + sound/audio/final_mix.wav -> renders/final.mp4 (video copied, AAC 256k)
cd "$(dirname "$0")/.." && ffmpeg -v error -y -i renders/video_only.mp4 -i sound/audio/final_mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 256k -ar 48000 -ac 2 -shortest -movflags +faststart renders/final.mp4 && echo renders/final.mp4
