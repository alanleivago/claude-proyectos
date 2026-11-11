---
name: telegram-renders
description: Cada render final de un video se envía al chat de Telegram del usuario con tools/enviar_telegram.py
metadata:
  node_type: memory
  type: feedback
  originSessionId: dd621c73-0dc8-4663-a3a9-e8d02c9a413f
  modified: 2026-11-04T16:25:37.191Z
---

Al terminar el render final de cualquier video (también versiones corregidas y de otro idioma), correr `python tools/enviar_telegram.py <pieza>/renders/share.mp4` (como video; el texto es el título del video, sacado de piece.json). Token y chat id en `.env` de la raíz.

**Caption = TÍTULO DE TIKTOK (usuario, 2026-11-04):** el texto del envío no es el título interno, es el título listo para pegar en TikTok, CORTO (una frase simple, tipo "how to…"), 1 emoji + 4-5 hashtags, en el idioma del video, bien escrito. Pasarlo como 2º argumento. Ej aprobado por el usuario: "How to make a safe room during a zombie outbreak 🧟‍♀️ #zombie #survival #residentevil #ps1 #zombieapocalypse". NO frases largas con dos oraciones.

**Ruta siempre (usuario, 2026-11-04):** al entregar cualquier video final, dar SIEMPRE la ruta absoluta completa de Windows del mp4 (ej. `F:\Claude Proyectos\pieces\zombie-08-farm\renders\zombie08_farm_v3.mp4`) para que lo busque y lo vea.

**Why:** el usuario lo pidió el 2026-11-01 para recibir los videos en su Telegram del PC.
**How to apply:** después de encode + review, antes de entregar; solo renders finales, no storyboards ni pruebas. Límite de bots 50 MB (el script recomprime). Ver [[pov3d-style]].
