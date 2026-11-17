---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, majestic-stories, parte2, remake-transformado, capos, patrona, nayarit, mexcaltitan, pulsera]
relatedTo: [pulsera-mexcaltitan, atrium-vista]
---
# La Pulsera del Estero · Parte 2

Continúa `pieces/pulsera-mexcaltitan`. La Parte 1 terminó con el giro: "Mírala bien, Arsenio. La que corriste es tu hija", la nuera Tamara lo sabía ("Contigo hablo después") y la lancha de las seis esperando con el motor encendido. Aquí: desenlace del giro (por qué Herlinda se fue y qué sabía Tamara) y castigo. Diálogos, detalles y CTA nuevos.

Marca **MAJESTIC STORIES**, la misma de la Parte 1 (edit.py, BRAND = "MAJESTIC", SPEED = 1.15). No entra en la rotación. Sin Navidad.

Son 28 clips hablados de dos frases cortas (el CTA de 10 s), 1 inserto i01 y 3 mudos r*: 32 clips. 366 palabras. El montaje apunta a 1:40-2:00 (con la aceleración de 1.15) y a 2 s o menos por tramo.

**Título:** Hace 24 años corrió del muelle a la mamá de su hijastra… y hoy la patrona la subió a la misma lancha 😳 | La Pulsera del Estero · Parte 2

## Premisa
Gancho (0-2 s), con recordatorio: en el muelle, al caer el sol, la patrona le dice a su hijo: "Ya dieron las seis, Arsenio. Y tu lancha te está esperando." Arsenio: "Yo no sabía que tenía una hija." Eustolia: "No sabías porque nunca preguntaste. Igual que hoy, que ni su nombre le preguntaste."

Desenlace del giro: Maura cuenta que su madre vino a este muelle hace veinticuatro años a decírselo y "una señora rubia no la dejó llegar con usted". Eustolia: "En esta isla nomás hay una." Tamara lo niega; Maura: "Usted le dijo que Arsenio no quería saber nada de ella." Arsenio: "¿Y la subiste a la lancha de las seis?" Tamara: "Yo te quería para mí." Arsenio: "Me quitaste a mi hija. Y hoy casi la corro yo también." Tamara: "Tú tampoco la buscaste."

Castigo, el plazo de la P1 al revés: "Tamara, la lancha de las seis ya tiene pasajera. Y eres tú." Tamara: "¿Me va a correr como a una arrimada?" Eustolia: "Así corriste tú a Herlinda. Y no vuelvas a pisar mi isla." Tamara amenaza a Maura ("Esta isla no te quiere"), suelta el abanico y camina a la lancha; voltea fría (gancho para el final). Arsenio se queda, pero ya no manda en el muelle: manda Maura, y mañana a las cinco remienda redes, como las remendaba Herlinda.

Reconocimiento: "No me digas señora, mija. Dime abuela. Y a mi familia nadie la tira al agua." Arsenio: "Déjame ganarme que me digas papá." Maura: "Eso se gana remendando redes." Eustolia: "Esta noche cenamos los tres. Y los tamales los traes tú, Arsenio." BLACK y CTA de Maura a cámara.

## Qué cambia respecto a la P2 de Atrium (Amparo, "El traidor estaba en su propia casa") y a la P1
| Atrium P2 / medalla-mezcal-p2 | pulsera-mexcaltitan-p2 |
|---|---|
| El traidor de la casa entrega a la familia al capo rival | La nuera no traicionó por poder: corrió a la madre de Maura del muelle hace 24 años para quedarse con Arsenio |
| Castigo con hombres armados | Castigo con el plazo de la P1: Tamara se va en la lancha de las seis; Arsenio pierde el muelle y remienda redes |
| El heredero recibe el poder | Maura manda en el muelle y la patrona le pide "dime abuela" |
| CTA de la patrona | CTA de Maura: "¿Ustedes perdonarían a un papá que llegó veinticuatro años tarde?" |

Los CTA de las P1 eran "¿Qué harían ustedes con un hijo así? Déjame tu me gusta y sígueme, que la segunda parte viene fuerte." (pulsera) y "¿Ustedes creen que Lisandro le va a creer a su madre?…" (jipi). El de esta parte y el de jipi-becal-p2 son distintos entre sí. Ninguna frase de lines.json está en el lines.json de otra pieza (chequeo automático).

## Personajes
Las 4 hojas de personaje y la locación de la Parte 1, copiadas a chars/ (se resuben con `make_sheets.py --reupload`, que salta las carpetas pulsera-mexcaltitan* en el control de duplicados). Sin hojas nuevas: no hay personajes nuevos (Herlinda Graciano solo se nombra). Misma ropa que en la Parte 1.
| Hoja | Quién | Aspecto fijo |
|---|---|---|
| EUSTOLIA_LOMELI | Eustolia, 72, la patrona del estero | pelo plateado en chongo bajo con flor de tulipán roja tras la oreja derecha, arracadas de oro, vestido azul marino con bordado blanco |
| ARSENIO_LOMELI | Arsenio, 47, su hijo, padre de Maura | robusto, barba negra corta, camisa de lino blanca medio desabotonada, pantalón caqui, anillo de oro en la mano derecha |
| TAMARA_LOMELI | Tamara, 44, mujer de Arsenio (villana de esta parte) | rubia platinada ondulada a los hombros, lentes de sol en la cabeza, vestido rosa mexicano sin mangas, pulseras de oro, abanico de palma en la mano derecha |
| MAURA_GRACIANO | Maura, 24, la nieta (CTA) | pelo negro ondulado largo y suelto, blusa turquesa deslavada, falda larga blanca, pulsera de chaquira azul y amarilla con un venado en la muñeca IZQUIERDA |

Locación: LOC_MUELLEMEXCAL, al atardecer (sigue la escena de la P1). Geografía fija: Arsenio y Tamara a la DERECHA, del lado de tierra junto a la fonda (Arsenio a la izquierda de Tamara); Maura y Eustolia a la IZQUIERDA, del lado del agua (Maura en la orilla, Eustolia a su derecha). La lancha de las seis (blanca con franja azul) espera al final del muelle.

Utilería, una de cada una: pulsera de chaquira (muñeca IZQUIERDA de Maura), lancha blanca con franja azul y motor fuera de borda, abanico de palma (Tamara, se le cae en i01).

Sin armas, sangre, cifras de dinero ni deudas. Sin uniformes ni niños. Edades adultas en número en los prompts (72, 47, 44, 24).

## Encuadres (copia de costal-cuyutlan)
31 planos con gente + 1 inserto: 17 OTS (55 %), 7 single (23 %: confesión de Arsenio, reacciones, llanto, emoción de Maura, Tamara yéndose, CTA), 4 two-shot (13 %) y 3 de grupo (10 %). El que sale de espaldas va con su @{ASSET} y su ropa vista desde atrás. Cada OTS/two/grupo tiene su respaldo single (intentos 4-6 o `--one`).

## Diálogo (lines.json, fuente única)
| clip | quién | encuadre | frases |
|---|---|---|---|
| c01 | Eustolia | OTS (Arsenio de espaldas, der.) | "Ya dieron las seis, Arsenio." / "Y tu lancha te está esperando." |
| c02 | Arsenio | OTS (Eustolia, izq.) | "Amá, yo no sabía que tenía una hija." / "Se lo juro, nunca supe nada." |
| c03 | Eustolia | OTS | "No sabías porque nunca preguntaste." / "Igual que hoy, que ni su nombre le preguntaste." |
| c04 | Maura | OTS (Arsenio, der.) | "Mi mamá vino a decírselo a este muelle." / "Hace veinticuatro años, señor." |
| c05 | Arsenio | single | "Herlinda se fue de la isla sin avisarme." / "Nunca más supe de ella." |
| c06 | Maura | two-shot | "Se fue porque la corrieron." / "Una señora rubia no la dejó llegar con usted." |
| r1 | — | single | mudo: a Tamara se le para el abanico y da un paso atrás |
| c07 | Eustolia | OTS (Tamara, der.) | "¿Una señora rubia, Tamara?" / "En esta isla nomás hay una." |
| c08 | Tamara | OTS (Eustolia, izq.) | "Suegra, eso pasó hace mucho." / "Esa muchacha está inventando." |
| c09 | Maura | two-shot | "Mi mamá me lo contó llorando." / "Usted le dijo que Arsenio no quería saber nada de ella." |
| c10 | Arsenio | two-shot (con Tamara) | "¿Tú le dijiste eso a Herlinda?" / "¿Y la subiste a la lancha de las seis?" |
| c11 | Tamara | OTS (Arsenio, izq.) | "Yo te quería para mí, Arsenio." / "Esa remendadora te iba a quitar de mi lado." |
| c12 | Arsenio | OTS (Tamara, der.) | "Me quitaste a mi hija, Tamara." / "Y hoy casi la corro yo también." |
| c13 | Tamara | OTS | "Tú tampoco la buscaste, Arsenio." / "No me eches toda la culpa a mí." |
| c14 | Maura (llanto) | single | "Mi mamá lo esperó toda la vida." / "Hasta el último día lo esperó." |
| c15 | Eustolia | grupo (los cuatro) | "Tamara, la lancha de las seis ya tiene pasajera." / "Y eres tú." |
| c16 | Tamara | OTS (Eustolia, izq.) | "¿Me va a correr como a una arrimada?" / "Llevo veinte años en esta familia." |
| c17 | Eustolia | OTS (Tamara, der.) | "Así corriste tú a Herlinda." / "Y no vuelvas a pisar mi isla." |
| c18 | Tamara | OTS (Maura, izq.) | "Disfrútalo mientras dure, muchacha." / "Esta isla no te quiere." |
| i01 | — | inserto | la mano con pulseras de oro deja caer el abanico de palma en los tablones |
| r2 | — | single | mudo: Tamara camina sola hacia la lancha de las seis y voltea, fría |
| c19 | Arsenio | OTS (Eustolia, izq.) | "¿Y yo, amá?" / "¿También me subo a esa lancha?" |
| c20 | Eustolia | grupo (los tres) | "Tú te quedas, pero en este muelle ya no mandas." / "Desde hoy, aquí manda Maura." |
| c21 | Eustolia | OTS (Arsenio, der.) | "Y mañana a las cinco remiendas redes." / "Como las remendaba Herlinda." |
| c22 | Maura | two-shot (con Eustolia) | "¿Yo, mandar en el muelle, señora?" / "Si yo nomás vendía tamales." |
| c23 | Eustolia | OTS (Maura, izq.) | "No me digas señora, mija. Dime abuela." / "Y a mi familia nadie la tira al agua." |
| c24 | Maura | single | "Toda la vida quise tener una abuela." / "Mi mamá nunca me dijo que era usted." |
| c25 | Arsenio | OTS (Maura, izq.) | "Maura, sé que no merezco nada." / "Pero déjame ganarme que me digas papá." |
| c26 | Maura | OTS (Arsenio, der.) | "Todavía no le digo papá, señor." / "Eso se gana remendando redes." |
| r3 | — | single | mudo: Arsenio asiente con los ojos húmedos |
| c27 | Eustolia | grupo (los tres) | "Esta noche cenamos los tres en mi casa." / "Y los tamales los traes tú, Arsenio." |
| BLACK | — | — | 0,4 s |
| c28 | Maura (CTA a cámara: sonrisa cómplice, pausa, ceja, toca la pulsera, se acomoda el pelo, ladea la cabeza, asiente) | single | "¿Ustedes perdonarían a un papá que llegó veinticuatro años tarde?" / "Escríbeme qué harías tú y sígueme para ver el final." |

28 clips hablados, 4 mudos, 366 palabras.

## Montaje
- Sin plano abierto ni de objetos: c01 arranca con Eustolia ya hablando y "Ya dieron las seis, Arsenio" entra antes de los 2 s.
- Corte al terminar cada frase. Mismo personaje con frases seguidas = salto dentro de sus clips (c20-c21 Eustolia). Reacciones de 1,0-1,2 s solo donde cuentan algo (r1-r3).
- Música MAJESTIC: golpe sutil en el frame 0, suspenso hasta c22, cálida de c22 a c27 ("dime abuela", la cena de los tres), suspenso en el CTA. BLACK de 0,4 s antes del CTA. SPEED = 1.15.
- El CTA no nombra a nadie ("un papá"): se entiende por el video.
- Pronunciación a vigilar: "Herlinda", "Arsenio", "Tamara", "remendadora", "remiendas", "veinticuatro", "arrimada".
- QA: la pulsera siempre en la muñeca IZQUIERDA de Maura; Arsenio barbado de camisa blanca, Tamara rubia de rosa con abanico (hasta i01), la flor roja de Eustolia; la lancha blanca con franja azul; Arsenio y Tamara a la derecha, Maura y Eustolia a la izquierda; sin dobles en los bordes.
