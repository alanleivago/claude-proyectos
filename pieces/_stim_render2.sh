cd "/f/Claude Proyectos/pieces"
for N in "$@"; do P=stimulus-$N-hf; cd $P; echo "== $N gen $(date +%T)"
  python prep/gen.py > prep/gen_out.txt 2>&1 || { echo "FAIL gen $N"; cd ..; continue; }
  npx --yes hyperframes@0.9.16 render --fps 24000/1001 --quality delivery --skill hyperframes -o renders/stimulus-$N.mp4 > prep/render.log 2>&1 || { echo "FAIL render $N"; cd ..; continue; }
  echo "== $N rendered $(date +%T)"; cd ..
done; echo ALLDONE
