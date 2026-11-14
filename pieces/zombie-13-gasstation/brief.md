---
type: spec
status: draft
tags: [zombie-channel, ava-restfield, gas-station, series, short, brief]
relatedTo: [zombie-channel, ava-rules, zombie-12-radio]
---

# Ep13 "AVA: Gas Station, Part 1" — brief

Short 9:16, 62.0 s (voz termina 59.0 s), 2a persona, serie por partes con cliffhanger. Plan aprobado: PLAN.md. Base: copia de zombie-12-radio.

## Estado
- Storyboard APROBADO con fixes (autos Quaternius CC0, exterior con detalle, frente de aluminio con la puerta en su marco, mano low poly facetada con dedos articulados + vendaje + puno, gota que rueda y se abre, final mas cerca, zombis mas cerca de los faros, menos destello, linterna apuntando a la puerta).
- ENTREGADO v1 (2026-11-10): `renders/zombie13_gas_v1.mp4` = share.mp4, 62.0 s, -14.0 LUFS, pico -1.3 dBFS. 2 rondas API (`renders/*_revision.md`). Sin Telegram.
- Motor: `engine/sets/gas.js` (gasolinera + tienda en codigo, IK de dos huesos para la mano en el pico), `sets/screens13.js` (diagrama de la bomba, ITEMS), `film.js` (cortes ep13).
- Voz: f2a102da steps 32 wav, 8 semillas (hasta 14 en 09_0/10_2), elegidas en `voz/pick_manual.json`; desconocido b0469a54 apagado por la puerta (paso bajo 1,3 kHz + eco corto en `voz/assemble.py`). "Oh, fudge" = toma del ep1.
- Audio: `audio/scripts/mix13.py` (SFX Freesound CC0 elegidos con earshot rank; creditos en audio/CREDITS.json).

## Datos
- Las bombas de nafta funcionan con electricidad: sin luz no bombean.
- Regla de los 3: unas 3 semanas sin comida, unos 3 dias sin agua.
