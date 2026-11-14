---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte1, navidad]
relatedTo: [regreso-20]
---
# posada (La Posada del Mercado · Parte 1, video 19): estado
- Historia ORIGINAL navideña (fórmula de las ganadoras, sin ref). No se cruza con pieces/nochebuena (hijo avergonzado de su madre).
- Marca: **MEXI STORIES** (edit.py, BRAND = "MEXI"; música y marca de agua de pieces/_marcas/MEXI, arriba a la derecha; sin music/ propia).
- Archivos listos: guion.md, lines.json (fuente única de diálogos, 430 palabras ≈ 225 s de voz), clips.py (37 clips: c01–c25 + c13b, r1–r7, i1–i4; 256 s en bruto; NOSUB al final de cada diálogo, SOLO/ONE/ALONE en los primeros planos, gaze(side), nadie con sombrero, una carpeta / un jarrito / una clavija / una piñata, multitud solo en r3 y r5 (planos abiertos mudos), SAFE/SOFT con \b, variant, NOREF, TRIES=6, 17 s entre clips, gatito de control, acepta IDs y mueve la versión vieja a clips/old/, imprime "FIN P1"), make_sheets.py (6 hojas nuevas con control md5 DUPLICADO, imprime "FIN HOJAS"), phr.py, edit.py (EDL en borrador por índices de línea; salida renders/v1.mp4), caption.txt.
- Hojas nuevas (nombres únicos en pieces/*/chars): CATALINA, IGNACIO, BRUNO, HERMINIA, LOC_ARCOS, LOC_PLAZUELA.
- Nada generado en Flow todavía. Una sesión de Flow a la vez: si otra pieza está generando, esperar su "FIN".
- Siguiente:
  1. `python -I make_sheets.py > sheets_log.txt` (esperar "FIN HOJAS"; si hay DUPLICADO, borrar chars/dup/<nombre>.jpg y repetir). Revisar las hojas en hoja de contactos: mestizos, ropa correcta, que no se parezcan entre sí, LOC_ARCOS con pesebre vacío y una sola piñata.
  2. `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P1", Traceback e "intento 6").
  3. QA con hoja de fotogramas y tiras de la franja inferior. Revisar:
     - Geografía: pleito (Cata/Nacho IZQ., Bruno DER.), procesión (todos IZQ., Bruno DER.), pidiendo posada (Nacho DER. afuera, Cata IZQ. adentro), aparte (Herminia IZQ., Cata DER.).
     - Luces: encendidas c01–c07 e i1 (se apagan); apagadas r2–c18 e i2/i3 (se encienden en i3); encendidas desde r5.
     - Nadie en los bordes, nadie aparece de golpe, sin sombreros; procesión solo de adultos, sin doble de Bruno (abrigo gris carbón) en r3/r5.
     - Una sola carpeta negra sin sobre ni sello (c10–c18, i2), un solo jarrito (r1, i4, c22, r6), Herminia siempre con una sola vela, pesebre vacío.
     - Subtítulos quemados, frases repetidas, morphs, sin dedo acusador.
  4. Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Luego `python -I phr.py`, pasar la EDL a rangos y `python -I edit.py`. Verificar (sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS/pico, marca MEXI a la derecha) y mandar a Telegram con caption.txt.
- Riesgos:
  - r3/r5: multitudes con velas (gente ajena, objetos de más, dobles); son planos abiertos mudos, se pueden recortar o cambiar por un plano medio.
  - i1/i3: que las luces no se apaguen/enciendan de verdad; si falla, usar r2 como corte de "apagón".
  - c19/c20: los versos de posada pueden salir cantados con música o repetidos; van "half sung", revisar.
  - c24 (gancho): que no aparezca otra persona en el portal vacío.
  - c25 (CTA): que no salga mudo ni rígido.
  - Pronunciación de "Herminia", "borreguitos", "os pido posada".
- 2026-11-05: regenerados c07 r2 c09 c16 c21 c23 revisados; montaje renders/v1.mp4 (155.7 s, 79 planos, -14.2 LUFS, pico -1.7 dBTP). Fallbacks: punch-in en la 1.ª frase de c07/c16/c21/c23 (figura oscura en el borde), r2 desde 2.0 s, "Y este pueblo también" sale de clips/old/c16_v1 (el c16 nuevo no la dice). Falta: revisión del usuario y Telegram.
