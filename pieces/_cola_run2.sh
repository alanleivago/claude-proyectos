#!/bin/bash
# Cola Flow cuenta tiktokeeuu691: resubir hojas + clips, pieza por pieza
cd "/f/Claude Proyectos/pieces"
for p in fonda-chela-p2; do
  echo "=== $p $(date +%H:%M)"
  (cd $p && python -I make_sheets.py --reupload >> sheets_log.txt 2>&1; echo "hojas $p rc=$?"; python -I clips.py >> clips_log.txt 2>&1; echo "FIN clips $p rc=$?")
done
echo "=== COLA TERMINADA $(date +%H:%M)"
