---
type: spec
status: active
tags: [zombie-channel, ava-restfield, ava-day-1, police-station, shotlist]
relatedTo: [zombie-channel, ava-rules]
---

# Ep3 — "AVA: DAY 1 — The Police Station" (shot list)

Formato nuevo (análisis del nicho en `fuentes/zombie-nicho/`): historia en 2ª persona, datos reales, guiños de Resident Evil
(RE1/RE2: comisaría estilo RPD, puerta de carga, máquina de escribir, pantalla ITEM, FILE, menú YES/NO) y decisión final.
Sin referencia de vídeo. 9:16, 360x640 ×3, 67.6 s. Tiempos globales en s; palabras exactas en `engine/timeline.json`.

## Mundo
Comisaría vieja de ciudad americana, de noche, lluvia. Vestíbulo principal (estilo hall de la RPD): suelo de baldosas a
cuadros, mostrador de recepción de madera, columnas, bancos, una puerta de rejas (gate) cerrada con candado al fondo, y
**puertas delanteras de cristal** (dos hojas con marco metálico + cristaleras a los lados) que dan a la calle con lluvia,
patrullas abandonadas con las luces apagadas. Luces del vestíbulo APAGADAS (regla 1): luz azul de luna/farolas desde la
calle a través del cristal + linterna/flexo tenue. Al final (17) se encienden todas (fluorescentes, cálido-blanco).
Detalle RE: pots de hierba verde/roja, un First Aid Spray en el mostrador, cartel "R.P.D."-like = "CITY POLICE" (no usar RPD/Raccoon),
tablón de anuncios, banderas, extintor.

## Planos
| id | t0 | voz | qué se ve | set |
|---|---|---|---|---|
| 01_ext | 0.0 | "Zombies took the city at nine…" | Exterior de noche, lluvia: fachada de la comisaría (escalones, puertas de cristal, letrero CITY POLICE), 2-3 zombis caminando por la calle, patrulla abandonada con la puerta abierta. Cámara baja que avanza lento. Texto a máquina arriba "DAY 1" / "9:02 PM" (Courier, una tecla por letra, como la tarjeta final del ep1/2). | ext |
| 02_hall | 2.55 | "…and you're locked inside the old police station." | Vestíbulo oscuro: Ava cierra el candado de la reja (turn_key) y se gira. HUD aparece de golpe (film.js). | hall |
| 03_safe | 5.2 | "Sounds like the safest place in town…" | Ava frontal a cámara, plano medio, gesto confiado (hands_on_hips / smug, sonrisa); detrás el mostrador y las columnas. | hall |
| 04_isnt | 7.6 | "…it isn't." | Contraplano: las puertas de cristal desde dentro; fuera, 3 zombis pegados al cristal con las manos (manos del modelo), el cristal tiembla (solo el cristal) en cada golpe. HUD → CAUTION. | hall |
| 05_radio | 9.35 | "The radio says help arrives in seven days. Lights off. Gate locked. Open for no one." | Primer plano: radio de policía en el escritorio (luz roja, dial verde), onda; panel FILE de RE a la derecha: "EMERGENCY BROADCAST / HELP ARRIVES IN 7 DAYS", y las 3 reglas una por una en su palabra: "1. LIGHTS OFF" (lights), "2. GATE LOCKED" (gate), "3. OPEN FOR NO ONE" (open). | rooms |
| 06_door | 13.5 | "Good news…" | Pantalla de carga de puerta de RE: negro, una puerta de madera pesada en 3D que se abre despacio hacia la cámara (la cámara avanza al hueco oscuro). | screens |
| 07_armory | 15.3 | "…you found the armory." | Armería: estanterías y taquillas metálicas VACÍAS, soportes de rifles vacíos, una sola caja de munición; Ava entra con la linterna, mira a cámara (shrug). | rooms |
| 08_item | 17.2 | "Bad news… one pistol. Fifteen bullets." | Pantalla ITEM (como 08_examine del ep2): maletín con casillas casi vacío; pistola (models/pistol-retro.glb) girando en EXAMINE "HANDGUN" con contador "15" en verde; en "fifteen" el 15 parpadea. | screens |
| 09_cooler | 21.0 | "But bullets aren't what gets you first… water is. You need one gallon a day." | Ava junto a un dispensador de agua de oficina (garrafa azul de 5 gal); en "water" zoom a la garrafa; etiqueta "1 GALLON / DAY" en "gallon" (dato FEMA). | rooms |
| 10_math | 25.75 | "The water cooler has five. Four toilet tanks… six more. Eleven days. Help comes in seven." | Diagrama/ITEM de provisiones: icono garrafa "5 GAL" (five), 4 cisternas de váter "4 × 1.6 GAL" (four toilet tanks), "+6" (six), total "= 11 DAYS" en verde (eleven), y debajo "HELP: 7 DAYS" (seven) con un ✓. | screens |
| 11_lobby | 30.85 | "And the front doors? Glass. So you never, ever go near the lobby." | Vestíbulo hacia las puertas de cristal (sin zombis ahora, lluvia fuera); etiqueta "GLASS" en "glass" con línea al cristal; zona del vestíbulo marcada con una X roja / "NEVER" en "never". | hall |
| 12_save | 34.2 | "You save your game. Day one… two forty-seven A.M." | Sala segura: máquina de escribir verde sobre una mesa, baúl de objetos, hierba en maceta, luz cálida de flexo (la única). Ava teclea. Pantalla RE: "Will you save your game?" > YES; luego hoja que se escribe a máquina "DAY 1 — 2:47 AM" (una tecla por letra) y "INK RIBBON ×2". | rooms |
| 13_knock | 38.6 | "At three fourteen… someone knocks on the glass." | Reloj de pared (o despertador digital) marcando 3:14; corte en "someone" a las puertas de cristal: una silueta de policía (gorra) detrás del cristal mojado, contraluz de farola, faros de una patrulla apagados; golpes en "knocks" (solo el cristal tiembla). HUD → CAUTION. | hall |
| 14_cop | 42.9 | (POLICÍA) "Police department. We're evacuating the block. Open the door." | Plano desde dentro, cerca del cristal: el policía (uniforme azul oscuro, gorra, placa) con la cara en sombra bajo la visera, golpea con los nudillos; Ava de espaldas en primer término. | hall |
| 15_log | 46.7 | "Then you check the duty log. Every officer on shift tonight… status: lost." | Pantalla FILE de RE: hoja "DUTY LOG — NIGHT SHIFT"; lista de 6 agentes con su estado; en "lost" se estampan "LOST" en rojo en cada línea. La línea "B. VICKERS" la última. | screens |
| 16_badge | 51.85 | "Including Officer Vickers." | Primer plano de la placa del policía tras el cristal: "VICKERS" (en "Vickers"); la cara se ilumina por un relámpago: piel gris de zombi, ojos blancos. HUD → DANGER. | hall |
| 17_lights | 54.0 | "He's still knocking. Then every light in the station turns on… by itself." | Vestíbulo: el cristal tiembla (knocking); en "light" se encienden los fluorescentes fila a fila hacia la cámara (clac-clac), todo iluminado; Ava se gira sorprendida. | hall |
| 18_fudge | 58.9 | "Oh, fudge." | Ava frontal, cara de "oh no" (surprised/ shocked → sonrisa nerviosa), luz blanca encima. | hall |
| 19_choice | 60.7 | "Do you open the door? Comment yes or no… most comments decide Day two." | Menú RE sobre negro (o sobre el vestíbulo oscurecido): "DO YOU OPEN THE DOOR?" con "YES  NO" y cursor amarillo que alterna en "yes"/"no"; en "comment" aparece "COMMENT ↓"; en "most" texto a máquina "DAY 2 — YOU DECIDE."; a 65.2 "FOLLOW AVA RESTFIELD!" (bitText sc 2). | screens |
