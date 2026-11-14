---
type: handoff
status: active
tags: [atrium, novelas, vista-stories]
relatedTo: [encendedor, padre-veladoras, chocolate-rancho, hacienda-sangre, reten-sierra, medalla-mezcal, agua-hacienda]
---
# canasta (La Canasta) — estado
- Remake de 7697901687620635917 de @relatosinolvidables10 ("Humilló a una anciana que vendía chicles… jamás imaginó con quién regresaría", 3.4M vistas, 168 s). 8.º remake, marca VISTA STORIES (el 7.º, encendedor, fue SAGA FILMS). Archivos listos: guion.md, make_sheets.py, clips.py (36 clips: 34 hablados + r1, r2), edit.py (copia de encendedor, EDL vacía, marca VISTA STORIES, cálida entre c28 y r2), phr.py, music/ (copia de encendedor), caption.txt. Nada generado en Flow todavía.
- Assets nuevos (únicos frente a agua-hacienda, medalla-mezcal, reten-sierra, hacienda-sangre, chocolate-rancho, padre-veladoras y encendedor, sin subcadenas): REFUGIO, HORACIO, MARIBEL, EUSEBIO, FEDERICO, LOC_VESTIBULO, LOC_GERENCIA, LOC_BANQUETA, LOC_SALITA.
- Atuendos: los de la ref (mosaico fps=1/6) con otros colores: cárdigan mostaza en vez de verde olivo, traje negro y corbata azul rey en vez de gris y guinda, blusa rosa en vez de lila, camisa azul claro de portero en vez de uniforme gris, traje gris oxford en vez de azul marino.
- Siguiente: `python -I make_sheets.py > sheets_log.txt`, revisar las hojas (md5 y que cada nombre tenga su imagen), luego `python -I clips.py > clips_log.txt`, QA por agente (bordes y ropa), regenerar malos, `python -I phr.py`, armar la EDL por frases en edit.py, `python -I edit.py`, verificación completa, Telegram con caption.txt.
- Riesgos: hoja de EUSEBIO (si Flow la lee como guardia uniformado, NOREF), c03/c13 (paquetitos de chicles sin monedas), c19/c21 (brazo ofrecido: contacto suave), c24/c26 (vaso de agua), r2/c31-c33 (lluvia y paraguas, tres personajes), c33 (shock sin morph), c34 (CTA con movimiento orgánico). Pronunciación de "Refugio", "Eusebio", "Horacio", "paquetitos", "vergüenza".
- Política: sin policías ni placas, sin dinero a cuadro, sin golpes ni dedo acusador (mano abierta), sin niños, edades numéricas.

## Entregado (2026-11-04)
- renders/v1.mp4: 2:28, -14.5 LUFS, pico -1.6, sync 0 frames. VISTA STORIES. Enviado a Telegram.
