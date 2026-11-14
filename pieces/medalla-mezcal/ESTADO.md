---
type: handoff
status: active
tags: [atrium, novelas, vista-stories]
relatedTo: [agua-hacienda]
---
# Estado nocturno (2026-11-04) — el usuario duerme y autorizó seguir solo

1. medalla-mezcal: clips generándose en segundo plano (`python -I clips.py > clips_log.txt`). Al terminar: revisar FALLOs/morphs/pronunciación (hija, juro) por clip, regenerar los malos, `python -I edit.py` → renders/v1.mp4, VERIFICACIÓN COMPLETA (memoria atrium-reglas), enviar a Telegram.
2. Siguiente autorizado: "El Retén" (fuentes/atriumstories/videos/7701749432621993246, 1.1M). Mismo flujo: agente escribe guion/make_sheets/clips/edit (copiar edit.py de agua-hacienda, aprobado v4) cambiando personajes/diálogos; nombres de assets únicos; md5 de hojas; clips uno por uno; verificar; Telegram.
3. Luego, por vistas: 7699644756812385567 (317K), 7697331061650476319 (260K).

## Actualización (QA de clips, ver qa_clips.md)
- 39/45 clips OK de generación. c31-c34, c36, c38 fallan con "page.waitForFunction Timeout 20000ms" (espera del chip de mención) también al reintentar (job btih2joho, log clips_log2.txt).
- PROBLEMA GRAVE: en todos los clips FAUSTO sale con el look de Don Chuy de agua-hacienda (camisa verde a cuadros, paliacate rojo, sombrero grande), no el de chars/FAUSTO.jpg (camisa crema, perilla). El asset "FAUSTO" de Flow tiene la imagen equivocada (bug de renombrar tile).
- ARREGLO: copiar FAUSTO.jpg recodificada (`ffmpeg -i chars/FAUSTO.jpg -q:v 3 chars/ARREOLA.jpg`), subirla como "ARREOLA" (flow_upload_file), comprobar la miniatura en Flow, `sed -i 's/{FAUSTO}/{ARREOLA}/g' clips.py`, mover a clips/old/ los 19 clips con FAUSTO + c20 y c28 (repiten frase inventada), regenerar con `python -I clips.py`. Investigar el timeout del chip (¿demasiados assets? ¿nombre parecido?) si sigue.
- c29: recortar el último frame (salta de plano). c37: subtítulo quemado (aceptable).
- HECHO: ARREOLA subido, clips.py usa @{ARREOLA}; c01 de prueba OK (look correcto). 21 clips viejos en clips/old/. Regeneración en curso (log clips_log3.txt). Después: QA de los clips nuevos (mismo agente/qa), editar EDL c29 (recortar último frame), montar, verificar, Telegram, y seguir con El Retén.
- ENTREGADO v1 (208.6 s, 89 planos) por Telegram 2026-11-04; verificado sync 0-1 frame en 5 puntos, marca, golpe, negro+CTA. Más largo que refs (máx 178 s): si el usuario lo pide, recortar. SIGUIENTE: El Retén.
- v2 (2026-11-04): 10 clips regenerados OK en QA; edit.py con método reten-sierra v4 (EDL por frases, renders/phr.json, CROP37, limiter 0.80); lines.json borrado. renders/v2.mp4 154.0 s, 95 segmentos/70 planos, -14.7 LUFS, -1.8 dBTP. c34 corta antes de su corte interno (1.5 s). Falta enviar a Telegram.
