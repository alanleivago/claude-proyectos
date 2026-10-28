---
type: plan
status: draft
tags: [digger, digger-03, storyboard, the-lock, cerradura, thief, pin-tumbler, mechayuki]
relatedTo: [mechayuki-rules, digger-02-toilet, digger-channel, guion]
---

# Digger 03: The lock — storyboard v1 (pendiente de aprobación)

- **Tablero:** `storyboard_v1.png` tiene el still central de los 27 planos. Inicio, mitad y final de cada uno están en `review/sb/`.
- **Style frames:** `review/style/` (`styleframe_opening.png`, `styleframe_thief.png`, `styleframe_thief_picking.png`, `styleframe_pin_tumbler.png` y la tira `styleframes.png`).
- **Tiempos provisionales:** aún no hay voz. `tools/fake_timeline.py` calcula los tiempos desde `guion.md` y da ~100 s, un poco lento. Con el ritmo real de megagirl (ep 02: 2,35 palabras/s), 221 palabras salen a ~94 s de voz más 2,6 s de outro. Todos los planos se reajustan solos con la voz real (`prep_timeline.py`).
- **Comentario de Mia:** palabras 80–91 de 221, es decir, 36–41 %. En pantalla cae en el plano #11.
- **Motor:** `engine/film.js` reutiliza todos los helpers y sets del ep 02: pueblo, buzón, calle, taller, laboratorio, NPC de `lib-mml` y FX.

## Inicio y final (regla: nunca el mismo sitio ni el mismo plano)
- **Inicio (#1–#2):** a las afueras del pueblo, en la excavación de una verja de hierro enterrada con cadena y candado oxidado. El primer panel va lleno: barriles y cajas con nieve, valla, farola, pinos, perro, halcón y relieves.
  - #1: contrapicado medio mientras cava; en "artifact" la pala choca con el candado.
  - #2: plano 3/4 alto. Ella levanta el candado y aparece el HUD ARTIFACT 003.
- **Final (#25–#27):** delante de **su casa** en el pueblo, con la puerta roja con cerradura de cilindro, el farol y la ventana encendida. Es otro sitio y otro encuadre.
  - #25: la llave de madera junto a la llave plana.
  - #26: ella se encoge de hombros y el ladrón pasa de puntillas por detrás (gag).
  - #27: echa la llave, saluda, y la grúa se aleja. El outro va encima.

## Planos
| # | inicio prov. (s) | tr. | línea | set / plano | acción · cara | el mundo reacciona / FX | rótulo |
|---|---|---|---|---|---|---|---|
| 1 | 0,0 | — | Operator… I dug up another human artifact. | excavación de la verja, contrapicado medio, atrezo completo | `dig` → `surprised`; happy → surprised → hearts | el hoyo crece en cada palada, la nieve vuela al montón, *clang* en el candado con impacto, "!", destellos, el halcón pasa | — |
| 2 | 3,8 | C | Humans called it… a lock. | 3/4 alto, primer plano | `hold_up_object` con el candado; surprised → hearts | caja HUD, destellos, corazones | SCANNING → ARTIFACT 003 |
| 3 | 6,3 | M | If you roll a rock against your door… you have a lock. | cabaña de piedra en el pueblo | empuja la roca (**NUEVA `push_heavy`**; provisional `carry_heavy`) | la roca rueda hasta la puerta, polvo de nieve, sudor, impacto en "lock" | — |
| 4 | 11,2 | M | But now you can't get out either. | dentro de la cabaña, con luz por las rendijas | empuja la puerta, que no se mueve (provisional `pump`); angry → sad | golpes en la puerta, sudor, marca de enfado, impacto | — |
| 5 | 14,1 | M | So humans put a wooden bar across the door. | dentro, 3/4 | baja la tranca a los soportes (**NUEVA `lift_bar`**; provisional `hold_up_object`) | la tranca cae y suelta polvo | — |
| 6 | 17,9 | C | This is a bolt. | punch-in a la puerta atrancada | — | destellos | **BOLT** |
| 7 | 19,6 | M | But from the outside… anyone could slide it open. | dentro | ella lo ve; open → shocked/bigShock | un palo entra por la rendija y desliza la tranca; flecha, "!" | — |
| 8 | 24,3 | M | Four thousand years ago, wooden pins dropped into the bolt and locked it. | almacén antiguo (arenisca, friso pintado, antorchas, ánforas) | `think` → surprised | los pasadores de madera caen al cerrojo; calor de las antorchas | 4000 YEARS AGO |
| 9 | 29,9 | C | A wooden key with pegs lifted them out. | **diagrama 2D** del cerrojo de madera (panel de pergamino) | — | entra la llave de tacos, los pasadores suben y el cerrojo se desliza | PINS · KEY · BOLT |
| 10 | 32,9 | C | This is a pin lock. | ella con la llave tipo cepillo de dientes | `hold_up_object`; happy | destellos en la llave | **PIN LOCK** |
| 11 | 34,9 | M | Operator Mia asks: "Why do keys have little teeth?" | buzón | `phone_look` con la carta | pegatina de TikTok de operator_mia, "?", punch-in en "Why" | comentario |
| 12 | 39,0 | C | Mia… keep watching. | primer plano | `smug` y guiño | destello | — |
| 13 | 40,7 | M | The Romans made locks out of metal… with keys so small they wore them as rings. | sala romana (piedra, columnas, cofre con flejes de bronce) | `hold_up_object` con la llave-anillo | destellos; punch-in a la llave-anillo en "rings" | BRONZE + IRON |
| 14 | 47,4 | M | But someone always got in anyway. | calle de noche (gradación azul, luna) | ella espía desde una esquina (**NUEVA `peek`**; provisional `look_around`) | el ladrón cruza de puntillas con el saco; "?" | luna |
| 15 | 50,5 | C | A thief. | primer plano del ladrón | — | antifaz, gorro y camiseta de rayas; destello en el ojo | **THIEF** |
| 16 | 52,3 | C | Sneaky. | primer plano de reacción (temblor de cámara) | `surprised`; shocked/bigShock → angry/frown | "!", marca de enfado, sudor, impacto | — |
| 17 | 53,2 | M | He slid thin wires into the lock… and lifted the pins one by one. | puerta roja de lado, ladrón en la cerradura | el ladrón agachado (**NUEVA del NPC: `pick_lock`**) | las ganzúas se mueven; lupa en la que los pasadores suben de uno en uno (PIN 1…5 → OPEN!), *clicks* | PIN n / OPEN! |
| 18 | 59,4 | C | This is lock picking. | la puerta se abre | el ladrón se cuela | la puerta chirría al abrirse; destellos | **LOCK PICKING** |
| 19 | 61,2 | M | In 1851, a locksmith named Alfred Hobbs picked the famous "unpickable" lock… | Gran Exposición (arcos de hierro, techo de cristal, banderas), vitrina con el candado | ella `think`; Hobbs (NPC con chistera) en la vitrina | murmullo, destellos | **1851** · ALFRED HOBBS |
| 20 | 66,7 | C | …in fifty-one hours. | lado de la vitrina | Hobbs trabaja | timelapse día/noche, contador de 0 a 51 H, *click*, una X roja sobre "UNPICKABLE", impacto | 51 H |
| 21 | 68,3 | M | In the 1860s, Linus Yale Junior put the pins inside a small turning cylinder… with a flat key. | taller (banco del relojero, reloj, engranajes) | `present` con la cerradura de cilindro y la llave plana | destellos en la llave | LINUS YALE JR. 1860s |
| 22 | 76,1 | M | Only the right key lifts every pin to the same line… and the cylinder turns. | **diagrama 2D del pin tumbler** sobre el vacío del laboratorio | — | la llave plana entra, sus dientes empujan cada pasador rojo/azul hasta la línea amarilla y el tambor gira (flecha) | PINS · KEY · SAME LINE · TURN |
| 23 | 82,7 | C | That's why keys have little teeth. | taller, primer plano | `hold_up_object` con la llave; hearts | los dientes brillan, corazones | — |
| 24 | 85,0 | C | This is a pin tumbler. | punch-in al diagrama, ya abierto | — | destellos | **PIN TUMBLER** |
| 25 | 87,2 | M | Your front door still works like that lock from four thousand years ago. | **FINAL:** su puerta roja en el pueblo | `shrug` con la llave de madera y la llave plana | destellos en las dos llaves, nieve | 4000 YEARS |
| 26 | 92,4 | M | Humans spent four thousand years… just to keep other humans out? | misma puerta, más abierto | idle → `shrug`; half → relaxed | el ladrón pasa de puntillas por detrás y se para con "!"; "?" sobre ella | — |
| 27 | 97,5 | M | Artifact understood. Logging off. | grúa que se aleja de la puerta | echa la llave (**NUEVA `turn_key`**) y luego `wave` ×2 | *click* de la cerradura, destellos | LOGGING OFF… → MECHAYUKI, ARTIFACT 003: LOCK y FOLLOW @MECHAYUKI |

## Assets y animaciones nuevas que harán falta
**Animaciones nuevas** en `zero-fem/anim/build_anim.py`:
- `push_heavy`: empujar con las dos manos y el cuerpo inclinado, en loop (#3).
- `lift_bar`: levantar una tranca larga con las dos manos y bajarla (#5).
- `push_door`: empujar la puerta y rebotar (#4; ahora se usa `pump`).
- `peek`: asomarse desde una esquina inclinada, una mano en la pared (#14).
- `turn_key`: meter la llave, girar la muñeca y sacarla (#27).

**Ladrón:**
- Paso sigiloso de puntillas: rodillas altas, brazos encogidos (#14, #18, #26).
- `pick_lock`: agachado ante la cerradura, las dos manos con ganzúas (#17).

Opciones para el ladrón: añadir un paso procedural de puntillas al NPC de `lib-mml` o hacer un rig propio. Ahora mismo es el `bank_teller` oscurecido con antifaz, gorro, camiseta de rayas y saco, todo en código.

**Props y sets** (en código, ya hechos en versión storyboard):
- verja enterrada con candado y cadena; roca;
- cabaña de piedra y su interior con la tranca;
- almacén antiguo, cerradura de madera de pasadores y llave de tacos;
- sala romana con cofre y llave-anillo;
- Gran Exposición con vitrina y cartel UNPICKABLE;
- cerradura de cilindro y llave plana; puerta roja de su casa;
- diagramas 2D del cerrojo antiguo y del pin tumbler.

**Mejoras pendientes:**
- **Llave plana en 3D:** ahora se lee como una barra. Hay que darle volumen y el perfil de dientes visible (#21 y #23).
- **#3:** la roca la tapa a ella en parte. Hay que reencuadrar cuando exista `push_heavy`.
- **Hobbs:** distinguirlo del ladrón (otra variante de color, chaleco).
- **SFX de Freesound CC0:** ganzúa rascando, *click* de pasador, roca rodando, tranca de madera, chirrido de puerta, antorcha, murmullo de multitud, pasos de puntillas y llave girando.
- **Música:** nueva composición en el mismo estilo (music4).
- **Voz:** se generará cuando VoiceStudio esté disponible.
  - Sin "!".
  - Apertura con `pieces/voice-fx/megagirl_operator.wav` empalmado.
  - Preguntas: PSOLA en "teeth?" si hace falta, y comprobar que "…out?" suba.
