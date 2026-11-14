---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte1, historia-propia, referencias3, navidad]
relatedTo: [masa-honrada, tiendita-justa, referencias3]
---
# casera-recibos (La Casera de los Recibos · Parte 1): estado

## La historia
- Historia propia inspirada en la premisa n.º 5 de fuentes/referencias3/resumen.md (ref ★ 7702576886957755670 de @relatos.de.vida.9, 1.4M). Mismos beats de los virales, con personajes, nombres, diálogo y prueba final nuevos; atuendos de la ref en otros colores.
- Maricela, enfermera de 31 años, descubre que doña Chelo cobra la misma luz nueve veces y nunca devuelve el depósito, y la echa a la calle a dos días de Nochebuena. Doña Pachita la recoge con ponche y le da la pista de la lista del hospital. Graciela, la jefa de enfermeras, se hará pasar por inquilina nueva la noche de la posada. Gancho: Chelo le renta el cuarto por teléfono sin saber quién es. Ambiente navideño (posada, piñata, ponche, Nochebuena), sin nacimiento ni dinero navideño.
- Guion pasado por la skill humanizer: frases cortas de telenovela, sin rayas ni contrastes de relleno.

## Marca
**MAJESTIC STORIES**: edit.py, BRAND = "MAJESTIC". La música y la marca de agua salen de pieces/_marcas/MAJESTIC (brand, brand_wm). No hay carpeta music/ propia.

## Archivos listos
- guion.md y caption.txt (formato Parte 1, #parte1).
- lines.json: fuente única de clips.py (519 palabras, unos 225–240 s en bruto; montaje objetivo 2:00–2:20).
- clips.py, con 37 clips (c01–c33 y r1–r4). Suman 270 s de generación.
  - Todos los planos son de una persona: gaze(side) + ONE + ALONE.
  - NOSUB + CLEAN + END en cada diálogo; NODOUBLE en los de riesgo.
  - SAFE/SOFT, incluidas las frases fuertes del diálogo.
  - variant, NOREF (también quita las hojas de locación), TRIES=6, gatito de control y 17 s entre clips.
  - Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P1".
- make_sheets.py: 9 hojas con control md5 DUPLICADO y --reupload; imprime "FIN HOJAS".
- phr.py.
- edit.py: EDL en borrador por índices de línea, ganancia 0 en los mudos y BLACK 0.4 s antes de c33. Música: suspenso hasta c16, cama cálida de c16 a c30 (Pachita, el hospital y el plan) y suspenso de c30 al final. Loudnorm en dos pasadas y --remix. Salida en renders/v1.mp4.

## Hojas nuevas
Aún no se generaron. Los nombres se verificaron como únicos en pieces/*/clips.py y make_sheets.py.
- Personajes: MARICELA_ORNELAS, CHELO_VALDIVIA, NANCY_GUILLEN, PACHITA_ROBLES y GRACIELA_MONDRAGON.
- Locaciones: LOC_PATIOCHELO, LOC_COCINACHELO, LOC_SALAPACHITA y LOC_OFIHOSPITAL. Simples: sin letreros, precios ni marcas ni nacimiento; un solo adorno navideño por locación.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, correr `md5sum chars/*.jpg` y armar hoja de contactos: Maricela (suéter azul marino) contra Nancy (chamarra lila, pelo rizado); Chelo (pelo cobrizo, bata verde) contra Pachita (chongo blanco, chal rojo).
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
3. QA con hoja de fotogramas, franja inferior y bordes. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
4. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y correr `python -I edit.py` (o `--remix`).
5. Verificar sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS y pico, y la marca MAJESTIC STORIES visible a tamaño real.
6. Telegram con caption.txt (3er arg = MAJESTIC).

## Revisar en el QA
- Geografía: patio, Chelo DER. y Maricela IZQ.; cocina, Maricela IZQ. y Nancy/Chelo DER.; banqueta, Maricela IZQ. y Nancy/Pachita DER.; sala, Maricela IZQ. y Pachita DER.; oficina, Maricela IZQ. y Graciela DER.
- Dobles: ningún segundo suéter azul marino, bata verde esmeralda, chamarra lila, chal rojo ni blazer gris carbón. Sin otras inquilinas de fondo.
- Navidad: solo las luces y la piñata de estrella en el patio, y las luces y el ponche en la sala. Ningún nacimiento, Niño ni imagen religiosa.
- Utilería: papel doblado sin letras (c01, c03); libreta cerrada (c24); dos maletas azul oscuro; jarrito de ponche en las dos manos; celular al oído con la mano DERECHA.
- Sin uniforme de enfermera ni gafete en Maricela ni en Graciela.
- Fallos de Omni: subtítulos quemados, frases repetidas, 2.ª frase perdida y morphs.
- Riesgos: c08, Chelo ya en la puerta (que no entre caminando); c14, Nancy en la puerta entreabierta (que no salga Maricela en el borde); c30 a c32, llamadas (sin pantalla dividida); pronunciación de "platicadita", "veinticuatro" y "Nochebuena".
