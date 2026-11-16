# Stalker: créditos

- Malla v2: hecha desde cero en código. Las partes orgánicas son campos de distancia con marching cubes (`tools/sdf_body.py`, numpy + scikit-image), decimadas a PS1 en Blender 5.2 (`tools/build.py`). No usa ningún modelo base de terceros: Blender MCP no tenía generadores 3D ni Sketchfab/Poly Pizza activados (sin API keys).
- Texturas: generadas por código (`tools/make_tex.py`, ruido numpy, 128 px, 32 colores). Sin fotos ni assets externos.
- Diseño: inspirado en un fan remake de Nemesis (ref del usuario, `../ref/`). Se quitó el símbolo biohazard y los logos; el pecho lleva una caja hexagonal oxidada con luz verde. Sin arma.

Rehacer: `python tools/make_tex.py .` → `python tools/sdf_body.py .` → `blender -b -P tools/build.py -- <ruta absoluta de stalker>` → `blender -b -P tools/render.py -- <ruta>` → `python tools/compose.py .`

## v3.1 (actual: stalker_ps1.glb). v3 en stalker_ps1_v3.glb + compare_v3.png; v2 en stalker_ps1_v2.glb + compare_v2.png
- Imagen de concepto: Google Flow, Nano Banana Pro, vía srz-google-flow-mcp (cuenta del usuario), 2026-11-15. Elegida: `concept/2026-11-15T02-06-20-full-body-front-view-character-turnaroun-2.jpg` (cintura fruncida, falda plisada, tubos separados por hombro, caja hexagonal con luz verde, sin biohazard).
- Hyper3D Rodin (clave de prueba del addon) devolvio API_INSUFFICIENT_FUNDS el 2026-11-15: la v3 NO usa generador 3D.
- Hoja turnaround (frente | perfil | espalda): Google Flow, Nano Banana Pro, vía srz-google-flow-mcp, con la imagen de concepto 2 subida como referencia. `concept/2026-11-15T02-18-06-character-model-turnaround-sheet-of-the--1.jpg` = `v3/sheet.jpg`.
- Método de Ava (pieces/zombie-girl/model): `tools/v3_measure.py` (perfiles) → `v3_build.py` (anillos lofteados) → `v3_texture.py` (proyección de la hoja, 128 px, 32 colores) → `v3_rig.py` (19 huesos, tubos y abrazaderas, export) ; revisión con `v3_preview.py` + `v3_cmp.py` y `render.py` + `compose.py`.
