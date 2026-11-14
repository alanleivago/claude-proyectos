---
type: handoff
status: active
tags: [atrium, novelas, vista-stories]
relatedTo: [padre-veladoras, chocolate-rancho, hacienda-sangre, reten-sierra, medalla-mezcal, agua-hacienda]
---
# encendedor (El Encendedor) — estado
- Remake de 7702851598850018591 ("Parte 3 FINAL | 20 años esperando la verdad", 91K): era el de más vistas sin rehacer (queda solo la Parte 2, 47K). Cuenta VISTA STORIES (la 6.ª, padre-veladoras, fue MAJESTIC). Archivos listos: guion.md, make_sheets.py, clips.py (35 clips: 33 hablados + r1, r2), edit.py (copia de padre-veladoras, EDL vacía, marca VISTA STORIES, cálida entre c28 y c33), music/ (copia de padre-veladoras), caption.txt. Nada generado en Flow todavía.
- Assets nuevos (únicos frente a agua-hacienda, medalla-mezcal, reten-sierra, hacienda-sangre, chocolate-rancho y padre-veladoras): CONSUELO, SANTIAGO, CIRILO, BALTASAR, ROQUE, LEANDRO, LOC_ESTUDIO, LOC_BODEGA, LOC_PATIO, LOC_ESTACION, LOC_CORREDOR, PROP_ENCENDEDOR.
- Siguiente: `python -I make_sheets.py > sheets_log.txt`, revisar las hojas (md5 y que cada nombre tenga su imagen: bug de Flow que corre imágenes un nombre), luego `python -I clips.py > clips_log.txt`, QA por agente (bordes y ropa), regenerar malos, armar la EDL por frases en edit.py, `python -I edit.py`, verificación completa, Telegram.
- Riesgos: c01 (Leandro hablando dentro de la pantalla de la laptop, lip sync), hoja de CIRILO (camuflaje; si Flow lo frena, NOREF), c08 (copa de tequila; SOFT la cambia por agua), c04-c07 (muchacho retenido: sin cuerdas ni golpes), r1 (estación con cuatro personajes), c19/c20 (el encendedor debe ser el mismo de la hoja), c33 (CTA con movimiento orgánico). Pronunciación de "Baltasar", "Cirilo", "Ordaz", "encendedor", "licenciada".
- Política: sin policías, placas ni chalecos (la copia la tiene una abogada; Cirilo va a declarar), sin armas, sin contacto brusco (Baltasar no agarra a Roque), sin dinero, Santiago con edad numérica (25).

## Entregado (2026-11-04)
- renders/v1.mp4: 2:02, 76 planos media 1.61 s, -14.7 LUFS, pico -1.8, sync 0 frames. SAGA FILMS. Enviado a Telegram.
- v2 (2026-11-04): c01 regenerado (Leandro dentro de la laptop). Enviado a Telegram.
