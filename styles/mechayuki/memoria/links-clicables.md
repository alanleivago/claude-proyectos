---
name: links-clicables
description: Siempre dar link clicable markdown (ruta relativa a la raíz del workspace) a cada archivo que el usuario deba ver/escuchar
metadata:
  type: feedback
---

Al entregar storyboards, renders, audios o tomas: SIEMPRE poner el link markdown clicable en el chat, con ruta relativa a la raíz `F:\Claude Proyectos` (ej. `[storyboard.png](pieces/x/storyboard.png)`), no relativa a la carpeta de la pieza (eso falló: "Couldn't open that file").

**Why:** el usuario: "ponme aquí el link siempre para verlo aquí".
**How to apply:** cada archivo entregado → link `[nombre](pieces/.../archivo)`; la ruta absoluta solo como respaldo.
