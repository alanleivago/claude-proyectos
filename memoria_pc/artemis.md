---
name: artemis
description: "Artemis (google/artemis) instalado en F:\\artemis para manejar Android por lenguaje natural; el usuario quiere usarlo para publicar en Facebook/TikTok desde sus teléfonos, pero aún no"
metadata:
  node_type: memory
  type: project
  originSessionId: 8902ab2e-7298-4e9b-8cc9-0c6cf244fa6a
  modified: 2026-11-02T03:28:17.089Z
---

Instalado 2026-11-01 en `F:\artemis` (uv sync hecho; uv, adb, scrcpy vía winget). Falta: GEMINI_API_KEY en `F:\artemis\.env` (defaults son Gemini Flash), teléfono con depuración USB, y registrar el MCP (`uv run artemis mcp --install claude`, que también mete reglas de testing; pedir aprobación).

**Why:** el usuario planea que yo publique en Facebook y TikTok usando sus teléfonos Android vía Artemis.
**How to apply:** NO configurarlo hasta que el usuario avise. Cuando lo haga: desactivar ARTEMIS_HELPER_AUTO_INSTALL si es teléfono personal, confirmar cada publicación (como con [[zernio]]).
