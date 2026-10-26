#!/bin/bash
# usage: sheet.sh out.png t1 t2 ...   (builds, renders stills at scale 0.5, hstacks them)
cd "/f/Claude Proyectos"; T="C:/Users/Alan Leiva/.claude/skills/animate/tools"; out=$1; shift
node "$T/build.mjs" pieces/ls-storm | tail -1
i=0; in=""; fl=""
for t in "$@"; do node "$T/still.mjs" pieces/ls-storm $t pieces/ls-storm/review/st_$t.png --scale 0.5 >/dev/null 2>&1 || echo "FAIL $t"; in="$in -i pieces/ls-storm/review/st_$t.png"; fl="$fl[$i]"; i=$((i+1)); done
ffmpeg -v error -y $in -filter_complex "${fl}hstack=$i" pieces/ls-storm/review/$out
echo done
