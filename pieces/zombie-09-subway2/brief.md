---
type: spec
status: draft
tags: [zombie-channel, ava-restfield, subway, last-train, part-2, short, brief]
relatedTo: [zombie-channel, ava-rules]
---

# Ep9 "AVA: The Last Train — Part 2" — brief

Short 9:16, 62.0 s, inglés, segunda persona. Parte 2 del ep4 (`pieces/zombie-04-subway`, v6 aprobado), adaptada de la parte 2 del reel "Subway" de play.malo (`fuentes/zombie-nicho/playmalo-subway-p2.md`): todo parafraseado, Ava, look PS1/RE.

## Qué se reusó
- **Motor:** copia de `zombie-04-subway/engine` (main.js, fx.js, refont.js, film.js). `lib.js`, heroína y caras del ep7; cara `scared` con `sets/avaface.js` (ep8). Modelo y texturas de Ava sin tocar.
- **Decorado:** `engine/sets/subway2.js` copia el andén MERCY STREET del ep4 (azulejo, vías, reja EXIT con candado, cabina, reloj, vagones foto→loft, la criatura de dos ojos separados).
- **Voz:** scripts del ep7 (`gen.py → pick.py → prep.py → assemble.py → fix_words.py → fix_caps.py → build_cues.py`). "Oh, fudge" = toma del ep1.
- **Final:** menú RE del ep6 (WHAT DO YOU DO? / COMMENT 1 OR 2 / FOLLOW FOR MORE!), sin subtítulos encima.

## Nuevo (hecho en código)
- Sonrisa de la criatura: media luna de 26 cm con dientes, más ancha que la cara; se estira en "wide".
- Interior del vagón: asientos azules, barras, ventanas, puertas con vidrio que corren, anuncios, tiras de luz, luz de emergencia, pantalla.
- Túnel: vía doble con cambio de vía y señal, y el túnel desconocido (ladrillo, lámparas rojas enjauladas, cartel viejo con letras caídas).
- Pantalla "WELCOME TO THE LAST STOP" con contador y botones LEAVE (rojo, "Exit the train") / STAY (blanco, "Remain on board").
- Rebobinado: glitch sobre YOU DIED y la rama STAY hacia atrás con capa VHS (REW, tracking, contador).
- YOU DIED rojo desde el primer cuadro.

## Reglas de plantilla aplicadas
- Clips que se reproducen UNA vez (kneel, push_door, attack2 con sus dos golpes); solo idle/run/walk en ciclo.
- Sin parpadeo del suelo: cámaras con near 0.1 y `polygonOffset` en las capas sobre el piso.

## Estado
- Checkpoint 1: storyboard `storyboard_v1.png`. Audio (SFX Freesound CC0 con earshot, música por LUFS, gancho 0-10 s, −14 LUFS) y render final después de la aprobación.
