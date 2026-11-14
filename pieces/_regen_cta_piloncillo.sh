#!/bin/bash
# Espera la próxima pausa de chofer-patrona-p2, la detiene, regenera el CTA c34 de piloncillo-rio (hasta 3 redacciones si sale mudo) y reanuda chofer-patrona-p2
cd "/f/Claude Proyectos/pieces"
LV3="C:/Users/ALANLE~1/AppData/Local/Temp/claude/c026b2981c42eeb2/31217992-d068-4929-9882-eede7428b798/scratchpad/lv3.py"
n=$(grep -c "^OK" chofer-patrona-p2/clips_log.txt)
until [ $(grep -c "^OK" chofer-patrona-p2/clips_log.txt) -gt $n ] || grep -q "^FIN" chofer-patrona-p2/clips_log.txt; do sleep 2; done
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { \$_.CommandLine -match 'clips\.py|src/cli\.js' -and \$_.CommandLine -notmatch 'Get-CimInstance|_regen_' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force }"
echo "PAUSA para CTA piloncillo c34 $(date +%H:%M)" >> chofer-patrona-p2/clips_log.txt
echo "cola pausada $(date +%H:%M)"
cd piloncillo-rio
for k in 0 1 2; do
  python -I cta_variants.py $k
  python -I clips.py c34 >> clips_log4.txt 2>&1
  w=$(PIEZA="F:\Claude Proyectos\pieces\piloncillo-rio" PYTHONIOENCODING=utf-8 python "$LV3" c34 2>/dev/null | grep "^c34")
  echo "variante $k: $w"
  echo "$w" | grep -qi "Leobardo" && echo "$w" | grep -qi "segunda parte" && { echo "CTA OK variante $k"; break; }
  [ -f clips/c34.mp4 ] && mv clips/c34.mp4 "clips/old/c34_mudo_v$k.mp4"
done
[ -f clips/c34.mp4 ] || { cp clips/old/c34_v1.mp4 clips/c34.mp4; echo "CTA SIN EXITO: se repone el original"; }
cd ..
(cd chofer-patrona-p2 && nohup python -I clips.py >> clips_log.txt 2>&1 &)
echo "cola reanudada $(date +%H:%M)"
echo FIN-CTA
