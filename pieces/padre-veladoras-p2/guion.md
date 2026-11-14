---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, majestic-stories, parte2]
relatedTo: [padre-veladoras, atrium-novelas]
---
# Las Veladoras · Parte 2

Sigue justo después del cliffhanger de la Parte 1: Ramiro le sacó tres "sí" a Rufino, lo hizo pedir perdón y prender una por una las veladoras que apagó, y le dijo "el domingo te quiero aquí, en primera fila". El CTA preguntó "¿Ustedes creen que Rufino va a venir el domingo?". La Parte 2 abre ese domingo en el atrio, antes de misa, sin saber si viene.

**Título:** Le ordenaron venir a misa… y el padre descubrió quién le prendía las veladoras | Las Veladoras · Parte 2

**Marca:** MAJESTIC STORIES (la de la Parte 1; no entra en la rotación).

## Arco
1. **Recapitulación (1 frase):** Ramiro en el atrio: "Hace una semana, Rufino le apagó las veladoras al padre, y yo le pedí que hoy viniera a primera fila." Mauro: no hay ni una moto en la plaza.
2. **¿Viene o no?** Adentro, la primera fila sigue vacía a quince minutos de la misa. Anselmo cuenta que toda la semana alguien entró de noche a prender sus veladoras, y nunca supo quién.
3. **Pago 1:** Mauro avisa que llegaron dos motos. Entran Rufino y Chato, solos. "Usted pidió primera fila, ¿verdad?" Rufino confiesa que él prendía las veladoras, entrando por la sacristía.
4. **Pago 2 (el corazón):** su madre, doña Socorro, lo traía a esa misma iglesia y siempre se sentaba en la primera fila: "Por eso hoy quería sentarme en su lugar." Ramiro lo pone a prueba ("las palabras se las lleva el viento") y Rufino promete arreglar el techo de la sacristía con sus muchachos; Chato, pintar la barda del atrio. Anselmo: "La casa de Dios tiene albañiles nuevos." Ramiro: "Así se cumple la palabra… ve y prende la última veladora."
5. **Gancho nuevo:** al prender la última veladora, a Rufino se le sale un San Judas de plata. Ramiro se queda quieto: él mandó hacer dos iguales, uno de oro para él y uno de plata para su hermano, el que se fue al norte y nunca volvió. "¿Cómo se llamaba tu padre?" "Se llamaba Efraín."
6. **CTA:** Anselmo a cámara, con carisma: "¿Ustedes creen que Rufino es sobrino de don Ramiro? Sigan la página para ver la tercera parte, y denle me gusta." (Rufino y Ramiro se nombran muchas veces antes.)

## Personajes (hojas de la Parte 1, misma ropa)
| Asset (Flow) | Quién | Ropa (prompt) |
|---|---|---|
| ANSELMO | padre Anselmo, 55 | canoso hacia atrás, **lampiño** (QA P1: salía con barba), lentes sin montura, traje gris carbón, alzacuello, un rosario de madera rojo oscuro |
| RUFINOVIBORA | Rufino, 45 | cola de caballo, candado negro, aro, brazos tatuados, chaleco de piel café con víboras crema, camiseta negra, **una** cadena de plata con **un** San Judas ovalado de plata |
| CHATOBANDANA | Chato, 42 | bandana verde de paisley, bigote, camisa de cuadros azul, el mismo chaleco, manos vacías |
| RAMIRO | don Ramiro Salcedo, 64 | bigote blanco, **exactamente un** sombrero de fieltro café puesto, guayabera azul claro, **una** cadena de oro con **una** medalla de oro, anillo |
| MAUROESCOLTA | Mauro, 40 | barba recortada, aviadores, traje azul marino, camisa blanca, **manos vacías, sin armas** |

Hoja de contactos de chars/ revisada (2026-11-05): los 9 jpg muestran a la persona o el lugar correcto y los md5 son distintos. En la Parte 1 Flow corrió las imágenes un nombre; las malas (RUFINO, CHATO, MAURO, LOC_PARROQUIA, LOC_MIRADOR) quedaron en ../padre-veladoras/chars/mal y **no se usan ni se copiaron**. LOC_TERRAZA se copió, pero la Parte 2 no la usa.
Locaciones: LOC_TEMPLO (nave, domingo temprano antes de misa, sin feligreses), LOC_ATRIO (plaza, sin motos, una sola camioneta negra). Utilería: PROP_VELADORAS (candelero de veladoras a la DERECHA junto al barandal), un solo cerillo largo, un solo San Judas de plata. **Ninguna hoja nueva.**

**Geografía fija.** Nave: el candelero de veladoras y Anselmo siempre a la DERECHA. Bloque A (c04–c08): Ramiro a la IZQUIERDA en el pasillo; en sus planos, Anselmo de espaldas en el borde derecho. r1: Ramiro pasa a la primera banca de la DERECHA. Bloque B (desde r2): Rufino y Chato a la IZQUIERDA; en los planos de Rufino, Ramiro o Anselmo de espaldas en el borde DERECHO; en los de Ramiro y Anselmo, Rufino de espaldas en el borde IZQUIERDO. Atrio: Ramiro a la IZQUIERDA, Mauro a la DERECHA junto a la camioneta. Los bordes van con su `@{ASSET}` y su ropa (ANS_B, RUF_B y RAM_B en clips.py).

Política: sin niños (doña Socorro y el padre de Rufino solo se mencionan, no hay flashback y la iglesia está sin feligreses), sin dinero ni bancos (la promesa es trabajo con las manos: techo y barda), sin señalar con el dedo (manos abiertas, gestos con la cabeza), sin armas (Mauro con las manos vacías, ningún grupo de hombres en cuadro), verbos suaves (camina despacio, asiente, se queda quieto). Prevención de fallos Omni (qa_clips.md de agua-hacienda-p2, medalla-mezcal-p2, reten-sierra-p2 y hacienda-sangre-p2): NOSUB al final de cada diálogo, "says each sentence only once", un solo sombrero, sin gafetes ni letras en la ropa, utilería única (un cerillo, una medalla de plata en Rufino y una de oro en Ramiro, sin listón) y nadie aparece de golpe (en r2 entran caminando desde el fondo).

Palabras a vigilar: "Anselmo", "Rufino", "Ramiro", "veladoras", "sacristía", "doña Socorro", "albañiles", "San Judas", "Efraín". Se evitó la j donde se pudo (sin "hijo", "dijo", "dejar", "ojos", "lejos"; "dijo" pasa a "pidió" y "me dijo" a "me contó").

## Planos
PG = plano general · PM = plano medio · PP = primer plano · SH = sobre el hombro · det = detalle

| # | plano | quién | línea / acción | clip |
|---|---|---|---|---|
| **1. Domingo en el atrio: ¿viene o no? (recap)** |||||
| 1 | PM, atrio | RAMIRO | "Hace una semana, Rufino le apagó las veladoras al padre, y yo le pedí que hoy viniera a primera fila." / "¿Ya llegó, Mauro?" | c01 |
| 2 | PP, atrio | MAURO | "Todavía no, patrón. No hay ni una moto en la plaza." / "Esa gente no sabe cumplir su palabra." | c02 |
| 3 | PP, atrio | RAMIRO | se acomoda el sombrero: "Ya veremos, Mauro." / "Tú espera aquí afuera. Yo voy con el padre." | c03 |
| **2. La primera fila vacía y las veladoras de noche** |||||
| 4 | PP SH | ANSELMO | prende una veladora con un cerillo: "Buenos días, Ramiro." / "Llegaste antes que todos." | c04 |
| 5 | PP SH | RAMIRO | "Buenos días, padre." / "Faltan quince minutos para la misa, y la primera fila sigue vacía." | c05 |
| 6 | PP | ANSELMO | "Hay que tenerle fe, Ramiro." / "Toda la semana, alguien vino de noche a prender mis veladoras." | c06 |
| 7 | PP | RAMIRO | "¿De noche? ¿Quién?" / "Si la iglesia se queda cerrada desde las ocho." | c07 |
| 8 | PP | ANSELMO | "Cada mañana las encontraba prendidas, una por una." / "Y nunca supe quién era." | c08 |
| 9 | PM | RAMIRO | mudo: se pasa a la primera banca de la DERECHA, pensativo | r1 |
| **3. Llega Rufino (pago)** |||||
| 10 | PM, puerta | MAURO | "Patrón, acaban de llegar dos motos." / "Y no viene nadie más con ellos." | c09 |
| 11 | PG | RUFINO + CHATO | mudo: entran caminando por el pasillo central, del lado IZQUIERDO, sin nadie más | r2 |
| 12 | PM | CHATO | "Buenos días, padre." / "Este no durmió en toda la noche por llegar temprano." | c10 |
| 13 | PP SH | RUFINO | "Buenos días, don Ramiro." / "Usted pidió primera fila, ¿verdad?" | c11 |
| 14 | PP SH | RAMIRO | "Llegaste, Rufino." / "La verdad, no pensé que fueras a cumplir." | c12 |
| 15 | PP | RUFINO | "Yo tampoco, señor." / "Pero aquí estoy, y nada más me traje al Chato." | c13 |
| 16 | PP SH | ANSELMO | "Rufino, ¿tú fuiste el que prendió mis veladoras?" / "¿Todas las noches?" | c14 |
| 17 | PP | RUFINO | mudo: baja la mirada y asiente despacio | r3 |
| 18 | PP SH | RUFINO | "Sí, padre. Entraba por la puerta de la sacristía." / "No quería que nadie me viera." | c15 |
| 19 | PP | ANSELMO | "¿Y por qué de noche, Rufino?" / "Yo te abría la puerta a cualquier hora." | c16 |
| **4. Doña Socorro y la primera fila (cama cálida)** |||||
| 20 | PP | RUFINO | "Porque me daba pena, padre." / "Mi madre me traía a esta misma iglesia, y aquí prendía sus veladoras." | c17 |
| 21 | PP | ANSELMO | "Tu madre era doña Socorro." / "Siempre se sentaba en la primera fila." | c18 |
| 22 | PP | RUFINO | mano en el respaldo de la primera banca: "Sí, padre. Ahí mismo." / "Por eso hoy quería sentarme en su lugar." | c19 |
| 23 | PP | RAMIRO | mudo: se le ablanda la cara, asiente | r4 |
| 24 | PP SH | RAMIRO | "Las palabras se las lleva el viento, muchacho." / "¿Qué más vas a hacer por esta parroquia?" | c20 |
| 25 | PP SH | RUFINO | "El techo de la sacristía tiene goteras, señor." / "Los muchachos y yo lo vamos a arreglar con nuestras manos." | c21 |
| 26 | PM | CHATO | "Y el sábado pintamos la barda del atrio, padre." / "Ya les avisé a todos." | c22 |
| 27 | PP | ANSELMO | "Entonces la casa de Dios tiene albañiles nuevos." / "Siéntense, que ya va a empezar la misa." | c23 |
| 28 | PP | RAMIRO | "Así se cumple la palabra, Rufino." / "Ve y prende la última veladora, que esa te toca a ti." | c24 |
| **5. Gancho nuevo: el San Judas de plata** |||||
| 29 | det | RUFINO | la mano tatuada prende la última veladora; el San Judas de plata se sale de la camiseta y se mece con la luz | i1 |
| 30 | PP | RAMIRO | mudo: ve la medalla, se le borra la sonrisa, se queda quieto | r5 |
| 31 | PP SH | RAMIRO | "Rufino, espérate." / "¿De dónde sacaste ese San Judas de plata?" | c25 |
| 32 | PP | RUFINO | sostiene el San Judas entre dos dedos: "Era de mi padre, don Ramiro. Nunca lo conocí." / "Mi madre me lo dio antes de irse con Dios." | c26 |
| 33 | PP | RAMIRO | se toca su propia medalla de oro: "Yo mandé hacer dos iguales." / "Uno de oro para mí, y uno de plata para mi hermano." | c27 |
| 34 | PP | ANSELMO | "Ramiro, ¿el de tu hermano?" / "¿El que se fue al norte y nunca volvió?" | c28 |
| 35 | PP | RAMIRO | "Rufino, contéstame una cosa." / "¿Cómo se llamaba tu padre?" | c29 |
| 36 | PP SH | RUFINO | "Mi madre nada más me contó su nombre, y que se fue al norte antes de que yo naciera." / "Se llamaba Efraín." | c30 |
| 37 | PP | RAMIRO | mudo: ojos muy abiertos, la mano en su medalla de oro (fundido a negro) | r6 |
| **6. CTA** |||||
| 38 | negro | — | 0,4 s | BLACK |
| 39 | PP a cámara | ANSELMO | con carisma: asiente, ladea la cabeza, sonríe, se acomoda los lentes, gesticula con el rosario: "¿Ustedes creen que Rufino es sobrino de don Ramiro?" / "Sigan la página para ver la tercera parte, y denle me gusta." | c31 |

62 frases, 451 palabras, unos 220–235 s de voz en bruto (38 clips: 31 hablados de 6–10 s, 6 reacciones mudas y 1 detalle).

## Montaje
- Sin plano abierto: arranca con Ramiro hablando en el atrio (recap). Golpe sutil en el frame 0 y cama de suspenso.
- Música: suspenso 0 → c17, cálida c17 → i1 (doña Socorro, la primera fila, la promesa), suspenso i1 → fin (el San Judas, Efraín, CTA). Cama baja, la voz manda.
- Corte solo al terminar cada frase; el mismo personaje se queda en su plano (salto dentro del clip). r1–r6 e i1 van solo porque cuentan algo (ganancia 0).
- Negro de 0,4 s antes del CTA. Marca MAJESTIC STORIES arriba al centro (22 px, alpha 80, y=135). Sin CONTINUARÁ.
