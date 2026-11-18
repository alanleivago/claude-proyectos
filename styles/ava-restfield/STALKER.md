---
type: spec
status: active
tags: [ava-restfield, zombie-channel, stalker, giant, recurring-enemy, ps1-low-poly, rig, sound-kit, mac]
relatedTo: [zombie-channel, ava-rules, zombie-03-station]
---

# El gigante ("the Stalker"): enemigo recurrente

**Nombre en la narración: "the hunter"** (desde el ep15, pedido del usuario). "the Stalker" es solo el nombre interno del modelo/código; Ava nunca lo llama así ni "the smile". En pantalla: sus dientes sin labios con luz suave en la cara, luz verde del pecho. Tema musical cuando está en pantalla: ver GUIA §6. **Su BGM siempre arranca desde 0,5 s del tema en cada aparición** (entrada de 0,15–0,3 s, nunca continúa desde donde quedó; GUIA §4).

Aparece en el Día 3 (largo 3, `pieces/zombie-03-station/largo3`): siguió a Ava desde el bosque (huellas descalzas del doble de su bota) y entra a la mansión saltando por la ventana alta junto a la puerta. Desde ahora persigue a Ava y a Ribbon en los videos siguientes, con la gramática del primer encuentro con el perseguidor de RE3. Solo se copia la técnica: nada de nombres, música, assets ni símbolos del juego.

## Reglas de diseño (del usuario)
- Low poly PS1 **con el mismo nivel que Ava y Lisa**: texturas proyectadas de 128 px, 32 colores, filtro nearest, sin brillo.
- Unos 2,6 m. Hombros enormes, cabeza chica y calva, cuello largo; grapas sobre un ojo, el otro ojo blanco lechoso, dientes enormes sin labios.
- Abrigo largo negro de goma hasta el suelo, tubos rojo vino sobre los hombros, abrazaderas amarillas, **caja hexagonal oxidada con luz verde** en el pecho (en lugar de cualquier símbolo). Nunca el símbolo de biohazard ni logos.
- **Sin arma.** Manos vacías enormes **tipo manopla: sin dedos separados** (malla de una pieza; los huesos `fingers*`/`thumb*` solo cierran el bloque), que se abren y se cierran.
- Pies descalzos gigantes; empapado del bosque.
- Entra **saltando por una ventana** (la ventana estalla hacia adentro), cae pesado, se levanta despacio, ladea la cabeza y mira escalera arriba.
- **Hace ruido monstruoso:** rugido gutural grave al caer y levantarse, gruñido/respiración grave cuando mira y en cada paso de subida. Nunca escribir que "no hace ningún sonido" (corrección del Día 3, v2 → v3).
- Camina lento y pesado; cada paso suena (pie descalzo pesado) y tiembla el objeto golpeado, nunca la cámara ni Ava.

## Cómo se hizo el modelo (método de Ava)
Carpeta: `pieces/zombie-03-station/largo3/stalker/` (créditos en `stalker/CREDITS.md`, diseño en `largo3/gigante.md`).
1. Concepto: Google Flow, Nano Banana Pro (vía srz-google-flow-mcp) → `stalker/concept/2026-11-15T02-06-20-...-2.jpg`.
2. Hoja turnaround frente | perfil | espalda con el concepto como referencia → `stalker/v3/sheet.jpg`.
3. `tools/v3_measure.py`: perfiles de la silueta por altura (frente y perfil) → `v3/profiles.json`, `v3/joints.json`.
4. `tools/v3_build.py`: anillos lofteados por segmento (cuerpo, abrigo, brazos, manos manopla, pies) → `v3/mesh.blend`.
5. `tools/v3_texture.py`: proyección de la hoja sobre la malla, 128 px, 32 colores → `v3/tex/`.
6. `tools/v3_rig.py`: rig de **19 huesos**, tubos y abrazaderas, export `stalker_ps1.glb` (sin animaciones: todo se anima por huesos en el set).
7. Revisión: `v3_preview.py` + `v3_cmp.py` (malla contra la hoja), `render.py` + `compose.py` (renders `compare_v3.png`).
Versiones viejas: v2 (SDF + marching cubes, `tools/sdf_body.py`, `build.py`) y v3 en `stalker_ps1_v2.glb` / `stalker_ps1_v3.glb`; la actual es v3.1 = `stalker_ps1.glb`.

## Huesos (19)
`hips spine chest neck head upperarmL forearmL handL fingersL thumbL upperarmR forearmR handR fingersR thumbR thighL shinL thighR shinR`

## Cómo cargarlo y animarlo en el motor
- Archivo en el motor: `pieces/zombie-03-station/largo3/engine/models/stalker_ps1.glb` (= `largo3/stalker/stalker_ps1.glb`).
- Código: `largo3/engine/sets/p3new.js`, función `makeStalker(scene)` (bloque "STALKER", ~línea 88). Escala el modelo a 2,6 m, guarda la pose de reposo de cada hueso y expone `pose({ ph, w, tilt, grip, duck, pitch, yawHead, t, crouch, reach })`:
  - `ph` fase del paso (0..1), `w` 0 quieto .. 1 caminando (muslos ±0,42 rad, rodillas, balanceo de hombros y cadera);
  - `tilt` ladeo de cabeza, `pitch` mirar arriba, `yawHead` girar la cabeza;
  - `grip` 0 mano abierta .. 1 cerrada (manopla), `duck` agacharse, `crouch` caer agachado (aterrizaje), `reach` brazos al frente;
  - `t` hace parpadear la luz verde de la caja del pecho (`PointLight` en el hueso `chest`).
- Uso en planos: `stalk(x, z, yaw, opts, y)` dentro del mundo GH (vestíbulo de la mansión). Planos de ejemplo: `132b_jump`, `133_land`, `134_feet`, `135_hands`, `138_tilt`, `138b_tilt`, `139_looks_up`, `140_hunting`, `146_first_step`, `149_giant`, `150_choice` (decisión en negativo + menú). La ventana que estalla: `blast(t, t0)`.
- Para un set nuevo: copiar `makeStalker` (y el `L.loadModel('models/stalker_ps1.glb')`) al módulo del set, llamar `pose()` cada cuadro (resetea los huesos a reposo antes de rotar: nunca acumula), y anclar los tiempos a palabras con `ctx.at`.

## Gramática del encuentro (RE3, medida cuadro a cuadro)
- Aparece primero chico en plano general; luego plano grande desde su espalda (~70 % del cuadro) con Ava diminuta al fondo.
- Silencio total de música ~1 s solo en el golpe definitivo (aterrizaje); el rugido entra encima de ese silencio.
- **Decisión:** corte seco → destello blanco 0,5 s → negativo congelado SIN texto 2,5 s → parpadeo negro + destello 0,5 s → negativo CON las dos opciones 2,4 s → parpadeo negro + destello 0,5 s (negativo total ≈ 6,2 s) → vuelve el color con el mismo encuadre, caja azul en la opción que nombra la voz y cuenta regresiva; el gigante en cámara lenta todo el rato. La música no sube: drone grave filtrado + latido (40 bpm en el negativo, 60 después). Efectos estirados ×0,5 y graves; la voz no.

## Kit de sonido (Freesound CC0, elegidos con earshot rank/describe)
| Uso | Archivo (git: solo `meta.json`; audio en LucidLink) | Fuente / crédito |
|---|---|---|
| Rugido (caer y levantarse) | `largo3/audio/cand/monster_growl/366837.mp3` (en la mezcla: ×0,9 de velocidad, paso bajo 3,5 kHz) | "Growl and Roar" — Jofae, https://freesound.org/s/366837/ |
| Gruñido grave (tras "It roars", primer paso) | `largo3/audio/cand/monster_roar/222523.mp3` (×0,9, paso bajo 2,2 kHz) | "Deep Monster Growl" — uagadugu, https://freesound.org/s/222523/ |
| Respiración / gruñido de criatura (mira arriba, sube, cámara lenta ×0,5) | `largo3/audio/cand/monster_growl/634201.mp3` (paso bajo 1,5 kHz) | "CreatureBreath" — dragonboi50120, https://freesound.org/s/634201/ |
| Aterrizaje pesado | `largo3/audio/cand/heavy_land/673424.mp3` | "Falling body hits the floor" — courtneyeck, https://freesound.org/s/673424/ |
| Paso descalzo pesado (`GSTEP` = paso bajo 900 Hz) | `largo3/audio/cand/impact/735421.mp3` | "BF_slide the wall" — maatre, https://freesound.org/s/735421/ |
| Ventana que estalla | `largo3/audio/cand/glass_big/536763.mp3` + `wood_break/669452.mp3` | egomassive / EricsSoundschmiede |
| Drone de la decisión | `largo3/audio/cand/drone_low/871189.mp3` | "Textured Low Drone - Loop" — kkenny101 |
Los eventos y niveles están en `largo3/audio/mix_largo.py` (bloque "plan de sonido de la mansion" + "v3: el gigante RUGE"). Plan narrativo: `largo3/plan_sonido.md`. Créditos de video: `largo3/audio/CREDITS.json` y `largo3/DESCRIPCION.md`. Otros candidatos descargados: `audio/cand/monster_roar/`, `audio/cand/monster_growl/` (script `audio/fetch_fs3.py`).

## Dónde vive cada cosa
| Qué | Git (repo, rama main) | LucidLink (PC `C:\Volumes\alanwork\trabajo\Renders finales claude\Ava Restfield\` · Mac `/Volumes/alanwork/trabajo/Renders finales claude/Ava Restfield/`) |
|---|---|---|
| Modelo actual `stalker_ps1.glb` (458 KB) | `pieces/zombie-03-station/largo3/stalker/stalker_ps1.glb` y `largo3/engine/models/stalker_ps1.glb` | `_assets/stalker/stalker_ps1.glb` |
| Versiones v2/v3, `v3/mesh.blend`, `src/*.npz`, `tex/`, `v3/tex/`, concept, renders, `compare*.png` | scripts en `largo3/stalker/tools/` + `CREDITS.md` | `_assets/stalker/stalker_src.zip` |
| Sonidos del gigante (mp3 de arriba + candidatos) | `meta.json` de cada carpeta | `_assets/stalker/sound/` |
| Stems y mezcla del Día 3, voces, tomas | scripts `voz/*.py`, `audio/mix_largo.py` | `_assets/day3/` |
| Código del set (makeStalker, planos, decisión) | `largo3/engine/sets/p3new.js`, `p3screens.js`, `shots_src.py` | — |
| Render final del Día 3 | — | `police-station-part-3.mp4` |
