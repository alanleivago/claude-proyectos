---
type: doc
status: draft
tags: [agente-davis, tiktok, piloto, checklist-gratis]
relatedTo: [ESTRATEGIA, bloques-youtube]
---

# Piloto 01: "ICE llega a la escuela" (formato pantalla dividida)

Duración: ~45 s. Vertical 1080x1920. Arriba clip IA (Flow, Omni), abajo Patrick. Etiqueta "Generado por IA".

## Guion (voz de Patrick)

0-3 s, GANCHO (título en caja negra arriba: "ICE llegó a la ESCUELA… ¡MIRA lo que hizo la maestra!")
"Miren lo que pasó en esta escuela…"

3-18 s, clip IA arriba (agentes en la puerta de una primaria, maestra se planta en la entrada y no los deja pasar sin orden de un juez; niños mirando por la ventana). Patrick abajo reacciona.
"La maestra hizo lo correcto. Sin una orden firmada por un juez, no tienen por qué entrar. Pero la pregunta de verdad es otra…"

18-32 s, Patrick a cámara (clip arriba en cámara lenta, desaturado).
"Si mañana te detienen a ti… ¿quién recoge a tus hijos? ¿La escuela sabe a quién entregárselos? Lo he visto muchas veces. La familia que tenía su plan escrito sufrió mucho menos."

32-45 s, CTA (pantalla completa: portada + checklist de la lista gratis, flecha roja hacia abajo, texto "Lista GRATIS en mi perfil").
"Por eso preparé una lista con las 15 cosas que tu familia debe tener listas. Es gratis. Comenta LISTA y te la mando, o búscala en el link de mi perfil."

## Storyboard

| # | Tiempo | Arriba (IA) | Abajo | Texto en pantalla |
|---|---|---|---|---|
| 1 | 0-3 | Patrulla de ICE frente a escuela primaria | Patrick mirando, cejas arriba | Caja negra: título gancho |
| 2 | 3-10 | Agentes caminan a la puerta; maestra sale | Patrick asiente | Subtítulos amarillos palabra a palabra |
| 3 | 10-18 | Maestra con brazos extendidos, "¿tienen orden de un juez?" | Patrick señala arriba | "SIN ORDEN DE UN JUEZ" |
| 4 | 18-32 | Niños en la ventana (lento, desaturado) | Patrick a cámara, serio | "¿Quién recoge a TUS hijos?" |
| 5 | 32-45 | Pantalla completa: hojas de la lista + flecha roja | — | "Comenta LISTA 👇 / Lista GRATIS en mi perfil" |

## Respuesta a comentarios "LISTA"
Script de comentarios (pendiente): responde al comentario + DM con agentpatrickdavis.gumroad.com/l/checklist-gratis.

## Estado (2026-11-15)
- Patrick HD: piloto01/2026-11-15T23-59-38-...jpg (Nano Banana Pro desde Agente Reacciones.mp4), subido a Flow como @{patrick_hd}.
- Clips Omni listos en piloto01/: 00-00-57 (reacción "la maestra hizo lo correcto"), 00-01-55 (¿quién recoge a tus hijos?), 00-03-40 (CTA "Escríbeme LISTA"), 00-05-05 (escuela: maestra en la puerta, arriba).
- Flow bloquea "ICE"/confrontación en el prompt: usar "two men in dark jackets with badges", tono calmado.
- IG mikewaynedotcom sin login solo muestra 12 reels recientes (no ICE).
- Falta: voz VoiceStudio d31aa86f por clip (estirar a la duración), montaje 1080x1920 (arriba escuela, abajo Patrick), subtítulos amarillos, caja de título, pantalla CTA con la lista + flecha, storyboard al usuario.

## Indicaciones nuevas del usuario (2026-11-15)
- Instagram ya tiene sesión iniciada en Chrome: sacar reels de ICE de instagram.com/mikewaynedotcom (bajar mucho en el perfil; ICE vs ciudadanos / vs policía) con yt-dlp --cookies-from-browser chrome. Esos clips van ARRIBA (se pueden usar).
- Patrick: usar `Ref youtube agente/Agente reaccion.mp4` para el tramo en que mira el video de arriba, y `Ref youtube agente/agente imagen hd.png` como imagen base para generar en Omni los clips donde habla (reemplaza a mi patrick_hd).
- Antes de montar: analizar los últimos TikToks de @agentedavis con este formato (reacciona al video → habla → recomienda) para copiar estructura, tiempos y look. Hacerlo por API (script Python, créditos).

## Formato real (analisis_reels.md, Reels_67 = el formato a copiar)
- Clip viral ARRIBA ~70 % / Patrick ABAJO ~30 % en pose de reacción (mano en la barbilla mirando pantalla = Agente reaccion.mp4), callado, el clip corre casi completo (~65-70 % del video).
- Título gancho fijo: caja negra redondeada, texto blanco negrita, en la unión de las dos zonas. Subtítulos amarillos con contorno negro, 2-4 palabras, centro del clip.
- Corte seco a layout 56/44: Patrick habla a cámara, opinión en 3-4 puntos, planos del clip como b-roll.
- Puente al producto ("si quieres X…") + imagen del producto con flecha roja + frase de beneficio + despedida con nombre ~2 s.
- Reels_68 alterna: CTA "escribe X" en comentarios (lead magnet), corte seco.

## Estado 2 (2026-11-16)
- Clips Patrick v2 (desde agente imagen hd.png, 9:16) en piloto01/v2/: 02-01-05 (¿quién recoge a tus hijos?), 02-02-04 (CTA LISTA + "Soy el agente Davis"), 02-03-14 (opinión "esa maestra conoce sus derechos"). Se ven bien, misma cara.
- Reels Mike Wayne: 219 URLs en fuentes/mikewayne/urls.txt; captions por Chrome de Flow (CDP 9333, ig_caps.mjs) → captions2.txt; filtrar ICE/police y bajar con yt-dlp --cookies ig_cookies.txt.
- Clips Patrick v3 HORIZONTALES 16:9 (correcto) en piloto01/v3/. IG: lo abre el usuario (captcha), NO recargar.
- LIPSYNC (2026-11-16): método A que funciona = prompt de Omni TODO EN ESPAÑOL ("habla EN ESPAÑOL (no en inglés)... Dice exactamente, en español: ...") → Omni dice el texto exacto; luego la voz VoiceStudio se estira (atempo ~1.04) y se alinea al primer/último word de Whisper → piloto01/v4/patrick_v1_sync.mp4. Pendiente: aplicarlo a v2 y v3. Método B (lipsync local tipo LatentSync/MuseTalk) no instalado aún.
- SYNC por frase con medición: tools/patrick_sync.py clip.mp4 voz.wav out.mp4 (3 pasadas, objetivo ≤0.1 s por palabra). v1 OK: piloto01/v4/patrick_v1_sync3.mp4 (máx 0.06 s). Falta v2/v3 con prompt en español. IG descartado; probar FB facebook.com/mikewaynedotcom/reels/ con UNA carga (sin recargar).
- 10 reels del usuario bajados SIN cookies (yt-dlp con cookies da 400) en fuentes/mikewayne/clips/. Análisis + guiones por clip → agente-davis/tiktok/clips_mikewayne.md (analizar_clips.py). Usar un clip por video; DWOzPiZk55B/DWOyorrkoUF = maestra. patrick_sync.py arreglado (reencode+apad): v4/patrick_v1_sync4.mp4.
- Video maestra (DWOzPiZk55B): clips Patrick en piloto01/maestra/ (patrick_op.mp4 máx 0.64 s ✗, patrick_cta.mp4 máx 0.24 s ✗) → mejorar sync (más pasadas o cortar por palabra) antes de montar. Guion = clips_mikewayne.md sección DWOzPiZk55B (opinión ajustada: 'Cuidado, porque así te puedes meter en un problema grave…'). Flow bloquea 'enfrentarte con un objeto'.
- TÍTULOS: igual que en los últimos TikToks de Patrick: texto en Montserrat, caja de fondo negro tal cual (copiar medidas/posición de Agente Reels_67-69).
- MÚSICA de fondo: Ref youtube agente/Hiraoka-Kotaro-musica agente.m4a. Premiere tiene abierta la secuencia de estos reels (assets disponibles vía MCP premiere). VOZ: nunca acelerarla (no 'volando'); si Omni habla rápido, RALENTIZAR EL VIDEO al ritmo de la voz; verificar que la voz no se corte al final.
