# QA clips · madrina-central Parte 1 (SIN MARCA, 2026-11-08)

Método (el de pedida-mano / viuda-aguacate): hoja de 5 fotogramas por clip (2/25/50/75/97 %) comparada con chars/ (EVA_SALDIVAR, RUBEN_GALINDO, GASPAR_LEYVA, PORFIRIO_TAPIA) y con la geografía fija de clips.py. Tiras de cuadro completo cada 0.25 s de 0 a 2.0 s en todos los hablados y mudos; fotogramas grandes alrededor del arranque de voz en los dudosos; franja superior en el patio (letreros); crops probados en el peor fotograma. Cortes internos con scene > 0.3; LUFS por clip; envolvente de energía (0.05 s) para el arranque real de la voz; earshot describe en i01, i04, c05 y c33 (sin música). Audio: faster-whisper large-v3 (es, CPU, int8) con lv3.py → renders/lv3.json, contra lines.json; c19 redecodificado (beam 1/5 y VAD). Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos los planos salvo **c04, r5 y un tramo de c02, donde sale Nicandro de viuda-aguacate** (viejo con sombrero de palma, bolo plata, chamarra de gamuza café) en lugar de Rubén. Eva: chongo negro alto, arracadas, cárdigan negro, blusa vino, pulseras. Gaspar: rapado, piocha, camisa crema bordada, cadena y reloj de oro. Rubén: barba, camisa de mezclilla sobre playera blanca. Porfirio: boina negra, bigote gris, chamarra azul marino, radio al pecho. Ningún subtítulo quemado (franjas inferiores limpias). Sin armas ni sangre (i05: cargadores de manos cruzadas y vacías). Sin niños. Ninguna música dentro de los clips. Un solo tráiler rojo sin logo; llavero en la mano derecha (i02). Transcripción = lines.json en los 36 diálogos salvo c02 (pierde "Vengo del hospital") y c27 (repite "¿Y ahora?"); ambos se arreglan en el montaje. c01 salió en el intento 5 (NOREF), pero la cara y la ropa coinciden con la hoja. Fallo repetido de Omni: **figuras en el borde los primeros 0.25–1.25 s**; se arregla con el arranque o un crop.

| clip | estado | motivo |
|---|---|---|
| i01 | OK con recorte | **Corte interno a 2.96 s**: 0–2.95 es Eva de pie en el patio. Útil 3.0–6.0 (gancho y cadena tensa sobre la defensa roja). Foley real (cadena, puerta): bajo o silencio. |
| c01 | OK con recorte | **Corte interno a 0.29 s** (0–0.29 la grúa sola). Voz 0.60–2.14 / 3.53–5.26: empezar ≥ 0.33. |
| c02 | OK con recorte | **4 cortes internos**: 0–2.45 Rubén, **2.46–3.41 Nicandro** (personaje de otra pieza), 3.42–5.37 Rubén, **5.38–7.07 Eva**, 7.08–8.0 Rubén. Audio: "Don Gaspar, hoy nació mi hija." 0.60–2.30 + "Deme una semana." 3.73–4.62; **"Vengo del hospital" no se dice** (silencio 2.4–3.6). Usar 0.53–2.42 + salto a 3.66–4.75 (ambos en plano de Rubén). |
| c03 | OK con recorte | Figura oscura en el borde IZQ. 0–0.25 y Gaspar entrando por la DER. hasta ~0.9. Voz desde 1.30 (energía; Whisper marca 0.21): empezar en 1.0. |
| i02 | OK | Mano con reloj de oro balancea el llavero y cierra el puño. Silenciar (alucina "¡SUSCRÍBETE!"). |
| c04 | **REGENERAR** | **Personaje equivocado**: Nicandro (sombrero de palma, bolo, gamuza, barba blanca) en vez de Rubén, todo el clip. Audio bien (0.36–2.19 / 3.14–4.44). |
| c05 | OK con crop | **Letrero "WHOLESALE" y un teléfono** arriba a la DER. todo el clip; 2 extras de fondo junto a la grúa. Voz 1.36–3.92 / 4.77–6.02. `crop=630:1120:45:160` todo el clip (probado a 0.5, 4.0 y 7.7: cabeza entera, sin letras). |
| r1 | OK con recorte | Figura oscura abajo a la IZQ. 0–1.0. Útil 1.0–6.0. Aviso: letrero borroso arriba a la DER. Silenciar. |
| c06 | OK | Voz 0.37–2.31 / 3.12–4.59. |
| c07 | OK con recorte | Rubén **entra caminando** desde el borde IZQ. y figura oscura abajo 0–0.75. Voz 0.91–4.82: empezar en 0.85. Aviso: letrero borroso ("COOL T…") cortado arriba a la DER., no se puede recortar sin cortar la cabeza. |
| c08 | OK | Voz 0.26–2.19 / 3.06–4.43. −18.3 LUFS. |
| i03 | OK | Mano con pulseras pasa una hoja de la libreta (garabatos ilegibles). Silenciar (alucina "Gracias por ver el video"). |
| c09 | OK | Voz 0.64–1.87 / 1.86–4.45. |
| c10 | OK | Voz 0.66–2.44 / 4.03–6.74. |
| c11 | OK | "Melquiades" bien. Voz 1.05–2.78 / 3.56–5.27. |
| c12 | OK | "Leyva" bien. Voz 0.84–2.95 / 4.26–5.98. Cola muda 6.1–7.9 (ojos húmedos): sirve como reacción de Rubén (ver r5). |
| r2 | OK | Cierra la libreta. Mudo: silenciar. |
| c13 | OK | "redondees" bien. Voz 0.92–2.49 / 3.62–4.94. |
| c14 | OK con crop | Rubén entra por el borde IZQ. 0–0.5 y **hombro de camisa blanca** abajo a la DER. 0–1.25. Voz 0.62–4.73: empezar en 0.55 + `crop=600:1067:0:0` en 0.55–1.4 (probado limpio a 0.6 y 1.2). |
| c15 | OK | Voz 0.15–2.25 / 3.17–4.44. |
| c16 | OK con recorte | Figura oscura abajo a la IZQ. 0–0.5. Voz 0.63–2.66 / 3.74–5.29: empezar en 0.55. −17.3 LUFS. |
| c17 | OK | Voz 0.10–2.09 / 2.62–3.53. |
| c18 | OK | Se toca el radio. Voz 0.39–4.91. |
| c19 | OK | Se levanta 1.0–1.75. Voz 1.80–3.57 ("Cierren las puertas de la Central", confirmado con beam 1/5 y VAD; lv3 se comió "Cierren las puertas") / 4.62–6.60. |
| i04 | OK con recorte | Eva camina frente a las cortinas metálicas (el prompt no la pedía). **Números de andén "6" y "10"** en las cortinas (no son subtítulos; el "6" acompaña a "cierren el cuatro y el seis"). Audio: golpes de cortina tipo explosión (−16.3 LUFS, alucina "¡SUSCRÍBETE!"): silenciar o muy bajo. Útil 0–3.0. |
| c20 | OK | Voz 0.69–2.36 / 3.50–4.73. −17.1 LUFS. |
| i05 | OK (aviso) | Cargadores en fila de manos cruzadas, vacías; **Eva al frente** (no pedida, coherente con i04). Silenciar. |
| c21 | OK (aviso) | Número "52" pequeño sobre una cortina. Voz 0.83–2.02 / 2.29–4.48. −13.7 LUFS (el más fuerte). |
| c22 | OK con crop | Figura oscura abajo a la DER. 0–1.0. Voz 0.72–2.21 / 3.26–4.64. `crop=540:960:0:0` en 0–1.1 (probado limpio a 0.75 y 1.1). |
| r3 | OK con recorte | Figura oscura en el borde IZQ. 0–0.25. Útil 0.5–6.0. Silenciar. |
| c23 | OK con recorte | Figura en el borde IZQ. 0.25–0.5. Voz 0.72–2.95 / 2.94–5.17: empezar en 0.6. |
| c24 | OK con crop | **Figura oscura (espalda)** en el borde IZQ. 0–1.0. Voz 0.45–1.58 / 1.95–4.38. `crop=540:960:180:0` en 0–1.1 (probado limpio a 0.45 y 1.0). |
| i06 | OK | Mano con reloj deja el llavero junto a la libreta. Silenciar (alucina "¡Vamos a ver!"). Útil ~2.5–6.0. |
| c25 | OK | Voz 0.65–1.87 / 2.53–4.18. |
| c26 | OK con recorte | Figura oscura abajo a la IZQ. 0–0.5. Voz 1.20–5.55: empezar ≥ 0.6. |
| c27 | OK con recorte + crop | **Repite "¿Y ahora?"**: "…sin un peso de interés. ¿Y ahora? / ¿Y ahora tú cobras el doble?". Usar 0.75–4.20 (sale tras "interés", la voz acaba a 4.0) + salto a 6.10–7.66. Figura oscura en el borde IZQ. 0–1.0: `crop=540:960:180:0` en 0.75–1.1 (probado limpio a 0.8 y 1.1). |
| c28 | OK | Voz 0.68–2.42 / 3.12–4.29. |
| c29 | OK | Voz 0.37–6.37 (pausa larga tras "decencia", 2.4–3.9: salto si se quiere). |
| c30 | OK | Voz 0.45–1.91 / 2.74–4.03. |
| c31 | OK | Desliza el llavero. Voz 0.64–3.12 / 3.86–6.31. |
| r4 | OK con recorte | Forma blanca abajo a la DER. 0–0.5. Útil 0.75–6.0. Silenciar (alucina "Gracias por ver el video"). |
| c32 | OK con crop | **Figura de ropa clara** en el borde DER. 0–1.5. Voz 0.45–2.62 / 3.67–4.84. `crop=540:960:0:0` en 0–1.5 (probado limpio a 0.5 y 1.3). Aviso: "¿Me va a dejar en la calle?" sale como pregunta (funciona). |
| c33 | OK con recorte | Rubén descentrado en el borde IZQ. 0–0.9 (la cámara lo centra). Voz 1.20–3.96 / 4.96–7.19: empezar en 1.0. |
| c34 | OK | Voz 0.38–5.52. |
| r5 | **NO USAR** (sin regenerar) | **Personaje equivocado**: Nicandro en vez de Rubén. Reemplazo: cola muda de **c12 6.10–7.90** (Rubén con ojos húmedos, mismo set) o de c33 7.30–8.0, silenciadas. |
| c35 | OK con recorte | Manos en el radio y forma blanca abajo a la DER. 0–0.5. Voz 0.70–3.82 / 4.71–6.95 ("Imelda" bien): empezar en 0.6. −26.4 LUFS (bajo). |
| c36 | OK | CTA con carisma: sonríe, ladea la cabeza, manos juntas. Voz 0.54–3.01 / 4.25–7.70. |

## REGENERAR
- **c04**: sale Nicandro (personaje de viuda-aguacate) en vez de Rubén.

Cambio en clips.py (solo c04; todo lo demás igual). Agregar el NODOUBLE y el ancla negativa en el desc de c04:
```python
 ("c04", 6, talk("c04", "Rubén", one(f"Close-up of {RUB} {PAT}, {RL}, upset, his jaw tight; he is a 30-year-old man with short black hair and a short black beard, NOT an old man: no hat of any kind, no bolo tie, no suede jacket, no white beard", "RIGHT",
     NODOUBLE("man in a denim shirt")), "upset, firm")),
```
lines.json no cambia.

Para regenerar (cuando Flow esté libre): `python -I clips.py c04 > clips_log2.txt`. Revisar: Rubén (barba negra, mezclilla, sin sombrero), "Ya le pagué el doble en intereses. / Usted lo sabe, don Gaspar.", bordes limpios.

Fallback si vuelve mal: quitar c04 y dejar solo c05 ("Aquí los intereses los pongo yo") después de c03; se entiende, aunque se pierde el reclamo de Rubén.

Nota: Nicandro sale en 3 planos de Rubén (c02 2.46–3.41, c04, r5). Probablemente la hoja de viuda-aguacate sigue en el proyecto de Flow. Si vuelve a salir, usar un proyecto nuevo con `make_sheets.py --reupload`.

## Arreglos para el montaje (tramos útiles)
- **Cortes internos**: i01 solo 3.0–6.0; c01 desde 0.33; c02 0.53–2.42 + 3.66–4.75 (se pierde "Vengo del hospital", la frase queda "Don Gaspar, hoy nació mi hija. Deme una semana.").
- **Salto dentro del clip**: c27 0.75–4.20 + 6.10–7.66 (quita el "¿Y ahora?" repetido).
- **Reemplazo**: r5 → c12 6.10–7.90 (o c33 7.30–8.0), silenciado.
- **Crops de borde** (punch-in solo mientras dura el borde, probados limpios): c14 `600:1067:0:0` (0.55–1.4), c22 `540:960:0:0` (0–1.1), c24 `540:960:180:0` (0–1.1), c27 `540:960:180:0` (0.75–1.1), c32 `540:960:0:0` (0–1.5). Letrero: c05 `630:1120:45:160` todo el clip.
- **Arranques** (antes de la voz): c03 = 1.0, c07 = 0.85, c14 = 0.55, c16 = 0.55, c23 = 0.6, c26 ≥ 0.6, c33 = 1.0, c35 = 0.6. Mudos/insertos: r1 1.0–6.0, r3 0.5–6.0, r4 0.75–6.0, i04 0–3.0, i06 ~2.5–6.0.
- **Silenciar**: r1–r4, i02, i03, i04, i05, i06 y el reemplazo de r5 (Whisper alucina "¡SUSCRÍBETE!", "Gracias por ver el video", "SILENCIO"). i01 tiene foley real de cadena: bajo o silencio. i04 son golpes tipo explosión: silenciar.
- **Volumen**: c21 (−13.7), c20 (−17.1), c16 (−17.3), c36 (−17.9) fuertes; c35 (−26.4), c02 (−26.1) bajos. El loudnorm de edit.py los empareja.
- **Avisos sin acción**: Eva en el patio en i04/i05 (no pedida; se lee como "la madrina sale a cerrar", pero c22 dice que espera en su bodega); números de andén en i04 y c21; letreros borrosos en c07 y r1; garabatos ilegibles en la libreta de i03; extras de fondo en c05.
- Whisper escribe cifras ("80 mil", "40", "4") y "central" con minúscula: es grafía.
