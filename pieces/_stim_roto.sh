cd "/f/Claude Proyectos/pieces"
while [ $# -gt 0 ]; do N=$1; T=$2; shift 2; cd stimulus-$N-hf; echo "== $N $T $(date +%T)"; python prep/roto_hook.py $T > prep/roto_out.txt 2>&1 || echo FAIL; rm -rf prep/roto; cd ..; done; echo done $(date +%T)
