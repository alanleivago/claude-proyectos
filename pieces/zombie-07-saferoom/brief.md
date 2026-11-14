---
type: spec
status: draft
tags: [zombie-channel, ava-restfield, saferoom, short, brief]
relatedTo: [zombie-channel, ava-rules]
---

# Ep7 "AVA: The Safe Room" — brief

Short 9:16, 62.0 s (voz termina en 57.3 s). Es el ep3 de la serie original puerta/ventana (ep1 `zombie-01-door`, ep2 `zombie-02-window`). La casa usa el papel pintado, el parquet, el sofa azul y la puerta acolchada "13" del ep1, y W1 es la ventana con tablones del ep2.

El motor es una copia del ep6 (`zombie-06-floor30`). Los decorados estan en `engine/sets/saferoom.js` (casa en corte) y `engine/sets/screens7.js` (ITEM, EXAMINE y tarjeta final). Guion: `voz/guion.md`. Storyboard: `storyboard_v1.png`.

## Datos verificados

| Dato en el video | Estado | Fuente |
|---|---|---|
| Refugiarse en un cuarto interior con pocas o ninguna ventana. Voz: "an inside room with as few windows as possible". | OK. Ready.gov dice "interior room with few windows if possible". OSHA dice "small, interior room, with no or few windows". | [Ready.gov Shelter](https://www.ready.gov/shelter), [OSHA, archivo](https://webarchive.library.unt.edu/eot2008/20080918015207/http://osha.gov/SLTC/etools/evacuation/shelterinplace.html) |
| Kit basico: agua (1 gal/persona/dia), comida, radio a pilas, linterna, pilas extra, botiquin, telefono con cargador y bateria de respaldo. Voz: "Pretty much FEMA's own list". | OK. Ready.gov es el sitio de FEMA. | [Ready.gov Build a Kit](https://www.ready.gov/kit) |
| Presion directa, firme y continua, sin levantar para mirar. Voz: "press down hard for a full fifteen minutes, no peeking". | OK para una herida menor como un corte en la mano. HealthLinkBC: "steady, direct pressure ... for a full 15 minutes" y "resist the urge to peek". Stop the Bleed (USUHS): "There is no definite amount of time", presion continua hasta que pare y al menos 5 min antes de mirar. Cruz Roja: presion firme hasta que pare; si se empapa, se agrega otra gasa encima sin sacar la primera. | [HealthLinkBC](https://www.healthlinkbc.ca/healthwise/how-stop-bleeding-skin-wound), [Stop the Bleed USUHS](https://stopthebleed.usuhs.edu/), [Cruz Roja](https://www.redcross.org/take-a-class/resources/learn-first-aid/bleeding-life-threatening-external), [Harvard Health](https://www.health.harvard.edu/staying-healthy/emergencies-and-first-aid-direct-pressure-to-stop-bleeding) |

**Cambio respecto del pedido:** se pidio "unos 10 minutos". Ninguna de las fuentes (Stop the Bleed, Cruz Roja, Harvard) da 10 minutos. La unica cifra fija que encontre es de HealthLinkBC: 15 minutos para una herida menor. Por eso la voz dice "a full fifteen minutes".

## Estado (checkpoint 1: storyboard)

- **Voz:** REAL, "ava bread buena" f2a102da, steps 32, wav, 4 semillas por toma.
  - `pick.py` elige la toma mas viva; "Oh, fudge" es la toma del ep1.
  - Orden de scripts: gen.py → pick.py → prep.py → assemble.py → fix_words.py → build_cues.py.
  - Resultado: `voz/track.wav`, `engine/timeline.json` y `engine/cues.json`.
- **Objetos** (foto de Flow aislada → recorte PNG → loft/caja en Blender):
  - pasos: `objects/tools/prep_ep7.py` y `build_ep7.py`;
  - comparacion: `objects/compare/ALL.png`;
  - reusados de episodios anteriores: radio, can, bathtub, fridge, dresser, crt, plank;
  - la venda se modelo como cilindro: la foto sobre gris no daba un recorte limpio, asi que la textura sale del centro del rollo.
- **Sangre:** textura real de Flow, `engine/tex/blood_drops.png`.
- **Pendiente para despues de la aprobacion:**
  - audio: SFX reales de Freesound CC0 verificados con earshot, musica por LUFS, gancho de 0-10 s y master a −14 LUFS (`audio/scripts/mix6.py` se adapta);
  - render final, `revisar_render.py` y envio por Telegram.
