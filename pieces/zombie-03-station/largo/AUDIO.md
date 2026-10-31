---
type: plan
status: draft
tags: [zombie-channel, ava-restfield, long-form, audio-plan, freesound-cc0, earshot]
relatedTo: [zombie-channel, ava-rules, sonido-pro]
---

# Largo — plan de audio (borrador, SIN mezclar)

Base: `../audio/scripts/mix3.py` del corto aprobado (voz x1.15, música real CC0 continua, estéreo -14 LUFS, TP ≤ -1 dBTP).
Voz lista: `voz/track.wav` (8:04 de película; Marla 996b1578 tras la puerta (paso bajo 2.2 kHz); Ava 3824e262, policía/cinta cf919aa6 por radio con tos real). Eventos SFX:
`audio/sfx_events.json` (1201 eventos, de `engine/sfx_dump.mjs`; cada set los ancla a palabras).

## Música por capítulo (Freesound CC0, elegida con earshot rank)
Consulta earshot: "dark suspenseful horror thriller film score with a steady pulse, tense strings and low drones" sobre 29
candidatos (`audio/cand/mus_*` + el tema del corto). Todo CC0. La música no se corta en ningún hueco largo (regla del usuario);
entre capítulos se funde con cola de 1 s sobre la tarjeta a máquina.

| tramo | t | cue | pista (Freesound, autor) | earshot | nota |
|---|---|---|---|---|---|
| Gancho | 0:00–0:13 | tema | 345069 "Cinematic Atmospheric Element 26OA-QQ" (metrostock99) | z 3.6 strong | tema del corto aprobado |
| 9:02 / 9:15 | 0:13–0:57 | llegada + radio | 164272 "Dark Ambience – Abandoned Fields" (Dredile) | z 3.9 strong | ducking -6 dB bajo la emisión |
| 9:40 | 0:57–1:24 | el cristal | 350953 "Cinematic BG Atmospheric #0055C" (metrostock99) | z 4.1 strong | pulso; sube en "standing there" |
| 10:15 / 10:50 / 11:05 | 1:24–2:46 | armería, agua, comida | 492956 "Horror Ambient" (mr45) | z 3.7 strong | más ligero en "you smile" y en la cafetera |
| 11:30 / 12:00 | 2:46–3:35 | Ribbon + teléfonos | 559388 "Temple on the Hill" (szegvari) | z 3.8 strong, cálido | respiro; cambia a 640612 en "growls" |
| 12:40 | 3:35–4:01 | generador / CO | 640612 "Dark Alien Planet Scary Horror Atmo" (szegvari) | z 3.8 strong | casi nada en "sleepy" |
| 1:10 | 4:01–4:35 | celdas | 631933 "Dark Myst Angels… Thriller Horror" (szegvari) | z 3.3 strong | se CORTA en el YOU DIED de mentira (regla) y vuelve en 48e |
| 1:35 / 1:50 | 4:35–5:19 | Marla + llave | 164272 reprise bajo | — | silencio bajo los susurros de Marla |
| 2:10 / 2:47 | 5:19–6:11 | turnos + guardado | 559388 reprise (−10 dB) | — | calma de save room |
| 3:14 | 6:11–7:01 | el golpe → 50 | 865550 "Dark Atmospheric Drone (Time-Stretched)" (kkenny101) | z 3.65 riser | sube hasta DANGER en "Vickers" y en "breathing" |
| 3:40 | 7:01–7:40 | luces + cinta | 686659 "I shouldn't have agreed" (xkeril) | z 3.3 riser | golpe en "Oh, fudge"; 0.4 s de silencio antes de "Vickers" |
| Final | 7:40–8:04 | espejo | 345069 reprise | — | se corta antes de FOLLOW AVA RESTFIELD |

Descartada: 338845 (z alto pero es "Alarm piece – modular patch", alarma sintética). Créditos CC0 no obligatorios; se listan
igual en la descripción.

## Ambiente
- Lluvia continua: `../audio/cand/rain_amb/467172.mp3` (la del corto). Más fuerte en planos ext y junto al cristal; amortiguada
  (LPF 1.2 kHz) en sótano, perrera, radio y sala segura.
- Truenos en los relámpagos (01, 57, 68): `../audio/cand/thunder/778363.mp3`, `750670.mp3`.
- Zumbido de fluorescentes desde 59_lights_on hasta el final (`../audio/cand/fluor_on/145117.mp3` + loop del zumbido).
- Generador en marcha (61 → final, bajo y lejano fuera del sótano): `audio/cand/generator/`.

## SFX (de `audio/sfx_events.json`)
Mismas fuentes que el corto (`../audio/picks.json`) + nuevas descargas en `audio/cand/` (dog_whine, dog_growl, generator,
tape_click, glass_shatter, cough). Reglas: recortar el silencio inicial de cada archivo; una tecla de máquina por letra
(`type_key` ×103: tarjetas de capítulo, hoja de guardado, menú final); golpes del cristal (`glass_knock` ×36, `glass_hit`,
`glass_bang`) en su frame; Dino Crisis: sonido por defecto en `label`/`label_pop`, pitido de radio solo cuando aparece la radio
(11, 12, 15, 51), menú FILE/ITEM (`menu_open`, `item_pop`, `counter_tick`, `stamp`); voces de zombi RE (`assets/zombie-sfx-yt/seg`)
para `zombie_moan/growl/groan`, `horde_moan`. Perro: `tail_thump` ×22, `dog_whine`, `dog_growl(_low)`, `collar_jingle`,
`dog_claws_concrete`. A elegir con earshot rank/find antes de mezclar: dog_*, generator_loop, tape_click/reel_spin, glass_shatter.

## Pasos
Pasos de Ava: eventos `step_walk` / `step_run` en cada contacto del pie (todos los sets) → golpes recortados de Dino Crisis
`assets/dino-crisis-sfx/ch/walk_run_indoors.wav` (paso de andar para walk, de correr para run; variar entre 4-6 golpes).
Tarjetas: `type_key` por letra de la hora + `type_key_soft` por letra de la línea DAY 1.

## Pendiente para la mezcla
`audio/scripts/mix_largo.py` (copia de mix3.py) con la tabla de cues de arriba, ducking bajo voz, cortes de música en
"Oh, fudge" y antes del FOLLOW; medir con earshot timeline/critique.
