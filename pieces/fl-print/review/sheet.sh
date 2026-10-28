#!/bin/bash
# usage: sheet.sh name t1 t2 ... -> review/<name>.jpg (stills at those times, side by side, 360 px wide each)
cd "/f/Claude Proyectos"; T="C:/Users/Alan Leiva/.claude/skills/animate/tools"; N=$1; shift; I=(); F=""; k=0
for t in "$@"; do node "$T/still.mjs" pieces/fl-print $t pieces/fl-print/review/_$k.png >/dev/null 2>&1; I+=(-i pieces/fl-print/review/_$k.png); F="$F[$k]scale=360:-1[v$k];"; k=$((k+1)); done
S=""; for ((j=0;j<k;j++)); do S="$S[v$j]"; done
ffmpeg -v error -y "${I[@]}" -filter_complex "${F}${S}hstack=$k" pieces/fl-print/review/$N.jpg && echo pieces/fl-print/review/$N.jpg
