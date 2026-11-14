# for each piece: wait for its temp head cutout, gen, render, review
cd "/f/Claude Proyectos/pieces"
for N in "$@"; do P=stimulus-$N-hf
  until [ -f $P/assets/cutout_hook.webm ] && [ ! -d $P/prep/roto ]; do sleep 15; done
  cd $P; echo "== $N gen $(date +%T)"
  python prep/gen.py > prep/gen_out.txt 2>&1 || { echo "FAIL gen $N"; cd ..; continue; }
  npx --yes hyperframes@0.9.16 render --fps 24000/1001 --quality delivery --skill hyperframes -o renders/stimulus-$N.mp4 > prep/render.log 2>&1 || { echo "FAIL render $N"; cd ..; continue; }
  echo "== $N rendered $(date +%T)"
  (cd ../.. && python tools/revisar_render.py --estilo stimulus --nota "fase 1: gancho con roto temporal BiRefNet (el del usuario en Premiere llega después)" pieces/$P/renders/stimulus-$N.mp4 > pieces/$P/prep/review.log 2>&1) || echo "FAIL review $N"
  echo "== $N reviewed $(date +%T)"; cd ..
done; echo ALLDONE
