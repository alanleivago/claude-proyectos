---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte1, remake-transformado, figura-de-poder, taxco, guerrero, plateria]
relatedTo: [invernadero-atlixco, piloncillo-rio, cafe-neblina, cenote-campana, atrium-vista]
---
# plata-taxco (Los Faroles de Taxco · Parte 1): estado

## Video base
- Remake transformado de **"Lo corrieron por ayudar a un anciano… y la vida le regresó el favor | Parte 1"** de @atriumstories_ (7700994634381643039, **268K vistas**, 88 s, 40 planos). Análisis: `fuentes/atrium-vista/videos/7700994634381643039_analisis.md`.
- Por qué este: todos los capos de más vistas ya tienen pieza (Leche 1.7M: agua-hacienda y chocolate-rancho; la patrona 1.5M: medalla-mezcal; El Retén 1.1M y su re-subida: reten-sierra y cenote-campana; 330K hacienda-sangre; 312K cafe-neblina; 298K piloncillo-rio; 275K invernadero-atlixco; 221K padre-veladoras). El siguiente sin pieza es este (268K). Está clasificado como bondad-recompensa, pero tiene figura de poder (el empresario que llega a defender al humilde).
- Del original queda solo el esqueleto: humillación + plazo → llega la figura de poder → plazo invertido → giro familiar → castigo en la Parte 2.

## Qué se cambió
- Escenario y región: taller mecánico y banqueta de ciudad → callejón empedrado de Taxco, Guerrero (región no usada en pieces/), con las torres de Santa Prisca, y una mina de plata vieja en el cerro.
- Oficio: mecánico que arregla gratis el coche de un anciano → maestro platero de 64 años con su aprendiz.
- Humillación y plazo: el jefe lo corre por hacer caridad → el joyero de enfrente le tira al empedrado las piezas de la feria: "Antes que prendan los faroles, maestro." Quiere el local (sin cifras de dinero ni deudas).
- Reloj: los faroles del callejón que se prenden uno por uno (i03).
- Figura de poder: el hijo empresario en traje con un sobre → don Anastasio, 72, dueño de la mina, que baja del cerro con una fila de camionetas blancas y sus mineros con los brazos cruzados. Sin armas.
- Lazo con el humilde: "reparaste el coche de mi padre" → "Tú hiciste nuestros anillos de bodas cuando yo no tenía nada."
- Inversión: "Mira los faroles, Gumaro. Ya se te prendieron a ti. Te doy lo mismo que le diste. Antes que amanezca, te vas de Taxco."
- Giro: "el anciano era mi padre" → quien le abrió la puerta a Gumaro y le dio el anillo de la abuela es Leocadia, la nieta de Anastasio, que mira desde el balcón de la joyería.
- Objeto clave: coche beige, sobre, empleo → pulsera de plata con jaguar y obsidiana, y el anillo de plata con estrella (pareja del de Anastasio).
- Nombres: todos nuevos y únicos en pieces/ (Remedios, Tapia y "Tacho" ya existían y se descartaron): Severiano Ocampo, Gumaro Lizardi, Eufrosina Bahena, Anastasio Bermejo, Leocadia Bermejo.
- Villano y traidora distintos a simple vista: Gumaro hombre de 48, bajito, engominado, camisa vino; Leocadia mujer de 29, pelo largo suelto, vestido verde esmeralda.
- Diálogo: las 68 frases son nuevas; se evitaron las formas de invernadero-atlixco ("¿Hasta las seis le diste?", "Ahora el plazo es tuyo", "Pregúntele a él", "¿oyes los motores?").
- CTA: "Sigue la página para que veas la segunda parte" → Severiano a cámara, sonrisa pícara y pausa: "Si ustedes fueran don Anastasio… ¿la perdonan? Dale me gusta y sígueme, que la segunda parte se pone buena."
- Sin Navidad.

## Marca
**MEXI STORIES**: edit.py, BRAND = "MEXI" (kit pieces/_marcas/MEXI: arriba a la derecha, margen 36, y=210, 22 px, alfa 80, música propia).

## Archivos
guion.md, caption.txt, lines.json (fuente única, 343 palabras), clips.py (45 clips: 34 hablados c01-c34, 7 insertos i01-i07, 4 reacciones r1-r4; copia de invernadero-atlixco con todas sus defensas: gaze + ONE + ALONE, NOSUB + CLEAN + END, NODOUBLE, SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6, gatito como IMAGEN, md5 duplicados, reload_flow, new_project; imprime "FIN P1"), make_sheets.py (5 personajes + LOC_TALLERPLATA + LOC_MINA = 7 hojas, "ordinary non-famous face", control md5 DUPLICADO, --reupload), phr.py, edit.py (EDL vacía, se arma desde renders/phr.json; música cálida de c24 a c27).
- `python -m py_compile` OK en clips.py, make_sheets.py, edit.py y phr.py. IDs de CLIPS = claves de lines.json, mismo orden (comprobado leyendo el texto, sin importar). Todos los @{ASSET} de clips.py tienen hoja en make_sheets.py. Las frases de SOFT coinciden con lines.json.

## Avance
- 2026-11-09: archivos escritos. NO se generó nada en Flow. Faltan: 7 hojas (make_sheets.py), clips, QA, phr.py, EDL y montaje.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes y distintas (Severiano flaco calvo con lentes, Gumaro bajito engominado, Eufrosina con paliacate rojo, Anastasio grandote con sombrero y bigote blanco, Leocadia con vestido verde).
2. `python -I clips.py > clips_log.txt` y QA de cada clip (morphs, bordes, faroles apagados antes de i03 y prendidos después, la pulsera del jaguar y el anillo de estrella iguales, el reloj de Gumaro en la izquierda, taller a la izquierda y balcón a la derecha, camionetas sin letras; pronunciación de "Severiano", "Gumaro", "Eufrosina", "Anastasio", "Leocadia", "Taxco").
3. phr.py → EDL en edit.py → montaje y verificación (sync en 5 puntos, ≤2 s por tramo, LUFS/pico, marca MEXI) → Telegram con caption.txt y 3.er arg MEXI.
- 2026-11-09: clips.py importa OK (45 = lines.json). Hojas: Flow devolvió imágenes viejas (EUFROSINA = patio de invernadero, LEOCADIA y LOC_MINA = copias de GUMARO, ANASTASIO duplicado) → chars/mal, assets renombrados con sufijo 2 (EUFROSINA_BAHENA2, ANASTASIO_BERMEJO2, LEOCADIA_BERMEJO2, LOC_MINA2); 7 OK a ojo y subidas.
- Clips: 12/45 hechos (c01–c11, i01, i02) cuando Flow se quedó SIN CRÉDITOS ("No tienes suficientes créditos", cada clip 10 créditos). Al reanudar: `python -I make_sheets.py --reupload` y `python -I clips.py >> clips_log.txt` (sigue desde r1).
