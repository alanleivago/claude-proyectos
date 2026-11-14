#!/bin/bash
# Espera a que fonda-chela-p2 termine un clip (pausa entre clips), para la cola, regenera c24 de viuda y la reanuda
cd "/f/Claude Proyectos/pieces"
n=$(grep -c "^OK" fonda-chela-p2/clips_log.txt)
until [ $(grep -c "^OK" fonda-chela-p2/clips_log.txt) -gt $n ]; do sleep 2; done
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { \$_.CommandLine -match '_cola_run.sh|clips\.py|srzGoogleFlowMCP.*cli\.js|src/cli\.js' -and \$_.CommandLine -notmatch 'Get-CimInstance|_regen_insert' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force }"
echo "cola pausada $(date +%H:%M)"
(cd madrina-central && python -I clips.py c04 >> clips_log2.txt 2>&1); echo "REGEN c04: $(tail -1 madrina-central/clips_log2.txt)"
nohup bash _cola_run2.sh > _cola_run.log 2>&1 &
echo "cola reanudada"
