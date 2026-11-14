---
type: doc
status: active
tags: [migracion, antigravity, contexto, memoria]
relatedTo: [CLAUDE.md, CLAUDE.local.md, tools/exportar_contexto.py]
---
# Contexto completo para continuar el trabajo en Antigravity

Generado el {{FECHA}} en la máquina {{MAQUINA}} con `tools/exportar_contexto.py`, a partir de todo lo trabajado con Claude Code: instrucciones, memoria, estilos, estado de piezas, el historial completo de mensajes del usuario, herramientas y git. Solo incluye texto: los videos, audios y modelos 3D están en el repo y en los discos.

## 0. Léeme primero (instrucciones para el agente de Antigravity)

**Quién es el usuario.** Alan Leiva. Hace videos (shorts 9:16 de TikTok/Reels/Shorts y largos 16:9 de YouTube) en muchos estilos y canales, casi todo animado por código (three.js, HyperFrames, Blender por MCP, Python + ffmpeg) o generado con Google Flow (Nano Banana / Veo / Omni Flash). Habla español; los guiones pueden ser en inglés o español según el canal. Trabaja con un PC Windows (repo en `F:\Claude Proyectos`) y una Mac; las dos comparten el repo git `https://github.com/alanleivago/claude-proyectos.git`.

**Cómo quiere que trabajes** (detalle en la PARTE 1 y la PARTE 2):
- Respuestas cortas, en español, sin halagos ni preámbulos. No narrar el plan: hacerlo.
- Leer el contexto (spec del estilo, memoria, pieza aprobada de referencia) ANTES de programar. Si falta información, preguntar.
- Cambios mínimos; no reescribir archivos enteros; nada de features que no pidió.
- Verificar antes de decir "listo": renderizar, mirar fotogramas, medir el audio.
- Si dice "hazlo así", hacerlo así.
- Cada estilo tiene un **nivel aprobado** (una pieza concreta) que es la barra mínima y la plantilla a copiar. Las correcciones que dio en cada estilo son reglas permanentes: revisarlas en cada plano antes del render final.
- Mostrar el storyboard y esperar su OK antes del render final, aunque diga "procede al render" (salvo los estilos marcados "sin storyboard").
- Render final → copiar a LucidLink `C:\Volumes\alanwork\trabajo\Renders finales claude\<Estilo>\<titulo-corto>.mp4` (+ `caption.txt` al lado si existe). Sin duplicados en otras carpetas. Videos largos: entregar también título + miniatura 1280x720.
- Confirmar antes de cualquier publicación (TikTok, Facebook, Gumroad, Zernio).
- Entregar cada archivo con su ruta como link.

**Orden de prioridad cuando algo choque:** mensaje actual del usuario > PARTE 5 más reciente > memoria (PARTE 2) > specs de estilo (PARTE 3) > reglas generales (PARTE 1).

**Cómo usar este archivo:**
1. Copiar la PARTE 1 (y lo esencial de la sección 0) a las reglas globales / del workspace de Antigravity, para que se carguen siempre.
2. Copiar la PARTE 2 (memoria) como reglas o como un archivo de conocimiento del workspace; es lo más importante: gustos, correcciones y el nivel aprobado de cada estilo.
3. Cuando el usuario pida un video de un estilo: leer su memoria (PARTE 2), su spec (PARTE 3) y la pieza aprobada en `pieces/`, y buscar en la PARTE 5 lo que dijo de ese estilo.
4. Reconfigurar los MCP de la PARTE 6 en la config de MCP de Antigravity (mismos comandos/URLs). Las claves no van en este archivo: están en `.env` (raíz del repo), `~/.freesound.json`, etc., en cada máquina.
5. Las "skills" de Claude Code son carpetas con un `SKILL.md` de instrucciones (rutas en la PARTE 6); en Antigravity se pueden usar como workflows/reglas leyendo ese archivo.

**Herramientas clave** (detalle en la memoria): srz-google-flow-mcp para TODO lo de Flow (nunca flow-auto ni Flow Connector), VoiceStudio local para voces clonadas (REST/MCP, steps=32, wav), earshot para juzgar sonido, sound-layer / real-sfx / Freesound / Openverse para SFX reales, humanizer para pasar los guiones, `tools/revisar_render.py` para revisar renders con la API de Anthropic (créditos de API de su plan; clave en `.env`), Blender MCP, Premiere MCP, FilmCraft, Zernio (publicar), VMOS (teléfonos en la nube), LucidLink.

**Datos de la Mac:** la Mac comparte el repo por git (todo lo commiteado está igual en las dos). Sus sesiones de Claude Code están en su propio `~/.claude`. Para sumar su historial y memoria, correr en la Mac `python3 tools/exportar_contexto.py MIGRACION_MAC.md` y dar también ese archivo.

## Índice

- PARTE 1 — Instrucciones permanentes (CLAUDE.md)
- PARTE 2 — Memoria completa (gustos, correcciones, reglas por estilo, recursos)
- PARTE 3 — Estilos de video (specs)
- PARTE 4 — Piezas (proyectos de video) y su estado
- PARTE 5 — Historial completo de instrucciones del usuario (todas las sesiones)
- PARTE 6 — Herramientas, MCP, skills y entorno
- PARTE 7 — Repositorio git
