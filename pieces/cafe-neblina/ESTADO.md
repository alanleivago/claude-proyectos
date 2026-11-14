---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte1, remake-transformado, capos, veracruz, cafe]
relatedTo: [cenote-campana, hacienda-sangre, atrium-vista]
---
# cafe-neblina (La Neblina · Parte 1): estado

## Video base
- Remake transformado de **"Me dejó la hacienda vacía y una deuda escondida | Parte 1"** de @atriumstories_ (7704455244683480350, **312K vistas**, 142 s, 55 planos). Análisis: `fuentes/atrium-vista/videos/7704455244683480350_analisis.md`.
- Por qué este: los tres de más de 1M ya tienen remake (Leche 1.7M: agua-hacienda y chocolate-rancho; la patrona 1.5M: medalla-mezcal; El Retén 1.1M: reten-sierra y cenote-campana). Siguiendo en vistas, la re-subida de El Retén (334K) es el mismo video y "Lo corrió de la hacienda" (330K) ya es hacienda-sangre. El siguiente sin remake es este (312K).
- Del original quedan la deuda que deja el marido y el esqueleto pedido: humillación + plazo → llega la figura de poder → plazo invertido → giro familiar → castigo en la Parte 2.

## Qué se cambió
- Escenario y región: hacienda de ganado con presa seca y oficina de cristal (norte) → finca cafetalera chica en la sierra central de Veracruz (patio de secado con neblina) y un beneficio viejo en el valle. Veracruz no se usó en ninguna pieza.
- Oficio: ganadera con abogada y capataz → cafeticultora; el abusador ya no es el marido sino Lamberto, un coyote que compra café.
- Humillación y plazo: el marido se va en su sedán y le deja 15 días de deuda → el coyote le pisa el café tendido con las botas: "Mañana te vas, Brígida."
- Figura de poder: no había (Regina pelea sola con sus trabajadores) → don Gaudencio, dueño del beneficio y padrino de bodas de Brígida, con tres camionetas verdes. Sin armas.
- Cómo llega: el coyote mismo le marca a su "patrón" para presumir la finca, y el patrón es el padrino.
- Objeto clave: préstamo de banco, tablet, reserva de agua → un pagaré doblado con la firma de Nemesio y fecha del martes, y el sombrero de palma con banda azul que Brígida tejió.
- Inversión: "hasta mañana" que le dio el coyote → "Tú te vas hoy. Antes que baje la neblina. Y sin un solo costal."
- Giro: el marido sabotea por teléfono desde su oficina → Nemesio, el marido que "se fue al norte hace dos años", estaba escondido en el asiento de atrás de la camioneta del coyote.
- Nombres: todos nuevos y únicos en pieces/ (Abelardo, Mancera, Rufino, Clemente, Fermín, Wences, Ponciano, Evaristo, Heriberto, Melquiades, Cabañas y Ríos ya existían y se descartaron). Brígida, Lamberto, Toribio, Gaudencio, Silvano, Nemesio.
- Diálogo: las 70 frases son nuevas; ninguna viene del original ni de cenote-campana.
- CTA: Regina "Mauricio cree que ya perdí. Sígueme…" → Brígida a cámara: "¿Ustedes perdonarían a Nemesio? Dale me gusta y sígueme para la segunda parte."
- Sin Navidad.

## Marca
**MEXI STORIES**: edit.py, BRAND = "MEXI" (kit pieces/_marcas/MEXI: arriba a la derecha, margen 36, y=210, 22 px, alfa 80, música propia de la marca).

## Archivos
guion.md, caption.txt, lines.json (fuente única), clips.py (47 clips: 35 hablados c01-c35, 7 insertos i01-i07, 5 reacciones r1-r5; copia de cenote-campana con todas sus defensas: gaze + ONE + ALONE, NOSUB + CLEAN + END, NODOUBLE, SAFE/SOFT con las frases fuertes, variant, NOREF, TRIES=6, gatito, md5, reload_flow, new_project; imprime "FIN P1"), make_sheets.py (6 personajes + LOC_PATIOCAFE + LOC_BENEFICIO, "ordinary non-famous face", control md5 DUPLICADO, --reupload), phr.py, edit.py (EDL vacía, se arma desde renders/phr.json; música cálida de c24 a c26).
- Guion pasado por la skill humanizer: frases de 3 a 6 palabras (salvo "¿Nemesio?" y el CTA), sin contrastes de relleno.

## Avance
- 2026-11-08: archivos escritos. `python -c "import clips"` OK. Faltan: 8 hojas (make_sheets.py), clips, QA, phr.py, EDL y montaje. NO se generó nada en Flow.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes y distintas (Toribio calvo, Lamberto bigotón y panzón, Nemesio demacrado), solo Gaudencio con sombrero puesto, solo Brígida con trenza.
2. `python -I clips.py > clips_log.txt` y QA de cada clip (morphs, bordes, el pagaré y el sombrero de banda azul siempre iguales, la pickup gris, la pronunciación de "Brígida", "Nemesio", "Gaudencio", "empeñó").
3. phr.py → EDL en edit.py → montaje y verificación (sync en 5 puntos, ≤2 s por tramo, LUFS/pico, marca MEXI visible arriba a la derecha) → Telegram con caption.txt (3er arg MEXI).
- 2026-11-08 noche: 8 hojas OK a ojo. Clips 47/47. QA: regenerados c12 (decía otra frase) y c15 (repetía "la de Brígida"); al crear proyecto Flow nuevo las hojas quedaron en el viejo → make_sheets --reupload y c12 otra vez con hoja. i04 0–3 s es una actriz ajena (solo 3.3–4.8). Crops de borde en renders/edlcfg.json.
- renders/share.mp4: 130.5 s, 86 tramos (1.53 s/tramo), -14.3 LUFS, -1.2 dBTP (alimiter 0.74), BLACK 124.6 s, MEXI arriba a la derecha. Revisión API: renders/share_revision.md. NO enviado a Telegram.
