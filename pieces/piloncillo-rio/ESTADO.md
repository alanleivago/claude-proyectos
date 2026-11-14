---
type: handoff
status: active
tags: [atrium, novelas, sin-marca, parte1, remake-transformado, capos, huasteca, san-luis-potosi, piloncillo]
relatedTo: [cafe-neblina, cenote-campana, atrium-vista]
---
# piloncillo-rio (El Paso del Río · Parte 1): estado

## Video base
- Remake transformado de **"Le dio 5 minutos… y no le creyó | Parte 1 (Aurelio, avioneta, comandante)"** de @atriumstories_ (7704831377383951647, **298K vistas**, 171 s, 90 planos). Análisis: `fuentes/atrium-vista/videos/7704831377383951647_analisis.md`.
- Por qué este: los de más de 1M ya tienen remake (Leche: agua-hacienda y chocolate-rancho; la patrona: medalla-mezcal; El Retén: reten-sierra y cenote-campana). La re-subida de El Retén (334K) es el mismo video, "Lo corrió de la hacienda" (330K) es hacienda-sangre y "Me dejó la hacienda vacía" (312K) es cafe-neblina. Este (298K, capos) es el siguiente sin usar.
- Del original queda el esqueleto: humillación + plazo → el humillado es la figura de poder y llega su gente → plazo invertido → giro familiar → castigo en la Parte 2.

## Qué se cambió
- Escenario y región: pista de tierra roja con avioneta y palmar → paso de balsa en un río turquesa de la Huasteca potosina (San Luis Potosí, región no usada en pieces/) y una molienda de piloncillo.
- Oficio: capo con cargamento → dueño de una molienda de piloncillo que llega en troca vieja y huaraches; el abusador ya no es un comandante federal (sin uniformes) sino Rigoberto, un muchacho que encadenó el paso de la balsa.
- Humillación y plazo: extorsión de un millón → le avienta un cono de piloncillo al río: "Diez minutos, viejito. O te regresas por donde viniste." Cobra con "la mitad de la carga" (sin cifras de dinero).
- Plazo del poderoso: "cinco minutos" con reloj dorado → "Antes que espese el piloncillo" (el cazo de la molienda es el reloj, i03).
- Gente que llega: sicarios armados en un palmar → Celerina, la encargada de la molienda, con cuatro camionetas azul marino y hombres con las manos cruzadas. Sin armas.
- Inversión: "¿Diez minutos me diste, Rigoberto? Ahora son tuyos. Abre esa cadena. Y hoy mismo te vas del río."
- Personaje nuevo sin equivalente: Crispín, el balsero al que le quitaron la balsa; Fortino se la devuelve (escena cálida).
- Giro: no había giro familiar (el original acaba con "¿también vienen por allá?") → quien le rentó el paso a Rigoberto es Leobardo, el hijo de Fortino, que mira desde la otra orilla junto a su troca blanca.
- Objeto clave: dólares, avioneta, reloj dorado → cono de piloncillo, cadena con candado, cazo de cobre, balsa de cable.
- Nombres: todos nuevos y únicos en pieces/ (Ulises, Anselmo, Zamudio, Barragán, Olvera, Montiel, Ledesma, Quezada, Saldívar ya existían y se descartaron). Fortino Tavera, Rigoberto Urbina, Crispín Mireles, Celerina Pantoja, Leobardo Tavera.
- Diálogo: las 68 frases son nuevas; ninguna viene del original ni de cafe-neblina.
- CTA: moraleja + "¿Quieres saber qué le pasó al comandante?" → Fortino a cámara: "¿Ustedes qué harían con Leobardo? Dale me gusta y sígueme para la segunda parte."
- Sin Navidad.

## Marca
**SIN MARCA**: edit.py, BRAND = "SINMARCA" (kit pieces/_marcas/SINMARCA: sin marca de agua, música propia de suspenso).

## Archivos
guion.md, caption.txt, lines.json (fuente única), clips.py (45 clips: 34 hablados c01-c34, 7 insertos i01-i07, 4 reacciones r1-r4; copia de cafe-neblina con todas sus defensas: gaze + ONE + ALONE, NOSUB + CLEAN + END, NODOUBLE, SAFE/SOFT con las frases fuertes, variant, NOREF, TRIES=6, gatito como IMAGEN, md5 duplicados, reload_flow, new_project; imprime "FIN P1"), make_sheets.py (5 personajes + LOC_PASORIO + LOC_TRAPICHE = 7 hojas, "ordinary non-famous face", control md5 DUPLICADO, --reupload), phr.py, edit.py (EDL vacía, se arma desde renders/phr.json; música cálida de c25 a c27).
- `python -m py_compile` OK en clips.py, make_sheets.py, edit.py y phr.py. IDs de CLIPS = claves de lines.json (comprobado sin importar).

## Avance
- 2026-11-08: archivos escritos. NO se generó nada en Flow. Faltan: 7 hojas (make_sheets.py), clips, QA, phr.py, EDL y montaje.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes y distintas (Fortino bajito con bigote blanco, Rigoberto flaco engominado, Crispín correoso con gorra, Leobardo con lentes), solo Fortino con sombrero.
2. `python -I clips.py > clips_log.txt` y QA de cada clip (morphs, bordes, la camisa de palmeritas igual, la troca roja a la izquierda y el río a la derecha, las camionetas sin letras, la pronunciación de "Fortino", "Rigoberto", "Crispín", "Leobardo", "piloncillo", "espese").
3. phr.py → EDL en edit.py → montaje y verificación (sync en 5 puntos, ≤2 s por tramo, LUFS/pico, sin marca de agua) → Telegram con caption.txt (3er arg SIN MARCA).
- 2026-11-09: hojas: Flow daba "actividad inusual" en imágenes → proyecto nuevo dadf6828 + recarga; 7 OK a ojo. Clips 45/45 (c08 tuvo que reupload de hojas a mitad). QA: regenerados c26 (gorra doble), i01 (nadador en el río), c08 (salía Rigoberto en la línea de Crispín; ahora Crispín, se salta un "mejor" repetido). c34 regenerado salió mudo → se usa el original (clips/old/c34_v2_mudo.mp4 aparte). c03 cortado a 3.75 s ("de la carga" repetido). Fuera i06 (botas sin dueño).
- renders/share.mp4: 126.7 s, 82 tramos (1.56 s/tramo), -14.3 LUFS, -2.1 dBTP, sync 0 ms en 5 puntos, BLACK 120.6 s, sin marca. Revisión API v1: renders/share_revision.md. NO enviado a Telegram.
- 2026-11-09 00:35: CTA c34 regenerado (variante 0 de cta_variants.py: primer plano, media sonrisa, ceja, pausa; línea completa con voz). Re-montado: 126.7 s, 82 tramos, -14.3 LUFS, -2.1 dBTP.
