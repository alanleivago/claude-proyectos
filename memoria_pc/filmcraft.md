---
name: filmcraft
description: "FilmCraft 0.17.1 (editor de video NLE en Rust, storytold/filmcraft) instalado en F:\\filmcraft con MCP \"filmcraft\" a nivel usuario"
metadata:
  node_type: memory
  type: reference
  originSessionId: f027d5ef-1e9e-4319-87b5-cdfbb5c70a8c
  modified: 2026-11-05T14:46:24.585Z
---

FilmCraft (editor de video tipo Premiere, open source, 700+ comandos manejables por agentes) instalado 2026-11-05.
- App portable: `F:\filmcraft\app\filmcraft.exe`; CLI: `F:\filmcraft\app\filmcraft-cli.exe` (`commands` lista todo).
- Código y docs: `F:\filmcraft\src` (docs/agents.md, docs/control-protocol.md).
- MCP `filmcraft` (user scope) = `filmcraft-cli.exe mcp` headless. Para manejar la app abierta: `filmcraft.exe --control 9876` y MCP con `mcp --bridge 127.0.0.1:9876`.
- Si la app no abre: `$env:WGPU_BACKEND="vulkan"`. Logs en `%APPDATA%\FilmCraft\Logs\filmcraft.log`.
- Actualizar: bajar el portable x64 nuevo de github.com/storytold/filmcraft/releases y verificar con SHA256SUMS.txt.
