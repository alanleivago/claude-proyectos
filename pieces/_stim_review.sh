cd "/f/Claude Proyectos"
for N in "$@"; do P=pieces/stimulus-$N-hf
  until grep -q "== $N rendered\|FAIL render $N" pieces/_stim_render2.log; do sleep 15; done
  python tools/revisar_render.py --estilo stimulus $P/renders/stimulus-$N.mp4 > $P/prep/review.log 2>&1 && echo "== $N reviewed $(date +%T)" || echo "FAIL review $N"
done; echo REVIEWSDONE
