# Claude Proyectos

## Créditos de API ($200/mes del plan Max)

El plan Max 20x trae USD 200 al mes de créditos de la API de Claude (no se acumulan). Cubren la API y el Agent SDK, no Claude Code.

- **Regla:** toda tarea que pueda correr por la API (ver/analizar videos y fotogramas, revisar renders, guiones en lote, títulos/SEO) se hace con un script Python + SDK `anthropic`, antes que gastar tokens del plan. El script escribe un reporte `.md` corto y Claude Code lee solo el resultado. Si los créditos se acaban (error de saldo), avisar y recién ahí hacerlo en la sesión.
- **Clave:** `ANTHROPIC_API_KEY` en el `.env` de la raíz (git-ignorado, cada máquina tiene el suyo). Nunca como variable de entorno del sistema: Claude Code la usaría en vez del plan. Vence a los 30 días; se renueva en platform.claude.com → Claves y acceso.
- **Llamadas:** usar `client.messages.stream(...)` con `max_tokens` ≥ 16000 (Sonnet 5.5 piensa antes de responder) y quedarse solo con los bloques `type == "text"`.

Herramientas que ya usan los créditos:
- `ver-youtube` (skill): yt-dlp + Whisper local + fotogramas → notas en `fuentes/<tema>/`.
- `python tools/revisar_render.py --estilo <estilo> video.mp4` → `<video>_revision.md` con veredicto y fallos por regla. Correrlo antes de mostrar un render al usuario.
