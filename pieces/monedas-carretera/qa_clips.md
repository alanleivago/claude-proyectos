# QA clips · monedas-carretera Parte 1 (MAJESTIC, 2026-11-07)

Método (el de pedida-mano): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (AMADOR_QUINTANAR, KEVIN_BARRON, MEMO_RANGEL, BENIGNO_ARTEAGA, LOC_GASCARRETERA, LOC_TRAMODESIERTO) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas) en los 47 clips; fotogramas a 240-300 px en los dudosos; recortes probados fotograma a fotograma en el tramo afectado. Decodificación completa (ffmpeg -f null), freezedetect, cortes (scene > 0.3), LUFS y F0 por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV con numpy (renders/lv3.json), contra lines.json; c01, c09, c12, r3 e i01 re-decodificados por tramo (T=0 y T=0.4, con y sin prompt) + envolvente a 0.1 s. Nada se corrió en Flow.

Resultado general: los 47 decodifican sin errores; ningún congelado; un solo corte interno (i06 a 2.0 s). Caras y ropa correctas en todos (Amador: barba blanca, sombrero de paja crema, camisa blanca de manga larga, chaleco de cuero café. Kevin: pelo negro en picos, polo rojo de manga corta, pantalón negro. Memo: rizos castaños, camisa azul marino de manga arremangada, pantalón gris. Benigno: bigote negro, sombrero negro, chamarra de mezclilla negra, radio al pecho). Cada clip con su personaje (r1 Memo, r2 Amador, r3/r4/r5 Kevin). Sin armas, sangre, uniformes, gafetes ni logos; i05 son 7 escoltas (se pidieron 5) de manos cruzadas, sin sombrero. Ningún subtítulo ni texto en pantalla (tiras inferiores limpias en los 47). Voces: todos hombres, F0 110–180 Hz, cada uno con su personaje. Transcripción = lines.json en 34 de 35 diálogos (c01 pierde la 2.ª frase). Geografía respetada (Amador IZQ. con la troca blanca detrás, Kevin DER. junto a la bomba, Memo al centro detrás de la bomba, Benigno IZQ. frente a las camionetas negras).

Fallo recurrente: **dobles en el borde** (otra persona de espaldas como en over-the-shoulder) en el primer 0.5–2.5 s de varios planos, incluido un **segundo sombrero de paja** (c09, c25, c30, c31: solo Amador y Benigno llevan sombrero). Todos se salvan con recorte o arranque tardío, probados limpios.

| clip | estado | motivo |
|---|---|---|
| c01 | OK (regenerado) | Las dos frases (large-v3: "1,200 de diésel y me paga con monedas, tiene un minuto para quitar su troca"). Voz 0.08–3.95 y 4.30–5.97 (pausa 3.95–4.30). Bordes limpios. −21.5 LUFS. |
| c02 | OK | Voz 0.22–7.28. |
| c03 | OK | Voz 0.98–5.29. −16.8 LUFS. |
| c04 | OK | Voz 0.10–4.82. |
| c05 | OK | Voz 0.10–3.82 (dice la versión original "Tú te callas, Memo"). |
| c06 | OK | Voz 0.65–4.18. |
| c07 | OK con crop | **Doble de Kevin**: manga/torso ROJO en el borde IZQ. de 0.0 a ~1.5 s; voz desde 0.52. `crop=640:1138:80:0` en 0.5–1.6 (limpio a 0.5/0.6/0.75; 1.0–1.5 limpio ya con 672:1195:48:0). −14.9 LUFS (fuerte). |
| c08 | OK (aviso) | Monedero en la mano DERECHA (se pidió IZQUIERDA; igual en c09, coherente entre los dos). Voz 0.37–6.96. |
| c09 | OK con crop | Hombre de **camisa a cuadros + segundo sombrero de paja** en el borde DER. de 0.0 a ~4.5 s (a 5.0 ya no está); voz desde 0.86. `crop=620:1102:0:0` en 0.85–5.0 (limpio a 0.85/1.25/2/3/4). Audio "Así la sigo llevando" (la 1.ª pasada dice "las"; el tramo re-decodificado dice "la"). |
| c10 | OK con recorte | Kevin entra caminando desde el borde DER. (0–1.0 s); voz desde 1.05: empezar en 1.0. |
| c11 | OK con recorte | **Doble de Kevin** (rojo) en el borde IZQ. de 0.0 a ~1.25 s; voz desde 1.39: empezar en ≥ 1.3 (limpio a 1.3). |
| c12 | OK con crop (aviso) | Forma oscura/cuadros en el borde DER. 0.0–1.0 s; voz desde 0.47. `crop=640:1138:0:0` en 0.45–1.0. Audio "Mejor levántelas las monedas del piso" (clítico de más, coloquial mexicano; con prompt sale "levante"): se deja. |
| c13 | OK | Voz 1.14–4.82. |
| c14 | OK | Voz 0.69–5.92. |
| c15 | OK | Voz 0.37–3.96. |
| c16 | OK | Voz 0.19–4.51. |
| c17 | OK con crop (aviso) | Figura oscura en el borde DER. 0.0–0.5 s; voz desde 0.10. `crop=576:1024:0:0` en 0.1–0.6 (limpio). Aviso: camiseta blanca de cuello redondo bajo el chaleco (la hoja es camisa con cuello). |
| c18 | OK (aviso) | Camiseta gris lisa en vez de camisa gris (igual en c26 y c33). Dice la versión original "¿Le cerramos la carretera…?". Voz 0.84–4.90. |
| c19 | OK | Mano abierta. Voz 0.10–5.36. |
| c20 | OK con crop | **Segundo sombrero de paja** + manga blanca en el borde DER. de 0.0 a ~2.5 s (visto en el montaje v1; a 3.0 limpio); voz 0.36–4.22. `crop=576:1024:0:0` en la 1.ª frase. −23.6 LUFS (bajo). |
| c21 | OK con recorte | Rojo en ambos bordes 0.0–0.25 s; voz desde 0.94: empezar en ≥ 0.5. |
| c22 | OK con crop | **Doble de Memo** (rizos + hombro azul marino) en el borde DER. 0.0–~2.0 s; voz desde 1.34. `crop=640:1138:0:0` en 1.3–2.1 (limpio a 1.3/1.5/1.75/2.0/2.5). −23.8 LUFS (bajo). |
| c23 | OK | Manos abiertas. Voz 0.62–5.10. |
| c24 | OK | Voz 0.76–4.83. |
| c25 | OK con crop | Figura oscura + **segundo sombrero de paja** en el borde DER. 0.0–1.0 s; voz desde 0.61. `crop=576:1024:0:0` en 0.6–1.1 (limpio). |
| c26 | OK | Voz 0.44–4.83. |
| c27 | OK | Voz 0.16–4.02. −15.8 LUFS (fuerte). |
| c28 | OK | Monedero con las dos manos. Voz 0.92–5.98. |
| c29 | OK con crop | **Doble de Memo** (azul marino) en el borde IZQ. 0.0–1.25 s; voz desde 0.70. `crop=640:1138:80:0` en 0.65–1.3 (limpio, la mano abierta queda dentro). |
| c30 | OK con crop | Camisa a cuadros + **segundo sombrero de paja** en el borde DER. 0.0–~2.0 s; voz desde 0.29. `crop=576:1024:0:0` en 0.25–2.1 (limpio). |
| c31 | OK con crop | Figura azul marino + **segundo sombrero de paja** en el borde DER. 0.0–~2.5 s; voz desde 0.38. `crop=576:1024:0:0` en 0.35–2.6 (limpio; corta un poco el brazo izq. de Amador; a 2.75 ya limpio sin crop). |
| c32 | OK con recorte | Kevin entra desde la DER. hasta ~0.9 s (a 0.44 sigue en el borde); voz real desde 1.15 (lo de antes son pasos): empezar en 1.05. |
| c33 | OK con J-cut | **Radio duplicado**: uno al pecho y otro en la mano (lo usa) de 0.0 a ~1.05 s; voz 0.99–5.34. No se tapa con crop (a 0.95 la mano está a media altura). Imagen desde 1.10, audio desde 0.95 (los 0.15 s de "Pa-" sobre el plano anterior). |
| c34 | OK | Voz 0.72–4.80. |
| c35 | OK | CTA a cámara, se toca el ala del sombrero. Voz 0.46–7.89. −15.1 LUFS (fuerte). |
| i01 | OK | Mano de polo rojo vuelca el monedero; monedas al piso desde ~3.5 s. Audio = monedas (Whisper alucina "¡Suscríbete al canal!"): silenciar o usar solo como SFX. |
| i02 | OK | Mano vieja con manga blanca recoge monedas al monedero. Silenciar. |
| i03 | OK (aviso) | Dron sobre la carretera; parecen más de 7 camionetas (8–9). Silenciar. |
| i04 | OK | Camionetas negras llegan con polvo, sin placas visibles; estación vacía 0–1.5 s. Silenciar. |
| i05 | OK | 7 escoltas (no 5) de camiseta gris y jeans, manos cruzadas, sin armas ni sombrero. Silenciar. |
| i06 | OK (regenerado) | Un solo plano continuo (scene > 0.3: ningún corte), antebrazos desnudos bajo las mangas cortas rojas. Las manos salen de cuadro a ~4.75 s: usar 0–4.5. Silenciar (alucina "¡Suscríbete!"). |
| i07 | OK (aviso) | Palma con la moneda, manga azul marino hasta la muñeca (Memo la lleva arremangada); la cruz no se distingue. Silenciar. |
| r1 | OK | Mudo (−41.3 LUFS): silenciar. |
| r2 | OK | Mudo (−46.6), se toca el sombrero: silenciar. |
| r3 | OK con recorte | Algo en el borde IZQ. 0.0–0.25 s: empezar en ≥ 0.5. Ruido que sube a −21 dB en 3.5–6 s (Whisper alucina "Gracias"/"¡SUSCRIBETE!"): silenciar. |
| r4 | OK con recorte | Brazo en el borde IZQ. 0.0–0.25 s: empezar en ≥ 0.5. Silenciar. |
| r5 | OK | Mudo: silenciar. |

## REGENERAR
- **c01**: 2.ª frase perdida ("Tiene un minuto para quitar su troca.").
- **i06**: corte interno a 2.0 s + mangas rojas largas.

Cambios en clips.py (solo c01 e i06; se mantienen STYLE, VOICE, NOSUB, CLEAN, END, ONE/ALONE con gaze, NODOUBLE, SAFE, SOFT, variant, NOREF, STYLES, TRIES=6, recargas y gatito de control):
- c01: tono "mocking, cold, impatient, he says every sentence in full with a short breath between sentences, and only then stays silent" (sirve también en el intento 6, que deja una sola frase).
- i06: "two hands with bare forearms below the SHORT sleeves of a red polo shirt pick up scattered coins… One single continuous close-up from the very first frame to the last, no cuts, no wide shot."

Para regenerar (cuando Flow esté libre): `python -I clips.py c01 i06 > clips_log2.txt` (la versión vieja pasa a `clips/old/<id>_v1.mp4`). Revisar después: c01 las dos frases completas y sin repetición; i06 sin corte y antebrazos desnudos.

Fallbacks si vuelven mal:
- c01: usar el viejo para la 1.ª frase (voz 1.2–4.6, verificado con large-v3 + envolvente: no hay más voz hasta 8.04) y quitar "Tiene un minuto para quitar su troca." del montaje; el plazo lo sostiene c03 ("Atrás viene gente que sí paga") y la caption.
- i06: usar el viejo de 2.1 a ~3.3 s (después del corte, solo manos y monedas; las mangas largas se ven poco) o saltarlo (r4 cubre el momento). Sin audio que quitar.

## Arreglos menores para el montaje
- **Crops de borde** (punch-in solo mientras dura el borde; probados limpios): c07 `640:1138:80:0` (0.5–1.6), c09 `620:1102:0:0` (0.85–5.0), c12 `640:1138:0:0` (0.45–1.0), c17 `576:1024:0:0` (0.1–0.6), c22 `640:1138:0:0` (1.3–2.1), c25 `576:1024:0:0` (0.6–1.1), c29 `640:1138:80:0` (0.65–1.3), c30 `576:1024:0:0` (0.25–2.1), c31 `576:1024:0:0` (0.35–2.6).
- **Arranques**: c10 = 1.0, c11 ≥ 1.3, c21 ≥ 0.5, r3 ≥ 0.5, r4 ≥ 0.5 (todos antes de la voz).
- **J-cut**: c33 imagen desde 1.10, audio desde 0.95 (radio duplicado en la mano hasta ~1.05).
- **Silenciar** r1–r5 e i01–i07 (Whisper alucina "Suscríbete", "Gracias por ver el video", "El día de hoy"); i01 trae sonido de monedas, usable como SFX si se quiere.
- Volumen: c07 (−14.9), c35 (−15.1), c27 (−15.8) fuertes; c22 (−23.8), c20 (−23.6), c19 (−22.4) bajos. El loudnorm de edit.py los empareja.
- Avisos sin acción: monedero en la mano derecha (c08/c09); c17 camiseta de cuello redondo; Benigno con camiseta gris lisa en c18/c26/c33; i03 más de 7 camionetas; i05 7 escoltas; i07 manga sin arremangar; c12 "levántelas las".
- Whisper escribe "1,200" y "10 pesos" con cifras y quita comas/signos: es grafía.

## Regenerados (2026-11-07, clips_log2.txt) — QA OK, sin fallbacks
- **c01** OK: large-v3 dice las dos frases de lines.json; pausa 3.95–4.30 entre ellas. Kevin solo, bordes limpios.
- **i06** OK: un solo primer plano continuo, antebrazos desnudos (manga corta roja); se usa 0.3–1.5.
- renders/lv3.json actualizado con c01 e i06.
- En el montaje v1 aparecieron dos fallos que el QA no vio: c20 (sombrero de paja doble en el borde DER. 0–2.5 s → crop) y c32 (Kevin a medio entrar a 0.44 → arranque 1.05). c31 2.ª frase con crop (a 2.70 aún asoma el ala del sombrero doble).
- c04 2.ª frase: la voz real llega a ~5.3 s (los tiempos de palabra de Whisper se adelantan); salida en 5.45 (con 4.97 se cortaba "minutos").
- Montaje: renders/v1.mp4 (153.3 s, 90 planos, 1.70 s/plano, máx. 2.68 s; -14.3 LUFS, -1.6 dBTP); transcripción completa en renders/v1_transcript.txt = lines.json salvo grafías (1,200 / "las" c09 / "levántelas" c12) y un "tarde" que large-v3 inserta en c19 en la pasada larga (en el tramo solo dice "esperen tantito").
