# QA clips · camionero Parte 1 (MEXI, 2026-11-05)

Método (el de regreso-20): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (TEOFILO_TRAILERO, LEONOR_DIRECTORA, CLEMENTE_BODEGUERO, NAYELI_MONITOREO, LALO_CHALECO, FIDEL_CARGADOR, LOC_ANDENCARGA/SALAMONITORES/PASILLORACKS/CUARTOCAJAS) y con la geografía fija de clips.py; tiras del 38 % inferior a 1.5 fps (subtítulos) y tiras de bordes izq./der. (20 %) a 4 fps en los 37 clips; fotogramas completos de los bordes dudosos. freezedetect + cortes (scene > 0.3) + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre WAV cargado con numpy, palabra por palabra contra lines.json, más F0 mediana por clip. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos (Teófilo gorra verde con malla y franela azul a cuadros; Leonor blazer camel y blusa azul rey con dije; Clemente camisa marino, corbata verde, gafete liso, **nunca con saco**; Nayeli blusa lavanda con chongo; Lalo chaleco naranja sin letras; Fidel chaleco gris acolchado y sudadera guinda). Las hojas viejas de chars/mal/ (CLEMENTE_JEFEBODEGA = copia de Teófilo, FIDEL_ESTIBADOR = foto de un pasaporte) no coinciden con nadie: Clemente nunca sale con gorra ni bigote canoso. Sin niños, armas, policías ni uniformes de seguridad, sin extremidades de más, nadie señala con el dedo (manos abiertas en todos). Una sola gorra, una sola llave (c15, r2), una sola tabla (c05, c17, c23), una sola pila de cajas con etiquetas blancas lisas (c17). Pantallas (c10–c12, i1) con la imagen DENTRO del marco y sin texto legible. Geografía bien (monitores a la IZQ., puerta del pasillo a la DER., cajas a la IZQ. y puerta a la DER. en el cuarto). Sin subtítulos en ninguno. Ningún clip congelado ni con cortes internos; nadie aparece de golpe. Voces: hombres 110–160 Hz (Teófilo, Clemente, Lalo, Fidel), mujeres 183–246 Hz (Leonor, Nayeli), cada una con su personaje.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Mano abierta. Audio completo (0.5–5.3). |
| c02 | OK | Audio completo (0.7–6.5). |
| c03 | OK | Audio completo (0.0–8.7). Parche chico en la gorra, ilegible. |
| c04 | **REGENERAR** | Hombro/espalda oscura de otra persona (marino) en primer plano en el borde IZQ. de 0.0 a ~1.5 s; la voz va de 0.0 a 4.46: no se puede recortar. |
| c05 | **REGENERAR** | **Doble de Nayeli** (blusa lavanda y chongo, de espaldas) en primer plano en el borde IZQ. de ~1.5 a ~2.8 s, en medio de la frase. |
| c06 | OK | Las manos que asoman son las suyas (encoge los hombros). Audio completo. |
| c07 | OK | Mano en el pecho. Audio completo. |
| r1 | OK | Se acomoda la corbata. Mudo (alucina "¡Suscríbete!": silenciar). |
| c08 | OK | Lalo da un paso adelante (ya está en cuadro desde el frame 0). Audio completo. |
| c09 | OK | Audio completo, las dos frases (0.0–6.8). |
| c10 | OK | Nayeli sentada a la IZQ. frente a los monitores, mano abierta. Audio completo. |
| i1 | OK | Un monitor, hombre de chaleco gris con carrito dentro de la pantalla, sin texto. Mudo (alucina "¡SUSCRÍBETE!": silenciar). |
| c11 | OK | Audio completo. Parche chico en la gorra, ilegible. |
| c12 | OK | Audio completo, bajo (−24.0). |
| c13 | OK | Mano abierta hacia la puerta (no señala). Voz 0.72–4.5. |
| c14 | OK | Audio completo. |
| c15 | OK | Una llave entre los dedos. Voz 0.72–4.72. |
| c16 | **REGENERAR** | Otro hombre de pelo negro y camisa oscura (nuca/perfil, doble de Clemente) en el borde DER. de ~0.5 a ~1.7 s; la voz arranca en 1.4 s ("Fidel,"): recortar se come la 1ª palabra. |
| r2 | OK | Fidel solo, abre la puerta con una llave. Mudo (alucina "¡Vamos a ver!" sobre el ruido de la cerradura: silenciar). |
| c17 | OK | Una pila de cajas a la IZQ., etiquetas lisas, una tabla. Audio completo (−14.5, fuerte). |
| c18 | OK | Puerta abierta a la DER. Audio completo ("trailer" bien). |
| c19 | OK | Audio completo. |
| c20 | OK | En el marco de la puerta a la DER. Voz 0.44–4.66. |
| c21 | OK | Las dos frases completas (0.8–7.2), "a escondidas" bien. |
| c22 | OK | Voz 1.14–4.84. |
| c23 | OK | Una tabla. Voz 1.02–7.24. |
| c24 | OK | Manos juntas. Audio completo. |
| c25 | **REGENERAR** | Persona de espaldas con ropa oscura (nuca) en primer plano en el borde DER. de 0.0 a ~1.75 s; la voz arranca en 0.0. |
| c26 | OK | En cuadro desde el frame 0. Voz 1.52–2.9. |
| c27 | OK | Voz 0.54–6.46. |
| c28 | OK | Mano abierta hacia la salida. Audio completo. |
| c29 | OK | Audio completo. |
| c30 | **REGENERAR** | Persona de espaldas con ropa oscura en el borde IZQ. de ~0.25 a ~1.5 s; la voz arranca en 0.0. (La mano de ~6 s está abierta, no señala.) |
| c31 | OK | Mano en el pecho. Audio completo, bajo (−24.0). |
| c32 | OK | Fidel camina hacia cámara desde el fondo (en cuadro desde el frame 0, no entra). Audio completo, bajo (−23.6). |
| r3 | OK | Leonor sola, abre los ojos. Mudo (alucina "¡Suscríbete!": silenciar). |
| c33 | **REGENERAR** | CTA: el parche de la gorra trae **letras** ("JUL BOMCO / LEM V'OF BEERS") casi legibles, en primer plano los 10 s. Audio completo (0.76–9.0) y gestos bien. |

## REGENERAR
- **c04**: hombro oscuro de alguien en primer plano en el borde izq. (0–1.5 s, voz desde 0.0).
- **c05**: doble de Nayeli en primer plano en el borde izq. (1.5–2.8 s, en medio de la frase).
- **c16**: doble de Clemente (nuca/perfil) en el borde der. (0.5–1.7 s, voz desde 1.4).
- **c25**: persona de espaldas en el borde der. (0–1.75 s, voz desde 0.0).
- **c30**: persona de espaldas en el borde izq. (0.25–1.5 s, voz desde 0.0).
- **c33**: letras en el parche de la gorra (texto en pantalla).

Cambios en clips.py: constantes `ALONE`, `ONE` (plano de una sola persona, NO por encima del hombro, sin nuca/hombro/oreja de nadie) y `gaze(side)` (mira a un lado de cámara sin nombrar al otro personaje; en todos los fallos el prompt decía "looking at X off-screen" y Omni metió a X en el borde), como en regreso-20 v2. c04, c25 y c30 cambian `look(...)` por `gaze(...)` + ONE + ALONE; c05 además "no other woman in a lavender blouse anywhere"; c16 además "no other man in a dark shirt anywhere". c33 añade `PLAINCAP` (gorra lisa, sin parche, logo ni letras). Se mantienen STYLE, VOICE, NOSUB, END, SOLO, SAFE, SOFT, NOREF, STYLES, TRIES=6, los 17 s entre clips y el gatito de control.

Probado en seco en una copia con gen falso: con IDs, la versión anterior pasa a `clips/old/<id>_vN.mp4` (sin pisar las que ya hay), el resto no se toca, e imprime "FIN P1".

Para regenerar (cuando Flow esté libre): `python -I clips.py c04 c05 c16 c25 c30 c33 > clips_log2.txt`. Revisar después: nadie en los bordes ni en primer plano (tiras de bordes a 4 fps), c33 con gorra lisa y sin letras, voces completas.

## Arreglos menores para el montaje
- **r1, r2, r3, i1**: silenciar el audio (ruido de sala −35 a −42 LUFS; Whisper alucina "¡Suscríbete!").
- **c03, c11, c30**: parche chico en la gorra con un dibujo/letras ilegibles a tamaño de teléfono; se deja. Si se quiere uniformar, tomar c33 nuevo (gorra lisa) como referencia.
- Volumen: c17 (−14.5) y c07 (−16.8) fuertes; c12 y c31 (−24.0), c32 (−23.6) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Arranques tardíos de voz (c26 1.52 s, c22 1.14 s, c23 1.02 s, c21 0.8 s, c33 0.76 s, c13/c15 0.72 s): el montaje por frases (phr.py) los recorta.
- Whisper escribe los números con cifras (10, 90, 100, 20): coinciden con lines.json (diez, noventa, cien, veinte); no hay palabras faltantes, repetidas ni segundas frases perdidas en ningún clip.

## QA v2 + montaje v1 (2026-11-05, clips regenerados; viejos en clips/old/*_v1.mp4)
Mismo método (tiras de bordes izq./der. 25 % a 4 fps, hoja completa a 4 fps, tiras del 38 % inferior a 1.5 fps, faster-whisper large-v3 palabra por palabra). Sin subtítulos ni texto en ninguno; las 6 voces completas.

| clip | estado | motivo |
|---|---|---|
| c04 | OK | Nadie en bordes. Voz 0.0–4.98, las dos frases. |
| c05 | OK con crop | Orilla lavanda (otra blusa) en el borde IZQ. de 0.0 a ~1.0 s; voz desde ~1.0. Frase 1 con punch-in `crop=630:1120:90:60` (limpio). Voz completa. |
| c16 | OK con crop | Hombro/cabeza oscura en el borde DER. de 0.0 a ~1.2 s; voz desde 0.55. Frase 1 con `crop=594:1056:0:40` (limpio). Voz completa. |
| c25 | OK | Nadie en bordes. Voz completa. |
| c30 | OK con crop | Bulto oscuro en el borde DER. de 0.0 a ~1.0 s; voz desde 0.7. Frase 1 con `crop=630:1120:0:40` (limpio). Voz completa. |
| c33 | OK | Gorra lisa (sin parche, logo ni letras) los 10 s. Voz completa (0.6–9.1). |

renders/v1.mp4: 153.2 s, 83 planos (media 1.86 s), -14.2 LUFS, -1.8 dBTP, LRA 2.4. Transcripción large-v3 = lines.json (64/64 líneas en orden, sin faltantes ni repetidas). Sincronía en 5 puntos (c02, c09, c18, c26, c33): audio -5 ms, video 0/+1 fotograma. Hoja de contactos sin texto salvo la marca MEXI STORIES arriba a la der.; earshot: música presente bajo el diálogo en los tres tramos (AudioSet Music 0.81 / 0.53 cálida / 0.85).
