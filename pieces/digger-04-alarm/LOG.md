---
type: summary
status: active
tags: [digger, digger-04, alarm-clock, despertador, knocker-upper, tiktok, mechayuki, megagirl, voicestudio, zero-fem, sinaboto-format]
relatedTo: [mechayuki-rules, digger-03-lock, digger-channel, guion, storyboard]
---
# Digger 04: el despertador — registro de producción

## Entregable
- **Vídeo:** `digger04_alarm_v1.mp4`, **105,4 s** (voz 102,8 s + 2,6 s de outro). 1080x1920, 30 fps, H.264 crf 16, AAC 192k a 48 kHz.
- **Audio** (medido con earshot sobre el mp4): **−12,0 LUFS**, **−1,0 dBTP**, LRA 1,9 LU y 0 muestras recortadas.
- **Hojas:**
  - `review/final_contact.png`: 40 fotogramas del mp4.
  - `review/final_stills/sheet_1-4.png`: inicio, mitad y final de los 31 planos.
- **Guion y fuentes:** `guion.md`. El storyboard aprobado es `storyboard.md` + `storyboard_v1.png`.
- **Formato:** sinaboto. Abre directamente con el gancho; no hay "Operator… I found" ni escena de hallazgo.

## Cambios pedidos por el usuario al aprobar el storyboard
1. **Zonas verdes**: hierba en vez de nieve en todo el episodio. En `shots.js` de este episodio, `T.snow` pasa a ser `tex/grass.png`; la nieve real queda en `T.snowW` solo para el plano de invierno (#3). Además:
   - tejados de teja roja y pinos verdes;
   - árboles con hojas y con flor, arbustos, macetas, jardineras en las ventanas, hiedra, parches de flores;
   - la fábrica con hiedra, árboles y césped;
   - el final en una loma de hierba con caída a un valle verde: campos, río, el pueblo abajo.
2. **Cama sin atravesar**:
   - Tumbada y sentada salen ahora del rig: `sleep_lie`, `wake_sit_up`, `slap_snooze`. Ya no hay rotación rígida en three.js.
   - La raíz va sobre el colchón. Medido en Blender con el cuerpo deformado: el punto más bajo queda 0–2 cm bajo el colchón (−9,0 a −9,15 frente a −9,0 de suelo).
   - La coleta: tumbada se dirige al lado de la almohada, y sentada hacia atrás sobre el colchón. Antes atravesaba la cama 0,57 m.
   - El edredón es un arco sobre las piernas, de 0,52 m de alto, porque la armadura mide 0,30–0,45 m tumbada. Así no corta.
   - Almohada fina: la cabeza se apoya en ella.
3. **Sombreros de los NPC**:
   - Low poly PS1 con textura pequeña: gorra de tweed, tricornio de fieltro con ribete dorado, gorro de dormir a rayas con pompón, cofia morada con ala y lazo.
   - Se miden por la cabeza de cada NPC (alto y ancho de la malla en reposo) y van pegados al hueso que lleva la cabeza (`Bone001`). Siguen todas las poses sin hueco ni flotar.
4. **Pendientes del storyboard:**
   - #12: plano medio que se levanta hacia la ventana al dar los golpes.
   - #17: tomate con el tubo y guisantes más grandes, con estela.
   - #16: Mary centrada y de 3/4.
   - #31: caída visible con borde de rocas, valla y valle más oscuro con río.

## Animaciones nuevas (`zero-fem/anim/build_anim.py`, 58 acciones; las 51 anteriores no cambian)
- `sleep_lie`, `wake_sit_up`, `slap_snooze`, `push_nail`, `run`, `tap_pole` y `blow_tube`.
- Comprobado: `actions.json` y `face_tracks.json` de las 51 acciones anteriores son idénticos.
- El glb nuevo solo se copió a este episodio; los ep 01–03 conservan el suyo.
- La coleta tiene dirección forzada solo en las 3 acciones de cama (`HAIR_DIR`), sin límite de cono.
- NPC: los trabajadores caminan con el paseo procedural (rodillas bien, signos medidos en el ep 03). El knocker-upper camina con la pértiga y golpea la ventana.

## Voz (VoiceStudio, megagirl `baab32b2`, cadena limpia, sin "!")
- **Generación:** 14 párrafos con `voz-studio/scripts/gen2.py`. Whisper coincide con todos (13 a 1,000 de primera; "Rude." en la semilla 3).
- **"Rude.":** se rehízo para que sea la misma voz. 10 tomas, elegida la `s10` por similitud de hablante **0,929** (antes 0,845). Whisper: "Rude.".
- **Similitud de hablante** (WavLM-SV frente a los párrafos aprobados del ep 03): 0,977–0,994 en todos los párrafos.
  - "Operator Jay asks…" (p06): **0,977**, la misma voz.
- **Preguntas:**
  - "knocker-upper?" bajaba (−0,5 st). Se aplicó PSOLA solo a "-upper" (`fix_q.py`) y ahora sube **+5,9 st**.
  - "…sleep through it?" sube sola: **+8,2 st**.
- **"Sixpence":** el Whisper small sobre la pista montada oye "six pints". El Whisper medium sobre la toma oye "six pence". Se deja.
- **Montaje:** `assemble.py`, cortando solo en silencio. Pausas de 0,32–0,5 s; 0,5 s antes de "Rude." y 0,7 s después, con plano de reacción.
- **Cadena:** `retro_voice --preset genre --eq 0`, a −14 LUFS.
- **Tiempos:** `prep_timeline.py` → `engine/timeline_megagirl.json`.
- **Comentario de Jay:** de 36,1 s a 42,6 s sobre 102,8 s, es decir 35,1–41,4 %.

## Sonido
- **Música:** `audio/scripts/music5.py`. Tema original nuevo "rise and shine", 112 BPM en Re mayor (I vi IV V | I iii IV V):
  - contrabajo y violonchelo pizzicato reales con bajo caminante;
  - melodía en pizzicato de violín;
  - marimba;
  - la caja de música toca el motivo "alarma" Re-La-Re al empezar cada frase;
  - clarinete y batería suave;
  - *breakdown* bajo el comentario;
  - parada en "Rude." con "pea-pop" en pizz y "harrumph" de clarinete;
  - cierre en Re.
  - earshot: *playful and quirky* z 3,3, pizzicato z 2,9, *chiptune* z 2,2 (no es chiptune).
- **SFX:** 21 grabaciones CC0 de Freesound elegidas con earshot `rank` (`audio/cand/picks.json`). Incluyen:
  - gallo al amanecer, pájaros, ronquido;
  - llama de vela, clavo, **clang** sobre plato metálico;
  - silbato de vapor y ambiente de fábrica, carrera, verja de hierro, caja registradora, monedas;
  - toques en el cristal, guisante contra el cristal, ventana que se abre, gruñido;
  - timbre de despertador antiguo (y tres a la vez para "todas las ventanas suenan"), tic-tac, clic del botón, almohada.
  - De código: puff del tubo, bonk, zumbador, trombón triste, tono de móvil y blips de etiquetas.
- **Ambientes por plano:** pájaros en los planos de día y verdes, grillos de noche, fábrica, tic-tac, habitación y viento de invierno (#3).
- **Mezcla:** `audio/scripts/mix4.py` (generado por `make_mix4.py` a partir del mixer del ep 03). Ducking 7 LU bajo la voz, limitador.
- **earshot `critique` del mp4: "launch-grade".**
  - 21 de 23 métricas en rango, 0 críticos, 0 mayores, p_real 0,93, música presente el 100 %.
  - Avisos menores (igual que en los ep 01–03): casi mono y poco sub.

## Revisión por plano (stills de inicio, mitad y final contra mechayuki-rules; `review/r1`, `r2`, `final_stills`)
Columnas:
- **Anim:** ella animada y el mundo reacciona.
- **Acción:** la acción se lee.
- **Manos:** sin atravesar.
- **Overlay:** etiquetas legibles y dentro del cuadro.
- **Cara:** expresión acorde a la línea.
- **FX:** hay efectos.
- **SFX:** la acción tiene sonido.

| # | Anim | Acción | Manos / cama | Overlay | Cara | FX | SFX | resultado |
|---|---|---|---|---|---|---|---|---|
| 1 | ✔ `sleep_lie`, el sol sube y el rayo avanza | ✔ | ✔ sobre el colchón, edredón sin cortes | ✔ | ✔ dormida | ✔ zzz, rayo, destellos | ✔ gallo, ronquido | PASS |
| 2 | ✔ `wake_sit_up` | ✔ | ✔ | ✔ ALARM CLOCK | ✔ sorpresa → ojos entornados | ✔ "!" | ✔ | PASS |
| 3 | ✔ nieve, el reloj corre | ✔ | ✔ | ✔ 0X:XX, LATE | ✔ | ✔ | ✔ viento, tic rápido | PASS |
| 4 | ✔ `push_nail` | ✔ | ✔ el clavo en el puño | — | ✔ | ✔ calor | ✔ | PASS |
| 5 | ✔ la vela baja y el clavo cae | ✔ | — | ✔ METAL PLATE | — | ✔ goteo, flecha | ✔ llama, clavo | PASS |
| 6 | ✔ se despierta en el catre | ✔ | ✔ manta en arco | ✔ CLANG | ✔ shock | ✔ impacto, "!", temblor | ✔ clang | PASS |
| 7 | ✔ punch-in | ✔ | — | ✔ CANDLE ALARM | — | ✔ | ✔ | PASS |
| 8 | ✔ obreros caminando, humo | ✔ | — | ✔ 1800s | ✔ | ✔ humo | ✔ fábrica, silbato | PASS |
| 9 | ✔ `run` y la verja se cierra | ✔ | — | ✔ LATE = FIRED | ✔ shock → triste | ✔ impacto, sudor | ✔ carrera, verja, zumbador | PASS |
| 10 | ✔ la aguja gira loca | ✔ | — | ✔ PRICEY | ✔ | ✔ "?", sudor | ✔ caja registradora, boing | PASS |
| 11 | ✔ monedas en arco a su mano | ✔ | ✔ | ✔ +1 PENNY | ✔ | ✔ | ✔ monedas | PASS |
| 12 | ✔ camina y `tap_pole` | ✔ | ✔ la pértiga entre los puños | ✔ TAP | ✔ | ✔ la ventana se enciende | ✔ pasos, toques | PASS |
| 13 | ✔ | ✔ | ✔ | ✔ KNOCKER-UPPER | ✔ smirk | ✔ | ✔ | PASS |
| 14 | ✔ buzón | ✔ | ✔ carta | ✔ pegatina | ✔ | ✔ "?" | ✔ | PASS |
| 15 | ✔ duerme a las 2 PM | ✔ | ✔ | ✔ 2 PM | ✔ | ✔ zzz | ✔ ronquido, pájaro | PASS |
| 16 | ✔ Mary con tubo, cofia y chal | ✔ | — | ✔ LONDON, MARY SMITH | ✔ | ✔ "?" | ✔ | PASS |
| 17 | ✔ `blow_tube`, guisantes con estela | ✔ | ✔ | ✔ TIK | ✔ medio perfil | ✔ | ✔ puff, tic en el cristal | PASS (débil: perfil) |
| 18 | ✔ | ✔ | ✔ el tubo en el puño | ✔ PEA SHOOTER | ✔ | ✔ | ✔ | PASS |
| 19 | ✔ la moneda gira | ✔ | ✔ | ✔ 6D A WEEK | ✔ | ✔ | ✔ | PASS |
| 20 | ✔ el durmiente se asoma enfadado (gorro de dormir) | ✔ | ✔ | — | ✔ smirk | ✔ marca de enfado | ✔ ventana, gruñido | PASS |
| 21 | ✔ Hutchins (tricornio) y su reloj | ✔ | — | ✔ 1787, LEVI HUTCHINS | ✔ | ✔ | ✔ tic-tac | PASS |
| 22 | ✔ suena la campana a las 4:00 | ✔ | — | ✔ 4:00 AM ONLY | ✔ shock | ✔ marcas de timbre, temblor | ✔ timbre | PASS |
| 23 | ✔ `present`, el reloj en su mano | ✔ | ✔ | ✔ 1876, SETH THOMAS | ✔ sparkle + blush | ✔ | ✔ | PASS |
| 24 | ✔ el knocker-upper se va con la pértiga | ✔ | ✔ | — | ✔ triste | ✔ suenan todas las ventanas, sudor | ✔ timbres, trombón | PASS |
| 25 | ✔ golpea todavía en los 70 | ✔ | ✔ | ✔ 1970s | ✔ "!" | ✔ | ✔ | PASS |
| 26 | ✔ `slap_snooze` y el botón baja | ✔ | ✔ | ✔ 1956, SLAP | ✔ enfado → dormida | ✔ marcas de timbre, impacto | ✔ timbre, clic | PASS |
| 27 | ✔ vuelve a dormir | ✔ | ✔ | ✔ + A FEW MIN | ✔ | ✔ zzz | ✔ almohada, ronquido | PASS |
| 28 | ✔ punch-in | ✔ | — | ✔ SNOOZE BUTTON | — | ✔ | ✔ | PASS |
| 29 | ✔ los 4 iconos | ✔ | ✔ móvil | ✔ | ✔ | ✔ | ✔ pops | PASS |
| 30 | ✔ suena el móvil, snooze y un guisante le da en la cabeza | ✔ | ✔ | ✔ SNOOZE | ✔ "?" | ✔ impacto | ✔ tono, bonk | PASS |
| 31 | ✔ `wave` y grúa sobre el valle | ✔ | — | ✔ outro | ✔ guiño + rubor | ✔ | ✔ | PASS |

**Inicio y final:** distinto sitio. Empieza en su dormitorio al amanecer (interior) y acaba en la loma verde sobre el valle (exterior).

**Planos más débiles:**
- #17: de perfil y de espaldas mirando a la ventana; la cara se ve poco.
- #31: la caída al valle se lee, pero sin mucho dramatismo.
- #6: el catre queda al fondo.

## Revisión automática (`tools/revisar_render.py --estilo mechayuki`, créditos API)
- **Ronda 1: NO LISTO.** Arreglado:
  - Mary centrada y disparando: los guisantes vuelan de su tubo a la ventana, con TIK.
  - Inserto del tubo entero con un guisante saliendo.
  - La moneda: "SIXPENCE A WEEK" y moneda de plata.
  - El durmiente detrás de la pared: ya no se ven piernas bajo el alféizar.
  - Las pértigas en la mano de los NPC (`npcHand`), con el brazo levantado en #25.
  - Monedas que salen de la mano del obrero.
  - Quitadas la luna pegada a la pared (#12) y la losa verde sobre el buzón.
  - Azulejos 1956 limpios (las manchas parecían nieve).
  - Gorra ajustada al cráneo.
  - Etiquetas "1800 - 1900" y "UP TO 1970" (la S se leía como 5).
  - Rayos de sol finos y translúcidos.
  - Final: más cerca, móvil levantado junto a la cara, tarjetas al lado contrario de la cara y a tamaño de caption; el sol fuera del título; la grúa mira hacia el valle.
  - Pausas un poco más largas al principio: el comentario de Jay empieza al 35,1 %.
- **Ronda 2: CASI.** Arreglado:
  - Coleta tumbada sobre el hombro (2 cm sobre el colchón, medido).
  - Clavo visible en el puño.
  - Mary de perfil y luego de 3/4 con el tubo en los labios.
  - Hutchins dentro del cuadro.
  - Reloj de 1876 sobre la mesilla, con ella presentándolo y la cama fuera del plano.
  - Placa SNOOZ legible.
  - Encuadres de #9 y #12.
- **Ronda 3: CASI.** Arreglado:
  - Clavo oscuro y más grande.
  - Continuidad de la vela (en #7 ya está consumida, con el clavo en el plato).
  - Monedas que se quedan en su mano.
  - Pared completa con vigas en el taller de Hutchins.
  - #23 animado: `present` → `nod` → `hands_on_hips`, con push-in.
  - Botón snooze en 3D con relieve.
  - Etiqueta METAL PLATE separada del caption.
- **Señalado e intencional:**
  - Los fotogramas en bloques son el fundido en mosaico entre planos.
  - El disco oscuro del vientre es el traje.
  - "Six pints": el Whisper medium sobre la toma oye "six pence".
  - El outro tiene el mismo tamaño aprobado en los ep 01–03.
  - 105 s, porque el guion aprobado tiene 227 palabras.
- **Ronda 4** (sobre el mp4 final): **CASI**, con fallos menores.
  - Encuadres que la cortan: #9, #11, #23, #29–30.
  - La cara de perfil o tapada por el pelo en el comentario (#14) y en #12.
  - Etiquetas en el pop-in algo grandes.
  - Moneda pequeña.
  - Plato que se lee cerámico.
  - Caption "fired" que se lee "Ared" (fuente del pie, igual que en los ep anteriores).
  - **No se rehízo el vídeo**: quedan como planos débiles para la próxima versión.
- Las revisiones están en `review/digger04_alarm_v1_revision_round1-3.md` y en `digger04_alarm_v1_revision.md` (la última).

## Créditos
- Todo es CC0 o propio: personaje comprado por el usuario, voz del usuario, música original con one-shots CC0 (VSCO-2) y SFX CC0 de Freesound. La lista de SFX está en `audio/cand/picks.json`.
- **No hay CC-BY.**
- NPC: relleno de `lib-mml` recoloreado; los sombreros están hechos en código.

## Descripción para TikTok
```
If you sleep facing a window… you have an alarm clock ⏰ Before alarm clocks, people paid a knocker-upper to tap on their window… or shoot peas at it.
Humans paid people to shoot peas at their windows… and then invented the snooze button? Follow @mechayuki for more artifacts.

#mechayuki #alarmclock #history #knockerupper #howitworks #ps1 #lowpoly #retrogaming #learnontiktok

Music, voice and animation: original. Sounds: CC0 (Freesound).
```

## v2: `digger04_alarm_v2.mp4` (la v1 se conserva)
- **Formato:** 105,4 s, mismas specs. −12,0 LUFS, −1,0 dBTP. La voz y los tiempos son los de la v1.
- **Hojas:** `review/v2_stills/sheet_1-4.png` y `review/final_contact_v2.png`.
- **Cambios:**
  - **Reencuadres con el cuerpo entero:** #9 (empieza dentro del cuadro y la cámara está más atrás), #11, #16, #23 y #29–30.
  - **Cara visible:**
    - #14: cámara baja, se le ve la cara bajo el flequillo mientras lee.
    - #12: al parar, la cámara pasa junto a la pared y la mira de frente mientras golpea hacia arriba.
    - #17: cámara junto a la pared, de frente, mientras sopla.
  - **Subtítulos:** "fi"/"fl" con un espacio fino tras la "f" y sin ligaduras (`main.js`). Ahora "fired" se lee bien; "afternoon" no cambia.
  - **Monedas:** la de seis peniques va colgada del hueso de la mano; las del #11 son más grandes.
  - **Plato del #5:** peltre gris con borde claro y un brillo.
  - **Placas:** al tamaño del ep 03 (escala 2; ya no hay placas a escala 3). El outro no cambia.
- **`revisar_render.py`** sobre la v2: **CASI.** Ver `digger04_alarm_v2_revision.md`.

## v3: `digger04_alarm_v3.mp4` (la v1 y la v2 se conservan)
- **Voz:** solo se regeneró el párrafo 7, con el texto "Six-pence… a week".
  - Elegida la toma s6 de 6: similitud de hablante 0,993.
  - Whisper small y medium la oyen "Six pence"; sobre la pista montada, Whisper small también dice "Six pence" (antes oía "six pints").
  - Se volvió a montar la pista y a calcular los tiempos: 105,6 s. El comentario de Jay empieza al 35,1 %.
  - La música se rehízo con los nuevos tiempos.
- **Planos:**
  - **#1/#3:** cámara en 3/4 desde el lado contrario a la ventana: se le ve la cara dormida y, a la vez, la ventana con el sol (o la nieve).
  - **#4:** clavo grande (cuerpo claro y cabeza oscura) colocado en su puño cada fotograma, apuntando a la vela; reencuadre.
  - **#12/#17:** 3/4 desde junto a la pared: su cara, la pértiga o el tubo y la ventana objetivo en el mismo cuadro.
  - **Cerbatana:** marrón madera en todos los planos; ya no la oscurece la gradación nocturna.
  - **#14:** lee la carta con `present`, la cabeza alta y la cara despejada.
  - **#15/#16:** "2 PM" más abajo, así que no se cruza con LONDON en el fundido. #16 con las piernas enteras.
  - **#19:** moneda de plata más grande en su puño, girada de frente a la cámara.
  - **#24:** la pértiga en su mano, inclinada hacia delante y lejos del sombrero.
  - **#28:** placa SNOOZ dentro del cuadro.
  - **#29:** rótulos de los iconos sobre placa oscura.
  - **#31:** el sol abajo a la derecha, lejos de LOGGING OFF.
- **Hojas:** `review/v3_stills/sheet_1-4.png`.
