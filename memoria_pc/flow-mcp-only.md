---
name: flow-mcp-only
description: NUNCA usar el Flow Connector (flow-auto / skill flow-generate); siempre el Flow MCP (srz-google-flow-mcp)
metadata:
  node_type: memory
  type: feedback
  originSessionId: 31217992-d068-4929-9882-eede7428b798
  modified: 2026-11-14T17:16:22.877Z
---

Desde 2026-11-03 el usuario prohibió el Flow Connector (CLI `flow-auto`, skill flow-generate). Todo lo de Google Flow va por el MCP srz-google-flow-mcp ([[flow-mcp]]), también los videos de [[atrium-novelas]].

**Why:** el Connector no generaba nada en su Flow (cola pausada, pestaña oculta) y el usuario quiere usar solo el MCP.
**How to apply:** imágenes con flow_generate_image (+ flow_upload_file para referencias @{name}). Video: flow_generate_video (Omni 1.1 Flash, 720p, 4/6/8/10 s, ingredients @{name}); CLI `node src/cli.js video --prompt-file p.txt --duration 8 --out DIR`. Acento mexicano aprobado por el usuario (prompt "native Mexican Spanish ... clear lip sync").

**Cuenta (desde 2026-11-14):** usar SIEMPRE correoderecuperacion496@gmail.com (ULTRA, /u/3/; abre en modo Agente, flow.js lo apaga solo; antes tiktokeeuu691 y lyrics33231363, sin créditos) en Flow/Chrome, nunca manuelleivapro60@gmail.com (las dos están logueadas en el Chrome del MCP, FlowImageChrome). El MCP abre Flow con `?authuser=` = FLOW_ACCOUNT (src/chrome.js, default tiktokeeuu691).
