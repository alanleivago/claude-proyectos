---
type: plan
status: draft
tags: [ava-restfield, part-3, sound-plan, mix, stalker, decision]
relatedTo: [zombie-03-station, ava-rules]
---

# Plan de sonido: de la ventana al menú RUN / FIGHT (largo 3)

La gramática sale del estudio del primer encuentro con el perseguidor en el survival horror clásico (notas en `fuentes/re3-encuentro/`). Se copia solo la técnica: nada de música, efectos, nombres ni assets del juego. La música es CC0 (Freesound) como siempre, medida por LUFS por tramo.

Lo que se toma de la referencia:
- El monstruo primero aparece chico, en plano general. Luego viene un plano grande desde su espalda que ocupa ~70 % del cuadro, con la protagonista diminuta al fondo.
- A la decisión se entra con un corte seco: imagen en negativo, barras gris claro y la criatura casi congelada (cámara lenta).
- El texto aparece ~2 s después de entrar y se queda en pantalla varios segundos.
- La música no sube durante la decisión: se sostiene en un nivel bajo y plano.
- El silencio total (~1 s) se guarda para el golpe definitivo. Acá lo usamos al aterrizar.

| Momento (toma / plano) | Imagen | Música | Efectos | Nivel |
|---|---|---|---|---|
| k1 "the whole house shakes" (131_shake) | araña y polvo, solo se mueven los objetos | la BGM del capítulo baja 6 dB en 0,5 s | grave de temblor (CC0), crujido de vigas, tintineo de la araña en su cuadro | voz −14 LU |
| pausa (···) después de k1 | vestíbulo quieto | **silencio de música** 1,8 s, solo tono de sala | un último cristal de la araña | ambiente −50 dBFS |
| k2–k3 "the tall window… explodes" (132_explode) | la ventana revienta hacia adentro | **stinger** grave + golpe de orquesta CC0 en el cuadro exacto de "explodes" | vidrio grande que se rompe, marco de madera que se astilla, lluvia de cristales cayendo 1,5 s | pico −1 dBTP |
| k3 "in one jump" (132b_jump) | salto en el aire | nada: corte a silencio en el despegue | soplido de aire, tela del abrigo | — |
| k4 "It hits the marble hard" (133_land) | plano general alto: chico, agachado | **silencio total ~1 s** justo después del impacto | impacto pesado sobre mármol, crujido del piso, cristales que rebotan | impacto −3 dBFS, luego silencio |
| "stands up slowly" | se levanta despacio | entra un drone bajo CC0 a −20 dB (sin melodía) | roce del abrigo de goma, articulaciones; **rugido gutural grave** al caer y levantarse (v3, pedido del usuario: "It roars") | drone 12 LU bajo la voz |
| k4–k5 pies, manos (134–135) | detalles | drone sostenido | paso descalzo pesado (uno por pie en su cuadro), cuero de las manos al cerrarse | — |
| k6 [RESPIRA] (136) | cara de Ava arriba | el drone baja 3 dB | respiración real CC0, seca y cerca | sola en silencio |
| k8–k9 "tilts its head… looks up the stairs" (138–139) | inclina la cabeza, mira hacia arriba | **sin cambio**: el silencio del monstruo es la amenaza | un solo crujido de cuello al inclinar la cabeza | — |
| k10–k11 "is hunting" (140, desde su espalda) | espalda enorme, Ava chiquita | latido grave (pulso a 60 bpm) que entra en "hunting" | — | −16 LU |
| k12 Ribbon ladra (141) | Ribbon | latido sigue | ladridos reales que sacuden (solo el perro) | ladrido −8 dBFS |
| q1–q7 "two seconds… first step" (142–146) | amenaza que sube | **tema de persecución**: ostinato de percusión CC0 que arranca en "two seconds" y crece por tramos sin pasar −10 LU | crujido largo de la escalera en "groans" | por tramo, igualado en LUFS |
| q8–q9 [PIENSA] "Run… or fight. Decide!" (147) | cara de Ava | el ostinato se corta en seco en "Decide!" | — | — |
| **e4: DECISIÓN, fase negativa (150_choice, 0–6,4 s del plano)** — medida cuadro a cuadro en el clip de referencia: destello blanco 0,5 s → negativo congelado SIN texto 2,5 s → parpadeo negro + destello 0,5 s → negativo CON las dos opciones 2,4 s → parpadeo negro + destello 0,5 s. Negativo total ≈ 6,2 s | negativo, barras gris claro, gigante casi congelado | la música no sube (en la referencia la curva se queda plana, sin corte): drone bajo filtrado (paso bajo 600 Hz) y latido ralentizado ~40 bpm | un golpe sordo (boom grave) en cada destello blanco (3 en total, −18 dB), teclas de máquina de escribir cuando aparecen las opciones (3,5 s) | drone −24 LUFS; voz encima limpia |
| **e4 desde 6,4 s del plano hasta el final: menú en imagen NORMAL** (como en la referencia: vuelve el color con el mismo encuadre, el texto sigue y aparece la caja de selección) | color normal, caja azul en la opción que nombra la voz, cuenta regresiva, gigante en cámara lenta | sigue el drone y el latido a tempo normal (60 bpm) | blip de cursor en "Option one" / "Option two"; pasos del gigante estirados (×0,5, −5 st) |
| e5–e6 "Comment one or two… SUBSCRIBE!" | barras con el texto | el drone sigue hasta el final (la BGM no se corta en los largos) | sonido de menú al aparecer COMMENT y SUBSCRIBE | final −14 LUFS integrados del video |

Reglas para la mezcla:
- v3 (pedido del usuario): el monstruo RUGE al caer/levantarse, gruñe tras "It roars" y respira/gruñe grave al mirar arriba y en cada paso de subida. Grabaciones CC0 reales.
- Hay dos silencios de música: tras el temblor (···) y tras el aterrizaje. Ninguno se rellena con voz ni con efectos nuevos.
- El negativo dura lo mismo que en la referencia (~6,2 s, con dos parpadeos); después la decisión sigue en color normal con el menú y la cuenta regresiva. La cámara lenta también afecta al audio: los efectos van estirados y graves; la voz no.
- Todo sale de Freesound CC0 o Dino Crisis según la guía, nada del juego de la referencia. Se verifica con earshot (`rank`, `find`, `describe`, `realness`), y la mezcla final con `timeline` y `measure` por tramo.
