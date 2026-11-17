---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, majestic-stories, parte2, remake-transformado, capos, baja-california-sur, san-ignacio, partera, boda]
relatedTo: [frascos-sanignacio, sarape-saltillo-p2, atrium-vista]
---
# Los Frascos de San Ignacio · Parte 2

Continúa `pieces/frascos-sanignacio`. La Parte 1 terminó con el giro: el novio que le tiró los frascos a doña Tiburcia se casa hoy con la hija de Belarmino ("¿Tú te casas hoy con mi hija? Mírame bien, muchacho." / "¿Usted… es don Belarmino? Señor, yo no sabía."). El CTA prometía: "en la segunda parte llega la novia". Aquí se arranca en ese mismo instante, ya metido el sol: castigo del novio y del amigo (levantar cada frasco y besarle la mano a la madrina, el plazo invertido de la P1), llega la novia, Jimena, y desenlace del giro: se entera de que su novio humilló a la partera que la recibió y suspende la boda. Diálogos, detalles y CTA nuevos.

Marca **MAJESTIC STORIES**, la misma de la Parte 1 (edit.py, BRAND = "MAJESTIC", SPEED = 1.15). No entra en la rotación. Sin Navidad.

Son 25 clips hablados de dos frases cortas (el CTA de 10 s), 1 inserto y 6 mudos: 32 clips. 380 palabras. El montaje apunta a 1:40-2:00 (con la aceleración de 1.15) y a 2 s o menos por tramo.

**Título:** Llegó vestida de novia y vio a su prometido levantando los frascos de la partera… 😳 | Los Frascos de San Ignacio · Parte 2

## Premisa
Gancho (0-2 s), sigue al instante de la P1: Belarmino a Bastián: "¿No sabías? Pues ya lo sabes, muchacho. Empieza a levantar frascos, que la novia ya viene en camino." Bastián se excusa; Tiburcia: "A la gente se le respeta sin saber quién es." Bastián, de traje, se agacha a recoger los frascos. Iker quiere irse ("Esto ya no es cosa mía"); Belarmino: "Tú los echaste a la caja, tú los acomodas." Los dos levantan los frascos en el puesto.

Llega Jimena (nueva, 27), vestida de novia: "¿Papá? ¿Qué hace Bastián recogiendo frascos?" Belarmino le cuenta. "¿Doña Tiburcia? ¿La que me recibió a mí?" Tiburcia: "Te recibí en una noche de mucho viento, mija. Y hoy te ibas a casar encima de mis frascos." Bastián: "Pensé que era una vendedora cualquiera." Jimena: "¿Y a las cualquieras sí se les tira todo?" Iker se lava las manos y Bastián lo acusa.

Castigo: "Ahora te falta lo otro": Bastián le besa la mano a Tiburcia; ella: "Ese beso no me lo da usted, joven. Me lo da el miedo que trae." Jimena deja el anillo en el puesto: "Hoy en esta plaza no hay boda." Bastián suplica (su familia ya espera en la iglesia); Belarmino: "Que se enteren. Y que vean quién levantó los frascos de mi madrina." Jimena le da su ramo a Tiburcia; Belarmino manda quitar el arco. Gancho: Bastián llama a su papá ("Un tal Belarmino me dejó sin novia") y Tiburcia, tranquila: "Que venga su papá, joven. A él también lo recibí yo." BLACK y CTA de Jimena a cámara.

## Qué cambia respecto a la P1 y a otras P2
| P1 (frascos-sanignacio) | frascos-sanignacio-p2 |
|---|---|
| Bastián tira los frascos "antes de que llegue la novia" | Antes de que llegue, Bastián e Iker los levantan uno por uno |
| "Le besas la mano a mi madrina" (amenaza) | El beso en la mano, y "me lo da el miedo que trae" |
| La novia no sale | Jimena llega vestida de novia, deja el anillo en el puesto y le da su ramo a Tiburcia |
| Giro: el novio es el de la hija de Belarmino | Desenlace: "Hoy en esta plaza no hay boda"; nuevo gancho: Tiburcia también recibió al papá de Bastián |
| CTA de Tiburcia: "¿Ustedes lo dejarían casarse con su hija?" | CTA de Jimena: "Me quedé sin boda, pero no sin madrina. ¿Ustedes lo habrían perdonado?" |

Ninguna frase de lines.json está en el lines.json de otra pieza (chequeo automático).

## Personajes
Las 5 hojas de personaje y LOC_PLAZASANIGN de la Parte 1, copiadas a chars/ (se resuben con `make_sheets.py --reupload`, que salta las carpetas frascos-sanignacio* en el control de duplicados), y una hoja nueva. LOC_DESIERTOBCS no se usa (todo pasa en la plaza). Misma ropa que en la Parte 1.
| Hoja | Quién | Aspecto fijo |
|---|---|---|
| TIBURCIA_OSUNA | Tiburcia, 76, partera y hierbera | chongo blanco bajo, aretitos de plata, vestido azul marino deslavado de florecitas, mandil blanco, rebozo gris; desde c20 con el ramo de la novia |
| BASTIAN_TALAMANTES | Bastián, 29, el novio (villano) | copete castaño claro, traje de lino azul cielo, camisa blanca sin corbata, tenis blancos, pulsera de oro; desde r2, las rodillas empolvadas |
| IKER_BARAJAS | Iker, 28, el amigo (secuaz) | pelo rizado rojizo, barba corta rojiza, camisa verde menta de palmeras, chino beige |
| BELARMINO_ARCINIEGA | Belarmino, 63, el padre de la novia (figura de poder) | sombrero de fieltro café, bigote gris grueso, camisa vaquera crema con broches de nácar, jeans, hebilla plateada, botas |
| ZACARIAS_MAGANA | Zacarías, 41, chofer y escolta | rapado, barba negra corta, traje gris oscuro sobre camisa negra |
| **JIMENA_ARCINIEGA** (nueva) | Jimena, 27, la novia, hija de Belarmino (CTA) | castaño oscuro en chongo bajo con velo largo, aretes de perla, vestido de novia blanco de satín con cuello alto y mangas largas de encaje; ramo redondo de flores blancas hasta c20 |

Presentación del personaje nuevo: Jimena en r3 (plano medio de las rodillas para arriba, vestido completo).

Locación: LOC_PLAZASANIGN, al anochecer, recién metido el sol. Geografía fija (la de la P1): a la IZQUIERDA Tiburcia detrás de su puesto, Belarmino a su derecha, Jimena a la derecha de su padre (hacia el centro) y Zacarías detrás de Belarmino; a la DERECHA Bastián frente al arco de flores e Iker un paso detrás.

Utilería, una de cada una: puesto de hierbas con frascos de vidrio (tirados hasta r2, de pie después), caja de cartón con frascos (Iker, hasta c04), arco blanco de flores, ramo redondo de flores blancas, anillo de compromiso de oro, camionetas negras sin logos ni placas. Sin armas, sangre, cifras de dinero ni deudas. Sin uniformes ni niños. Edades adultas en número en los prompts (76, 63, 41, 29, 28, 27).

## Encuadres (copia de sarape-saltillo-p2)
31 planos con gente + 1 inserto: 16 OTS (52 %), 7 single (23 %: Bastián recoge un frasco, la presentación de Jimena, Bastián contra Iker, el llanto firme de Jimena, la súplica, la llamada, CTA), 5 two-shot (16 %) y 3 de grupo (10 %). Los 3 grupos son mudos (en los grupos con diálogo Omni a veces mueve la boca equivocada). El que sale de espaldas va con su @{ASSET} y su ropa vista desde atrás. Cada OTS/two/grupo tiene su respaldo single (intentos 4-6 o `--one`).

## Diálogo (lines.json, fuente única)
| clip | quién | encuadre | frases |
|---|---|---|---|
| c01 | Belarmino | OTS (Bastián de espaldas, der.) | "¿No sabías? Pues ya lo sabes, muchacho." / "Empieza a levantar frascos, que la novia ya viene en camino." |
| c02 | Bastián | OTS (Belarmino, izq.) | "Don Belarmino, fue un malentendido, se lo juro." / "Yo no sabía quién era la señora." |
| c03 | Tiburcia | OTS (Bastián, der.) | "Por eso mismo, joven." / "A la gente se le respeta sin saber quién es." |
| r1 | — | single | mudo: Bastián, de traje, se agacha a recoger un frasco |
| c04 | Iker | two-shot (con Bastián) | "Yo ahí te dejo, Bastián." / "Esto ya no es cosa mía." |
| c05 | Belarmino | OTS (Iker, der.) | "Tú no te vas a ningún lado, pelirrojo." / "Tú los echaste a la caja, tú los acomodas." |
| r2 | — | grupo | mudo: Bastián e Iker levantan los frascos en el puesto; Tiburcia, Belarmino y Zacarías miran |
| r3 | — | single | mudo: Jimena vestida de novia (presentación) |
| c06 | Jimena | OTS (Belarmino, izq.) | "¿Papá? ¿Qué hace Bastián recogiendo frascos?" / "La boda ya va a empezar y todos me están esperando." |
| c07 | Belarmino | OTS (Jimena, der.) | "Tu novio corrió de su puesto a mi madrina, mija." / "Le echó sus hierbas a la basura." |
| c08 | Jimena | OTS (Tiburcia, izq.) | "¿Doña Tiburcia? ¿La que me recibió a mí?" / "Mi papá siempre me habló de usted." |
| c09 | Tiburcia | OTS (Jimena, der.) | "Te recibí en una noche de mucho viento, mija." / "Y hoy te ibas a casar encima de mis frascos." |
| c10 | Bastián | OTS (Jimena, izq.) | "Mi amor, te juro que no sabía quién era." / "Pensé que era una vendedora cualquiera." |
| c11 | Jimena | OTS (Bastián, der.) | "¿Una cualquiera, Bastián?" / "¿Y a las cualquieras sí se les tira todo?" |
| c12 | Iker | two-shot (con Bastián) | "Yo le dije que la dejara en paz, Jimena." / "Él quería la plaza vacía para las fotos." |
| c13 | Bastián | single | "¿Tú me dijiste? Tú echaste todo a la caja." / "No te hagas, Iker." |
| c14 | Belarmino | OTS (Bastián, der.) | "Ya levantaste los frascos, muchacho." / "Ahora te falta lo otro." |
| r4 | — | two-shot | mudo: Bastián le besa la mano a Tiburcia por encima del puesto |
| c15 | Tiburcia | OTS (Bastián, der.) | "Ese beso no me lo da usted, joven." / "Me lo da el miedo que trae." |
| c16 | Jimena (llanto firme) | single | "Yo quería un hombre que respetara a mi gente." / "Y tú humillaste a la primera que te estorbó." |
| i01 | — | inserto | la mano de Jimena deja el anillo en el puesto, entre los frascos |
| c17 | Jimena | OTS (Bastián, der.) | "Guárdate tu anillo, Bastián." / "Hoy en esta plaza no hay boda." |
| r5 | — | grupo | mudo: la plaza helada; Bastián solo frente al arco |
| c18 | Bastián (súplica) | single | "Jimena, mi familia ya está esperando en la iglesia." / "Todo el pueblo se va a enterar." |
| c19 | Belarmino | OTS (Bastián, der.) | "Que se enteren, muchacho." / "Y que vean quién levantó los frascos de mi madrina." |
| c20 | Jimena | two-shot (con Tiburcia) | "Estas flores son para usted, madrina." / "Perdóneme por lo que le hicieron en su plaza." |
| c21 | Tiburcia | OTS (Jimena, der.) | "Tú no tienes la culpa de nada, mija." / "Qué bueno que lo viste antes del altar." |
| c22 | Belarmino | two-shot (con Zacarías) | "Zacarías, quita ese arco de aquí." / "El puesto de mi madrina se queda donde siempre ha estado." |
| c23 | Bastián (llamada) | single | "¿Papá? Vente a la plaza ahorita mismo." / "Un tal Belarmino me dejó sin novia." |
| r6 | — | grupo | mudo: Belarmino abraza a Tiburcia, Jimena a su lado; Bastián al teléfono |
| c24 | Tiburcia (gancho) | OTS (Bastián, der.) | "Que venga su papá, joven." / "A él también lo recibí yo." |
| BLACK | — | — | 0,4 s |
| c25 | Jimena (CTA a cámara: sonrisa valiente, se limpia una lágrima, pausa, se echa el velo atrás, ceja, ladea la cabeza, asiente) | single | "Me quedé sin boda, pero no sin madrina." / "¿Ustedes lo habrían perdonado? Díganmelo abajo y síganme, que el papá de Bastián ya viene." |

25 clips hablados, 7 mudos (1 inserto), 380 palabras.

## Montaje
- Sin plano abierto ni de objetos: c01 arranca con Belarmino ya hablando y "¿No sabías?" entra antes de los 2 s.
- Corte al terminar cada frase. Mismo personaje con frases seguidas = salto dentro de su clip. Reacciones de 1,0-1,2 s solo donde cuentan algo (r1, r5).
- Música MAJESTIC: golpe sutil en el frame 0, suspenso hasta c20, cálida de c20 a c22 (el ramo para Tiburcia), suspenso en el arco, la llamada, el gancho y el CTA. BLACK de 0,4 s antes del CTA. SPEED = 1.15.
- El CTA solo nombra a Bastián, que se oye desde c04.
- Pronunciación a vigilar: "Tiburcia", "Belarmino", "Jimena", "Zacarías", "Bastián", "pelirrojo".
- QA: el puesto siempre a la izquierda y el arco a la derecha; los frascos tirados hasta r2 y de pie después; Jimena siempre con el mismo vestido (cuello alto, mangas largas de encaje) y velo, con el ramo hasta c20 y Tiburcia con él después; Belarmino el único con sombrero; camionetas sin letras ni placas; el anillo sin grabados legibles; nadie de espaldas que no sea el mismo personaje con su misma ropa.
