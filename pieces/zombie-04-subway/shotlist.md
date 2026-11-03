---
type: spec
status: active
tags: [zombie-channel, ava-restfield, subway, shotlist]
relatedTo: [zombie-channel, ava-rules]
---

# Ep4 — "AVA: The Last Train — Part 1" (shot list)

Beats del reel "Subway" de play.malo (`fuentes/zombie-nicho/playmalo-subway-p1.md`), tabla aprobada por el usuario. 9:16,
360x640 x3, 69,4 s (la voz es mas rapida que la tabla de 95 s; CTA en toma aparte). Guion: `voz/guion.md`. Tiempos de palabra: `engine/timeline.json`.
Decorado unico: `engine/sets/subway.js` (anden MERCY STREET). Props por foto->loft: `objects/` (tools/prep_tex.py + build.py).

| id | t0 | voz | que se ve |
|---|---|---|---|
| 01_plat | 0.0 | You miss the last train… | anden vacio, carteles MERCY STREET, luces traseras del tren que se va |
| 01b_gate | 2.42 | …and the station locks you in. | reja de salida con cadena, EXIT; solo la reja tiembla. HUD aparece |
| 02_phone | 5.04 | Your phone has no signal… eleven forty-two… | telefono en su mano: NO SERVICE, 3 %, 11:42 |
| 02b_board | 8.91 | …and the next train isn't until five thirty. | reloj 11:42 + panel NEXT TRAIN 5:30 AM escrito en su palabra |
| 03_booth | 12.29 | Then you find a sheet taped up in the ticket booth | Ava se asoma a la hoja en la ventanilla |
| 03b_file | 14.04 | night shift instructions. Rule one… Rule two… don't… | FILE de RE: regla 1 en "never/empty", regla 2 palabra a palabra, borde roto |
| 04_laugh | 26.47 | You laugh it off… pranking the new guy. | frontal: sonrisa, shrug -> smug + guino |
| 05_clock | 30.79 | At eleven fifty-nine… midnight… | reloj 11:59 -> 12:00 en "midnight" |
| 05b_dark | 34.54 | every light in the station goes out. | tubos se apagan fila a fila; a oscuras en "out". HUD CAUTION |
| 06_train | 39.2 | A train pulls in with two headlights… | dos faros en el tunel, se acercan sin sonido |
| 06b_doors | 42.72 | …doesn't make a sound. The doors slide open on an empty car. | tren parado, la puerta se abre en "open": vagon vacio iluminado |
| 07_steps | 46.91 | Then you hear slow footsteps behind you. | Ava de frente (desde la puerta), anden negro detras |
| 07b_eyes | 48.94 | Something is standing right there… | silueta negra con ojos blancos al fondo. HUD DANGER |
| 07c_neck | 50.76 | …breathing on your neck. | primer plano: la silueta pegada a su hombro, vaho |
| 08_fudge | 54.51 | Oh, fudge. (toma del ep1) | frontal, shock -> sonrisa nerviosa |
| 08b_close | 55.93 | And the doors start closing. | plano lateral: las hojas empiezan a cerrarse |
| 09_choice | 58.89 | So do you get on… or do you stay? Comment one or two… | menu RE 1 GET ON / 2 STAY, COMMENT 1 OR 2, maquina de escribir |
| 10_end | 65.4 | — | reloj 12:00 girando, NEXT: PART 2., FOLLOW AVA RESTFIELD! |

Pendiente para el render: SFX reales (pasos y respiracion grabados, verificados con earshot), musica por LUFS (mix3.py),
revisar_render.py y hojas de contacto.

## Render v3 (2026-11-01)
- `renders/zombie04_subway_v3.mp4` (= `renders/share.mp4`): motor `engine/` + `audio/scripts/mix4.py` (-14,0 LUFS, TP -1,4 dBTP,
  musica Freesound 610534 a 11 LU bajo la voz). Revisiones API: `renders/*_revision.md`.
- Accion nueva `run` en `pieces/zombie-girl/anim/build_anim.py` (A_run, 20 f); glb copiado a `engine/models/`.
- Banco por foto->loft (`objects/`, bench). Torniquete: lateral sin los brazos pintados.

## Render v4 (2026-11-01, revision del usuario de v3)
- `renders/zombie04_subway_v4.mp4` (= `share.mp4`), 56,25 s, -14,0 LUFS, TP -1,5 dBTP.
- Voz entera nueva (`voz/takes_v4`, 4 semillas, `pick_v4.py` elige la mas viva que whisper oye bien), abre con "Imagine you…",
  pausas 0,3-0,45 s (apagon/tren 0,75). Tiempos de imagen y sonido salen de la voz: `voz/build_cues.py` -> `engine/cues.json`.
- Telefono POV vertical (camara por la normal de la pantalla), reja que se cierra delante de Ava (camara en la escalera),
  ojos de la criatura almendrados con brillo y pupila.
