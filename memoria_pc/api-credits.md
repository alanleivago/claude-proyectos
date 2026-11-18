---
name: api-credits
description: "Max 20x plan includes $200/month Claude API credits; key in project .env, SDK installed; use for automated scripts to save plan limits"
metadata:
  node_type: memory
  type: reference
  originSessionId: 98e21a33-27f5-4cd2-b46a-f3e7cab88585
  modified: 2026-10-29T03:42:20.741Z
---

El plan Max 20x del usuario trae USD 200/mes de créditos de API (no se acumulan; reset ~1 de cada mes). Organización "Alan's Individual Org" en platform.claude.com, sin tarjeta ni recarga automática: al acabarse los créditos la API se detiene, sin cobros.

- Clave: `ANTHROPIC_API_KEY` en `F:\Claude Proyectos\.env` (git-ignorado). NUNCA como variable de entorno de Windows (Claude Code la usaría en vez del plan, y los créditos no cubren Claude Code).
- La clave vence a los 30 días (27 nov 2026): renovarla en Console → Claves y acceso.
- SDK `anthropic` instalado; probado con claude-haiku-5-5 el 2026-10-28.

Herramientas hechas (2026-10-28), ambas con streaming + max_tokens 16000 (Sonnet 5.5 piensa antes de responder):
- `ver-youtube` ya usa Claude: yt-dlp (`--js-runtimes node`) + faster-whisper local + fotogramas. Un short de 2 min cuesta unos $0.13.
- `tools/revisar_render.py --estilo ava|mechayuki|pov3d|cartoon3d|yt-agente|sinaboto|emberlite|scroll3d [--nota] video.mp4` deja `<video>_revision.md` (veredicto, fallos con [MM:SS], cumple, no verificable). Unos $0.25 por render de 90 s. Correrlo antes de mostrarle cada render al usuario.

**Why:** el usuario quiere que el trabajo pesado y repetitivo (ver videos, revisar renders contra reglas) lo hagan scripts con esos créditos y no gaste tokens del plan.
**How to apply:** plan aprobado el 2026-10-28: (1) reemplazar Gemini en ver-youtube por yt-dlp + Whisper local + Claude API; (2) revisión automática de renders contra las reglas de cada estilo ([[ava-rules]], [[mechayuki-rules]], [[pov3d-style]], [[cartoon3d-rules-2]]). Los scripts escriben un reporte .md y lo leo solo si hace falta. Usar Haiku/Sonnet y caché de prompts.
