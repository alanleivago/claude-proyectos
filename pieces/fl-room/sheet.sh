# usage: sheet.sh out.png t1 t2 ... — stills of fl-room at those times, tiled
T="C:/Users/Alan Leiva/.claude/skills/animate/tools"; out=$1; shift; mkdir -p pieces/fl-room/review/st; args=(); filt=""; i=0
for t in "$@"; do node "$T/still.mjs" pieces/fl-room $t pieces/fl-room/review/st/$t.png --scale 0.5 >/dev/null 2>&1; args+=(-i pieces/fl-room/review/st/$t.png); filt+="[$i]scale=270:-1[v$i];"; i=$((i+1)); done
cols=$(( i < 7 ? i : 7 )); lay=""; for ((k=0;k<i;k++)); do lay+="[v$k]"; done
ffmpeg -v error -y "${args[@]}" -filter_complex "${filt}${lay}xstack=inputs=$i:layout=$(python -c "
n=$i;c=$cols;print('|'.join(f'{(k%c)*270}_{(k//c)*480}' for k in range(n)))")" "$out"
