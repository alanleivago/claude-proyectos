---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte1, remake-transformado, capos, yucatan, cenote]
relatedTo: [reten-sierra, golondrina-muelle, chofer-patrona, atrium-vista]
---
# cenote-campana (La Campana del Cenote · Parte 1): estado

## Video base
- Remake transformado de **El Retén P1** de @atriumstories_: "Le pidió 200 mil en el retén… y terminó rodeado" (7701749432621993246, **1.1M vistas**, 113 s, 62 planos). Análisis: `fuentes/atriumstories/videos/7701749432621993246_analisis.md`.
- Los tres videos de Atrium con más de 1M ya tenían remake: Leche 1.7M (agua-hacienda y chocolate-rancho), la patrona y el secreto de 20 años 1.5M (medalla-mezcal) y El Retén 1.1M (reten-sierra). Se eligió El Retén porque es el que encaja con el esqueleto pedido (precio y plazo → "¿tú crees que vine solo?" → llegan las camionetas → la cifra cambia de lado → la familia) y porque reten-sierra lo copió casi tal cual (otro retén). Esta versión no se le parece.
- Del original queda solo el esqueleto: humillación + plazo → llega la figura de poder → plazo y precio invertidos → giro familiar → castigo en la Parte 2.

## Qué se cambió
- Escenario y región: retén militar en carretera del norte → entrada de un cenote en el monte de Yucatán, más la hacienda henequenera amarilla de la dueña.
- Víctima y oficio: patrón con convoy (el original no tiene víctima humilde) → don Nicasio, 71, cuidador maya del cenote, con su nieta Citlali.
- Abusador: mayor del ejército con soldados → el ingeniero Portilla, de una empresa hotelera, con su capataz Cosme. Sin uniformes.
- Figura de poder: el propio patrón con revólver → doña Zenaida, 76, matriarca con bastón, que llega en cinco camionetas blancas. Sin armas.
- Humillación y plazo: "200 mil dólares y aquí nunca pasó nada" → el zapato tumba el cántaro de la madre de Nicasio, "una hora, don Nicasio, y este cenote se cierra"; los cien mil salen después.
- Cómo se pide ayuda: radio "adelántense, todos" → la campana de bronce que el padre de Zenaida colgó para que Nicasio la llamara (tres toques).
- Objeto clave: revólver plateado → la llave vieja de hierro de la reja, que solo tiene la familia.
- Inversión: 200 mil → 10 mil y ultimátum con arma → los cien mil los paga Portilla y la hora que dio ahora la tiene él.
- Giro familiar: "¿tienes esposa?" (amenaza a la familia del mayor) → la señora que mandó a Portilla y le dio la llave es Maricruz, la hija de Zenaida (contesta el celular: "¿Maricruz? ¿Hija, eres tú?").
- Nombres: todos nuevos y únicos en pieces/ (Leonor, Graciela, Eleuterio, Itzel, Abundio y Yazmín ya existían y se cambiaron).
- Diálogo: las 70 frases son nuevas; ninguna viene del original ni de golondrina-muelle (se reescribieron las que repetían su forma: "¿Quién tiró tu pescado?", "Llama a quien quieras… te quedan X minutos", "Dame ese teléfono", "Cuarenta años se la cuidé").
- CTA: voz en off "sigue la página…" → Nicasio a cámara: "¿Qué creen que hará doña Zenaida con su hija? Dejen su me gusta y compartan, que viene la segunda parte."
- Sin Navidad (golondrina-muelle ya la tenía).

## Marca
**MAJESTIC STORIES**: edit.py, BRAND = "MAJESTIC" (kit pieces/_marcas/MAJESTIC: arriba a la izquierda x=36 y=210, 22 px, alfa 80, música propia de la marca).

## Archivos
guion.md, caption.txt, lines.json (fuente única, 333 palabras), clips.py (47 clips: 35 hablados c01-c35, 7 insertos i01-i07, 5 reacciones r1-r5; 286 s de generación; copia de golondrina-muelle con todas sus defensas: gaze + ONE + ALONE, NOSUB + CLEAN + END, NODOUBLE, SAFE/SOFT con las frases fuertes, variant, NOREF, TRIES=6, gatito en imagen, control de duplicados md5, reload_flow, new_project, descarga corrupta, 17 s entre clips; imprime "FIN P1"), make_sheets.py (6 personajes + LOC_CENOTEREJA + LOC_HACIENDAAMARILLA, "ordinary non-famous face", control md5 DUPLICADO, --reupload), phr.py, edit.py (EDL vacía, se arma desde renders/phr.json; música cálida de c25 a c27).
- Guion pasado por la skill humanizer: frases de 3 a 6 palabras (salvo "¿Bueno?", "Hasta hoy." y el CTA), sin contrastes de relleno.

## Avance
- 2026-11-08: archivos escritos. `python -c "import clips"` OK (47 clips = lines.json, las 6 variantes de cada prompt se arman sin error). Faltan: 8 hojas (make_sheets.py), clips, QA, phr.py, EDL y montaje. NO se generó nada en Flow.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes y distintas (Portilla lampiño, Cosme barbón), solo Nicasio con sombrero, solo Zenaida con bastón.
2. `python -I clips.py > clips_log.txt` y QA de cada clip (morphs, bordes, la llave y la campana siempre iguales, la pronunciación de "Nicasio", "Zenaida", "Citlali", "Maricruz").
3. phr.py → EDL en edit.py → montaje y verificación (sync en 5 puntos, ≤2 s por tramo, LUFS/pico, marca MAJESTIC visible) → Telegram con caption.txt.
- 2026-11-08 noche: hojas: Flow devolvió gatitos/copias en la 1.ª tanda → chars/mal, assets renombrados con sufijo 2 (OSIEL_PORTILLA2, CITLALI_CANCHE2, COSME_BALAM2, ZENAIDA_CAUICH2, FIDENCIO_TZUC2, LOC_CENOTEREJA2, LOC_HACIENDAAMARILLA2); 8 OK a ojo. Clips 47/47.
- QA: regenerados c30 (chaleco con letras "SENC"), c19 (frase rota → lines.json "Tres veces. Es Nicasio." / "Prepárenme las camionetas.") y c26 (Nicasio sin sombrero). Fuera r1 (Zenaida en el cenote antes de llegar). Crops de borde en renders/edlcfg.json.
- renders/share.mp4: 137.6 s, 83 tramos (1.67 s/tramo), -14.4 LUFS, -2.1 dBTP, sync 0 ms en 5 puntos, BLACK 131.2 s, MAJESTIC arriba a la izquierda. Revisión API v1: renders/share_revision.md. NO enviado a Telegram.
