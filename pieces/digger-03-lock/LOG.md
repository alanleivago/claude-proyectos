---
type: summary
status: complete
tags: [digger, digger-03, the-lock, tiktok, mechayuki, megagirl, voicestudio, zero-fem, thief, pin-tumbler]
relatedTo: [mechayuki-rules, digger-02-toilet, digger-channel, guion, storyboard]
---
# Digger 03: the lock — registro de producción

## Entregable
- **Vídeo:** `digger03_lock_v1.mp4`. Dura **100,0 s** (voz 97,4 s + 2,6 s de outro), 1080x1920, 30 fps, H.264 crf 16, AAC 192k / 48 kHz. Audio: −14,0 LUFS, −1,2 dBTP.
- **Hojas:** `review/final_contact.png` (40 fotogramas del mp4) y `review/final_stills/sheet_1-4.png` (inicio, mitad y final de los 28 planos).
- **Guion y fuentes:** `guion.md`. Storyboard aprobado: `storyboard.md` y `storyboard_v1.png`. Los cambios pedidos por el usuario están abajo.

## Cambios pedidos por el usuario tras aprobar el storyboard
1. **Hallazgo nuevo, sin pala.** Los planos #1–#3 cuentan el hallazgo así:
   - **#1:** camina por el pueblo, con todo el atrezo, llevando un detector de metales casero: pértiga, bobina, caja roja, antena y LED.
     - Los pitidos se aceleran (anillos y BEEP en pantalla) y se para sobre un bloque de hielo con un candado congelado dentro (`detector_walk` → `detector_stop`), con "!".
   - **#2:** apunta con las dos manos (`melt_beam`) y lanza un rayo cálido.
     - El hielo humea, gotea, encoge poco a poco y se forma un charco.
     - Se agrieta en "artifact" y se parte en dos con impacto y salpicadura.
   - **#3:** el candado salta del hielo roto y le cae en la mano (`catch_object`), con SCANNING → ARTIFACT 003.
   - La primera línea pasa a ser **"Operator… I found another human artifact."**
2. **Arreglos:**
   - #4: la roca ya no la tapa; cámara lateral que sigue el empuje, con `push_heavy`.
   - Las rayas del ladrón están pintadas en la textura de la camisa (ya no hay cajas flotando).
   - El contador marca **51 H** en "fifty-one".
   - Hobbs se distingue: traje oliva, chistera con cinta roja y sin antifaz.
   - Llave plana en 3D de verdad: hoja extruida con 5 dientes, cabeza con agujero, ranura y brillo.
3. **Candado detallado, el mismo en todos los planos:**
   - cuerpo extruido con bisel y textura de óxido y latón con placa repujada;
   - banda de brillo horneada y sombreado plano PS1;
   - arco curvo de acero (medio toro y patas);
   - bocallave con ranura y destello especular.

## Voz (VoiceStudio, megagirl `baab32b2`, cadena limpia, sin "!")
- **Generación:** 16 párrafos con `scripts/gen2.py` (REST, num_step 32, WAV). Whisper coincide con todos. Las únicas diferencias son de formato: "4,000", "1851", "Jr.".
- **Apertura:**
  - El "Operator…" es el **clip aprobado del ep 01** (`pieces/voice-fx/megagirl_operator.wav`), empalmado en silencio con `scripts/splice_operator.py`: cortes a −44,5 y −45,2 dB.
  - El resto ("I found…") es la toma T_gNone_s7, una de 11. Se eligió la que deja silencio después de "Operator" y tiene la mejor similitud de hablante: **0,990** con WavLM-SV frente a los párrafos aprobados (`scripts/speaker_sim.py`).
- **Preguntas:**
  - "teeth?" bajaba (−5,3 st). Se aplicó PSOLA solo a esa palabra, injertada en la toma original (`fix_q.py`). Ahora sube de 296 a ~496 Hz, unos **+9 st**.
  - "…out?" sube por sí sola: **+9,5 st**.
- **"Sneaky.":** 0,55 s de pausa antes, 0,85 s después y plano de reacción (corte seco con cara de sorpresa y luego de enfado).
- **Montaje:** solo se corta en silencio. Pistas: `takes/megagirl_track_clean.wav` y `engine/timeline_megagirl.json`.
- **Comentario de Mia:** palabras 80–91 de 220 (36–41 %).

## Animaciones nuevas (`zero-fem/anim/build_anim.py`, 46 acciones; las 37 anteriores no cambian)
- **De ella:** `detector_walk`, `detector_stop`, `melt_beam`, `catch_object`, `push_heavy`, `push_door`, `lift_bar`, `peek` y `turn_key`. Se revisaron las hojas en `zero-fem/anim/sheets/`.
- **Del ladrón:** caminar de puntillas (`tiptoe`) y pose de forzar la cerradura (`pick`), hechos de forma procedural sobre los huesos rígidos del NPC de `lib-mml`, en `film.js`.

## Sonido
- **Música:** `audio/scripts/music4.py`. Tema original de "golpe pequeño" en Si♭ mayor a 106 BPM:
  - contrabajo *walking* real;
  - melodía en pizzicato de violín y respuestas de clarinete (one-shots CC0 de VSCO-2);
  - marimba, chasquidos y batería suave;
  - *breakdown* bajo el comentario y parada con clarinete "de puntillas" en "Sneaky.".
  - earshot: *playful and quirky* z 3,27 y *chiptune* z 2,30 (el ep 02 daba 2,89).
- **SFX:** 18 grabaciones CC0 de Freesound elegidas con earshot `rank`, más reutilizadas de episodios anteriores. Los pitidos del detector, el zumbido del rayo y los blips son de código (los "beep" CC0 sonaban a despertador).
- **Mezcla:** `audio/scripts/mix3.py`.
- **earshot `critique` del mp4: "close".** 20 de 23 métricas en rango, 0 críticos, p_real 0,94, música presente el 100 % y 81 % de los eventos visuales con sonido.
  - El único aviso "mayor" es la densidad de golpes: 1,87/s frente a un máximo de 1,86 en las referencias. Ya se bajaron 4 dB los SFX que no son revelaciones y 2–4 dB la batería, el pulsado y la marimba. Lo que queda viene sobre todo de la voz, que ocupa el 95 % de las ventanas.
  - Avisos menores: casi mono y poco sub, igual que en los episodios anteriores.

## Revisión por plano (stills de inicio, mitad y final contra mechayuki-rules; `review/r1`…`r3` y `final_stills`)
Columnas:
- **Anim:** ella animada y el mundo reacciona.
- **Acción:** la acción se lee.
- **Manos:** sin atravesar; los props sobre superficies.
- **Overlay:** etiquetas y overlays legibles y dentro del cuadro.
- **Cara:** expresión acorde a la línea y cara visible.
- **FX:** hay efectos.
- **Subt.:** subtítulo de 1 palabra con pop-in.

| # | inicio (s) | Anim | Acción | Manos | Overlay | Cara | FX | Subt. | resultado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0,0 | ✔ camina; pitidos que se aceleran | ✔ | ✔ el detector en la mano | ✔ BEEP | ✔ | ✔ anillos, "!", destellos, nieve, halcón | ✔ | PASS |
| 2 | 2,0 | ✔ el hielo se funde, se agrieta y se parte | ✔ | ✔ | ✔ | ✔ 3/4 | ✔ vapor, gotas, grieta, impacto | ✔ | PASS |
| 3 | 3,7 | ✔ el candado salta a su mano | ✔ | ✔ el candado en el puño | ✔ HUD | ✔ corazones | ✔ | ✔ | PASS |
| 4 | 5,8 | ✔ la roca rueda | ✔ | ✔ | — | ✔ | ✔ polvo, impacto | ✔ | PASS (débil: al final la roca sale del cuadro) |
| 5 | 10,1 | ✔ `push_door` | ✔ | ✔ | — | ✔ de perfil | ✔ marca de enfado | ✔ | PASS (débil: perfil) |
| 6 | 12,6 | ✔ `lift_bar`; la tranca va en las manos | ✔ | ✔ | — | ✔ | ✔ | ✔ | PASS |
| 7 | 16,0 | ✔ | ✔ | — | ✔ BOLT | — | ✔ | ✔ | PASS |
| 8 | 17,2 | ✔ un palo desliza la tranca | ✔ | — | — | ✔ sorpresa | ✔ "!", flecha | ✔ | PASS |
| 9 | 21,3 | ✔ caen los pasadores | ✔ | — | ✔ | ✔ | ✔ antorchas | ✔ | PASS |
| 10 | 26,4 | ✔ diagrama 2D: llave, pasadores, cerrojo | ✔ | — | ✔ | — | ✔ | ✔ | PASS |
| 11 | 29,4 | ✔ | ✔ | ✔ llave de madera | ✔ PIN LOCK | ✔ | ✔ | ✔ | PASS |
| 12 | 31,1 | ✔ | ✔ | ✔ carta | ✔ pegatina | ✔ | ✔ "?" | ✔ | PASS |
| 13 | 35,2 | ✔ guiño | ✔ | — | — | ✔ | ✔ | ✔ | PASS |
| 14 | 36,9 | ✔ punch-in a la llave-anillo | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | PASS |
| 15 | 43,1 | ✔ ladrón de puntillas y ella con `peek` | ✔ | ✔ | ✔ luna | ✔ | ✔ "?" | ✔ | PASS |
| 16 | 45,7 | ✔ | ✔ | — | ✔ THIEF | — | ✔ | ✔ | PASS |
| 17 | 47,0 | ✔ reacción | ✔ | — | — | ✔ shock → enfado | ✔ "!", marca, sudor, impacto | ✔ | PASS |
| 18 | 48,5 | ✔ ganzúas; los pasadores suben en la lupa | ✔ | ✔ | ✔ dentro de la lupa | — | ✔ | ✔ | PASS |
| 19 | 54,2 | ✔ la puerta se abre y se cuela | ✔ | — | ✔ LOCK PICKING | — | ✔ | ✔ | PASS |
| 20 | 55,6 | ✔ | ✔ | — | ✔ 1851, ALFRED HOBBS | ✔ | ✔ | ✔ | PASS |
| 21 | 62,6 | ✔ timelapse y contador | ✔ | — | ✔ 51 H, X roja | — | ✔ impacto | ✔ | PASS |
| 22 | 64,3 | ✔ | ✔ | ✔ cerradura de cilindro y llave 3D | ✔ | ✔ | ✔ | ✔ | PASS |
| 23 | 72,6 | ✔ diagrama: la llave alinea los pasadores | ✔ | — | ✔ | — | ✔ | ✔ | PASS |
| 24 | 78,6 | ✔ | ✔ llave con dientes junto a la cara | ✔ | — | ✔ corazones | ✔ | ✔ | PASS |
| 25 | 81,0 | ✔ punch-in | ✔ | — | ✔ PIN TUMBLER | — | ✔ | ✔ | PASS |
| 26 | 82,4 | ✔ | ✔ las dos llaves | ✔ | ✔ 4000 YEARS | ✔ | ✔ | ✔ | PASS |
| 27 | 88,7 | ✔ el ladrón pasa de puntillas por detrás | ✔ | ✔ | — | ✔ | ✔ "!", "?" | ✔ | PASS |
| 28 | 94,2 | ✔ `turn_key`, se gira y `wave` | ✔ | ✔ | ✔ outro sobre su despedida | ✔ | ✔ | ✔ | PASS |

**Inicio y final:** distinto sitio y distinto encuadre. Empieza en un plano general del pueblo con el detector y termina ante la puerta roja de su casa.

**Planos más débiles:**
- #5: el empujón a la puerta se ve de perfil.
- #4: la roca sale del cuadro en el último tercio.
- #19: el ladrón no se agacha visiblemente; los NPC tienen huesos rígidos.

## Créditos
- Todo es CC0 o propio: personaje comprado por el usuario, voz del usuario y música original con one-shots CC0. **No hay CC-BY.**
- La lista de SFX, con id, autor y URL, y las muestras de la música están en `audio/cand/picks.json`.
- Modelos: la cama Quaternius (CC0) no se usa aquí; la pala tampoco. Buzón: CreativeTrio (CC0).
- Transeúntes, ladrón y Hobbs: relleno de `lib-mml` recoloreado, por decisión del usuario.

## v2: `digger03_lock_v2.mp4` (versión vigente; correcciones del usuario sobre la v1)
- **Formato:** 100,0 s, mismas specs. −14,0 LUFS, −1,2 dBTP.
- **Hojas:** `review/final_contact_v2.png` y `review/v2_stills/sheet_1-4.png` (inicio, mitad y final de los 28 planos, revisados todos).
- **Voz:** la misma pista y los mismos tiempos de la v1, así que Whisper, las preguntas y la similitud de voz siguen valiendo.
- **earshot:** "close". p_real 0,94 (v1) y 82 % de los cortes con sonido. El único aviso "mayor" sigue siendo la densidad de golpes: 1,87/s frente a un máximo de 1,86.

| # | queja | solución |
|---|---|---|
| 1 | ~2 s: no se entendía el derretido | Plano lateral donde se ven a la vez sus puños y el bloque. Rayo en 3D: cono naranja aditivo y núcleo amarillo, de los puños al hielo. Líneas de calor, placa **HEAT BEAM** y termómetro pixel que sube de −12 a 28 °C. El hielo encoge hasta un 55 % y gotea antes de partirse |
| 2 | ~6 s: la roca se hundía y se separaba de las manos | La roca rueda sobre su propio centro (pivote a la altura del radio), así que siempre apoya en la nieve. Ella va a radio + 0,44 m, con los puños pegados a la roca todo el empujón. Deja un surco con bordes de nieve |
| 3 | ~14 s: sin sonido al poner la tranca | Golpe de madera CC0 (596484) más un segundo *clunk* 0,12 s después, mezclados como "revelación" (sin la rebaja de −4 dB) |
| 4 | ~19 s: puerta blanca abajo e incompleta | `door3D`: puerta completa hasta el suelo, con 6 tablones con relieve y juntas, 2 travesaños, bisagras de hierro con clavos, aldaba, chapa de cerradura, marco, dintel y umbral de piedra. Luz cálida en la cabaña |
| 5 | ~22 s: los 4000 años se veían planos | Sala nueva con bloques de arenisca en relieve (cajas sueltas con 3 tonos), friso, dintel y jambas, puerta 3D y dos antorchas con PointLight. Atrezo: ánforas con banda azul, cofre y cestas. Cerradura en 3D abierta por delante: carcasa con canales oscuros, pasadores cilíndricos marfil, cerrojo marrón oscuro con agujeros y llave naranja con tacos. El primer plano (#10) es 3D (ya no el panel de pergamino), con etiquetas PINS, BOLT y KEY |
| 6 | ~44 s: el ladrón doblaba las rodillas hacia atrás | Se midieron los ejes del rig: muslo < 0 va hacia delante y gemelo > 0 dobla bien. Se reescribieron `tiptoe` y `pick` con esos signos, y los pies se re-apoyan en el suelo cada fotograma. Revisado de perfil en 5 fases del paso |
| 7 | ~50 s: ganzúas separadas de las manos | Ladrón agachado ante la puerta, colocado para que sus puños queden a 13 cm de la bocallave. Dos ganzúas que salen de cada puño y entran en la bocallave, y una se mueve. Plano lateral |
| 8 | ~54 s: tras la puerta había una pared | Hueco real en la fachada y, detrás, una habitación cálida iluminada: papel pintado, suelo de tablas, alfombra, mesa con vela y pan, alacena con tarros y lámpara. Al abrirse, sale un charco de luz naranja sobre la nieve |
| 9 | ~57 s: ella cortada | Se movió a la derecha y más cerca (0,3 / 1,0), con cámara más abierta |
| 10 | 1:19: llave incompleta | Cámara más atrás; la llave entera (cabeza, hoja y dientes) entra en el cuadro |
| 11 | 1:24: la llave atravesaba la mano | `keyGrip`: las llaves cuelgan del hueso de la mano con la cabeza pellizcada en los nudillos y la hoja hacia fuera, sin atravesar el puño. Aplicado en #11 (llave de madera en la mano que presenta), #22, #24 y #26 |

Otros arreglos de la revisión de stills:
- #9 y #11 reencuadrados para que ella entre en el cuadro.
- En #11 la llave tapaba la cara con `hold_up_object`; ahora usa `present`.

**Tabla PASS v2:** los 28 planos pasan de nuevo con los mismos criterios de la tabla de la v1.

**Más débiles:**
- #5: empuje de la puerta de perfil.
- #18: el ladrón queda muy cerca de cámara; se lee por la camiseta y las ganzúas.

## v3: `digger03_lock_v3.mp4` (versión vigente)
- **Formato:** 99,7 s, mismas specs.
- **Audio:** **−12,0 LUFS** y **−1,0 dBTP** (medido con earshot sobre el mp4). 0 muestras recortadas, LRA 1,9 LU. El limitador hace como mucho 3,1 dB de reducción y nunca pasa de 1 dB de forma sostenida. El equilibrio voz/música no cambia: la música sigue 7 LU por debajo de la voz.
- **Hojas:** `review/final_contact_v3.png` y `review/v3_stills/sheet_1-4.png` (inicio, mitad y final de los 28 planos).

| # | queja | solución |
|---|---|---|
| 1 | Pausa larga tras "Operator…" | Se quitaron 0,25 s de silencio digital puro del empalme (cortando solo dentro del silencio). El hueco queda en ~0,40 s y todo lo que sigue se retemporiza solo desde la pista (`prep_timeline`), con la música de nuevo en sus secciones. Whisper: "Operator, I found another human artifact…" correcto |
| 2 | La roca no llegaba a ninguna puerta | La cabaña tiene una puerta 3D en la pared frontal. Ella empuja la roca hacia la puerta por un surco y la roca se para contra ella en "lock", con *thud* de roca, impacto, polvo, temblor de cámara y placa **BLOCKED**. Cámara alta en 3/4 desde detrás de ella, para ver a la vez a ella, la roca y la puerta |
| 3 | 1851: ella tapaba el cartel UNPICKABLE | Hobbs a la izquierda de la vitrina, ella a la derecha y la vitrina con su cartel en el centro, con cámara más abierta. Los tres se leen a la vez |
| 4 | Muro que aparecía de golpe (~1:03) | En el timelapse de 51 H, la "noche" era un fondo plano casi negro que se leía como un muro. Ahora es el mismo cielo del plano anterior con gradiente nocturno, así que hay continuidad |
| 5 | Puerta roja con más detalle | Textura de pintura gastada, 4 paneles en relieve con molduras, travesaño de cerradura, pomo de latón y **cilindro de cerradura visible** con bocallave, aldaba, número 3, bisagras, marco blanco con cornisa, escalón y umbral de piedra. Es el mismo modelo en todos sus planos |
| 6 | Volumen | Objetivo del máster en −12 LUFS con techo de true peak a −1 dBTP |

**PASS v3:** los 28 planos vuelven a pasar; los afectados (#4, #18–#21 y #26–#28) se revisaron en inicio, mitad y final.

## Descripción para TikTok
```
Operator… I found another human artifact: the LOCK 🔒 Humans spent 4,000 years just to keep other humans out?
Why do keys have little teeth? Now you know. Follow @mechayuki for more artifacts.

#mechayuki #lock #lockpicking #history #howitworks #science #ps1 #lowpoly #retrogaming #learnontiktok

Music, voice and animation: original. Sounds: CC0 (Freesound).
```
