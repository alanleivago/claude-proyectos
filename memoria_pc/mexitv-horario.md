---
name: mexitv-horario
description: Horario de publicación de @mexitve (Pixel VMOS): 3 días a las 18:00, luego 08:00 y 18:00; cola + tarea programada
metadata:
  type: project
---

Horario pedido 2026-11-16 para @mexitve (Pixel 10 Pro VMOS): 17, 18 y 19 de nov solo 1 video a las 18:00 (el 16 nada); desde el 20 de nov, 2 diarios (08:00 y 18:00), hora del PC (Venezuela, -04:00).

**Cómo está hecho:** tarea de Windows "MexiTV publicar TikTok" (08:00 y 18:00) corre `tools/mexitv_publicar.py`, que publica el primero de `tools/mexitv_cola.json` (["Estilo","archivo.mp4"], el mp4 + .txt deben estar en LucidLink) con tiktok_upload.py; log en tools/mexitv_publicar.log. Si falla, queda en la cola.

**How to apply:** la cola lleva SOLO videos generados para @mexitve (no reusar renders de otras cuentas). Cada video nuevo para @mexitve: entregarlo a LucidLink y añadirlo a la cola. Revisar el log y que la cola no se vacíe. Ver [[vmos-cloud]], [[atrium-p2-solo-si-funciona]].
