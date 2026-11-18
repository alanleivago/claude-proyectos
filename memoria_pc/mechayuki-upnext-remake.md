---
name: mechayuki-upnext-remake
description: "Nuevo formato Mechayuki (2026-11-15) — remakes de los reels de @jongmin.design (\"UpNext\"): mismos planos, diálogo parafraseado, subtítulos como los suyos"
metadata:
  node_type: memory
  type: project
  originSessionId: b19cd1d9-332a-4ffd-91ff-b618e0ca55df
  modified: 2026-11-18T01:25:24.924Z
---

Los shorts de artefacto y los de cat.explains.it no consiguieron vistas, así que el usuario (2026-11-15) quiere dejar el enfoque androide/artefactos. Desde ahora se rehacen los reels de @jongmin.design (Instagram, serie UpNext, autoayuda en diálogo con un gnomo mentor, low poly PS1): MISMOS planos, encuadres y ritmo, diálogo PARAFRASEADO en inglés y subtítulos iguales a los suyos. En TikTok esos videos no existen.
Análisis: fuentes/jongmin-design/ (SINTESIS.md, remake/ESTILO.md, una spec por reel en remake/<id>.md, hojas de contacto en remake/cuts/).
Orden: Dd2YemoPJ9- (342K likes), DeDh, DenX, Dd-HI, luego DeIZ, Dd5E y Deqi.
**Why:** el formato anterior no agarraba vistas; el usuario eligió replicar esta cuenta.
**How to apply:** render de prueba del gnomo antes del storyboard (NPC existente + gorro/barba, nunca un modelo a medida), storyboard → aprobación → render → revisión. Cambiar algunos detalles (objetos, nombres) para no quedar calcado. Ver [[mechayuki-rules]].
Personajes (2026-11-16): gnomo Pip = Servbot con su textura sombreada original recoloreada + ojos estilo Servbot (APROBADO, pieces/upnext-gnome, ojos A). Chica = la del tutorial MercurialForge (youtube DqntXa7dOO8), el usuario la quiere IDÉNTICA (modelada a mano como él, paso a paso; guía extra: tutorial de Crashsune), en pieces/upnext-girl. Verificar con overlays al 50% en sus cámaras.
Chica, v7 rechazada (2026-11-16): la cara era plana y la de él tiene volumen; la cabeza, el cuerpo y los pies no seguían su malla. Además usaba las caras de Roll (las del flequillo amarillo en el medio), que él solo pone como referencia; las suyas aparecen desde el minuto 9:19. Hay que replicar polígono por polígono su malla gris (7:55 y 7:57, ~470 tris), con Roll de assets/ (zip Roll Caskett) al lado como guía de altura, igual que él. No entregar hasta que sea idéntica. Capturas del usuario en fuentes/mml2-girl-tutorial/user_refs/.
Chica del tutorial ABANDONADA (2026-11-16): no se logró idéntica. La reemplaza la réplica del modelo de TikTok @.rashiyx (Ashley RE4, vuelta de 360°): pieces/upnext-girl2. El usuario eligió V2 (curvy, piernas desnudas) y V3 (curvy, pantimedias) para alternarlas en los videos. Low poly de 3,6k tris, con el trasero agrandado a pedido.
Al 2026-11-17: Ashley APROBADA (v5, pieces/upnext-girl2). Voces en VoiceStudio: "Ashley" y "Gnomo personaje apoyo" (quitarles el ruido). Las refs tienen un ojo de pez leve y animación a pocos fps. El usuario evalúa cambiar a Pip por MetalShadow (assets/Grego..., en prueba en pieces/upnext-metalshadow). Primer video en pieces/upnext-01, storyboard v2 gustó.
Mesera APROBADA (pieces/upnext-waitress, shorts + jeans) para un formato nuevo estilo TikTok @missmedannypsx (análisis en fuentes/missmedannypsx/). Su pretendiente es Artillery de MML modificado (pieces/upnext-suitor). El usuario revisa las animaciones en video de 360°.
Al 2026-11-17: Ashley ahora se llama "Airy" (banner v4 con "Subscribe!" en thatthatnewpixelfamilytest-square, pieces/upnext-girl2/branding/v4). Mesera = "Vera" (cuenta @askforvera, banner C black neon, pfp bored con fondo de un solo color). Pretendiente = "Theo". Voces en VoiceStudio: Vera "Voz mesera clean", Theo **"Voz theo pretendiente clean"** (usarla desde 2026-11-17), Pip "Voz gnomo pip", Airy "Ashley 2 clean". Modelos ripeados/comprados → LucidLink, nunca a git (el repo es público).
