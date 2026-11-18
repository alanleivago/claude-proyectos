---
name: migracion-antigravity
description: El usuario migrará pronto a Antigravity; MIGRACION_ANTIGRAVITY.md se regenera solo (Stop hook) y debe quedar completo
metadata:
  node_type: memory
  type: project
  originSessionId: 2713995d-530f-43bf-86e3-023d01bea9fa
  modified: 2026-11-14T16:36:47.579Z
---

Desde 2026-11-14 el usuario prepara la migración a Antigravity (aún no migra). `tools/exportar_contexto.py` genera `MIGRACION_ANTIGRAVITY.md` (reglas, memoria, specs, ESTADO de piezas, historial de mensajes, MCP/skills, git; solo texto, secretos redactados). Un Stop hook en `.claude/settings.local.json` lo regenera tras cada turno. La Mac genera el suyo: `python3 tools/exportar_contexto.py MIGRACION_MAC.md`.

**Why:** quiere tenerlo listo para darlo a Antigravity y seguir con normalidad.
**How to apply:** si aparece una fuente nueva de contexto (otro tipo de doc, nueva carpeta de specs), sumarla al script; la intro está en `tools/exportar_contexto_intro.md`. Commitear el .md junto con los commits normales.
