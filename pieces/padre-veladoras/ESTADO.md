---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories]
relatedTo: [chocolate-rancho, hacienda-sangre, reten-sierra, medalla-mezcal, agua-hacienda]
---
# padre-veladoras (Las Veladoras) — estado
- Remake de 7702486655336320286 ("Se burlaron del padre…", 200K): era el de más vistas sin rehacer. Cuenta MAJESTIC STORIES (la 5.ª, chocolate-rancho, fue VISTA). Archivos listos: guion.md, make_sheets.py, clips.py (36 clips), edit.py (copia de reten-sierra, EDL vacía, marca MAJESTIC STORIES, cálida entre c17 y c20), music/ (copia de reten-sierra), caption.txt. Nada generado en Flow todavía.
- Assets nuevos (únicos frente a agua-hacienda, medalla-mezcal, reten-sierra, hacienda-sangre y chocolate-rancho): ANSELMO, RUFINO, CHATO, RAMIRO, MAURO, LOC_PARROQUIA, LOC_MIRADOR, LOC_ATRIO, PROP_VELADORAS.
- Siguiente: `python -I make_sheets.py > sheets_log.txt`, revisar las hojas (md5 y que cada nombre tenga su imagen: bug de Flow que corre imágenes un nombre), luego `python -I clips.py > clips_log.txt`, QA por agente (bordes y ropa), regenerar malos, armar la EDL por frases en edit.py, `python -I edit.py`, verificación completa, Telegram.
- Riesgos: hojas de RUFINO/CHATO (motociclistas tatuados; si Flow los frena, NOREF), c05 (soplar las veladoras), r1 (toma aérea de camionetas), r2 (prender veladoras con cerillo), c28 (tres "sí" muy cortos), c34 (CTA con movimiento orgánico). Pronunciación de "Anselmo", "Salcedo", "Víboras", "motociclistas", "repletas".
- Política: sin empujones ni golpes (la ofensa es apagar las veladoras), sin armas, sin dinero; los hombres de Ramiro son rancheros en jeans y camisa blanca.

## Entregado (2026-11-04)
- renders/v1.mp4: 2:28, -15.0 LUFS, pico -1.6, sync 0 frames 5 puntos. MAJESTIC STORIES. Enviado a Telegram.
