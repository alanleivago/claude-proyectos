---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, vista-stories, parte2, remake-transformado, padre-hijos-herencia, justicia-familiar, tabasco, comalcalco, cacao]
relatedTo: [hamaca-comalcalco, sarape-saltillo-p2, atrium-vista]
---
# La Hamaca de Comalcalco · Parte 2

Continúa `pieces/hamaca-comalcalco`. La Parte 1 terminó con el notario contando que Norberto fue a verlo el lunes a preguntar si su madre tenía tierras y cómo quitárselas sin que supiera, "¿Tú sabías, Norberto? ¿Sabías y aun así me corriste?" e Isaura entregándolo: "Eso fue idea de él, suegra." El CTA prometía: "en la segunda parte reparto el cacao". Aquí se arranca en ese mismo instante, en el corredor: desenlace del giro (Norberto confiesa, culpa a Isaura y el notario cuenta que ella esperaba en la camioneta), castigo del hijo traidor y de la nuera, y la finca del río para Zenobia, la hija humilde. Diálogos, detalles y CTA nuevos.

Ritmo emocional tomado de la P2 de Evaristo de Atrium (7706270980758441247, 390K): arranque en plena tensión, el hijo acomodado y su pareja se culpan delante del mayor, el hijo humilde no pide nada, el mayor reparte y CTA.

Marca **VISTA STORIES**, la misma de la Parte 1 (edit.py, BRAND = "VISTA", SPEED = 1.15). No entra en la rotación. Sin Navidad.

Son 24 clips hablados de dos frases cortas (el CTA de 10 s), 1 inserto y 5 mudos: 30 clips. 374 palabras. El montaje apunta a 1:40-2:00 (con la aceleración de 1.15) y a 2 s o menos por tramo.

**Título:** Su hijo fue al notario para quitarle la finca… y terminó con la hamaca en los brazos 😳 | La Hamaca de Comalcalco · Parte 2

## Premisa
Gancho (0-2 s), sigue al instante de la P1: Norberto, acorralado en el corredor: "Sí fui con el licenciado, amá, no le voy a mentir. Pero fue Isaura la que me mandó." Isaura, en su mecedora, lo niega. Olegario: "usted también estaba ese lunes. Se quedó esperando en la camioneta, abanicándose." Fortunata: "Los dos fueron, entonces." Norberto se excusa ("quería asegurar su futuro"); Fortunata: "Mi futuro era un petate junto a los costales." Zenobia le reclama a su hermano y él la acusa de quedarse con todo: "Yo no quiero nada, Norberto."

Reparto del cacao: Fortunata le pide al notario cambiar de nombre la finca del río: "A nombre de la que me dio su cama. Zenobia Landero." Zenobia llora: se la dio porque tenía frío. "La tierra se le da a quien no la pide."

Castigo: Isaura pregunta a dónde se van; Fortunata: sobre su terreno, y el domingo, como quedaron, le dejan las llaves (el plazo de la P1 cumplido). "¿Y mi mamá?" — "En el asoleadero hay lugar de sobra. Ahí se duerme muy fresco, yo lo sé." Isaura se levanta y deja a Norberto: "Yo me voy con mi mamá, pero tú no vienes." Norberto, solo: "Me quedé sin casa, sin mujer y sin madre." Fortunata le pone su hamaca en los brazos: "Llegar a otra puerta con lo que traes en los brazos." Zenobia se lleva a su madre a la finca. Gancho: Isaura al teléfono con su mamá: "Esa finca no va a ser de Zenobia por mucho tiempo." BLACK y CTA de Fortunata a cámara.

## Qué cambia respecto a la P2 de Atrium (Evaristo, 390K) y a la P1
| Atrium P2 (Evaristo) | hamaca-comalcalco-p2 |
|---|---|
| Reunión en la casa del hijo pobre | El mismo corredor de la P1, en el mismo instante |
| El hijo rico y su esposa hacen cuentas | Norberto y Isaura se culpan; el notario los pone a los dos en la notaría |
| El padre paga la renta del hijo humilde | La finca del río pasa a nombre de Zenobia (sin cifras) |
| El hijo rico se va | Isaura deja a Norberto; él se queda con la hamaca de su madre |
| CTA en off | Fortunata a cámara: "Ya repartí el cacao. ¿Hice bien con mi hijo?" |

El CTA de la P1 era "¿Le darían otra oportunidad a un hijo así?". Ninguna frase de lines.json está en el lines.json de otra pieza (chequeo automático).

## Personajes
Las 5 hojas de personaje y LOC_CACAOCOMALC de la Parte 1, copiadas a chars/ (se resuben con `make_sheets.py --reupload`, que salta las carpetas hamaca-comalcalco* en el control de duplicados). Sin personajes nuevos. Misma ropa que en la Parte 1.
| Hoja | Quién | Aspecto fijo |
|---|---|---|
| FORTUNATA_LANDERO | Fortunata, 73, la madre (CTA) | trenza gris larga con listón rojo, arracadas chicas de oro, blusa blanca bordada de flores, falda larga verde oscuro; hamaca blanca enrollada en brazos hasta r4 |
| ISAURA_GARDUZA | Isaura, 43, la nuera (villana) | rubia teñida ondulada, arracadas grandes, blusa fucsia de satín, pantalón blanco; abanico rojo y celular; sentada en la mecedora hasta r3, de pie después |
| NORBERTO_LANDERO | Norberto, 47, el hijo (traidor) | alto, sienes canosas, camisa blanca de manga larga, pantalón azul marino, reloj plateado; desde r4 con la hamaca |
| ZENOBIA_LANDERO | Zenobia, 40, la hija humilde | chongo bajo, playera lila, mandil de cuadros azul y blanco con harina, jeans |
| OLEGARIO_OCHOA | Olegario, 61, el notario | bajito, pelo y bigote blancos, lentes redondos de carey, saco de lino beige; carpeta de piel café |

Locación: LOC_CACAOCOMALC, la misma tarde dorada. Geografía fija (la de la P1): corredor y mecedora a la DERECHA (Isaura, Norberto); orilla del asoleadero a la IZQUIERDA (Zenobia, Fortunata, Olegario, de izquierda a derecha).

Utilería, una de cada una: hamaca blanca enrollada, mecedora de mimbre blanca, abanico rojo, celular, carpeta de piel café. Sin armas, sangre, cifras de dinero ni deudas. Sin uniformes ni niños. Edades adultas en número en los prompts (73, 61, 47, 43, 40).

## Encuadres (copia de sarape-saltillo-p2)
29 planos con gente + 1 inserto: 15 OTS (52 %), 7 single (24 %: la reacción de Isaura, Fortunata al notario, el notario, el llanto de Zenobia, Norberto solo, la llamada, CTA), 4 two-shot (14 %) y 3 de grupo (10 %). Los 3 grupos son mudos (en los grupos con diálogo Omni a veces mueve la boca equivocada). El que sale de espaldas va con su @{ASSET} y su ropa vista desde atrás (Fortunata con o sin hamaca según el momento). Cada OTS/two/grupo tiene su respaldo single (intentos 4-6 o `--one`).

## Diálogo (lines.json, fuente única)
| clip | quién | encuadre | frases |
|---|---|---|---|
| c01 | Norberto | OTS (Fortunata de espaldas, izq.) | "Sí fui con el licenciado, amá, no le voy a mentir." / "Pero fue Isaura la que me mandó." |
| c02 | Isaura | two-shot (la pareja) | "¿Ahora me echas la culpa a mí, Norberto?" / "Tú solito fuiste a esa notaría." |
| c03 | Olegario | OTS (Isaura, der.) | "Perdone, señora, pero usted también estaba ese lunes." / "Se quedó esperando en la camioneta, abanicándose." |
| r1 | — | single | mudo: a Isaura se le detiene el abanico |
| c04 | Fortunata | OTS (Norberto, der.) | "Los dos fueron, entonces." / "Uno preguntaba y la otra esperaba afuera, muy fresca." |
| c05 | Norberto | OTS (Fortunata, izq.) | "Amá, yo nomás quería asegurar su futuro." / "Usted ya no tiene edad para cuidar una finca." |
| c06 | Fortunata | OTS (Norberto, der.) | "¿Mi futuro, Norberto? Mi futuro era un petate." / "Junto a los costales, donde tú me pusiste." |
| r2 | — | grupo | mudo: los cinco, todos miran a Norberto |
| c07 | Zenobia | two-shot (con su madre) | "Hermano, ¿cómo pudiste hacerle eso?" / "Con ese cacao nos dio de comer a los dos." |
| c08 | Norberto | OTS (Zenobia, izq.) | "Tú no te metas, que a ti te conviene." / "Ahora resulta que te vas a quedar con todo." |
| c09 | Zenobia | OTS (Norberto, der.) | "Yo no quiero nada, Norberto." / "Nomás quiero a mi mamá tranquila y con un techo." |
| c10 | Fortunata | single | "Licenciado, abra su carpeta, por favor." / "Hoy mismo cambiamos de nombre la finca del río." |
| c11 | Olegario | single | "¿A nombre de quién, doña Fortunata?" / "Dígamelo despacio, que lo voy anotando." |
| c12 | Fortunata | OTS (Zenobia, izq.) | "A nombre de la que me dio su cama." / "Zenobia Landero, mi hija la menor." |
| c13 | Zenobia (llanto) | single | "Amá, yo no le di mi cama por eso." / "Se la di porque usted tenía frío." |
| c14 | Fortunata | OTS (Zenobia, izq.) | "Por eso mismo, mija." / "La tierra se le da a quien no la pide." |
| i01 | — | inserto | las manos del notario escriben en la carpeta (nada legible) |
| c15 | Isaura | OTS (Fortunata, izq.) | "Suegra, ¿y nosotros a dónde nos vamos ahora?" / "Esta casa la levantamos con mucho esfuerzo." |
| c16 | Fortunata | OTS (Isaura, der.) | "Sobre mi terreno, Isaura." / "El domingo, como quedamos, me dejan las llaves en la mesita." |
| c17 | Isaura | OTS (Fortunata, izq.) | "¿Y mi mamá? Ya le había dicho que se viniera." / "¿Ahora dónde la acomodo?" |
| c18 | Fortunata | OTS (Isaura, der.) | "En el asoleadero hay lugar de sobra." / "Ahí se duerme muy fresco, yo lo sé." |
| r3 | — | grupo | mudo: Isaura se levanta de la mecedora y se aparta de Norberto |
| c19 | Isaura | two-shot (la pareja) | "Todo esto es por tu culpa, Norberto." / "Yo me voy con mi mamá, pero tú no vienes." |
| c20 | Norberto (casi llanto) | single | "Amá… ¿y ahora yo qué hago?" / "Me quedé sin casa, sin mujer y sin madre." |
| c21 | Fortunata | OTS (Norberto, der.) | "Lo mismo que hice yo, mijo." / "Llegar a otra puerta con lo que traes en los brazos." |
| r4 | — | two-shot | mudo: Fortunata le pone la hamaca en los brazos a Norberto |
| r5 | — | grupo | mudo: Norberto solo con la hamaca; Isaura aparte con el celular |
| c22 | Zenobia | OTS (Fortunata sin hamaca, der.) | "Véngase conmigo a la finca, amá." / "Allá el cacao y mi cocina la están esperando." |
| c23 | Isaura (gancho, llamada) | single | "¿Mamá? No, todavía no te vengas." / "Esa finca no va a ser de Zenobia por mucho tiempo." |
| BLACK | — | — | 0,4 s |
| c24 | Fortunata (CTA a cámara: sonrisa satisfecha, levanta un grano de cacao y lo enseña, pausa, ceja, ladea la cabeza, se encoge de hombros, asiente) | single | "Ya repartí el cacao, como les prometí." / "¿Hice bien con mi hijo? Díganmelo abajo y síganme, que Isaura todavía no se rinde." |

24 clips hablados, 6 mudos (1 inserto), 374 palabras.

## Montaje
- Sin plano abierto ni de objetos: c01 arranca con Norberto ya hablando y "Sí fui con el licenciado, amá" entra antes de los 2 s.
- Corte al terminar cada frase. Mismo personaje con frases seguidas = salto dentro de su clip. Reacciones de 1,0-1,2 s solo donde cuentan algo (r1, r3, r5).
- Música VISTA: golpe sutil en el frame 0, suspenso hasta c12, cálida de c12 a c15 (la finca para Zenobia), suspenso en la casa, la hamaca, el gancho y el CTA. BLACK de 0,4 s antes del CTA. SPEED = 1.15.
- El CTA solo nombra a Isaura, que se oye desde c01.
- Pronunciación a vigilar: "Fortunata", "Zenobia Landero", "asoleadero", "abanicándose", "notaría".
- QA: Fortunata con la hamaca hasta r4 y con los brazos vacíos después; Norberto con la hamaca desde r4; Isaura sentada hasta r3 y de pie después, siempre a la derecha con el abanico rojo; nada legible en la carpeta; nadie de espaldas que no sea el mismo personaje con su misma ropa.
