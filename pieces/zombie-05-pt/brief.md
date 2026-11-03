---
type: spec
status: active
tags: [zombie-channel, ava-restfield, pt, short, brief]
relatedTo: [zombie-channel, ava-rules]
---

# Ep5 "Ava: the ghost behind you (P.T.)" — brief

Short 9:16, ~62 s (61.8–62.2). Adapta el TikTok de datos `fuentes/zombie-nicho/tiktok-ZSgEwDXqs.md` con Ava, look PS1 y
cámara más fluida que el ep4 (dollies continuos, órbitas, whip-pans que siguen sus giros, cortes invisibles en el bucle).
Base: copia del ep4 aprobado v6 (`pieces/zombie-04-subway`). Guion: `voz/guion.md`. Referencias del pasillo: `fuentes/zombie-nicho/pt_refs/`.

## Datos verificados

| Dato | Estado | Fuente |
|---|---|---|
| P.T. ("playable teaser") salió gratis para PS4 el 12 de agosto de 2014, anunciado en la conferencia de Sony en Gamescom; era el teaser de *Silent Hills* (Kojima + Guillermo del Toro). | OK | [Wikipedia](https://en.wikipedia.org/wiki/P.T._(video_game)), [Push Square](https://www.pushsquare.com/news/2024/08/10-years-ago-hideo-kojimas-p-t-scared-the-hell-out-of-us-on-ps4), [Guinness](https://www.guinnessworldrecords.com/world-records/383926-first-playable-teaser-for-a-console) |
| Lance McDonald (modder) publicó el 9 de septiembre de 2019 que, con un parche de cámara que la separa del jugador, se ve a Lisa siempre detrás, siguiéndolo. | OK | [Game Informer](https://www.gameinformer.com/gamer-culture/2019/09/10/the-scariest-part-of-pt-was-just-revealed-through-a-hack), [Kotaku](https://kotaku.com/the-scariest-thing-in-p-t-was-following-you-all-along-1837985295), [Shacknews](https://shacknews.com/article/113846/pt-hack-reveals-creepy-lisa-is-always-behind-you) |
| Lisa se pega a la espalda **desde que agarras la linterna**, no desde el inicio. | Matiz | [Game Informer](https://www.gameinformer.com/gamer-culture/2019/09/10/the-scariest-part-of-pt-was-just-revealed-through-a-hack) |
| Al girarte desaparece (por eso "no había nada"). | OK | [TechSpot](https://www.techspot.com/news/81812-pt-camera-hack-reveals-ghostly-secret.html), [Prima Games](https://primagames.com/news/hacker-reveals-lisa-always-following-you-pt) |
| "Nadie lo notó en cinco años": 2014 → 2019. | OK (aprox.) | fechas de arriba |
| El juego es un pasillo en L que se repite, de la puerta de entrada a la puerta del fondo. | OK | [Push Square, guía](https://www.pushsquare.com/news/2014/08/guide_how_to_complete_the_spooky_pt_demo_on_ps4) |

Arreglo en el guion: la frase 1 (obligatoria) dice "the whole time"; la frase 6 precisa "from the moment you grab the
flashlight", que es lo que dice la fuente.

## Créditos (CC-BY, obligatorios en la descripción)

- **Lisa (P.T)** por **geladeiracomoeuamo1234**, Sketchfab, CC BY 4.0: https://sketchfab.com/3d-models/lisa-pt-3ad98409ae6e4c72a6c0f87ddfc979e6 . Modificado: decimado (18 736 → 10 873 tris), texturas a 128 px / 32 colores, brazos de T-pose abajo y esqueleto propio (`lisa/tools/build.py`).
- Fotos de los props (método foto→lowpoly): Wikimedia Commons (`objects/photos/*/urls.txt`); cuadros y foto familiar recortados de capturas de P.T. (`fuentes/zombie-nicho/pt_refs`).

## Archivos

- Lisa: zip del usuario `assets/lisa-pt.zip` → `lisa/src/` (sin tocar) → `lisa/lisa_ps1.glb` (= `engine/models/lisa.glb`). Antes/después: `lisa/before/sheet.png`, `lisa/after/sheet.png`.
- Pasillo y planos: `engine/sets/pt.js`. Props: `objects/tools/prep_pt.py` (fotos → texturas y siluetas) + `objects/tools/build_pt.py` (Blender → `objects/glb`).
- Storyboard: `storyboard_v1.png` (`review/storyboard.py`, frames del motor en `review/sb/`).

## Render v1 (2026-11-02)

- `renders/zombie05_pt_v1.mp4` (= `renders/share.mp4`), 62,0 s, -14,0 LUFS, TP -1,2 dBTP. Mezcla `audio/scripts/mix5.py` (música Freesound 610534 a 11 LU bajo la voz; SFX CC0 elegidos con earshot rank; créditos en `audio/CREDITS.json`).
- Revisión API: `renders/zombie05_pt_v1_revision.md` (CASI; fallos 0:11, 0:39-0:43, 0:51-0:53 y el LED de la tarjeta, ya corregidos en este v1).
- Trazado del pasillo comparado con el juego: `fuentes/zombie-nicho/pt_refs/yt_0fF3gW3K4rM/_sheet.jpg` (1 fps, 20 s) y la apertura con el TikTok: `pt_refs/tiktok_ZSgEwDXqs/_sheet.jpg`.
