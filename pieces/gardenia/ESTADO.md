---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte1, historia-original]
relatedTo: [intercambio, sazon-concha, fierro-herradura]
---
# gardenia (La Boda de las Gardenias · Parte 1, video 23): estado
- Historia ORIGINAL, no navideña, inspirada en `DfBf9XjxCJO` ("La quinceañera sin padrinos", 2.1M y 165K likes): es la única ★ del ranking que ninguna pieza había usado. Se toma el mundo, sin quinceañera ni hijos.
- Fórmula:
  - Humillación en la 1.ª línea: Leticia, la hermana rica, le dice a Rosaura: "Ya hablé con tus padrinos… Ninguno va a ir a tu boda".
  - Giro de poder: don Gilberto, el viudo de la gardenia de los sábados, es el dueño del salón Las Gardenias.
  - Payoff: a Leticia le cierran la puerta, y Rosaura le devuelve la frase "me faltan manos para servir las mesas".
  - Gancho: Leticia le dice a Abel por teléfono "haz lo que acordamos".
- Marca: **VISTA STORIES**. La música y la marca de agua salen de pieces/_marcas/VISTA (edit.py, BRAND = "VISTA"); no hay carpeta music/ propia.
- Archivos listos:
  - guion.md y caption.txt (formato Parte 1).
  - lines.json: fuente única de clips.py (475 palabras ≈ 230–240 s).
  - clips.py, con 39 clips: c01–c34 y r1–r5. Suman 280 s de generación.
    - Todos los planos con diálogo son de una persona: gaze(side) + ONE + ALONE.
    - NOSUB + CLEAN + END en cada diálogo.
    - NODOUBLE en los de riesgo: c01, c02, c06, c11, c18, c26, c27 y c32.
    - SAFE/SOFT, incluidas las frases fuertes del diálogo.
    - variant, NOREF (también quita las hojas de locación), TRIES=6, gatito de control y 17 s entre clips.
    - Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P1".
  - make_sheets.py: 7 hojas con control md5 DUPLICADO y --reupload; imprime "FIN HOJAS". phr.py.
  - edit.py:
    - EDL en borrador por índices de línea, con ganancia 0 en los mudos y BLACK 0.4 s antes de c34.
    - Música: cama cálida de c20 a c33. Loudnorm en dos pasadas. Salida en renders/v1.mp4.
- Hojas nuevas (aún no generadas; nombres verificados como únicos en pieces/*/chars, make_sheets.py, clips.py y lines.json): ROSAURA_ALCANTARA, LETICIA_ALCANTARA, ABEL_SANDOVAL, CHONA_BECERRA, GILBERTO_ARRIAGA, LOC_PATIOALCANTARA, LOC_PUERTAGARDENIAS.
  - Las locaciones son simples: nada religioso, sin adornos, letreros ni utilería suelta (lección de intercambio).
- Nada generado en Flow todavía.
- Siguiente:
  1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO y correr `md5sum chars/*.jpg`. Armar una hoja de contactos y comprobar:
     - Rosaura sin velo.
     - Leticia de azul rey con perlas.
     - Abel lampiño, para distinguirlo de Gilberto (pelo blanco, bigote, abrigo camello).
     - La mesa del patio vacía.
     - La puerta del salón sin letras.
  2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
  3. QA con hoja de fotogramas, tiras de la franja inferior y bordes.
  4. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
  5. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y `python -I edit.py`.
  6. Verificar: sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS y pico, marca. Luego Telegram con caption.txt.
- Revisar en el QA:
  - Geografía:
    - Patio de tarde: Rosaura, Abel y Chona IZQ.; Leticia y Gilberto DER.
    - Anochecer: Rosaura IZQ., Abel DER.
    - Noche con un foco: Rosaura IZQ.; Gilberto y Chona DER.
    - Puerta del salón: Leticia IZQ.; Gilberto y Rosaura DER.
  - Ningún doble: otro vestido azul, otro vestido blanco, otra mujer de pelo gris.
  - Nadie en los bordes; nadie que entre caminando.
  - Utilería:
    - El pastelito, uno solo y sin tocar (c09).
    - Una sola gardenia (c14 → c15 → r2).
    - Una sola olla (c26).
    - El celular con la pantalla de espaldas (c33, r5).
    - Ningún sobre, papel ni carpeta inventados.
  - Sin sombreros, velos ni lentes que aparezcan.
  - Subtítulos quemados, frases repetidas, 2.ª frase perdida, morphs.
- Riesgos:
  - c09: Leticia junto al pastel (que no lo toque ni salgan dos pasteles).
  - c32/c34: Rosaura en la puerta abierta con luz de adentro (que no aparezca gente ni decoración de salón).
  - r5: Abel con el celular (pantalla sin contenido, que no "salga" nada de la pantalla).
  - Pronunciación: "Gardenias", "quítatelo", "pastelito", "lavaderos", "acordamos", "Gilberto".
