---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte2]
relatedTo: [recetario, camionero, canasta-p2]
---
# recetario-p2 (El Recetario · Parte 2): estado
- Sigue en el mismo segundo del cliffhanger de recetario (Parte 1, entregada con MEXI STORIES). Payoff: el toque final nunca estuvo en la libreta, el postre de Leopoldo fracasa, él le regresa la libreta a Mireya. Gancho nuevo: falta la página con la receta de su papá y la tiene Chencho.
- Marca: **MEXI STORIES** (la de la Parte 1, fuera de la rotación). Música y marca de agua de pieces/_marcas/MEXI (edit.py, BRAND = "MEXI").
- Archivos listos: guion.md, lines.json (fuente única de clips.py), clips.py (31 clips: c01–c30 + r1; 236 s hablados en bruto, 56 frases; gaze() + ONE + ALONE en todos los planos, NOSUB y END tras cada diálogo, una de cada utilería (libreta casi siempre cerrada, una página doblada, un vasito), SAFE/SOFT con \b, variant, NOREF, TRIES=6, 17 s entre clips, gatito de control, imprime "FIN P2", acepta IDs y mueve la versión vieja a clips/old/), make_sheets.py (--reupload de las 9 hojas de la Parte 1 + 1 hoja nueva LOC_OBRADOR con control md5 DUPLICADO y control de nombre único; imprime "FIN HOJAS P2"), phr.py, edit.py (EDL vacía, cálida de c20 a c26, BLACK 0.4 entre c29 y c30, salida renders/v1.mp4), caption.txt.
- chars/: copia de la Parte 1 (MIREYA, CHENCHO, HORTENSIA, SAMANTA, LEOPOLDO, LOC_ALACENA, LOC_OFICINA, LOC_CAFETERIA, PROP_RECETARIO), revisadas en hoja de contactos: cada nombre es su persona/lugar, md5 distintos. Ojo: PROP_RECETARIO trae letra en inglés legible ("Dessert Recipes") -> en los prompts la libreta va cerrada o con letra diminuta ilegible.
- Nada generado en Flow todavía.
- Siguiente (una sesión de Flow a la vez):
  1. `python -I make_sheets.py --reupload > sheets_log.txt` (Monitor sobre "^FIN HOJAS P2"); revisar que no haya DUPLICADO ni FALTA y mirar chars/LOC_OBRADOR.jpg (obrador sin gente ni letreros, distinto de LOC_ALACENA).
  2. `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P2", Traceback e "intento 6").
  3. QA por agente (qa_clips.md): nadie en los bordes ni en primer plano (tiras de bordes a 4 fps), subtítulos quemados, frases/palabras repetidas, segunda frase completa (c01 es larga), una sola libreta y quién la tiene (c17/c22 Leopoldo, c23/c26 Mireya), sin letras legibles en la libreta abierta (c26), una sola página doblada (c28), un solo vasito (c20), Mireya con su vestido lila (sin filipina) en el obrador, Leopoldo con barba y bigote, c30 CTA con voz desde el inicio y gestos.
  4. Regenerar con `python -I clips.py <ids> > clips_log2.txt`; luego `python -I phr.py`, EDL por frases en edit.py y `python -I edit.py` -> renders/v1.mp4.
  5. Verificación completa (sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS/pico, marca), Telegram: `python tools/enviar_telegram.py pieces/recetario-p2/renders/v1.mp4` (lee caption.txt).
- Riesgos: c01 (frase larga de 10 s), c17/c22/c23 (paso de la libreta), c26 (libreta abierta), c28 (página doblada), c20 (probar el vasito), r1 mudo (Whisper puede alucinar: ganancia 0). Pronunciación: "Leopoldo", "incompleta", "puño y letra".
- 2026-11-06: c01 y c20 regenerados y revisados (c01 "fue" claro en large-v3 p1.00 y medium p0.97; c20 abre con "Mireya"; hojas y tiras limpias). phr.py corrido (renders/phr.json), EDL por frases de la envolvente de voz confirmada con large-v3, setsar=1, arreglos de qa_clips.md. renders/v1.mp4: 136.5 s, 68 planos (~2.0 s), -14.1 LUFS, -1.6 dBTP, sincronía <= 1 fotograma en 5 puntos, transcripción completa en orden, marca MEXI arriba a la der., música audible (earshot). Falta: visto bueno del usuario y Telegram.
