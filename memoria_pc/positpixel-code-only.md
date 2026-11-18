---
name: positpixel-code-only
description: "Estilo positpixel (shorts \"If A Human Had X Anatomy\"): solo todo en código, NO híbrido Flow; prueba en pieces/pp-chihuahua"
metadata:
  node_type: memory
  type: feedback
  originSessionId: b92f9035-1577-46e7-8626-9dad105318f7
  modified: 2026-11-08T05:53:06.095Z
---

Para replicar los shorts de positpixel (pixel art de caras/cuerpos humanos que se transforman), el usuario quiere SOLO la versión todo en código (canvas 180×320 ×6, posterizado, contorno 1 px). El híbrido Flow + código queda descartado (2026-11-08).

**Why:** en Flow no se pueden hacer los movimientos ni las formas de cuerpo que piden las transformaciones; la referencia está hecha a mano en pixel art.
**How to apply:** prueba de réplica en pieces/pp-chihuahua/code (SPEC.md, render.mjs; refs locales en references/positpixel/). A la versión en código "le falta muchísimo" para igualar la referencia: iterar contra los fotogramas clave antes de pasar a piezas nuevas (búho = [[pixdoc]]-like, voz Ava de prueba).
