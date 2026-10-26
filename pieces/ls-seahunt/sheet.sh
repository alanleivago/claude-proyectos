#!/bin/bash
# usage: sheet.sh out.png t1 t2 ...  (from F:/Claude Proyectos)
T="C:/Users/Alan Leiva/.claude/skills/animate/tools"; D=pieces/ls-seahunt/review; mkdir -p $D; out=$1; shift; ins=""; n=0
node "$T/build.mjs" pieces/ls-seahunt | tail -1
for t in "$@"; do node "$T/still.mjs" pieces/ls-seahunt $t $D/t_$t.png --scale 0.5 >/dev/null 2>&1 || echo "FAIL $t"; ins="$ins -i $D/t_$t.png"; n=$((n+1)); done
ffmpeg -v error -y $ins -filter_complex "hstack=inputs=$n" $out
