---
type: source-notes
status: done
tags: [minimax-h3, fal, h3-max, cloud]
relatedTo: [claude-code-comfyui-mcp-build-ai-videos-with-minimax-h3]
---
# El nuevo modelo de IA más RÁPIDO que existe | Minimax H3

- Link: https://www.youtube.com/watch?v=fYr3LLf2Ar8
- Canal: Benjamín Cordero
- Fecha: 2026-10-27
- Tema: minimax-h3
- Método: transcripción local (faster-whisper); Gemini falló con este video (41 min).

## De qué trata
No es sobre correrlo en local: presenta **H3 Max**, una versión de MiniMax H3 post-entrenada y optimizada por fal.ai que corre en la nube de fal, genera 5 s de video en 1–5 s y cuesta centavos. Muestra cómo conectarlo a Claude Code por el MCP de fal.

## Pasos / método
1. **[03:57]** Contexto: MiniMax H3 ("Hailuo 3") salió a fines de julio; pesos abiertos el 3 de agosto (~33 mil millones de parámetros); omnimodal, video con audio estéreo nativo.
2. **[04:26]** fal post-entrenó esos pesos (mejor obediencia al prompt y calidad) → H3 Max, anunciado el 27 de agosto; ~35× más rápido que el oficial.
3. **[07:44]** Opción 1: página de herramientas de fal "MiniMax H3 Max", 5 videos gratis sin cuenta.
4. **[08:28]** Opción 2: fal.ai con cuenta, pago por uso.
5. **[12:12]** Conectarlo a Claude Code: por API o por el MCP de fal ("conéctate al MCP de fal.ai… quiero generar videos con [nombre del modelo] text to video").

## Lo que se ve en pantalla
- **[09:41]** Bajar la resolución → 5 s generados en 0.8 s; a 768 tardó 4.5 s.
- **[10:27]** Precio aprox. 0.025 USD por segundo a 480p (≈0.125 USD por clip de 5 s).
- **[11:18]** 15 s a 480p en 3.5 s.
- Ejemplos: canal de TV infinito generado por IA, image to video de 10 s en ~6 s.

## Consejos y advertencias
- **[39:11]** Máximo 15 s por clip.
- **[39:22]** H3 Max sale a 480p o 720p máximo; el 2K es del H3 original, no de Max.
- **[38:46]** No hay memoria entre clips (la continuidad hay que manejarla uno).
- **[39:42]** Avisar que es contenido IA en plataformas que lo exigen.

## Lo que no queda claro
- No dice si el post-entrenamiento de H3 Max está disponible para correr en local (parece exclusivo de fal).
