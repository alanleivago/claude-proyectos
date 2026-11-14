---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte1, historia-original, navidad]
relatedTo: [sazon-concha, nochebuena, posada]
---
# intercambio (La Virgen de los Villaseñor · Parte 1, video 22): estado
- Historia ORIGINAL navideña (intercambio de regalos de Nochebuena en una familia acomodada), inspirada en "Se esforzaba por toda su familia pero nadie la valoraba" (3.1M) y "Mi suegra se adueñó de nuestra casa" (2.2M). Fórmula: humillación en la 1.ª línea (Constanza le regala un mandil a Fabiola: "para que no se te olvide cuál es tu lugar") → giro de poder (Fabiola le regala a Aurora la Virgen de Casimiro que Constanza tiró, pegada pieza por pieza) → payoff (Aurora le devuelve el mandil a Constanza y Fabiola pone la Virgen en el nacimiento) → gancho (Constanza: "la tiré por lo que mi papá escondió adentro de la base").
- Distinta de nochebuena (hijo avergonzado, ponche, testamento) y de posada (mercado, hoja de escritura): sin papeles, herencias ni dueños escondidos.
- Marca: **MEXI STORIES**. Música y marca de agua de pieces/_marcas/MEXI (edit.py, BRAND = "MEXI"); no hay music/ propia.
- Archivos listos:
  - guion.md y caption.txt (formato Parte 1, hashtags navideños).
  - lines.json: fuente única de clips.py (465 palabras).
  - clips.py, con 37 clips: c01–c32, r1–r4 e i1. Son 240 s hablados en bruto, más 30 s de mudos.
    - Todos los planos con diálogo son de una persona: `gaze(side)` + ONE + ALONE. Nunca "looking at X off-screen".
    - NOSUB + CLEAN (QA nochebuena c18) y END al final de cada diálogo; NODOUBLE en los planos de riesgo (c01, c02, c06, c14, c18, c29).
    - Una pieza de cada utilería: una Virgen (hoja PROP_VIRGENCASIMIRO), un mandil, una caja de cartón, una cajita blanca. El nacimiento solo lleva a San José, buey y burro (nunca figura del niño). Nadie con sombrero, gorro navideño ni lentes.
    - SAFE/SOFT con \b (incluye las frases fuertes del diálogo: "cuál es tu lugar en esta casa", "que nos da pena", "la tiró a la basura", "se nos acaba todo"), variant, NOREF (también quita la hoja de la Virgen), TRIES=6, 17 s entre clips y gatito de control.
    - Guarda en clips/, imprime "FIN P1", acepta IDs y mueve la versión vieja a clips/old/.
  - make_sheets.py: 8 hojas nuevas (5 personajes, 2 locaciones y la Virgen) + control md5 DUPLICADO; --reupload. Imprime "FIN HOJAS".
  - phr.py.
  - edit.py: EDL en borrador por índices de línea, ganancia 0 en los mudos, BLACK 0,4 s antes del CTA (c32), cama cálida c27 → c29, loudnorm en dos pasadas, salida renders/v1.mp4.
- Hojas nuevas (aún no generadas; nombres verificados como únicos en pieces/*/chars y en todos los make_sheets.py): FABIOLA_OCHOA, CONSTANZA_VILLASENOR, GERMAN_ALTAMIRANO, EMILIO_VILLASENOR, AURORA_VILLASENOR, LOC_SALAVILLASENOR, LOC_PATIOVILLASENOR, PROP_VIRGENCASIMIRO.
- Nada generado en Flow todavía.
- Siguiente:
  1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, correr `md5sum chars/*.jpg` y armar una hoja de contactos. Cada nombre tiene que ser su persona o lugar y los personajes no se parecen entre sí (Germán con barba gris, Emilio lampiño y rizado; Constanza de verde, Fabiola de vino). Nadie lleva sombrero ni lentes; el nacimiento sin figura del niño; la Virgen es una sola.
  2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
  3. QA con hoja de fotogramas y tiras de la franja inferior.
- Revisar en el QA:
  - Geografía: sala (Aurora sentada al CENTRO, Constanza y Germán DER. junto al árbol, Fabiola y Emilio IZQ.), patio (Fabiola IZQ., Emilio DER.; de noche Constanza IZQ., Germán DER.), payoff (Fabiola IZQ. junto al nacimiento, Emilio DER.).
  - Nadie en los bordes y ningún doble (otro vestido verde, otro suéter vino).
  - Una sola Virgen y siempre la misma (manto azul, grietas); el nacimiento con el hueco junto a José hasta c27; ninguna figura del niño; ninguna tarjeta ni letra.
  - El mandil: Constanza (c01) → Fabiola (c02) → Aurora (c25) → Constanza (c26). La caja de cartón con Fabiola en c05, c10–c13; la cajita blanca solo en c06.
  - Patio de noche (c29–c31) oscuro de verdad; el de c09–c13, con farolitos encendidos.
  - Subtítulos quemados, frases repetidas, morphs, personajes que entran caminando, manos o utilería que cambian de lado.
- Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Luego `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y `python -I edit.py`. Verificar (sincronía en 5 puntos, ritmo ≤ 1,9 s, LUFS y pico, marca) y mandar a Telegram con caption.txt.
- Riesgos:
  - i1: manos que abren la caja y sacan la Virgen (una sola figura, sin manos extra).
  - c15/c17/c21/c24: Aurora con la Virgen en las manos o en el regazo (deformación de la figura).
  - c27: poner la Virgen junto a San José en el nacimiento (manos y figuras).
  - r4: mirar la base de la Virgen sin letras ni tapitas inventadas con texto.
  - Pronunciación de "Villaseñor", "Casimiro", "Fabi", "póntelo", "llorarla" y "regalito".
- 2026-11-06: QA 2/3 hechos (c05, c15, c18, c25, c32 v4 OK; c07, c23 y c27 con crop de todo el clip por el pesebre de la hoja). renders/v1.mp4 montado: 159.4 s, 81 planos (media 1.99 s), -14.1 LUFS, -1.8 dBTP, sincronía ±1 fotograma, transcripción completa en orden. Falta: aprobación del usuario y Telegram (no enviado).
