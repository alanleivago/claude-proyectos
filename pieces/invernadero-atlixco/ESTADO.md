---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte1, remake-transformado, capos, matriarca, atlixco, puebla, nochebuenas]
relatedTo: [piloncillo-rio, cafe-neblina, cenote-campana, atrium-vista]
---
# invernadero-atlixco (Las Nochebuenas de Atlixco · Parte 1): estado

## Video base
- Remake transformado de **"Veinte años a su lado… y lo vendieron | Parte 1 (Aurelio, federales, túnel)"** de @atriumstories_ (7704056500502793502, **275K vistas**, 116 s, 61 planos). Análisis: `fuentes/atrium-vista/videos/7704056500502793502_analisis.md`.
- Por qué este: los de más de 1M ya tienen remake (Leche: agua-hacienda y chocolate-rancho; la patrona 1.5M: medalla-mezcal; El Retén: reten-sierra y cenote-campana). La re-subida de El Retén (334K) es el mismo video, "Lo corrió de la hacienda" (330K) es hacienda-sangre, "Me dejó la hacienda vacía" (312K) es cafe-neblina y "Le dio 5 minutos" (298K) es piloncillo-rio. Este (275K, capos) es el siguiente sin usar. ("Se burlaron del padre", 221K, es padre-veladoras.)
- Del original queda el esqueleto: humillación + plazo → llega la figura de poder → plazo invertido → giro familiar → castigo en la Parte 2.

## Qué se cambió
- Escenario y región: rancho con ramada, casa de piedra, túnel y cauce seco → invernadero de nochebuenas en el valle de Atlixco, Puebla (región no usada en pieces/), con el Popocatépetl al fondo, y el patio de talavera de una casona.
- Oficio: patrón con negocio ilícito y dinero en la mesa → dueña de un invernadero de nochebuenas; el abusador ya no es una comandante federal (sin uniformes) sino Nazario, un acaparador de flores.
- Humillación y plazo: los federales rodean el rancho y el patrón acusa a su hombre de confianza → Nazario le rompe una maceta a Efrén, el encargado: "Hasta que den las seis, Efrén. O tu patrona se queda sin cosecha." (sin cifras de dinero).
- Reloj: las campanas de la parroquia (i03). Gente que llega: los camiones de redilas del valle cargados de nochebuenas, productores con los brazos cruzados. Sin armas.
- Inversión: "¿Hasta las seis le diste? Ya sonaron, Nazario. Ahora el plazo es tuyo. Antes que den las siete, te vas del valle."
- Giro: el hijo traidor que espera al final del túnel por celos de la herencia → Ezequías, el esposo de Hermelinda, le dio las llaves y firmó el trato; viene en la camioneta del villano. El hombre de confianza acusado en falso no existe aquí: Hermelinda confía en Efrén desde el principio.
- Objeto clave: fajos de dólares, maleta, celular con audio → maceta de nochebuena rota y un llavero de nochebuena tallado en madera.
- Nombres: todos nuevos y únicos en pieces/ (Isauro ya existía y se descartó): Hermelinda Corona, Efrén Cuautle, Nazario Bretón, Rufina Tecuapetla, Ezequías Vilchis.
- Villano y traidor distintos a simple vista: Nazario 52, rapado, panzón, candado negro, polo mostaza; Ezequías 74, flaco, pelo y barba blancos largos, boina gris.
- Diálogo: las 68 frases son nuevas; ninguna viene del original ni de piloncillo-rio.
- CTA: "¿Quieres ver qué hago con el que me vendió?" → Hermelinda a cámara, con sonrisa pícara y pausa: "¿Ustedes perdonarían a Ezequías? Dale me gusta y sígueme para la segunda parte."
- Navidad ligera: temporada de nochebuenas (sin posada, cena ni aguinaldo).

## Marca
**VISTA STORIES**: edit.py, BRAND = "VISTA" (kit pieces/_marcas/VISTA: marca arriba al centro y=135, 22 px, alfa 80, música propia).

## Archivos
guion.md, caption.txt, lines.json (fuente única), clips.py (45 clips: 34 hablados c01-c34, 7 insertos i01-i07, 4 reacciones r1-r4; copia de piloncillo-rio con todas sus defensas: gaze + ONE + ALONE, NOSUB + CLEAN + END, NODOUBLE, SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6, gatito como IMAGEN, md5 duplicados, reload_flow, new_project; imprime "FIN P1"), make_sheets.py (5 personajes + LOC_INVERNADERO + LOC_CASONA = 7 hojas, "ordinary non-famous face", control md5 DUPLICADO, --reupload), phr.py, edit.py (EDL vacía, se arma desde renders/phr.json; música cálida de c24 a c27).
- `python -m py_compile` OK en clips.py, make_sheets.py, edit.py y phr.py. IDs de CLIPS = claves de lines.json, mismo orden (comprobado leyendo el texto, sin importar). Todos los @{ASSET} de clips.py tienen hoja en make_sheets.py.

## Avance
- 2026-11-09: archivos escritos. NO se generó nada en Flow. Faltan: 7 hojas (make_sheets.py), clips, QA, phr.py, EDL y montaje.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes y distintas (Hermelinda alta con chongo plata, Efrén fornido con bigote, Nazario rapado y panzón, Rufina bajita con trenza, Ezequías flaco con barba blanca larga y boina).
2. `python -I clips.py > clips_log.txt` y QA de cada clip (morphs, bordes, el broche y el abrigo de Hermelinda, el polo mostaza, invernaderos a la izquierda y camioneta negra a la derecha, camiones sin letras, el llavero igual en c07, i02 y c31; pronunciación de "Hermelinda", "Efrén", "Nazario", "Rufina", "Ezequías", "nochebuena").
3. phr.py → EDL en edit.py → montaje y verificación (sync en 5 puntos, ≤2 s por tramo, LUFS/pico, marca VISTA visible) → Telegram con caption.txt (3er arg VISTA).
- 2026-11-09: 7 hojas OK a ojo. Clips 45/45 (FIN P1), sin md5 duplicados. QA: audio = lines.json (c14 "ni ni" dentro de la frase, sin hueco para cortar). CTA c34 con carisma (se toca el broche, sonríe). i04 0–3 s es una actriz ajena (solo 3.3–4.8). Crops de borde en renders/edlcfg.json.
- renders/share.mp4: 133.5 s, 81 tramos (1.66 s/tramo), -14.4 LUFS, -2.2 dBTP, sync 0 ms en 5 puntos, BLACK 127.2 s, VISTA arriba al centro. Revisión API: renders/share_revision.md. NO enviado a Telegram.
- PENDIENTE (sin créditos de Flow): regenerar c32 (Efrén con llaves plateadas modernas; el llavero clave es de hierro con nochebuena) → prompt ya corregido en clips.py: `python -I clips.py c32` y re-montar.
