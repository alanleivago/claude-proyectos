---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte1, navidad]
relatedTo: [regreso-20]
---
# nochebuena (La Cena de Nochebuena · Parte 1, video 18): estado
- Historia ORIGINAL navideña (sin ref): humillación (Gerardo presenta a su mamá como "la señora que nos ayuda") → giro (Herminia es la dueña de la hacienda) → payoff (Ignacio la sienta en la cabecera; Gerardo cena en la cocina) → gancho (Regina y Gerardo quieren que ella "firme lo que él le diga").
- Marca: **MAJESTIC STORIES** (edit.py, BRAND = "MAJESTIC"; música y marca de agua de pieces/_marcas/MAJESTIC, sin music/ propia).
- Archivos listos: guion.md, lines.json (fuente única de diálogos), clips.py (42 clips: c01–c33 + r1–r7 + i1–i2; 473 palabras ≈ 240 s de voz, 294 s de clips en bruto; todos los primeros planos con ONE + ALONE + SOLO, NOSUB al final de cada diálogo, "speaks from the first second and says both sentences completely", nadie con sombrero, una olla / un jarrito / una canasta / una piñata / un nacimiento, SAFE/SOFT con \b, variant, NOREF, TRIES=6, 17 s entre clips, gatito de control, acepta IDs y mueve la versión vieja a clips/old/, imprime "FIN P1"), make_sheets.py (7 hojas nuevas con control md5 DUPLICADO, imprime "FIN HOJAS"), phr.py, edit.py (EDL en borrador generada de lines.json con índices de línea; mudos 1.0–2.4 s a ganancia 0; BLACK 0.4 s antes de c33; salida renders/v1.mp4), caption.txt.
- Hojas nuevas (nombres únicos en pieces/*): HERMINIA, GERARDO, REGINA, IGNACIO, LOC_PATIOPINATA, LOC_COMEDORLUCES, LOC_COCINAPONCHE.
- Nada generado en Flow todavía.
- Siguiente:
  1. `python -I make_sheets.py > sheets_log.txt` (esperar "FIN HOJAS"; si hay DUPLICADO, borrar chars/dup/<nombre>.jpg y repetir). Revisar las hojas en hoja de contactos: mestizos, ropa correcta, que no se parezcan entre sí, un solo nacimiento / una sola piñata / una sola olla.
  2. `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P1", Traceback e "intento 6").
  3. QA (qa_clips.md) con hoja de fotogramas y tiras de la franja inferior. Revisar:
     - Geografía: patio (Gerardo IZQ., Herminia DER.), comedor (Regina/Gerardo IZQ., Herminia DER.), cocina (Ignacio IZQ., Herminia DER.), cena (Gerardo/Regina sentados IZQ., Ignacio y Herminia DER.), gancho (Gerardo IZQ., Regina DER.).
     - Nadie en los bordes ni de espaldas en primer plano, nadie entrando a cuadro, sin sombreros, sin niños (ni en el nacimiento animado ni de extras).
     - Una sola piñata (que no se mueva sola), un solo nacimiento (i2: figuras estables, sin morph), una sola olla y un plato de buñuelos (i1), un solo jarrito (c21), una sola canasta (c02).
     - Subtítulos quemados, 2ª frase perdida, palabras repetidas, morphs, sin dedo acusador.
  4. Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Si un clip de 2 frases vuelve a perder la 2ª, partirlo (cNN + cNNb) como c14/c14b de regreso-20.
  5. `python -I phr.py`, pasar la EDL a rangos medidos (media ≤ 1.9 s) y `python -I edit.py`. Verificar (sincronía en 5 puntos, ritmo, LUFS/pico, marca MAJESTIC arriba a la izquierda) y mandar a Telegram con caption.txt.
- Riesgos:
  - c23 "Como usted diga, señor." es una sola frase de 6 s: puede salir con aire; recortar en el montaje.
  - c32 (gancho) y c31: tono "calculador/frío" puede frenar a Flow; SOFT los suaviza desde el 2º intento.
  - i2 (nacimiento): figuras que se muevan o cobren vida; usar solo 1–1.5 s o quitarlo.
  - c21 brindis con jarrito: que no aparezcan otras manos brindando.
  - c33 (CTA): que no salga mudo ni rígido.
  - Pronunciación de "Herminia", "buñuelos", "Nochebuena", "guayaba", "Ándale".

- 2026-11-05: c18 regenerado OK (sin letras). v1 montada y verificada: renders/v1.mp4, 165.2 s, 85 planos (media 1.94 s), -14.1 LUFS, -1.7 dBTP, sincronía ≤ 1 cuadro en 5 puntos, transcripción completa en orden. Pendiente: revisión del usuario y Telegram (no enviado).
