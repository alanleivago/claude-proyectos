---
name: premiere-mcp
description: Premiere Pro MCP (adobe-premiere-pro-mcp + CEP bridge) instalado; el usuario quiere que yo maneje Premiere para la roto (Recorte inteligente) y perfeccionar los videos Stimulus
metadata:
  type: reference
---
- npm global `adobe-premiere-pro-mcp`, CEP instalado (`premiere-pro-mcp --doctor` OK). Registrado en Claude Code user scope como `premiere-pro` (TOOLSET=full, telemetría 0). Repo clonado en F:\premiere-mcp.
- Bridge dir: C:\Users\ALANLE~1\AppData\Local\Temp\premiere-mcp-bridge. En Premiere: Window > Extensions > MCP Bridge (CEP) → Temp Directory → Save → Start Bridge.
- Primero siempre `verify_premiere_connection`. El usuario tiene abierto el proyecto Stimulus con todos sus assets de edición.
- Motivo (2026-11-06): la roto de BiRefNet/hyperframes comía la gorra en el gancho; Premiere tiene mejor recorte. Ver [[stimulus-style]].
