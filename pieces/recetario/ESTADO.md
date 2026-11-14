---
type: handoff
status: active
tags: [atrium, novelas, saga-films]
relatedTo: [buen-hijo, tele-nueva, canasta, encendedor, padre-veladoras, chocolate-rancho, hacienda-sangre, reten-sierra, medalla-mezcal, agua-hacienda]
---
# recetario (El Recetario) — estado
- Remake de 7693711393207405854 de @asombrosasreflexiones (la familia se aprovecha de la hija que hace postres y vende su libreta de recetas a la competencia; 3.1M vistas, 128 s; allá es Parte 5, aquí Parte 1 autónoma). 13.º remake, marca SAGA FILMS (el 12.º, buen-hijo, fue MAJESTIC). Archivos listos: guion.md, make_sheets.py, clips.py (31 clips hablados, 234 s brutos, 58 frases), edit.py (copia de buen-hijo, EDL vacía, marca SAGA FILMS, cálida entre c12 y c16), phr.py, music/ (copia de buen-hijo), caption.txt. Nada generado en Flow todavía.
- Assets nuevos (únicos frente a todas las pieces con make_sheets.py, sin subcadenas en ningún sentido): MIREYA, CHENCHO, HORTENSIA, SAMANTA, LEOPOLDO, LOC_ALACENA, LOC_OFICINA, LOC_CAFETERIA, PROP_RECETARIO.
- Atuendos: los de la ref (mosaico 24 cuadros) con otros colores: Mireya vestido de tirantes lila claro en vez de crema floral; Chencho playera verde menta manchada en vez de durazno; Hortensia vestido floral azul claro en vez de rosa; Samanta traje gris claro en vez de crema; Leopoldo camisa lavanda a rayitas en vez de blanca.
- Siguiente: `python -I make_sheets.py > sheets_log.txt`, revisar hojas (md5, etnia mestiza, que cada nombre tenga su imagen), `python -I clips.py > clips_log.txt` con Monitor, QA por agente (bordes y ropa, UNA sola libreta y quién la tiene, tele c16 y celular c28 dentro de la pantalla), regenerar malos, `python -I phr.py`, EDL por frases en edit.py (BLACK 0.4 entre c30 y c31), `python -I edit.py`, verificación completa, Telegram con caption.txt.
- Riesgos: c01/c08 (comer con cuchara, vasitos), c11 (libreta en el cajón sin que Mireya la toque), c16 (tele: Mireya dentro de la pantalla, sin duplicarse en la cocina), c18-c22 (una sola libreta), c25 (probar postre), c28 (contenido del celular dentro del marco), c31 CTA mudo (el prompt pide labios desde el primer frame). Pronunciación: "Hortensia", "Leopoldo", "batidora", "malagradecida".
- Política: sin policías, sin armas, sin contacto brusco, sin dedo acusador, sin dinero exigido ni cifras ni bancos, sin niños, edades numéricas.

## Entregado (2026-11-04)
- renders/v1.mp4: 2:03, -14.6 LUFS, pico -1.6, sync 0 frames. MEXI STORIES. Enviado a Telegram.
