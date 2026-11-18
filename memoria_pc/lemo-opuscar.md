---
name: lemo-opuscar
description: "Plugin lemo-opuscar (LemoLab) instalado: 66 estilos de película hechos en código; copia de estilos y galería en opuscar/"
metadata:
  node_type: memory
  type: reference
  originSessionId: 315a5ed2-12fc-47ef-8cec-acc8db9b100e
  modified: 2026-11-03T11:48:22.797Z
---

Plugin `lemo-opuscar@lemolab` instalado (scope user) el 2026-11-03 con el claude.exe del VSCode (ver [[flow-mcp]]). Se usa con `/lemo-opuscar:lemo-opuscar`; en el primer uso baja guías y herramientas a `~/lemo-opuscar`.

- Copia local: `F:\Claude Proyectos\opuscar\` → `styles/<slug>/STYLE.md` (prompt del estilo), `poster.jpg` y `demo/` (código del corto demo, sin mp4: hay que renderizarlo); `styleboard/index.html` = galería con los 66 estilos; `styleboard/catalog.json` = slug, nombre, categoría y usos.
- Hechos en código (sin modelo de video), 1920x1080 a 24 fps, 30–60 min y bastantes tokens por película. Voz por defecto Kokoro. Requiere Node 20+, ffmpeg 7+ y Python 3.11+ (hay de todo en este PC).
- Licencia: código MIT; demos CC BY 4.0 (dar crédito a LemoLab); lo que hagamos con los estilos es nuestro.
- Estilos propios en `~/lemo-my-styles/` (ver MY-STYLES.md).
