# Claude Proyectos

## Créditos de API ($200/mes del plan Max)

El plan Max 20x trae USD 200 al mes de créditos de la API de Claude (no se acumulan). Cubren la API y el Agent SDK, no Claude Code.

- **Regla:** toda tarea que pueda correr por la API (ver/analizar videos y fotogramas, revisar renders, guiones en lote, títulos/SEO) se hace con un script Python + SDK `anthropic`, antes que gastar tokens del plan. El script escribe un reporte `.md` corto y Claude Code lee solo el resultado. Si los créditos se acaban (error de saldo), avisar y recién ahí hacerlo en la sesión.
- **Clave:** `ANTHROPIC_API_KEY` en el `.env` de la raíz (git-ignorado, cada máquina tiene el suyo). Nunca como variable de entorno del sistema: Claude Code la usaría en vez del plan. Vence a los 30 días; se renueva en platform.claude.com → Claves y acceso.
- **Llamadas:** usar `client.messages.stream(...)` con `max_tokens` ≥ 16000 (Sonnet 5.5 piensa antes de responder) y quedarse solo con los bloques `type == "text"`.

Herramientas que ya usan los créditos:
- `ver-youtube` (skill): yt-dlp + Whisper local + fotogramas → notas en `fuentes/<tema>/`.
- `python tools/revisar_render.py --estilo <estilo> video.mp4` → `<video>_revision.md` con veredicto y fallos por regla. Correrlo antes de mostrar un render al usuario.

## Entrega de renders finales (todas las sesiones, todos los estilos — desde 2026-11-13)

- Cada video terminado se entrega en `/Volumes/alanwork/trabajo/Renders finales claude/<carpeta del canal>/`, con el título como nombre de archivo. Carpetas: Agente davis, Ali Abdaal, Alterbase, Amphorus, Ava Restfield, Cartoon3d, Doggo poly shorts, Edicion de videos Reels, Kodama yokai, Madfable, Majestic, Mechayuki, MexiTV, Punk poly shorts, Roblox, Stimulus, Tuneles, Vista. **cartoon3d ("3D cartoon") → Alterbase.** Si no está claro qué carpeta, preguntar una vez.
- Se envía la versión **share** (como `export.mjs --share`: libx264 CRF 24 preset slow, yuv420p, AAC 192k, +faststart), no el master.
- Después de entregar, borrar las versiones anteriores en `pieces/<pieza>/renders/` (silent vN, raw, duplicados final.mp4/<pieza>.mp4); queda solo el master con el título.
- En la PC, si ese volumen no existe, preguntar la ruta equivalente.
