---
name: storyboard-before-render
description: "Siempre mostrar el storyboard completo y esperar aprobación antes del render, aunque el usuario diga \"procede al render\""
metadata:
  node_type: memory
  type: feedback
  originSessionId: 10cedafc-4e3d-48cb-9e1f-a9ad81140e7d
  modified: 2026-11-09T14:27:50.747Z
---

Aunque el usuario diga "procede al render" justo después de aprobar el look, primero se manda el storyboard completo (board sheets) y se espera su OK; recién después se renderiza.

**Why:** en rbx-followers (2026-11-09) renderice directo tras "procede al render" y el usuario aclaro que debia enviar el storyboard antes.

**How to apply:** en todo estilo con paso de storyboard (roblox, cartoon3d, etc.), "procede al render" = arma el storyboard, muestralo y espera aprobacion; luego render. Ver [[roblox-windows]].
