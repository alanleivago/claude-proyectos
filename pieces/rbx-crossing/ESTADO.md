---
type: plan
status: active
tags: [roblox, rbx-crossing, handoff]
relatedTo: [styles/roblox/STYLE.md, pieces/rbx-followers, Ref roblox/tiktok/informe.md]
---

# rbx-crossing: estado (2026-11-10)

- Premisa: n.º 8 de [informe.md](../../Ref%20roblox/tiktok/informe.md) ("Only The Crossing Guard Stops Cars 🛑"), elegida por el usuario.
- Guion APROBADO: [script.md](script.md) (496 palabras, "In this town", humanizer).
- Voz: `voice/voice_final.wav` (109.8 s → video ~110.3 s), "3D cartoon 2" d9b69bea, speed 1.25, +4 st; 11 trozos (c5 partido en c5/c5b); transcripción completa verificada (solo brake/break y close/closed, homófonos). Tiempos `voice/words.json`.
- Pipeline copiado de rbx-followers + sets nuevos `src/set-road.js` (carretera infinita, autos sin conductor, mood fall/snow, carsAt/snowAt) y `src/set-hallway.js` (muro de fotos, photo(n)); props `src/props-cross.js` (STOP, catapulta, pizza, name tags, silbato); elenco nuevo en cast.js (rudy, rudyV con chaleco, wes, missdot, teacher, twins, bride/groom).
- Look v3: look/look_sheet.jpg. Correcciones del usuario: escenarios planos → set-road con colinas/pinos, postes y cables, faroles, señales escolares, caseta de Miss Dot, cercas/buzones/arbustos, hojas, escuela con techo/reloj/bus/columpios, nieve real (techos, montículos, ventanas y faroles encendidos, grade 'snow'), nubes, SCHOOL pintado, vapor; pasillo con carteles/EXIT/ventana. Pelo H1: casquete nuevo `hairCap` (sin línea en la frente) + mechones suaves (también copiado a rbx-followers/src/gneef.js). Look APROBADO (2026-11-10).
- Storyboard: 81 tomas en src/shots.js (SHOTLIST + STAGEI) → board/board_1..3.jpg. words.json corregido (números en letras, close/brake). ESPERANDO APROBACIÓN del storyboard antes del render.

## Siguiente
1. Voz (receta exacta de styles/roblox/STYLE.md, perfil "3d cartoon" 227af074, +4 st, verificación Whisper).
2. Copiar pipeline de [rbx-followers](../rbx-followers/ESTADO.md) (Windows: d3d11, followers.js para multitudes, sound/fs_fetch.py + sfx_mix.py + remix.py --own).
3. Look (fotogramas de prueba) → aprobación.
4. Storyboard completo → aprobación ANTES del render (memoria storyboard-before-render).
5. Render → QA → revisar_render (--reglas styles/roblox/STYLE.md) → sonido pro → título + miniatura → Telegram.
