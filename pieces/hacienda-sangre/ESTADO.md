---
type: handoff
status: active
tags: [atrium, novelas, vista-stories]
relatedTo: [reten-sierra, medalla-mezcal]
---
# hacienda-sangre (La Hacienda) — estado
- Remake de 7699644756812385567 (317K). Archivos listos: guion.md, make_sheets.py, clips.py (36 clips), edit.py (plantilla medalla-mezcal), music/ (copia de medalla-mezcal). Nada generado en Flow todavía.
- Assets nuevos (únicos frente a agua-hacienda, medalla-mezcal y reten-sierra): OCTAVIO, MATEO, TERESA, ARTURO, NICANOR, QUINTERO, LOC_ESTANCIA, LOC_BUFETE, LOC_RECAMARA, LOC_RANCHITO, LOC_BANCO, PROP_SANISIDRO.
- Siguiente: `python -I make_sheets.py > sheets_log.txt`, revisar las hojas (md5 y que cada nombre tenga su imagen: bug de Flow que corre imágenes un nombre), luego `python -I clips.py > clips_log.txt`, QA por agente, regenerar malos, `python -I edit.py`, verificación completa, Telegram.
- Riesgos: c01 (papel delante de Mateo de espaldas: que no se mezclen caras), c14 (manos con la figura), c28/c30 (Octavio dentro de la camioneta), pronunciación de "Cárdenas", "Isauro", "heredó".

## Entregado (2026-11-04)
- renders/v1.mp4: 2:26, 92 planos, media 1.59 s, -14.8 LUFS, sincronía 0 frames en 5 puntos. MAJESTIC STORIES. Enviado a Telegram con caption.txt.
- renders/v2.mp4 (2026-11-04): c02 y c33 regenerados (QA OK), regla nueva de cortes (mismo personaje = se queda en su plano con salto; fuera 25 reacciones de relleno; quedan r1, r2, r3 y c32), recortes c06/c20/c23 con `*pre`, recuperadas 7 frases (c05·1, c11·1, c14 "Lo cargaba", c16 "El café", c19 "Qué bueno", c21·1, c27·1). 2:21, 43 planos (media 3.28 s), 73 segmentos (media 1.93 s), -14.5 LUFS, pico -0.8 dBTP, sincronía 0 frames. Sin enviar a Telegram.
