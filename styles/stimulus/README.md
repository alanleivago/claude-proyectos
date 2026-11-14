---
type: doc
status: active
tags: [stimulus, talking-head, tesseract, estilo]
relatedTo: [tesseract]
---
# Estilo Stimulus (talking heads, cliente Dariel)

- Spec completa: [ESTILO.md](ESTILO.md) (síntesis de los 7 refs en `Ref videos Dariel/Stimulus/`; análisis por video en `analisis/`).
- Editor: Tesseract (`tsrct`), skill `tesseract-video`.

## Assets
- `assets/outro.mp4`: outro real (2.44 s, negro, logo + tagline por palabras + URL, con audio). Igual en todos los refs: se pega al final tal cual.
- `assets/logo_lockup.png`: logo blanco con alfa (aro + S + STIMULUS + tagline), sacado del último cuadro.
- `assets/DIN Next LT Arabic Bold.ttf`: fuente principal (importar con `tsrct project import-font`).

## Pendiente de conseguir
- Serif Didone para títulos tipo "NEW JERSEYS" (y cursiva pesada).
- Mate de persona para títulos detrás de la presentadora (Tesseract no trae modelo: generarlo con RVM/torch e importarlo como video luma).
