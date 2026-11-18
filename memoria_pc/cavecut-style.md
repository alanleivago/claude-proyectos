---
name: cavecut-style
description: Estilo "corte de cueva 3D" (pieces/cavernas): accidentes en cavernas como corte transversal three.js, ref TikTok hai.zhang515; look aprobado 2026-10-30
metadata:
  type: project
---

Pieza pieces/cavernas (2026-10-30): Gollum's Cave (Provo, Utah, ago 2005) en español, voz mathomaly ([[voicestudio]]), ~120 s, 18 beats aprobados. Ref: TikTok @hai.zhang515 (video 7696394873850662158), descargada en pieces/cavernas/ref/ (dice "Gulo Cave" = mala transcripción de Gollum's Cave).

Look APROBADO ("está excelente"): corte transversal 3D (src/cave.js sobre el motor three.js de grow): losa frontal con el paso recortado, paredes del corte, fondo arenisca sobre el agua y azul con cáusticas debajo, lámina de agua cian, cuerda guía beige, barra OXÍGENO arriba a la izquierda, subtítulos blancos en negrita al centro-abajo, cota "4,5 m".
**Corrección del usuario:** roca verde-negra y borde de musgo verde como el original, pero con un toque marrón para diferenciarlo (no gris azulado ni ocre).

**Why:** el usuario quiere el mismo look que la ref, cambiado lo justo para no ser copia.
**How to apply:** en próximos videos de cavernas reutilizar src/cave.js y esta paleta; pedir más movimientos de cámara que la ref.

**Estado 2026-10-30:** v1 entregada (renders/share.mp4, 87,8 s). Sonido con audio/mix_track.py (Freesound CC0 en audio/fs + sound-layer). Freesound falla con SSL de forma intermitente desde aquí: reintentar en bucle funciona. La voz mathomaly no articula bien "se desmaya": reformular la frase.

**APROBADO 2026-10-31 (final, 109 s):** voz **"Voz Tuneles" (VoiceStudio 41641440)**, no mathomaly; voz alta: piece.json `"voice": {"music": -10}`. Whisper en español: `voice.mjs --model small` (voice_words.py ya detecta idioma si el modelo no es .en). Cierre: sobre el negro final, foto de grupo de las víctimas (si no hay real, recreación Flow) **recta, centrada, pixelada que se aclara**, SIN etiqueta "recreación", bajo el último subtítulo; cola de voz `tail: 6`. Escenario siguiente: mismo estilo, nuevas refs de @hai.zhang515.

**Foto final (regla del usuario 2026-11-01):** SIEMPRE buscar primero una foto REAL de las personas del caso; solo si no existe, recrearla con Flow (pixelada, recta, centrada). Segunda pieza del estilo: pieces/rescate (Erasto Crisanto, cueva inundada 15 días, jul-ago 2026); selva portada de pieces/lluvia/src/world.js.
