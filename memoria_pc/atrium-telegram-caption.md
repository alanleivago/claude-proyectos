---
name: atrium-telegram-caption
description: Formato del texto con que se envía cada novela VISTA STORIES a Telegram (título gancho + descripción + CTA + hashtags)
metadata:
  node_type: memory
  type: feedback
  originSessionId: 31217992-d068-4929-9882-eede7428b798
  modified: 2026-11-04T11:24:43.791Z
---

Cada render de las novelas [[atrium-novelas]] se envía a Telegram con título y descripción listos para publicar, no solo el título.

**Formato** (ejemplos del usuario, 2026-11-04):
- **Línea 1:** "Parte 1 | gancho con puntos suspensivos… giro 🔑" o "gancho… giro 😳 | Título · Parte 1". Lleva un emoji al final.
- **Párrafo:** 2-3 frases en español mexicano que cuentan el arranque y dejan la pregunta abierta. Puede llevar un emoji (👀).
- **Pregunta al público** (opcional): "¿Qué harías tú en su lugar? 👀".
- **CTA:** "Sigue la página para no perderte la segunda parte, deja tu me gusta y comparte."
- **Hashtags:** 4-6, por ejemplo #telenovela #novelamexicana #drama #historiasmexicanas #parte1, más uno del título (#elreten).

**How to apply:** escribir el texto en `<pieza>/caption.txt` (máximo 1024 caracteres, el límite de Telegram) y enviar con `python tools/enviar_telegram.py <render> <pieza>/caption.txt`. El script lee el .txt si se le pasa uno. Pasarlo por humanizer de tono. Ver [[telegram-renders]].
