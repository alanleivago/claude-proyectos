cd "$(dirname "$0")"
for s in 1 2 3 4 5 6 7 8; do /Users/alanleiva/claude-proyectos/.venv/bin/python gen.py --seed $s >> gen_log.txt 2>&1; done
echo DONE >> gen_log.txt
