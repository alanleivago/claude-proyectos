---
type: handoff
status: active
tags: [atrium, novelas, sin-marca, parte1, historia-propia, referencias3]
relatedTo: [huipil-robado, tiendita-justa, referencias3]
---
# bascula-limon (La Báscula Arreglada · Parte 1): estado

## La historia
- Historia propia inspirada en la premisa n.º 10 de fuentes/referencias3/resumen.md (ref 7702205802534194435 de @relatos.de.vida.9, 245K). Mismos beats con personajes, diálogo y prueba nuevos.
- Bulmaro, el único acopiador del pueblo, le roba a don Fermín uno de cada cinco kilos con la báscula. Daniela (31, contadora) lo prueba con un bulto de cemento de 50 kg que marca 40. Bulmaro los veta por teléfono. Gancho: Daniela grabó la prueba y mañana todos los productores pesarán en otra báscula delante de Bulmaro; don Chalo les avisó. Sin Navidad.
- Guion pasado por la skill humanizer: frases cortas de telenovela, sin rayas ni contrastes de relleno.

## Marca
**SIN MARCA**: edit.py, BRAND = "SINMARCA". brand_wm() da un png transparente (sin marca de agua) y la música sale de pieces/_marcas/SINMARCA. Sin carpeta music/ propia.

## Archivos listos
- guion.md y caption.txt (formato Parte 1, #parte1).
- lines.json: fuente única de clips.py (430 palabras, unos 190–200 s en bruto; montaje objetivo 2:20–2:40).
- clips.py, con 35 clips (c01–c31 y r1–r4), 234 s de generación.
  - Todos los planos son de una persona: gaze(side) + ONE + ALONE (el insert r2 es solo la báscula y el bulto, con SOLO).
  - NOSUB + CLEAN + END en cada diálogo; NODOUBLE en los de riesgo.
  - SAFE/SOFT, incluidas las frases fuertes del diálogo.
  - variant, NOREF (también quita las hojas de locación), TRIES=6, gatito de control, reload_flow() en fallos y 17 s entre clips.
  - Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P1".
- make_sheets.py: 7 hojas (4 personajes, 3 locaciones) con control md5 DUPLICADO y --reupload; imprime "FIN HOJAS".
- phr.py.
- edit.py: EDL en borrador por índices de línea, ganancia 0 en los mudos y BLACK 0.4 s antes de c31. Música: suspenso hasta c10, cama cálida de c10 a c13 (deciden probar la báscula) y suspenso de c13 al final. Loudnorm en dos pasadas y --remix. Salida en renders/v1.mp4.

## Hojas nuevas
Aún no se generaron. Nombres verificados como únicos en pieces/*/clips.py y make_sheets.py (se evitaron ABUNDIO_* y ROGELIO_*, que ya existen).
- Personajes: FERMIN_ZAVALA, DANIELA_ZAVALA, BULMARO_PADILLA y CHALO_MORENO.
- Locaciones: LOC_ACOPIOLIMON, LOC_HUERTALIMON y LOC_PORCHEZAVALA.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, correr `md5sum chars/*.jpg` y armar hoja de contactos: Fermín (sombrero, bigote blanco) contra Chalo (calvo, camisa verde olivo).
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
3. QA con hoja de fotogramas, franja inferior y bordes. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
4. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y correr `python -I edit.py` (o `--remix`).
5. Verificar sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS y pico, y que NO haya marca de agua.
6. Telegram con caption.txt (3er arg = SIN MARCA).

## Revisar en el QA
- Geografía: acopio, Bulmaro DER. y Fermín/Daniela IZQ.; huerta, Fermín IZQ. sentado y Daniela/Chalo DER.; porche, Fermín IZQ. y Daniela DER.
- Dobles: ningún segundo sombrero de palma, guayabera crema, blusa terracota ni camisa verde olivo. Sin trabajadores de fondo en el acopio.
- Utilería: báscula mecánica sin pantalla ni números; bulto de cemento sin letras; libreta en la mano izquierda; celular con la pantalla de espaldas.
- r2 (insert de la báscula): que no aparezcan números, manos ni texto.
- Fallos de Omni: subtítulos quemados, frases repetidas, 2.ª frase perdida y morphs.
- Pronunciación de "Bulmaro", "mermado", "seiscientos cuarenta" y "pésenos".
