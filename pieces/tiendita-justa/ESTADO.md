---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte1, remake, referencias3, precio-justo]
relatedTo: [pedida-mano, referencias3]
---
# tiendita-justa (La Tiendita del Precio Justo · Parte 1, video 25): estado
- Remake de la premisa n.º 1 de fuentes/referencias3/resumen.md: ref ★ 7698839837180169504 (@solreflection, 9.8M). Mismos 11 beats que la ref (gancho, pérdida del villano, éxito, prueba social, flete/bodega, camioneta, envidia, cerca, queja, falsa calma, inspector). Otros nombres y diálogos; atuendos de la ref en otros colores.
- Premisa: Chuy y su papá Aurelio abren una tiendita a precio justo y le vacían la clientela a don Evaristo, que cobraba de más por ser el único. Evaristo pone una queja en la presidencia municipal y un mes después llega el inspector a pedir permisos y amenazar con clausurar.
- Política: sin cifras ni billetes ("precio justo" vago, libreta cerrada, "le adelanto los viajes"); el inspector es civil (traje café, sin gafete); "queja", no "denuncia"; sin niños ni palabras de edad; nadie con sombrero ni gorra; nadie señala; hojas sin letreros ni precios.
- Marca: **MEXI STORIES** (pedida-mano=MAJESTIC → esta=MEXI → siguiente=SIN MARCA). Música y marca de agua desde pieces/_marcas/MEXI (edit.py, BRAND = "MEXI"; arriba a la derecha, margen 36, y=210). No hay carpeta music/ propia.
- Archivos listos:
  - guion.md y caption.txt (formato Parte 1).
  - lines.json: fuente única de clips.py (491 palabras, unos 235–245 s).
  - clips.py: 45 clips (c01–c42 y r1–r3), 326 s de generación.
    - Planos de una persona con gaze(side) + ONE + ALONE; los de la fila lejana (c26, c30, c31, r3) usan far() (ONE sin ALONE, gente desenfocada al fondo).
    - NOSUB + CLEAN + END en cada diálogo; NODOUBLE en los de riesgo.
    - SAFE/SOFT (incluye frases fuertes del diálogo e "inspector" → "the man in the suit"), variant, NOREF (también quita las hojas de locación), TRIES=6, gatito de control, 17 s entre clips.
    - Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P1".
  - make_sheets.py: 14 hojas (8 personajes + 6 locaciones) con control md5 DUPLICADO y --reupload; imprime "FIN HOJAS". phr.py.
  - edit.py: EDL en borrador por índices de línea (76 entradas), mudos r1–r3 con ganancia 0, BLACK 0.4 s antes de c42. Música: suspenso 0→c07, cálida c07→c24, suspenso c24→fin. --remix. Salida en renders/v1.mp4.
- Hojas nuevas (aún no generadas; nombres verificados como únicos en pieces/*): CHUY_MEDINA, AURELIO_MEDINA, EVARISTO_LOZANO, CIPRIANO_ROBLES, TONA_ARELLANO, FIDEL_CARMONA, MARISOL_TREJO, LIC_ZAMARRIPA, LOC_TIENDAEVARISTO, LOC_TIENDITACHUY, LOC_BODEGAFLETE, LOC_CABINAFLETE, LOC_CERCATIENDITA, LOC_VENTANILLAMUNI.
- Nada generado en Flow todavía.
- Siguiente:
  1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO y correr `md5sum chars/*.jpg`. Hoja de contactos:
     - Chuy (camiseta guinda) y Evaristo (cuadros azul/blanco, mandil verde) que no se parezcan; Aurelio con paliacate LISO mostaza; Cipriano sin sombrero.
     - Fidel sin gorra; el inspector sin gafete ni escudos; Marisol sin gafete.
     - Locaciones sin letreros, precios, marcas ni billetes; la tiendita sin caja registradora.
  2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
  3. QA con hoja de fotogramas, tiras de la franja inferior y bordes.
  4. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
  5. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y `python -I edit.py` (o `--remix`).
  6. Verificar: sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS y pico, marca MEXI arriba a la derecha. Luego Telegram con caption.txt.
- Revisar en el QA:
  - Geografía: Evaristo IZQ. / Cipriano DER. (tienda vieja); Chuy IZQ. / Aurelio, Toña e inspector DER. (tiendita); Chuy IZQ. / Fidel DER. (bodega); Chuy volante IZQ. / Aurelio DER. (cabina); Marisol IZQ. / Evaristo DER. (ventanilla).
  - Ningún doble: otra camiseta guinda, otra camisa a cuadros, otra camisa azul cielo, otro traje café, otra blusa lila.
  - Nadie en los bordes ni entrando a cuadro; la fila siempre lejos y desenfocada.
  - Utilería: libreta cerrada en la mano IZQ.; cero billetes, precios o cifras; una sola camioneta, la roja; portapapeles con la hoja de espaldas.
  - Paliacate de Aurelio igual en todos los planos (en la ref cambiaba). Evaristo sin mandil solo en la ventanilla (c32, c34).
  - Subtítulos quemados, frases repetidas, 2.ª frase perdida, morphs.
- Riesgos:
  - c18/c19: "adelanto los viajes" (que no aparezcan billetes en las manos).
  - c37–c41: el inspector (que no salga con gafete, escudo o aspecto de policía).
  - c32–c34: ventanilla (sin banderas, sellos ni letreros).
  - Pronunciación: "Cipriano", "Evaristo", "mercancía", "mayoreo", "flete", "escarmiento", "presidencia municipal", "clausurar".
