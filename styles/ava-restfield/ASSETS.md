---
type: doc
status: active
tags: [ava-restfield, zombie-channel, assets, lucidlink, mac-setup, kit]
relatedTo: [zombie-channel, ava-rules]
---

# Ava Restfield — assets pesados para la Mac

Git ya lleva todo el código y los datos livianos de `pieces/zombie-*` (engine/*.js, sets, fuentes .ttf, texturas png, cues/timeline/shots .json, scripts de voz y mezcla, guiones, `meta.json` de cada candidato de audio). Lo que git NO lleva (`.gitignore`: `*.glb`, `*.wav`, `*.mp3`, `*.mp4`, `*.blend`, `assets/`, `Ref */`, `fuentes/**/*.jpg`) está en el kit de LucidLink:

`/Volumes/alanwork/trabajo/Renders finales claude/Ava Restfield/_kit/` (PC: `C:\Volumes\alanwork\trabajo\Renders finales claude\Ava Restfield\_kit\`). Total ~770 MB.

## Instalación en la Mac
```bash
cd "<raíz del repo>"
unzip -n "/Volumes/alanwork/trabajo/Renders finales claude/Ava Restfield/_kit/pieces_zombie_media.zip"
unzip -n "/Volumes/alanwork/trabajo/Renders finales claude/Ava Restfield/_kit/assets_ava.zip"
cd pieces/zombie-13-gasstation/engine && npm install && npx playwright install chromium
```
Los zips guardan rutas relativas a la raíz del repo, así que caen en su lugar. Después cambiar las rutas absolutas `F:/Claude Proyectos/...` al principio de los scripts de mezcla/voz (`mix13.py`, `mix_largo.py`, `assemble.py`) por la ruta de la Mac.

## Contenido del kit

| Archivo / carpeta | Qué trae | Origen en el PC |
|---|---|---|
| `pieces_zombie_media.zip` (620 MB, 2318 archivos) | Todo lo ignorado por git de `pieces/zombie-*` que hace falta para renderizar/mezclar, SIN node_modules, renders, frames, review, stems, mix.wav, tomas de semillas (`voz/takes*`), alternativas de voz ni música sintética vieja | `F:\Claude Proyectos\pieces\zombie-*` |
| ↳ `*/engine/models/*.glb` | Ava `heroine_anim.glb` (46 anims), zombis (thin-zombie dogchicken CC-BY, city-zombie rikindle3d CC0, hazmat-zombie), Ribbon `german_shepherd.glb` (Quaternius CC-BY), Marla/Dutch (`marla_base`, `dutch_base`, Quaternius CC0 Man/Woman), `ual_mannequin`/`giant_base`, autos Quaternius CC0 (`car_a/b`), Kenney `police-kenney.glb` CC0, Lisa (P.T.), props foto→lowpoly (spray, radio, linterna, agua, bañera, teléfono, etc.) | `pieces/zombie-*/engine/models/` |
| ↳ `*/audio/cand/**` | Biblioteca CC0 de Freesound ya elegida (SFX por categoría + música: mus_dark, mus_tension, mus_drone, mus_thriller, mus_horror, hook_drone, hook_musicbox, breath, swallow, gasp, stinger…). Los `meta.json` con autor/licencia están en git | `pieces/zombie-*/audio/cand/` |
| ↳ `*/voz/lines/*.wav` | Líneas de voz elegidas de cada pieza (incluye `zombie-01-door/voz/lines/13_fudge.wav` = "Oh, fudge" oficial) | `pieces/zombie-*/voz/lines/` |
| ↳ `zombie-girl/**` | Fuente del modelo de Ava: `.blend` (mesh, tex, face, rig, anim), hojas de referencia Flow `ref/sheet3.jpg` y vistas | `pieces/zombie-girl/` |
| ↳ `zombie-08-farm/assets_dl/**`, `objects/**` | Animales y monstruo descargados del farm, objetos foto→lowpoly | idem |
| `assets_ava.zip` (33 MB) | `assets/dino-crisis-sfx` (sin el wav fuente de 120 MB; incluye `9PdkWu31Xwo.wav` y `ch/*.wav`), `assets/zombie-sfx-yt/seg` (voces de zombi RE), `assets/dog` (poly.pizza), `assets/lisa-pt.zip`, los 11 archivos de `sound-layer/kit` que usan las mezclas (whoosh, chime, tick, thump, boom, click, pop, ui), `Ref ava bread/` (panel RE2 health, fuente RE), `fuentes/miniaturas/ref_pose/ava_pose_usuario.jpg` (pose aprobada de miniaturas) | `F:\Claude Proyectos\assets\…`, `sound-layer/kit`, `Ref ava bread`, `fuentes/miniaturas` |
| `voces_ref/` (1.4 MB) | Audios de referencia de VoiceStudio: `f2a102da.m4a` (Ava "ava bread buena", la actual), `3824e262.m4a` (Ava vieja), `b0469a54.wav` (desconocido), `cf919aa6.wav` (policía/Vickers), `644338f4.wav` (Dutch). Marla `996b1578` es diseño puro (female, middle-aged, low pitch, whisper, american accent, seed 42) | `%APPDATA%\OmniVoice\voices\` |
| `refs_aprobados/` (144 MB) | Videos de nivel aprobado para comparar: `ep01_door_v6.mp4`, `ep04_last-train_v6.mp4`, `ep05_pt_v5.mp4`, `ep12_radio.mp4`, `ep13_gas-station-part-1.mp4`. El largo Part 2 ya está en `Ava Restfield/police-station-part-2.mp4` | `pieces/zombie-*/renders/` |

## Fuentes tipográficas
- En git: `engine/fonts/` (PixelifySans OFL, Chicagogo, ChicPix).
- `refont.js` usa **Tahoma Bold** del sistema (macOS la trae en `/System/Library/Fonts/Supplemental/Tahoma Bold.ttf`). Courier (tarjetas a máquina) también viene en macOS.
- `review/storyboard.py` carga `C:/Windows/Fonts/arialbd.ttf`: en la Mac cambiar a `/System/Library/Fonts/Supplemental/Arial Bold.ttf`.

## Herramientas que la Mac necesita instaladas (no van en el kit)
- Node + npm (three, playwright), ffmpeg, Python con numpy, soundfile, scipy, pyloudnorm, faster-whisper, Pillow.
- VoiceStudio (backend `http://127.0.0.1:3900`): re-clonar Ava desde `voces_ref/f2a102da.m4a` con el texto de referencia de [GUIA.md](GUIA.md) §3 y recrear los diseños.
- earshot + skills `earshot`/`real-sound`, skill `humanizer`, API key de Freesound en `~/.freesound.json`, `ANTHROPIC_API_KEY` en el `.env` de la raíz (para `tools/revisar_render.py`).

## No incluido (a propósito)
- `node_modules` (se reinstalan), renders/frames/review, stems y mix.wav (se regeneran), las ~1.500 tomas de semillas descartadas (`voz/takes*`), el wav fuente de 120 MB de Dino Crisis, `assets/zombie-kit`, `crashsune`, `Grego…`, `tyrant-x.zip` (no los usa ninguna pieza de Ava), los largos L1 (252 MB) y farm (293 MB) en mp4.
