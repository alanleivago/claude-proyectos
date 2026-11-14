---
type: spec
status: draft
tags: [zombie-channel, ava-restfield, stairs, short, brief]
relatedTo: [zombie-channel, ava-rules]
---

# Ep10 "AVA: The Stairs" — brief

Short 9:16, 62.0 s (voz termina en 58.4 s), ingles, segunda persona. Ep4 de la serie de la casa (ep1 `zombie-01-door`, ep2 `zombie-02-window`, ep3 `zombie-07-saferoom`, que adelanto "NEXT: THE STAIRS / Should I open the door?").

## Que se reuso
- Motor: copia de `zombie-07-saferoom/engine`. `film.js` con el YOU DIED rojo desde el cuadro 1 del ep9 y el menu RE vivo del ep9.
- Casa del ep1/ep7 (papel, parquet, sofa azul, puerta acolchada "13"), taladro del ep2, tornillo de 3" del ep1, First Aid Spray del ep1 (`respray.js`), maquina de escribir del ep7, cara `scared` (`avaface.js`, ep8).
- Voz: scripts del ep7/ep9 (`gen.py → pick.py → prep.py → assemble.py → fix_words.py → fix_caps.py → build_cues.py`). pick.py del ep9 (8 semillas, whisper exacto, viveza, F0 final).

## Nuevo
- `engine/sets/stairs.js`: primer piso (rellano, dormitorio 2, bano 2, deposito), escalera de 14 escalones en el pasillo ensanchado, puerta trasera D3, barricadas, escalera de cuerda, zombis que entran por D1.
- `engine/sets/screens10.js`: ITEM / EXAMINE "ESCAPE LADDER".
- Objetos foto Flow (srz MCP) → recorte PNG → textura PS1: estanteria y mochila (`objects/tools/prep_ep10.py`, `engine/tex/ep10/`). Escalera de cuerda: codigo.
- Voz del hombre: diseno nuevo VoiceStudio `b0469a54` "Stranger at the door" (male, elderly, moderate pitch, american accent).

## Datos verificados

| Dato en el video | Estado | Fuente |
|---|---|---|
| "Zombies are terrible at stairs" | FICCION: se dice como regla del show ("In this world…", cartel THIS WORLD'S RULE). | — |
| "Fire safety says every room needs two ways out" + escalera de escape en la ventana de arriba | OK. USFA/FEMA "Get Out Safely": dos salidas por cuarto; para ventanas de pisos altos, escalera plegable aprobada por UL. Ready.gov: practicar con la escalera de escape. | [USFA home fire escape plans](https://usfa.fema.gov/prevention/home-fires/prepare-for-fire/home-fire-escape-plans), [USFA Get Out Safely (archivo)](https://webarchive.library.unt.edu/web/20081029025729/http://www.usfa.fema.gov/downloads/pdf/fswy9.pdf), [Ready.gov home fire escape plan](https://www.ready.gov/home-fire-escape-plan) |
| Refugiarse arriba | No se afirma como dato en la voz (solo es la decision de la historia). | — |

No pude abrir paginas de NFPA ni de Cruz Roja (solo resumenes de terceros); el dato de la voz se apoya en USFA.

## Estado (v3 entregado, 2026-11-08)
- Storyboard v1 aprobado. Render v3 = `renders/share.mp4` (62.0 s, −14.0 LUFS, pico −1.5 dBFS). 2 rondas API (`renders/*_revision.md`); v3 arregla los fallos claros de la ronda 2 (sin 3a ronda, regla de 2 rondas).
- Audio: `audio/scripts/mix10.py` (SFX Freesound CC0 elegidos con earshot rank, creditos en `audio/CREDITS.json`; voz del hombre filtrada detras de la puerta).

## Checkpoint 1 (historico)
- Storyboard: `storyboard_v1.png` (frames reales del motor con la voz real).
- Pendiente tras la aprobacion: SFX Freesound CC0 con earshot, musica por LUFS (~10-11 LU bajo la voz, por tramo), gancho 0-10 s, master −14 LUFS (`audio/scripts/mix10.py` desde mix9), render, max 2 rondas de revision API, `renders/share.mp4`. Sin Telegram.
