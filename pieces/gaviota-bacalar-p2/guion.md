---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, vista-stories, parte2, remake-transformado, madrastra-justicia, justicia-familiar, quintana-roo, bacalar, lanchas, hermano-traidor]
relatedTo: [gaviota-bacalar, costal-cuyutlan-p2, atrium-vista]
---
# La Gaviota de Bacalar · Parte 2

Continúa `pieces/gaviota-bacalar`. La Parte 1 terminó con Araceli llamando a Wilberto, el hermano de Saturnino, que llegó en la última lancha ("Hermano, Araceli no se va. La mitad de este muelle es mía") y con el plazo vuelto contra el padre ("¿No que antes de la última lancha? Pues ya llegó"). Aquí se arranca desde esa lancha: desenlace del giro (Wilberto le había cedido su mitad a la mamá de Ixchel) y castigo de la villana y del traidor (se van los dos en la misma última lancha). Diálogos, detalles y CTA nuevos.

Ritmo emocional del Final de la madrastra (7705499092683590942): la villana reclama lo que "también es suyo", la hija la desmiente con lo que era de su madre, escalada y amenaza, humillación devuelta, salida y reparación padre-hija. Del Final de don Evaristo (7706344565933985054, bloques 3-5) se toma la pareja que se culpa entre sí y el padre que pide perdón por no haber visto.

Marca **VISTA STORIES**, la misma de la Parte 1 (edit.py, BRAND = "VISTA", SPEED = 1.15). No entra en la rotación. Sin Navidad.

Son 23 clips hablados de dos frases cortas (el CTA de 10 s), 1 inserto y 6 mudos: 30 clips. 362 palabras. El montaje apunta a 1:30-1:50 (con la aceleración de 1.15) y a 2 s o menos por tramo.

**Título:** Su tío llegó en la última lancha a quitarle el muelle… sin saber lo que su mamá escondió en La Gaviota 😳 | La Gaviota de Bacalar · Parte 2

## Premisa
Gancho (0-2 s), con recordatorio: Wilberto en la punta del muelle, la lancha blanca recién amarrada detrás, golpeando el sobre amarillo contra la palma: "Ya llegó la última lancha, hermano. Y la mitad de este muelle es mía."

Saturnino: "Tú te fuiste a Cancún hace años." Wilberto trae los papeles y se queda con Araceli; ella, triunfal: "Ahora la que se queda soy yo." Ixchel voltea a ver La Gaviota: su mamá guardaba sus papeles debajo del asiento. Saca un papel viejo envuelto en plástico.

Desenlace del giro: "Usted le cedió su mitad a mi mamá, tío. Cuando se fue a Cancún. Aquí está su firma." Wilberto: "Eso fue hace mucho." Saturnino: "Lo que era de su mamá ahora es de Ixchel." Araceli y Wilberto se culpan ("¿No que la mitad era tuya?" / "Tú me dijiste que la muchacha no sabía nada"). Ixchel: "Tallando aprendí dónde guardaba todo mi mamá. Cada tabla de este muelle me la sé."

Castigo: "Ya llegó la última lancha, Araceli. Y en esa misma te vas con él, con todo y maleta." "¿En esa lancha? Ni siquiera tiene techo." Wilberto entrega la llave de la bodega ("Somos sangre" / "La sangre no se presta para quitarle a mi hija. Te espero el día que vengas sin sobres"). Araceli amenaza a Ixchel; ella le devuelve la humillación: "Cuídese al subir, señora. Las tablas están recién talladas, y resbalan." Araceli arrastra la maleta dorada por las tablas mojadas.

Cálida: "Mañana le pintamos el nombre a La Gaviota, hija. Con letras blancas, como le gustaba a tu mamá." Ixchel: "Y la saco yo… pero ya nunca de rodillas." Saturnino le quita el cepillo: "Perdóname por no ver lo que pasaba en mi propio muelle." Gancho: Araceli en la lancha que se aleja: "Ya veremos cuando mis hijas lleguen a este muelle." BLACK y CTA de Saturnino.

## Qué cambia respecto a la P1 y a las otras Partes 2
| Parte 1 | gaviota-bacalar-p2 |
|---|---|
| "La mitad de este muelle es mía" (Wilberto llega) | El papel de la mamá en La Gaviota: Wilberto le cedió su mitad; ahora es de Ixchel |
| El plazo: antes de que regrese la última lancha | La última lancha se lleva a Araceli y a Wilberto juntos |
| Wilberto tiene llave de la bodega | Entrega la llave de la bodega a su hermano |
| "Tallas bien por donde pisé" / el cepillo | "Las tablas están recién talladas, y resbalan"; Saturnino le quita el cepillo |
| La Gaviota con el nombre raspado | "Mañana le pintamos el nombre, con letras blancas" |
| CTA "¿Ustedes qué harían con un hermano así?" | CTA "¿Ustedes le habrían quitado la llave a su propio hermano?" |

Ninguna frase de más de 3 palabras de lines.json está en el lines.json de otra pieza (chequeo automático). "La mitad de este muelle es mía" se repite a propósito como recordatorio del gancho de la P1.

## Personajes
Las 4 hojas de personaje y LOC_MUELLEBACALAR de la Parte 1, copiadas a chars/ (se resuben con `make_sheets.py --reupload`, que salta las carpetas gaviota-bacalar* en el control de duplicados). Sin hojas nuevas ni personajes nuevos (Wilberto ya tuvo su presentación en r7 de la P1). Misma ropa que en la Parte 1.
| Hoja | Quién | Aspecto fijo |
|---|---|---|
| SATURNINO_DZIB | Saturnino, 56, el padre, dueño de las lanchas (CTA) | ancho de hombros, pelo gris corto, barba gris corta, guayabera blanca, pantalón caqui arremangado, sandalias de cuero, reloj de buceo negro |
| ARACELI_BRACAMONTES | Araceli, 45, la madrastra (villana) | pelo negro largo con mechas cobrizas, lentes de sol en la cabeza, labios rojos, vestido largo de playa naranja con flores, pulseras y sandalias doradas; maleta rígida dorada |
| IXCHEL_DZIB | Ixchel, 24, la hija | rasgos mayas, coleta alta negra, playera blanca con manchas de agua, capri azul marino, descalza; cepillo de tallar |
| WILBERTO_DZIB | Wilberto, 52, el tío (traidor) | delgado, calvo, bigote negro grueso, lentes dorados, polo amarilla limón, pantalón y mocasines blancos; sobre amarillo |

Locación: LOC_MUELLEBACALAR, de la tarde dorada al atardecer; la lancha que se aleja (c22) sale del mismo muelle. Geografía fija: a la IZQUIERDA Saturnino junto a las lanchas, con La Gaviota detrás, e Ixchel a su izquierda; a la DERECHA Araceli bajo la palapa con la maleta y Wilberto en la punta del muelle, a la derecha de ella, con la lancha blanca detrás.

Utilería, una de cada una: La Gaviota (lancha vieja turquesa con una gaviota blanca, nombre raspado), maleta rígida dorada, camastro, cepillo de tallar, sobre amarillo, papel viejo envuelto en plástico con letra ilegible, llave de hierro de la bodega, lancha blanca. Sin armas, sangre, cifras de dinero ni deudas. Sin uniformes ni niños. Edades adultas en número en los prompts (56, 52, 45, 24).

## Encuadres (copia de costal-cuyutlan-p2)
29 planos con gente + 1 inserto: 15 OTS (52 %), 7 single (24 %: Araceli triunfal, Ixchel saca el papel, Wilberto acorralado, "la sangre no se presta", la maleta por las tablas, el gancho, CTA), 4 two-shot (14 %) y 3 de grupo (10 %, todos mudos). El que sale de espaldas va con su @{ASSET} y su ropa vista desde atrás. Cada OTS/two/grupo tiene su respaldo single (intentos 4-6 o `--one`).

## Diálogo (lines.json, fuente única)
| clip | quién | encuadre | frases |
|---|---|---|---|
| c01 | Wilberto | OTS (Saturnino de espaldas, izq.) | "Ya llegó la última lancha, hermano." / "Y la mitad de este muelle es mía." |
| c02 | Saturnino | OTS (Wilberto, der.) | "Tú te fuiste a Cancún hace años, Wilberto." / "Y nunca volviste ni a ver las lanchas." |
| c03 | Wilberto | OTS (Saturnino, izq.) | "Pero firmé contigo, y aquí traigo los papeles." / "Araceli se queda, y yo con ella." |
| c04 | Araceli | single | "¿Ya ves, mi vida?" / "Ahora la que se queda soy yo, y la que se va es tu muchachita." |
| r1 | — | grupo | mudo: Ixchel voltea a ver La Gaviota |
| c05 | Ixchel | OTS (Saturnino, der.) | "Apá, mi mamá guardaba sus papeles en La Gaviota." / "Debajo del asiento, donde nadie buscaba." |
| r2 | — | single | mudo: Ixchel, de rodillas en La Gaviota, saca el papel de debajo del asiento |
| i01 | — | inserto | unas manos desenvuelven el papel viejo |
| c06 | Ixchel | OTS (Wilberto, der.) | "Usted le cedió su mitad a mi mamá, tío." / "Cuando se fue a Cancún. Aquí está su firma." |
| c07 | Wilberto | single | "Eso fue hace mucho, muchacha." / "Y tu mamá ya no está aquí para reclamar nada." |
| c08 | Saturnino | OTS (Wilberto, der.) | "Pero su hija sí, Wilberto." / "Lo que era de su mamá ahora es de Ixchel." |
| r3 | — | grupo | mudo: Araceli se baja los lentes y mira a Wilberto; él esconde el sobre |
| c09 | Araceli | OTS (Wilberto, der.) | "¿No que la mitad era tuya, Wilberto?" / "Me hiciste quedar en ridículo delante de todos." |
| c10 | Wilberto | OTS (Araceli, izq.) | "Tú me dijiste que la muchacha no sabía nada." / "Que nomás tallaba el muelle y se callaba." |
| c11 | Ixchel | OTS (Araceli, der.) | "Tallando aprendí dónde guardaba todo mi mamá." / "Cada tabla de este muelle me la sé." |
| c12 | Saturnino | two-shot (con Araceli) | "Ya llegó la última lancha, Araceli." / "Y en esa misma te vas con él, con todo y maleta." |
| c13 | Araceli | OTS (Saturnino, izq.) | "¿En esa lancha, con mi maleta dorada?" / "Ni siquiera tiene techo, Saturnino." |
| c14 | Saturnino | OTS (Wilberto, der.) | "Y tú, hermano, me dejas la llave de la bodega." / "Y la llevas a la otra orilla." |
| r4 | — | two-shot | mudo: Wilberto deja caer la llave de hierro en la mano de Saturnino |
| c15 | Wilberto | OTS (Saturnino, izq.) | "Somos sangre, Saturnino." / "¿Me vas a correr como a ella, delante de tu hija?" |
| c16 | Saturnino | single | "La sangre no se presta para quitarle a mi hija." / "Te espero el día que vengas sin sobres." |
| c17 | Araceli | OTS (Ixchel, izq.) | "Esto no termina aquí, muchachita." / "Disfruta tu muelle mientras puedas, que te dura poco." |
| c18 | Ixchel | OTS (Araceli, der.) | "Cuídese al subir, señora." / "Las tablas están recién talladas, y resbalan." |
| r5 | — | single | mudo: Araceli arrastra la maleta dorada por las tablas mojadas, de espaldas |
| c19 | Saturnino | two-shot (con Ixchel, frente a La Gaviota) | "Mañana le pintamos el nombre a La Gaviota, hija." / "Con letras blancas, como le gustaba a tu mamá." |
| c20 | Ixchel | OTS (Saturnino, der.) | "Y la saco yo, apá." / "Al amanecer, como siempre, pero ya nunca de rodillas." |
| c21 | Saturnino | two-shot (con Ixchel) | "Perdóname por no ver lo que pasaba en mi propio muelle." / "Ya no vas a tallar sola." |
| r6 | — | grupo | mudo: padre e hija sentados junto a La Gaviota; la lancha se aleja con Araceli y Wilberto |
| c22 | Araceli (gancho, en la lancha) | single | "Ríete, Saturnino, ríete." / "Ya veremos cuando mis hijas lleguen a este muelle." |
| BLACK | — | — | 0,4 s |
| c23 | Saturnino (CTA a cámara: media sonrisa, pausa, ceja, lanza la llave de hierro en la mano, se soba la barba, ladea la cabeza hacia la laguna, asiente) | single | "¿Ustedes le habrían quitado la llave a su propio hermano?" / "Cuéntenme abajo y síganme, que las hijas de Araceli ya vienen en camino." |

23 clips hablados, 7 mudos (1 inserto), 362 palabras.

## Montaje
- Sin plano abierto ni de objetos: c01 arranca con Wilberto ya hablando y "Ya llegó la última lancha, hermano" entra antes de los 2 s.
- Corte al terminar cada frase. Reacciones de 1,0-1,2 s solo donde cuentan algo (r1-r6).
- Música VISTA: golpe sutil en el frame 0, suspenso hasta c19, cálida de c19 a c22 (el nombre de La Gaviota, "ya nunca de rodillas", el perdón), suspenso en el gancho y el CTA. BLACK de 0,4 s antes del CTA. SPEED = 1.15.
- El CTA solo nombra a Araceli, que se oye en todo el video.
- Pronunciación a vigilar: "Bacalar", "Saturnino", "Ixchel" (ish-CHEL), "Wilberto", "Gaviota", "Cancún", "bodega".
- QA: Ixchel descalza con la playera blanca; Araceli siempre con el vestido naranja y la maleta dorada a la derecha; Wilberto siempre en la punta del muelle a la derecha; La Gaviota turquesa con la gaviota blanca y sin letras; el papel y el sobre sin texto legible; nadie de espaldas que no sea el mismo personaje con su misma ropa.
