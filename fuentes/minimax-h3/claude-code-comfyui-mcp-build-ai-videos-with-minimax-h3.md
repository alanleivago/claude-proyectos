---
type: source-notes
status: done
tags: [minimax-h3, comfyui, mcp, claude-code]
relatedTo: [easy-way-to-install-use-minimax-h3-on-8gb-vram-in-3-minutes, el-nuevo-modelo-de-ia-mas-rapido-que-existe-minimax-h3]
---
# Claude Code + ComfyUI MCP: Build AI Videos with Minimax H3

- Link: https://www.youtube.com/watch?v=Gmi4pd4OdJ8
- Canal: Noncoder
- Fecha: 2026-10-27
- Tema: minimax-h3
- Método: transcripción local (faster-whisper) + fotogramas; Gemini falló con este video.

## De qué trata
Claude Code maneja ComfyUI por MCP y arma solo el grafo: genera imágenes con Z-Image, las anima con MiniMax H3 (image to video, clips de 15 s) y las une con FFmpeg en un corto de 1 minuto con diálogo y lip sync.

## Pasos / método
1. **[04:00]** Instalar Claude Code (app o terminal).
2. **[04:29]** Instalar ComfyUI Desktop (o probar Comfy Cloud).
3. **[04:44]** Instalar un MCP de ComfyUI: el comunitario de GitHub (el que él usa) o el oficial "Comfy MCP" (comfy.org → Install MCP → Local ComfyUI → pestaña Claude Code terminal → copiar comando).
4. **[05:14]** Pegar el comando en la terminal de Claude Code (o pegarlo en el chat de la app) y reiniciar Claude Code y ComfyUI.
5. **[07:00]** En ComfyUI aparece un panel de agente a la izquierda para chatear y pedirle workflows.
6. **[07:46]** Prompt: estilo inspirado en Attack on Titan; Claude escribe prompts para Z-Image, los pasa a MiniMax H3 i2v en clips de 15 s y une con FFmpeg un video de 1 min con historia.

## Lo que se ve en pantalla
- Grafo creado por Claude: Load Diffusion Model, Load CLIP, Load VAE (dos), nodo MiniMax H3 image-to-video y Save Video.
- Página "Set up Comfy MCP" con opciones Comfy Cloud / Local ComfyUI y pestañas Claude Desktop, Claude Code terminal, Codex, Cursor, OpenClaw.
- Resultado: clips con voz y lip sync coherentes con el personaje.

## Consejos y advertencias
- **[07:30]** El agente consume tokens; se puede usar un modelo abierto (Kimi) para ahorrar.
- **[04:50]** Según él, el MCP comunitario da mejores resultados que el oficial.

## Lo que no queda claro
- No dice qué GPU usa, cuánto tardó, qué cuantización del modelo ni cuánta VRAM.
- No muestra nombres exactos de los archivos del modelo.
