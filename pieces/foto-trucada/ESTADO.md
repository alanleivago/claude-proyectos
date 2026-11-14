---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte1, historia-propia, referencias3]
relatedTo: [huipil-robado, casera-recibos, referencias3]
---
# foto-trucada (La Foto que No Era · Parte 1): estado

## La historia
- Historia propia inspirada en la premisa n.º 3 de fuentes/referencias3/resumen.md (ref ★ 7691753795893710100 de @eltiomoet, 3.3M). Mismos beats del viral con personajes, diálogo y trampa nuevos; atuendos de la ref en otros colores.
- A Norma la corren por chismosa y culpa a Rocío, la vecina costurera. Su hija Karla (25) le arregla una foto "para una broma"; la foto aparece en el grupo de la colonia, Hugo se va y la clientela de Rocío desaparece. Gancho: Karla reconoce su trabajo, se lo confiesa a Rocío y lo dirá en la junta de vecinos del domingo; Norma las ve juntas. Sin Navidad.
- Guion pasado por la skill humanizer: frases cortas de telenovela, sin rayas ni contrastes de relleno.

## Marca
**MEXI STORIES**: edit.py, BRAND = "MEXI". Música y marca de agua de pieces/_marcas/MEXI (brand, brand_wm). Sin carpeta music/ propia.

## Archivos listos
- guion.md y caption.txt (formato Parte 1, #parte1).
- lines.json: fuente única de clips.py (430 palabras, unos 190–200 s en bruto; montaje objetivo 2:20–2:40).
- clips.py, con 33 clips (c01–c29 y r1–r4), 228 s de generación.
  - Todos los planos son de una persona: gaze(side) + ONE + ALONE.
  - NOSUB + CLEAN + END en cada diálogo; NODOUBLE en los de riesgo.
  - SAFE/SOFT, incluidas las frases fuertes del diálogo.
  - variant, NOREF (también quita las hojas de locación), TRIES=6, gatito de control, reload_flow() en fallos y 17 s entre clips.
  - Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P1".
- make_sheets.py: 9 hojas (6 personajes, 3 locaciones) con control md5 DUPLICADO y --reupload; imprime "FIN HOJAS".
- phr.py.
- edit.py: EDL en borrador por índices de línea, ganancia 0 en los mudos y BLACK 0.4 s antes de c29. Música: suspenso hasta c23, cama cálida de c23 a c28 (Karla busca a Rocío y confiesa) y suspenso de c28 al final. Loudnorm en dos pasadas y --remix. Salida en renders/v1.mp4.

## Hojas nuevas
Aún no se generaron. Nombres verificados como únicos en pieces/*/clips.py y make_sheets.py.
- Personajes: NORMA_BECERRIL, ERNESTO_BECERRIL, ROCIO_MONTIEL, HUGO_MONTIEL, KARLA_BECERRIL y CLOTILDE_RAMOS.
- Locaciones: LOC_CALLECOLONIA, LOC_DEPAKARLA y LOC_COSTURAROCIO.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, correr `md5sum chars/*.jpg` y armar hoja de contactos: Norma (permanente rojizo, fucsia) contra Clotilde (pelo gris, cárdigan rosa); Ernesto (bigote gris) contra Hugo (barba negra); Rocío (mostaza) contra Karla (mezclilla negra).
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
3. QA con hoja de fotogramas, franja inferior y bordes. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
4. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y correr `python -I edit.py` (o `--remix`).
5. Verificar sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS y pico, y la marca MEXI STORIES visible a tamaño real (arriba a la derecha).
6. Telegram con caption.txt (3er arg = MEXI).

## Revisar en el QA
- Geografía: calle escena 1, Ernesto DER. y Norma IZQ.; calle escenas 2 y 6, Norma IZQ. y Rocío DER.; cocina, Karla IZQ. y Norma DER.; calle escena 4, Rocío IZQ. y Hugo DER.; costura, Rocío IZQ. y Clotilde DER.; calle de noche, Karla IZQ. y Rocío DER.
- Dobles: ninguna segunda blusa fucsia, blusa mostaza, chamarra de mezclilla negra, franela a cuadros, polo azul marino ni cárdigan rosa.
- Utilería: celular con la pantalla de espaldas (la foto nunca se ve); una sola maleta café; vestido azul de Clotilde; cinta métrica de Rocío en todos sus planos.
- Calle: sin números de casa ni letreros; la casa verde y la durazno iguales en todos los planos; de noche, dos cajas de cartón junto a la cochera.
- Fallos de Omni: subtítulos quemados, frases repetidas, 2.ª frase perdida y morphs.
- Pronunciación de "Clotilde", "mustia", "pásemela" y "delatar".
