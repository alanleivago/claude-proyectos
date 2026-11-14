# Stimulus — correcciones del cliente (ronda b-roll, 2026-11-10)

Aplica a los 11 reels aprobados (`pieces/stimulus-01-hf` … `stimulus-11-hf`). Se hace el v1 primero; los otros 10 después de que el usuario apruebe el v1.

B-roll del cliente: `Ref videos Dariel/Stimulus/broll/` (una carpeta por link) + catálogo `broll/CATALOGO.md`.

## Reglas comunes de b-roll (todas las piezas)
- EQUILIBRADO (corrección del usuario 2026-11-10): NO llenar el video de b-roll; el talking head es el protagonista. ~3 cutaways por reel en tramos puntuales.
- Descargar SOLO los clips que se usan en cada video (no bajar todo). Lo ya bajado está en broll/ y catalogado en broll/CATALOGO.md (311 clips).
- Cutaways sobre el talking head: la voz sigue, subtítulos e íconos quedan encima.
- 2.5–3 s cada uno, separados ~10-13 s; nunca en los primeros ~10 s (título del gancho con roto) ni en el CTA/outro.
- Elegir el clip que mejor encaje con lo que dice en ese momento. Nunca repetir un clip dentro de un video; repartir clips distintos entre los 11 (registro abajo).
- Recortar/escalar para llenar 1080x1920 limpio.
- Transición = FILM BURN estilo Premiere del cliente en la entrada y la salida de cada b-roll: `FilmBurnTransition7_Best8.mp4` (0.73 s, empieza ~0.43 s antes del corte) + destello `Purple Cinemarker.mp4` (0.10 s a 135 %, opacidad 39 %, ~0.16 s antes del corte). Originales en `styles/stimulus/assets/premiere_burn/`.
- Revisar que los bordes del b-roll queden limpios y que ningún b-roll tape mal el momento clave de un ícono.

## Lista por video
- V1: 00:21 música muy alta. Insertar b-roll en todo el video.
- V2: b-roll de 00:00 a 00:56. 00:01 cambiar a otra canción, menos triste (elegir entre las que ya usamos en otros Stimulus). 00:56 el audio de Austin suena apagado y la música muy alta: arreglar EQ/claridad de la voz ahí y bajar la música.
- V3: 00:02 música muy alta y muy triste: cambiar de canción. Insertar b-roll.
- V4: a 00:12 el nombre es "Geison", no "Jason" (corregir el subtítulo). Insertar b-roll.
- V5: insertar b-roll.
- V6: a 00:25 usar el b-roll `C:\Users\Alan Leiva\Downloads\IMG_5563.MOV` (copia en `broll/img5563/`). Insertar b-roll.
- V7: insertar b-roll. 00:57 música un poco alta.
- V8: el zoom-out de arranque necesita curva de velocidad (rápido al inicio, frenando al final). Insertar b-roll.
- V9: 00:12 música muy alta. Insertar b-roll.
- V10: 00:23–00:25 cortar "only your club leaders see that extra part" (cortar en silencio; revisar el roto del gancho si cae en los primeros 10 s). Insertar b-roll.
- V11: el zoom de arranque necesita curvas de velocidad para que se sienta más suave (rápido al inicio). Insertar b-roll.

## Registro de uso de b-roll (clip → video @ tiempo)
Código: `hfkit.broll(ROOT, parts, tw, audio, BROLL)` + `K.BROLL_CSS` (styles/stimulus/hfkit.py). Burns verticales en styles/stimulus/assets/premiere_burn/ (fb_v.mp4, pc_v.mp4, fb.wav).

| clip | video @ tiempo |
|---|---|
| link4/Drone/DJI_0036.MP4 @4.0 (pasillo de bodega) | V1 12.95–15.45 "never leaves their store" |
| link6/Crowriver Rec Program video.mov @11.0 (niños con camisetas, entrenador) | V1 26.57–29.35 "goes directly into your club" |
| link6/Josh 100 Clips/07-Soccer girls social.mov @12.6 (atajada + festejo) | V1 38.6–41.3 "freedom ... what matters most" |
| img5563/IMG_5563.MOV @13.7 (público del kit-reveal + maquetas de camisetas; zoom digital a los 16.39 → no pasar de ahí) | V6 23.89–26.54 "everyone hears it at the same time, in the same room" |
| link6/KFA v Saint Paul United FC/MVI_2112.MP4 @0.0 (jugador sentado con el kit violeta/blanco Stimulus, logo S en el pecho) | V5 15.15–17.75 (r3, antes Orono Girls) "they cover shipping both ways. No arguing" |
| link6/Josh 100 Clips/20-FG Block.mov @5.3 (espaldas FINK #5 / #4, noche) | V5 27.40–30.10 "if it doesn't fit, or the name or number's wrong" |
| link6/HSK Tournament Footage/MVI_0843.MP4 @0.5 (partido juvenil, padres al costado) | V6 13.76–16.50 "families, coaches, players, club members" |
| link6/Josh 100 Clips/18-FG Edit.mov @12.1 (choques de manos del equipo; flash 11.5–11.9) | V6 43.98–46.70 "the kids lose their minds every single time" |
| link6/Color is Everything/Color is evrything Dyansty__.mov @5.1 (camiseta roja con diseño y sponsor) | V7 16.73–19.40 "check your colors, patterns, logos" |
| link6/Futsal JOTP Game.MOV @16.15 (kit Stimulus, jugador se toma la camiseta; letterbox recortado → assets/broll/src_futsal.mp4) | V7 27.40–30.00 "hold it in your hands before you say yes" |
| link6/HSK Tournament Footage/MVI_0864.MP4 @24.0 (espaldas #42 en el arco) | V7 47.82–50.50 "new players show up, jerseys get lost" |
| link4/Drone/DJI_0037.MP4 @20.0 (chico con camiseta azul en el pasillo de bodega) | V2 12.35–14.85 "one sheet, the whole box ships to you" |
| link6/HSK Tournament Footage/MVI_0722.MP4 @0.5 (muchos niños en fila, camisetas turquesa) | V2 23.95–26.60 "families pay, the club's big" |
| link6/HSK Tournament Footage/MVI_0717.MP4 @0.9 (niños con camisetas turquesa Stimulus jugando un partido) | V2 39.85–42.20 "small order, club pays, you hand them out" (r3, antes Alchemy) |
| link6/KFA v Saint Paul United FC/MVI_2057.MP4 @4.0 (#12 kit blanco/violeta Stimulus de frente, partido real) | V2 49.85–52.35 "sorting, chasing payments, swapping sizes" (r3, antes C0275) |
| link2/Day 1/Video/C0147.MP4 @12.0 (cortadora láser sobre paneles) | V3 11.05–13.70 "we remake it" |
| link6/Josh 100 Clips/05-UF Social.mov @5.2 (jugador con el uniforme del equipo, césped oscuro) | V3 21.60–24.30 "the same design years down the line" |
| link3/Day 2/Selected Ads Folder/C0275.MP4 @1.0 (chico Stimulus levanta una camiseta en la fábrica) | V3 32.70–35.40 "between me and the factory" (r3, antes C0280) |
| link6/Josh 100 Clips/01-Baseball Social.mov @0.9 (pitcher de secundaria) | V4 12.45–14.95 "coaching a high school team" |
| link6/HSK Tournament Footage/MVI_0721.MP4 @0.2 (equipo en fila, camisetas iguales) | V4 23.00–25.70 "a whole new set for every player" |
| link6/HSK Tournament Footage/MVI_0714.MP4 @1.5 (espalda camiseta #52) | V4 35.50–38.20 "order one jersey 10 years from now" |
| link6/Josh 100 Clips/03-Soccer Kick social.mov @5.6 (arquero, frente de la camiseta) | V4 47.98–50.68 "name brand looks great on day one" |
| link6/The Froehlich Project.mp4 @3.8 (nena #4 naranja y niños con camisetas entrando a la cancha) | V8 11.26–13.90 "the orders ship, then a new kid shows up" |
| link6/Josh 100 Clips/26-soccoer edit.mov @6.2 (arquero verde al atardecer) | V8 20.72–23.40 "it stays open all season, March, November" |
| link6/Stimulis soccer Girls game.MOV @28.2 (duelo con el kit blanco Stimulus; corte a los 31.0) | V8 29.78–32.40 "game uniforms and warmups all in one link" |
| link6/Josh 100 Clips/32-Baseball Warmup.mov @1.3 (beisbolista con camiseta S calentando) | V9 19.63–22.40 "handing out jerseys at practice" |
| link6/frisbee edit.mov @7.9 (#4 y #14 verdes caminando, noche) | V9 27.86–30.55 "one team store, one link, shipped to each player's door" |
| link6/frisbee catch edit.mov @9.8 (equipo Crush festejando) | V9 38.14–40.90 "coaching, cheering, or just enjoying the game" |
| link6/Josh 100 Clips/28-Dribble Pull up Shot.mov @0.0 (básquet juvenil #24) | V10 11.71–14.45 "no car wash, no bake sale, here's how" |
| link6/Frisbee Catch (1).mov @6.1 (atrapada con familia en el costado) | V10 24.93–27.55 "so when your grandma buys a hoodie" (tiempos post-corte) |
| link6/Josh 100 Clips/36-Soccer Steal.mov @0.5 (duelo rojo vs celeste) | V10 40.97–43.70 "set it up once ... the whole season" (post-corte) |
| link6/Hmong Unity Group 2026/A006D044 @0.5 (3 nenes con camisetas rojas; GRABADO DE LADO → assets/broll/src/*_rot_at0.5.mp4, transpose=1) | V11 13.48–16.10 "and kids grow, like a lot" |
| link6/Hmong Unity Group 2026/A006D041 @14 (jugador #25 en la práctica; rotado igual) | V11 23.20–25.90 "bring it to practice, players try on the uniforms" |
| link6/Hmong Unity Group 2026/A006D100 @7 (equipo de básquet #48 #15; rotado igual; zoom de cámara a los 9.7) | V11 34.10–36.75 "size a team once the right way" (ronda 3: antes 34.41–37.00) |
| link6/Stimulis boys game.mov @13.55 (apretón #4, foto del equipo, logo STIMULUS en el short) | V8 41.20–44.25 "our team stores never close, and they don't cost you a thing" (ronda 3) |
| link6/KFA v Saint Paul United FC/MVI_2145.MP4 @0.1 crop 0.6 (partido, camisetas rojas, "Stimulus Athletic" en el pecho) | V9 10.25–12.95 "can you blame them? Think about their job" (ronda 3) |

V2 hecho: 4 b-rolls (pidieron b-roll en 00:00–00:56). Canción "premiere" → "rain" desde el seg 20 (más enérgica, earshot: triumphant/energetic, LRA 2), music_old.mp3 guardada; música -5 dB entre 52.5 y 57.4 s (en 56 s la cama queda 8 dB más baja que antes). Voz 51.6 s→fin con EQ de claridad (-2.5 dB 280 Hz, +4.5 dB 3.2 kHz, high-shelf +3.5 dB 6.5 kHz) en assets/edit_v.mp4 (edit.mp4 intacto).
V3 hecho: 3 b-rolls. Canción "presto" → "music_B" desde el seg 0 (menos triste: triumphant/playful, pizzicato), data-volume 0.10 → 0.08 (cama ~3.6 dB más baja); music_old.mp3 guardada.
V4 hecho: 4 b-rolls. Subtítulo "JASON" → "GEISON" (00:12).

V1 hecho: música -6 dB entre 19.5 y 31.8 s (music_v2.mp3), 3 b-rolls con film burn de entrada y salida.
V5/V6/V7 hecho: V5 2 b-rolls, V6 3 (IMG_5563 en 00:25), V7 3 + música -4 dB entre 55.5 y 60.0 s (music_v2.mp3; la voz baja en "Christmas morning, not a return request" y la música queda solo 11-12 dB debajo). Descartados por zoom/desenfoque: MVI_0862 2-5 s, MVI_0861 1-4 s (entra un adulto a los 4.0), MVI_0858, MVI_0865, Josh 22 (varios cortes de noche). Futsal JOTP tiene letterbox negro dentro del vertical: recortar crop=1080:1350:0:284 antes de usarlo. OJO: IMG_5563.MOV es HDR (HLG/BT.2020): sin convertir, hyperframes pasa a render HDR por capas y salen captions apiladas y el gancho en negro → tonemap a SDR antes (V6: assets/broll/src_img5563.mp4, zscale+tonemap hable). Enviados a Telegram como v3.
V8–V11 hecho: 3 b-rolls cada uno. V8 y V11: zoom de arranque 172→100 con rampa (hfkit.camera `a_ease` opt-in, gen5_body pasa `A_EASE`; plan.py `A_DUR, A_EASE = 0.55, K.bezier(0.25, 1, 0.5, 1)` → 1.72/1.52/1.37/1.25/1.17/1.11/1.07/1.04/1.02 por fotograma, antes lineal 0.4 s). V9: música -6 dB entre 10.3 y 16.4 s (rampas 0.4 s) escrita en assets/music.mp3, original en music_orig.mp3. V10: cortado "only your club leaders see that extra part" = segmento 8 del edit (22.98–25.36, bordes en silencio -45/-65 dB) con prep/cut_v10.py → edit_v.mp4 nuevo (edit_v_pre_cut.mp4 y words_edit_pre_cut.json guardados; edit.mp4 del roto intacto), plan.py reindexado (plan_pre_cut.py guardado), BURN_CUTS [2,5,8,13]. Los clips Hmong MXF están grabados de lado: rotarlos (transpose=1) a un mp4 propio antes de K.broll.

## Ronda 3 (2026-11-11) — V1–V4
- V1 v10: voz +1.5 dB (assets/edit_v.mp4 desde edit.mp4, ganancia simple + limitador de picos transparente -1.9 dBTP solo en la voz), música igual; rampa del zoom de arranque (hfkit).
- V2 v3: voz +1.5 dB sobre el edit_v de la ronda 2 (EQ desde 51.6 s conservada; el anterior en edit_v_r2.mp4), mismo limitador de picos, sin compresión extra; b-roll 40 s Alchemy → HSK MVI_0717 (niños con camisetas Stimulus jugando), 50 s C0275 → KFA MVI_2057 (#12 kit Stimulus, partido real); rampa del zoom.
- V3 v3: voz +1.0 dB (edit_v.mp4 nuevo, mismo limitador); b-roll 33 s C0280 → C0275 @1.0 (levanta la camiseta en la fábrica); rampa del zoom.
- V4 v3: solo la rampa del zoom de arranque (regenerado + render).

## Ronda 3 (2026-11-11) — V8, V9, V11
- OJO cortes: en V8 la imagen de edit.mp4 va ~3 fotogramas detrás de los tiempos de words_edit (concat con trims redondeados a fotograma): los cortes reales están en 16.391/23.482/40.749/44.002. En V11 hay un salto dentro de la toma cruda a 34.201 (fotograma 820) que no figura en los segmentos. Buscar cortes con `ffmpeg ... select='gt(scene,0.04)'` sobre edit_v.mp4, no con words_edit. El b-roll es opaco de t_in a t_out (el burn es solo overlay): el corte tiene que quedar dentro de [t_in, t_out].
- V8 v4: voz SIN compresor: prep/voice_v4.py rehace la voz desde el crudo (highpass + afftdn + agate, sin acompressor/loudnorm), mismo concat que make_edit (sincronía verificada por correlación, +9 ms de adelay = latencia de la cadena vieja), ganancia simple a -13.1 LUFS (antes -13.5) + limitador de picos rápido -1.5 dBFS (la voz cruda tiene ~16 dB de factor de cresta); LRA 2.2 → 3.0, ataque más marcado (earshot ab). Anterior en assets/edit_v_r2.mp4. B-roll 2 (Josh 26) 20.92–23.95 @6.25: cubre el corte de 23.482 ("doesn't matter"). B-roll nuevo 41.20–44.25 Stimulis boys game.
- V9 v4: voz +0.5 dB (edit_v desde edit_v_r2.mp4, ganancia simple + limitador de picos -1.5 dBFS; -13.4 → -13.0 LUFS). B-roll nuevo 10.25–12.95 MVI_2145 justo después de "And honestly" (el título del gancho ya salió a los 9.8).
- V11 v4: b-roll 3 adelantado a 34.10–36.75: entra antes del salto de 34.201 y sale antes del zoom de cámara del clip.

## Ronda 3 (2026-11-11) — V5, V6, V7, V10
- V5 v4: b-roll de 00:15 Orono Girls → KFA MVI_2112 @0.0 (camiseta Stimulus con el logo visible); rampa del zoom. Mezcla -13.7 LUFS / -1.0 dBTP.
- V6 v4: solo la rampa del zoom (regenerado). -13.6 LUFS / -1.0 dBTP.
- V7 v4: voz +1.5 dB con ganancia simple sobre edit_v (prep/voice_r3.py; anterior en edit_v_v3.mp4) + limitador de picos transparente a -1.2 dBFS (la voz ya venía con picos en -1); música igual (music_v2). Mezcla -13.7 → -12.6 LUFS, -1.0 dBTP.
- V10 v4: SINCRONÍA medida (apertura de boca con template-tracking vs envolvente de la voz): el crudo 10.mp4 ya trae el audio ~105 ms tarde (5.mp4 ~35 ms) y voice.wav suma +30 ms → la voz iba ~140 ms detrás de los labios en todo el video (el corte de cut_v10.py no corrió nada: <1 ms). prep/sync_v10.py adelanta solo el audio 0.105 s (queda ~50-70 ms, como V5) y corre words_edit.json lo mismo (backups edit_v_v3.mp4 / words_edit_v3.json). SFX de 00:08: riser_fast llega a pleno a los 0.88 s (meseta, sin golpe) → RISERS pk 1.1 → 0.93, cae en el arranque del contador de $16,000 (8.31 s). Voz +1 dB (mismo limitador). Mezcla -13.6 → -12.7 LUFS, -1.0 dBTP.
- Subir la voz sin tocar la música sube la mezcla (~-12.6/-12.7, no -14): la voz domina la integrada.



## Ronda 4 (2026-11-11) — cortes: zoom EN el corte
Regla del cliente: el cambio de zoom cae exactamente en el frame del corte; nunca tramos <8 frames entre cortes / zoom-corte / b-roll-corte; b-roll cerca de un corte se pega al corte. Automatizado en hfkit (picture_cuts, snap, camera snap_cuts, broll cuts=). Detalle en styles/stimulus/ESTILO.md.
Puntos marcados: V2 00:39, 00:52 · V3 00:35–36, 00:45 · V4 00:25 (extender b-roll anterior), 00:44 · V5 00:18, 00:23–24 · V7 00:04, 00:11, 00:23–24, 00:31 · V8 00:07, 00:16, 00:23–24, 00:28–29, 00:38–39 · V9 00:43–44 · V10 00:31–32, 00:46–47 · V11 00:04, 00:43–44.
- V2 v4 HECHO: cortes reales del picture (19 cortes; los `at` llegaban hasta 5 frames tarde y faltaban 5 jump cuts de la toma: 6.67, 18.52, 23.73, 47.05, 53.72). Cámara con esos cortes + todo movimiento a ≤0.4 s pegado al corte/borde de b-roll. 00:39: el zoom-in caía en 39.37 y el corte real en 39.50 (clip suelto de 3 frames) → zoom y entrada del b-roll MVI_0717 en el frame 947 (39.50). B-roll 3 ahora 39.50–42.37 (sale en el corte 42.37). 00:52: b-roll MVI_2057 sale en el corte real 52.63 (antes 52.35, 7 frames antes del corte); se quitó el burn viejo de ese corte (doble burn). B-roll 2 entra en el jump cut 23.73. Bordes de b-roll cuantizados al frame (antes quedaba 1 frame del host entre burn y b-roll). Fuentes de b-roll borradas de broll/: se reutilizan los cortes ya renderizados (assets/broll/bN_orig.mp4, cámara lenta suave si hace falta más duración).
- V3–V11: PENDIENTE hasta que el usuario confirme V2.
- V1 v11 HECHO (sin puntos marcados): misma automatización. 13 cortes reales; el corte de 7.80 (frame 187) estaba en `at` 7.59 → el zoom caía 5 frames antes del corte (doble salto). Cámara, burns viejos y reset del paneo del gancho ahora en el corte real; bordes de b-roll cuantizados. cut_check limpio, sin SLIVER.
- V3 v4 HECHO: 24 cortes reales (faltaba el jump cut de 40.79). 00:35–36: el corte real es 36.04 (frame 864) y el zoom caía en `at` 35.87 (4 frames antes) → zoom ahora en el frame 864; el b-roll C0275 sale en 35.40, 15 frames antes del corte (≥8, ok). 00:45: corte real 45.46 (frame 1090), zoom estaba 5 frames antes (45.25) → ahora en el corte. cut_check limpio, sin SLIVER.
- V8 v5 HECHO: 19 cortes reales. 00:07: zoom en 174, corte real 175 (1 frame suelto) → zoom en el frame 175. 00:16: zoom 391 / corte 393 → 393. 00:23–24: b-roll keeper salía en 574 y el corte real era 582 → sale en el corte 582 (el corte 563 queda tapado por el b-roll). 00:28–29: zoom 695 / corte 697 → 697. 00:38–39: zoom 928 / corte 930 → 930. También b-roll 1 entra en el corte 326 y b-roll 4 sale en el corte 1055. cut_check limpio, sin SLIVER, fotogramas revisados. Mezcla igual (-13.1 LUFS, -1.0 dBTP).
- V9 v5 HECHO: picture_cuts falló en el tramo final (el edit se atrasa 5–6 frames y la ventana de ±4 no llega): cortes reales 993, 1021, 1060, 1103 (detectaba 988, 1016, 1054, 1098) → corregidos a mano en prep/cuts.json (verificado con fotogramas). 00:43–44: zoom en 1059 y corte real en 1060 (1 frame suelto) → zoom en el frame 1060; el zoom de 42.58 también en su corte real (1021). B-roll 4 sale en 40.90 (12 frames antes del corte 993, ya no se pega al corte equivocado). cut_check limpio. Mezcla igual (-13.1 LUFS).
- V11 v5 HECHO: mismo fallo de picture_cuts: cortes reales 761, 779, 968, 1003, 1058 (detectaba 756, 770, 963, 998, 1052) → corregidos en prep/cuts.json. 00:04: el zoom caía en 107 y el corte real es 106 → ahora en el frame 106; el recorte de cabeza (cutout_pr.webm) corta en los mismos frames que el edit (61, 106, 170), sin desfase. 00:43–44: el zoom caía en 1055 y el corte real es 1058 (doble salto) → CAM_ENTRIES "OOIOOIOOIOOII": zoom-in abrupto EN el corte 1058 (antes ese corte quedaba sin cambio de encuadre). Jump de la toma en 820 = entrada del b-roll 3. cut_check limpio. Mezcla igual (-13.7 LUFS).
- V4 v4 HECHO: 27 cortes reales (faltaban jump cuts 21.89 y 48.05). 00:25: el b-roll MVI_0721 salía en 25.70 y el corte real era 25.77 (2 frames de host sueltos + zoom fuera del corte) → b-roll extendido hasta el corte 25.77 (el burn tapa el corte). 00:44: corte real 44.00 (frame 1055), zoom estaba 5 frames antes (43.79) → ahora en el corte. B-roll 4 entra en 48.05 (jump cut). cut_check limpio, sin SLIVER.

- V5 v5 HECHO: 00:18 zoom en 443 / corte real 445 → zoom en 445. 00:23–24 zoom 3 frames antes del corte 572 → CAM_ENTRIES con zoom-in en 572 y 632. Mezcla -13.7 LUFS sin cambios.
- V6 v5 HECHO (no marcado): regenerado con la automatización; zooms y bordes de b-roll en sus cortes. -13.6 LUFS.
- V7 v5 HECHO: 00:04 zoom 111→corte 112; 00:11 277→278; 00:23–24 563→565; 00:31 759→761. B-roll 2 y 3 entran/salen en cortes reales (660–719, 1148–1220). picture_cuts fallaba tras los 27 s (deriva >4 frames): cuts.json corregido a mano contra el crudo.
- V10 v5 HECHO: 00:31–32 zoom 764→corte 766; 00:46–47 1121→1123. cut_v10.py había dejado 2 frames sueltos en 22.98 s (551–552) → prep/fix_sliver_v5.py los reemplaza con frames del crudo (audio idéntico, se mantiene la sincronía de 105 ms; anterior en assets/edit_v_v4.mp4). cuts.json corregido a mano.
- hfkit.picture_cuts ahora sigue la deriva acumulada (cada corte detectado corrige la predicción del siguiente); reproduce los cuts.json corregidos a mano de V2, V7 y V9 (V11 difiere en 1 corte por 3 frames; queda el valor manual en caché).
- V1 v12 / V3 v5 (cortes extra marcados por el usuario): picture_cuts confundía un gesto (varios frames con mucho movimiento) con el corte real. V1: corte real 7.59 s (frame 182), detectado 187 → el zoom-in caía 5 frames después del corte. V3: cortes reales 8.09 s (194) y 9.59 s (230), detectados 198 y 234 → zoom 4 frames tarde. Arreglo en hfkit: el corte se puntúa como pico de UN frame (d[n] − max de los vecinos), no por diferencia bruta. V1 además min_shot=1.5 (la toma de 1.58 s 6.00–7.59 recibe su cambio de encuadre) y en V1/V3 el bloque de subtítulo que termina a ≤3 frames de un corte termina EN el corte. Pendiente de revisar con la detección nueva (difieren de su cuts.json en caché): V4 frames 214/1442 vs 216/1437, V8 106/290 vs 111/295.
- V1 v13 (cliente): se quitó "Families see the regular price, while the fundraising markup stays private." = el segmento entero 22.65–26.57 s (frames 543–636, 94 frames, 3.92 s). Ambos bordes eran cortes de segmento en silencio (antes de "Families" / después de "private."). Nuevo assets/edit_v.mp4 (anterior en edit_v_v12.mp4), words_edit.json remapeado (anterior words_edit_v12.json), bloques de caption de esa frase (con su ícono "eye") eliminados, b-roll "goes directly" ahora entra justo en el nuevo corte (22.65) y el de "freedom" pasa a 34.68. Duración 52.34 → 48.42 s. La música no se cortó: su crescendo sigue en 19.8–31 s, así que la bajada de -6 dB de music_v2 se queda ahí para taparlo.
