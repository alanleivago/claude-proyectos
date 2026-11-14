# QA clips · bascula-limon Parte 1 (SIN MARCA, 2026-11-07)

Método (el de pedida-mano): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (FERMIN_ZAVALA, DANIELA_ZAVALA, BULMARO_PADILLA, CHALO_MORENO, LOC_ACOPIOLIMON, LOC_HUERTALIMON, LOC_PORCHEZAVALA) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas) en los 35 clips. Fotogramas a 300 px en los dudosos y recortes probados en el fotograma 0 y en los puntos intermedios. Decodificación completa de cada clip (`ffmpeg -v error -f null`), freezedetect, cortes (scene > 0.3), LUFS y F0 (parselmouth) por clip. Audio: faster-whisper large-v3 (es, CPU, int8, sin VAD) contra lines.json; resultado en renders/lv3.json y renders/lv3.log. Nada se corrió en Flow.

Resultado general: caras correctas en todos (Fermín: bigote blanco, sombrero de palma, camisa azul claro, jeans con cinto café. Daniela: pelo negro lacio a los hombros, blusa terracota, pantalón beige, aretes plateados. Bulmaro: pelo negro peinado hacia atrás, bigote negro, guayabera crema, cadena de oro. Chalo: calvo con barba gris corta, camisa verde olivo). Solo Fermín lleva sombrero, salvo los dobles de c09, c22 y c23 (ver abajo, todos en los bordes y recortables). Nadie lleva lentes ni señala con el dedo (c14 y c31 tienen manos abiertas). Ningún subtítulo ni texto en pantalla: las tiras inferiores están limpias en los 35 clips (c03 v2 incluido). Ningún clip con cortes internos. Una sola báscula mecánica por plano y sin pantalla. El bulto de cemento (c13, r2) es gris liso, sin letras ni números. Libreta en la mano izquierda en c06 y c08. Celulares: Bulmaro (c20) con la mano DERECHA en el oído y Daniela (c27) con la DERECHA y la pantalla sin leerse. Voces: hombres 119–168 Hz (c29 168 Hz, masculina) y Daniela 197–254 Hz, cada voz con su personaje. Transcripción = lines.json en los 35 clips con audio. Se pronuncian bien "Bulmaro", "mermado", "seiscientos cuarenta" y "pésenos". Ninguna palabra repetida, tartamudeo ni frase inventada.

| clip | estado | motivo |
|---|---|---|
| c01 | OK con hflip | Voz 0.98–8.77. Bulmaro está a la DER. pero mira hacia la derecha del cuadro (de 4 s en adelante): `hflip` (guayabera simétrica, sin texto; la báscula queda a su lado). Abre en plano de cuerpo entero y la cámara se acerca. |
| c02 | OK | Voz 0.58–4.40. |
| c03 | OK con recorte + crop (v2, regenerado) | v1 corrupto (pasó a clips/old/c03_v1.mp4). v2: decodifica completo (6.0 s, video y audio), sin cortes internos ni congelados, −22.5 LUFS. large-v3: "La báscula no miente, don Fermín." (voz 0.83–2.57) / "Que pase el que sigue." (3.65–4.72) = lines.json. Bulmaro (guayabera crema, bigote negro, cadena) mira hacia la IZQ. todo el clip; sin subtítulos (tira inferior limpia), sin sombrero ni doble. **Manga blanca de otra persona en el borde IZQ. de 0.0 a ~1.0 s**: empezar en 0.75 y `crop=600:1067:120:0` en el primer tramo (probado limpio a 0.75, 0.9 y 1.05 s). |
| c04 | OK con recorte | Astilla blanca/azul en la esquina inferior DER. de 0.0 a 0.5 s. Voz desde 0.90: empezar en ≥ 0.75. |
| c05 | OK con recorte + hflip | Manga blanca en el borde inferior IZQ. de 0.0 a 0.25 s. Voz desde 0.62: empezar en ≥ 0.3. Mira hacia la derecha del cuadro, igual que c01: `hflip`. |
| r1 | OK | Mudo (Whisper alucina "Gracias por ver el video" a −52.5 LUFS): silenciar. Se toca el ala del sombrero. |
| c06 | OK con recorte | Hombro de camisa azul a cuadros en el borde IZQ. de 0.0 a 0.5 s. Voz desde 1.16: empezar en ≥ 0.75. |
| c07 | OK | Voz 0.10–4.61. |
| c08 | OK (aviso) | Voz 0.71–5.14. Whisper oye "No, **papá**" (el guion dice "apá"). |
| c09 | OK con crop | **Segundo sombrero de palma y hombro de camisa azul** (un doble de Fermín) en el borde DER./arriba de 0.0 a ~2.3 s. Voz desde 0.58. `crop=540:960:0:0` en 0–2.4 (probado limpio a 0, 0.5, 1.0, 1.5, 2.0 y 2.25 s; a 2.5 s el cuadro completo ya está limpio). |
| c10 | OK con crop | Figura blanca en el borde IZQ. de 0.0 a ~1.0 s. Voz desde 0.64. `crop=540:960:180:0` en 0–1.1 (limpio a 0, 0.5, 1.0 y 1.25 s). La mano en la nuca es la suya. |
| c11 | OK con crop | Figura clara en el borde inferior IZQ. de 0.0 a 0.5 s. Voz desde 0.29 ("Yo sí."). `crop=540:960:180:0` en 0–0.6 (limpio). |
| c12 | OK | Voz 0.39–5.02. |
| c13 | OK | Bulto gris liso al hombro, sin letras. Voz 1.44–7.41. |
| c14 | OK | Mano abierta (no señala). Voz 0.61–4.97. |
| c15 | OK con recorte | De 0.0 a ~0.7 s Daniela está medio fuera del cuadro por la IZQ. y hay una forma blanca en la esquina inferior DER. (0–0.5 s). Voz desde 0.67: empezar en 0.6 y aplicar `crop=600:1067:0:0` en 0.6–0.75. |
| r2 | OK | Insert de la báscula: sin manos ni números, el brazo sube y se asienta. Audio a −32 LUFS ("¡Vamos a ver!", voz de fondo): silenciar. |
| c16 | OK con recorte | Forma blanca en el borde inferior DER. de 0.0 a 0.25 s. Voz desde 0.70: empezar en ≥ 0.5. |
| c17 | OK | Voz 0.64–5.18. |
| c18 | OK | Voz 0.20–5.62. |
| c19 | OK | Se acomoda la guayabera. Voz 0.60–5.49. |
| c20 | OK | Celular en la mano DERECHA. Voz 0.12–7.48. −23.4 LUFS (bajo). |
| c21 | OK | Voz 0.64–7.49. |
| c22 | OK con crop | **Ala de otro sombrero** arriba a la DER. de 0.0 a ~1.25 s. Voz desde 0.19. `crop=600:1067:0:0` en 0–1.4 (limpio a 0, 0.5, 1.0 y 1.25 s). |
| c23 | OK con recorte + crop | **Ala de un sombrero y brazo** arriba a la IZQ. y una camisa a cuadros abajo a la IZQ. de 0.0 a ~0.9 s. Voz desde 0.58: empezar en 0.5 y aplicar `crop=576:1024:144:0` en 0.5–1.0 (limpio a 0.5 y 0.9 s). |
| r3 | OK | Mudo (alucina "Gracias por ver el video" a −51.9 LUFS): silenciar. Gira un limón en las manos. |
| c24 | OK | Voz 0.83–5.47. |
| c25 | OK con crop (aviso) | Hombre de camisa a cuadros en el borde IZQ. de 0.0 a ~1.5 s. Voz desde 0.26. `crop=504:896:216:0` en 0–1.6 (limpio a 0, 0.75 y 1.5 s). Whisper oye "No diga eso, **papá**". |
| c26 | OK | Voz 0.70–4.74. |
| c27 | OK | Celular en la mano DERECHA con la pantalla oscura. Voz 0.44–6.42. Fondo con ventana y varios focos (aviso). |
| c28 | OK | Voz 1.17–6.99. |
| c29 | OK | Voz 0.34–4.15. |
| c30 | OK con crop | Figura de camisa azul en el borde IZQ. de 0.0 a ~1.0 s. Voz desde 0.61. `crop=600:1067:120:0` en 0–1.1 (limpio a 0, 0.5 y 1.0 s). Casi quieto de 5.04 a 5.54 s, después de la voz (sin efecto). |
| r4 | OK | Bulmaro de noche con sonrisa satisfecha (no mira la báscula, aviso). Risa "jajaja" a −34.6 LUFS: silenciar. |
| c31 | OK | CTA con carisma: se acomoda el sombrero con las dos manos abiertas y nunca señala. Voz 0.84–9.29. |

## REGENERAR
Ninguno. c03 se regeneró (`clips_log2.txt`: "OK c03 (intento 1)") y pasa el QA (fila de arriba). No hace falta el fallback de sacar c03.

## Arreglos menores para el montaje
- **Espejo**: c01 y c05 con `hflip` para que Bulmaro (a la DER.) mire hacia Fermín y Daniela (IZQ.). No hay texto en cuadro y la guayabera es simétrica.
- **Crops de borde** (punch-in solo mientras dura el borde): c03 `600:1067:120:0` (0.75–2.72, primer tramo), c09 `540:960:0:0` (0–2.4), c10 `540:960:180:0` (0–1.1), c11 `540:960:180:0` (0–0.6), c22 `600:1067:0:0` (0–1.4), c25 `504:896:216:0` (0–1.6), c30 `600:1067:120:0` (0–1.1), c15 `600:1067:0:0` (0.6–0.75), c23 `576:1024:144:0` (0.5–1.0). Todos probados limpios.
- **Arranques**: c03 = 0.75, c04 ≥ 0.75, c05 ≥ 0.3, c06 ≥ 0.75, c15 = 0.6, c16 ≥ 0.5 y c23 = 0.5 s. Todos antes de la voz.
- **r1–r4**: silenciar el audio (r2 tiene "¡Vamos a ver!" y r4 una risa; edit.py ya les pone ganancia 0).
- Volumen: c12 (−15.5), c22 (−15.7) y c07 (−16.1) están fuertes; c20 (−23.4), c18 (−22.1) y c01 (−21.6), bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Avisos sin acción: c08 y c25 suenan a "papá" en vez de "apá" (el sentido es el mismo); c27 tiene el fondo del porche con ventana y varios focos; r4 no mira la báscula.
- Whisper escribe las cifras con números ("640", "40", "50") y "Don" con mayúscula: es grafía.
