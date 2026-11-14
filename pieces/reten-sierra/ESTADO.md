---
type: handoff
status: active
tags: [atrium, novelas, vista-stories]
relatedTo: [medalla-mezcal]
---
# reten-sierra (El Retén) — estado
- Hojas corregidas (bug de Flow corre imágenes un nombre): TEODORO→DONTEO, LOC_RETEN→LOC_GARITA, PROP_RELOJ→PROP_LEONTINA, sierra=LOC_MONTE, cabina=@{LOC_SIERRA} (archivo LOC_SIERRA.jpg ES la cabina), troca=PROP_CAMIONETA. LOC_CABINA.jpg/TEODORO… no usar.
- Clips: `python -I clips.py > clips_log.txt` en curso. Luego: QA por agente (como medalla qa_clips.md), regenerar malos, edit.py, verificación completa, Telegram. Riesgo c32: Garza hace lipsync de la voz de la radio.
- Siguiente: 7699644756812385567 (317K).

## Entregado (2026-11-04)
- `renders/v3.mp4`: 2:29, 98 planos, media 1.52 s, -14.8 LUFS, sincronía 0 frames en 5 puntos. Enviado a Telegram con caption.txt.
- Garza en camuflaje (GARZAVERDE) en todos los planos. Marca VISTA STORIES alpha 80.
- Pendientes menores: inserto del radio en c32 algo blando (ampliado 2.5x).
- `renders/v4.mp4` (2026-11-04): 2:18, 72 planos (49 cambios de plano + 22 saltos dentro del mismo clip), media 1.91 s, -14.8 LUFS / -1.4 dBTP, sincronía 0 frames. Regla nueva: mismo personaje = mismo plano (sin caras mudas de relleno). 7 clips regenerados OK. c33 nuevo sin BLUR33 (no hay texto de patrulla). edit.py de v3 en scratchpad/r4/edit_v3.py.
