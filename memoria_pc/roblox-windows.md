---
name: roblox-windows
description: Estilo roblox en este PC Windows — perfil de voz local y BGM descargada
metadata:
  node_type: memory
  type: project
  originSessionId: 9e5c0503-0eb1-4581-907e-9c16e4b79255
  modified: 2026-11-09T03:04:26.827Z
---

Estilo roblox (receta en styles/roblox/STYLE.md, hecho en la Mac). En este PC Windows:
- Voz: el perfil de la Mac `227af074` no existe aquí; usar **"3D cartoon 2" `d9b69bea`** en VoiceStudio (misma receta: steps 32, speed 1.25, +4 semitonos con ffmpeg).
- BGM TEMPOREX bajada a styles/roblox/bgm/bgm.wav (2026-11-08, 184.5 s, git-ignorado).
- Renders aprobados de referencia en `Ref roblox/` (1.mp4 120 s, Sock 126 s, Tug Of War 113 s).
- Pipeline exacto = copiar pieces/rbx-rope (three.js propio), no el /animate de canvas.

**Why:** el usuario lo indicó el 2026-11-08 al traer el estilo de la Mac.
**How to apply:** en cada video roblox hecho en Windows, cambiar profile_id en gen.sh/fix.py a d9b69bea.

**Regla de guion (2026-11-09):** todo guion roblox empieza con "In this town, …" (manda sobre la rotación de aperturas de STYLE.md).
