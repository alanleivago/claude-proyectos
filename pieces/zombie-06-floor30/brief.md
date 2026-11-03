---
type: spec
status: draft
tags: [zombie-channel, ava-restfield, floor30, short, brief]
relatedTo: [zombie-channel, ava-rules]
---

# Ep6 "Ava: Floor 30" — brief

Short 9:16, ~62 s. Adapta el reel `fuentes/zombie-nicho/ig-DeunEGHNj1F.md` (trailer de un juego de supervivencia: apartamento 3012, piso 30, brote zombi) con Ava, look PS1 y camara fluida como el ep5. Base: copia del ep5 aprobado v5 (`pieces/zombie-05-pt`). Guion: `voz/guion.md`. Decorado: `engine/sets/floor30.js`.

## Datos verificados

| Dato | Estado | Fuente |
|---|---|---|
| Una banera estandar llena hasta el rebosadero tiene unos 40-60 galones; 40 es lo tipico de una banera chica. El guion dice "about forty gallons". | OK (extremo bajo del rango) | [Hunker](https://www.hunker.com/13416360/how-many-gallons-of-water-does-the-average-house-bathtub-contain), [Badeloft](https://www.badeloftusa.com/ideas/how-much-does-bathtub-hold/), [Faucetfam](https://faucetfam.com/how-many-gallons-in-a-bathtub/) |
| FEMA / Ready.gov: guardar al menos 1 galon de agua por persona por dia (para beber y para higiene). | OK | [Ready.gov Water](https://www.ready.gov/water), [Ready.gov Build a Kit](https://www.ready.gov/kit) |
| Los edificios altos necesitan bombas electricas de refuerzo por encima de unos 6-8 pisos; sin luz, los pisos altos se quedan sin agua. | OK (el umbral varia: 6-10 pisos segun la fuente) | [Techloy](https://www.techloy.com/why-high-rise-buildings-need-water-booster-pumps/), [Patente US4290735](https://patents.google.com/patent/US4290735), [aviso del MIT en un apagon](https://mailman.mit.edu/pipermail/tang-residents/2014-March/000939.html), [Grundfos](https://www.grundfos.com/ae/learn/research-and-insights/roof-water-tank-system) |

Ajustes del guion por los datos:
- Banera: "about forty gallons" (no "a tub holds 40").
- Bombas: no se da un numero de pisos fijo en la voz; el diagrama marca hasta el piso 6 (presion de la calle).
- Matiz: el agua de la banera se considera para lavar o descargar el inodoro, salvo que se hierva o trate. La regla de 1 galon/dia es para beber e higiene.

## Estado (checkpoint 1)

- **Voz:** pendiente. VoiceStudio no esta abierto (REST 127.0.0.1:3900 rechaza la conexion, no hay proceso). `voz/gen.py`, `pick.py` y `prep.py` ya tienen las tomas del ep6. Al abrirlo, correr en orden:
  1. `python gen.py --seed N` (varias semillas);
  2. `python pick.py`;
  3. `python prep.py`;
  4. `python assemble.py`;
  5. `python build_cues.py`.
- **Tiempos provisionales:** `voz/scratch.py` estima por silabas (`lines.json` + `engine/timeline.json`) para el storyboard.
- **Objetos:** `objects/` (fotos de Flow aisladas sobre blanco, recortadas). Comparaciones en `objects/compare/ALL.png`.
- **Storyboard:** `storyboard_v1.png` (`review/storyboard.py`, frames del motor en `review/sb/`).
