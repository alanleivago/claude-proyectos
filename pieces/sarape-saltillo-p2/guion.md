---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, vista-stories, parte2, remake-transformado, padre-hijos-herencia, madre-hijos, saltillo, coahuila, sarape]
relatedTo: [sarape-saltillo, baul-sanmiguel, atrium-vista]
---
# El Sarape de Saltillo · Parte 2

Continúa `pieces/sarape-saltillo`. La Parte 1 terminó con la llamada de Clementina al dueño de la fábrica ("Nomás pasa por mí antes de las nueve… a ver si así combino con su casa"), "Yo lo crié, Tereso" y el carro negro deteniéndose frente a la panadería. Aquí se arranca a las nueve, frente a la casa de Fabián: desenlace del giro (Clementina fue la nana de Mauricio Arocha, el dueño de la fábrica donde Fabián es gerente), castigo del yerno villano y de la hija traidora, Florinda. Diálogos, detalles y CTA nuevos.

Ritmo emocional tomado de la P2 de Evaristo de Atrium (7706270980758441247, 390K, `fuentes/atrium-vista/videos/7706270980758441247_analisis.md`): arranque en plena tensión, el hijo acomodado y su cónyuge hacen cuentas delante del padre, el hijo humilde lo defiende, el padre dice "ya sé quién es quién" y CTA. Aquí el poder ya está revelado y el peso va en el castigo.

Marca **VISTA STORIES**, la misma de la Parte 1 (edit.py, BRAND = "VISTA", SPEED = 1.15). No entra en la rotación. Sin Navidad.

Son 26 clips hablados de dos frases cortas (el CTA de 10 s), 2 insertos i* y 4 mudos r*: 32 clips. 378 palabras. El montaje apunta a 1:40-2:00 (con la aceleración de 1.15) y a 2 s o menos por tramo.

**Título:** Llegó a la cena de su yerno del brazo del dueño de la fábrica… y él tuvo que entregar su oficina 😳 | El Sarape de Saltillo · Parte 2

## Premisa
Gancho (0-2 s), con recordatorio: Fabián, arriba en la puerta de cristal, de noche: "¿Suegra? ¿Usted qué hace bajándose de ese carro? Le dije que antes de las nueve se me iba."

Mauricio Arocha (nuevo, 56) se presenta junto al carro negro: "Ella viene conmigo. Clementina fue mi nana." Florinda sale a la puerta y se hace la que no sabía: "Te hubiera abierto la puerta." Clementina: "Te lo pregunté en esta misma escalera, mija." Tereso: "En mi panadería a mi amá nadie la corrió." Mauricio le pregunta a Fabián si es cierto que aquí su nana "no combinaba". Fabián lo achaca a los nervios; Clementina: "¿Y mi sarape también fue por los nervios? Usted lo tiró en ese escalón."

Castigo del villano: "Ese sarape salió de los telares de mi padre." Fabián suplica; Mauricio: "Un gerente que corre a su suegra no cuida a nadie. Mañana me entregas la oficina." Florinda defiende a su marido ("fue un error de una sola noche") y su madre le recuerda la central de camiones y el "mañana te marco" que nunca llegó. Fabián, de pronto amable, la invita a cenar: "Ya cené pan de pulque. Además, yo no combino con su casa."

Castigo de la traidora: Florinda llora; Clementina la perdona pero se queda con Tereso, y le pone en los hombros a él el sarape que tejió para la boda de Florinda: "Ahora es tuyo, Tereso. Tú sí me abriste." Tereso no acepta nada de Mauricio ("yo soy panadero"). "Así lo crié, Mauricio. Igualito que a ti, envuelto en mi rebozo." Arriba, Florinda suelta el brazo de Fabián: "Por tu cena me quedé sin madre. Y sin hermano." Gancho: Fabián solo en la puerta: "Todavía no sabe lo que yo sé de esa fábrica, licenciado." BLACK y CTA de Clementina a cámara.

## Qué cambia respecto a la P2 de Atrium (Evaristo, 390K) y a la P1
| Atrium P2 (Evaristo) | sarape-saltillo-p2 |
|---|---|
| Reunión en la casa del hijo pobre | Frente a la casa del yerno, a las nueve, con el carro del dueño abajo |
| El padre llama al licenciado para pagar la renta | El dueño ya está ahí: Fabián entrega la oficina de gerente (sin cifras) |
| "Ya sé quién es quién" | El sarape de la boda de Florinda pasa a los hombros de Tereso |
| El hijo rico se va | Florinda suelta a su marido; Fabián deja un gancho ("lo que yo sé de esa fábrica") |
| CTA en off | CTA de Clementina a cámara: "¿Ustedes habrían perdonado a una hija así?" |

El CTA de la P1 era "¿Qué cara creen que va a poner Fabián cuando me vea llegar?". Ninguna frase de lines.json está en el lines.json de otra pieza (chequeo automático).

## Personajes
Las 4 hojas de personaje y LOC_CASASALTILLO de la Parte 1, copiadas a chars/ (se resuben con `make_sheets.py --reupload`, que salta las carpetas sarape-saltillo* en el control de duplicados), y una hoja nueva. Misma ropa que en la Parte 1.
| Hoja | Quién | Aspecto fijo |
|---|---|---|
| CLEMENTINA_RAMOS | Clementina, 74, la madre (CTA) | trenzas blancas en corona, aretes de plata, rebozo gris oscuro con rayitas blancas, blusa lila, falda larga negra; sarape de franjas de colores en el antebrazo IZQUIERDO hasta i02 |
| FABIAN_ELIZONDO | Fabián, 46, el yerno (villano) | rapado, candado negro, camisa blanca entallada con el cuello abierto, pantalón negro, reloj plateado |
| FLORINDA_RAMOS | Florinda, 49, la hija (traidora) | pelo negro lacio con mechas miel, labios rojos, cadenita de oro, blusa de satín verde esmeralda, pantalón beige |
| TERESO_RAMOS | Tereso, 41, el hijo panadero | pelo rizado, bigote delgado, playera verde oscuro, mandil blanco con harina, jeans; desde i02, el sarape en los hombros |
| **MAURICIO_AROCHA** (nueva) | Mauricio, 56, el dueño de la fábrica | alto y delgado, pelo y barba cortos plateados, lentes de armazón negro delgado, traje azul marino con camisa azul claro, sin corbata, pañuelo blanco |

Presentación del personaje nuevo: Mauricio en r1 (plano medio de las rodillas para arriba, ropa completa).

Locación: LOC_CASASALTILLO, de noche (escalinata de piedra, puerta de cristal con luz cálida, lámparas de pared). Geografía fija: Fabián arriba a la DERECHA en el último escalón junto a la puerta y Florinda a su derecha en la puerta abierta; abajo a la IZQUIERDA, al pie de la escalinata, Tereso, Clementina y Mauricio (de izquierda a derecha), con el carro negro detrás.

Utilería, una de cada una: sarape de Saltillo de franjas de colores con flecos, carro negro largo sin logos ni placas. Sin armas, sangre, cifras de dinero ni deudas. Sin uniformes ni niños. Edades adultas en número en los prompts (74, 56, 49, 46, 41).

## Encuadres (copia de jipi-becal-p2)
30 planos con gente + 2 insertos: 16 OTS (53 %), 7 single (23 %: la presentación, la súplica, el llanto, la reacción, la emoción de Tereso, el gancho, CTA), 4 two-shot (13 %) y 3 de grupo (10 %). El que sale de espaldas va con su @{ASSET} y su ropa vista desde atrás (Clementina con o sin sarape según el momento). Cada OTS/two/grupo tiene su respaldo single (intentos 4-6 o `--one`).

## Diálogo (lines.json, fuente única)
| clip | quién | encuadre | frases |
|---|---|---|---|
| c01 | Fabián | OTS (Clementina de espaldas, izq.) | "¿Suegra? ¿Usted qué hace bajándose de ese carro?" / "Le dije que antes de las nueve se me iba." |
| r1 | — | single | mudo: Mauricio junto al carro negro (presentación) |
| c02 | Mauricio | OTS (Fabián, der.) | "Buenas noches, Fabián. Ella viene conmigo." / "Clementina fue mi nana. Me crió en la fábrica de mi padre." |
| c03 | Fabián | OTS (Mauricio, izq.) | "¿Su nana, licenciado?" / "Nadie me dijo que mi suegra lo conocía." |
| r2 | — | grupo | mudo: Florinda se congela en la puerta, Fabián pálido, Clementina abajo |
| c04 | Florinda | OTS (Clementina, izq.) | "Mamá… ¿por qué nunca me contaste?" / "Te hubiera abierto la puerta, te lo juro." |
| c05 | Clementina | OTS (Florinda, der.) | "Te lo pregunté en esta misma escalera, mija." / "Y me mandaste con tu hermano." |
| c06 | Tereso | OTS (Florinda, der.) | "Yo no tengo casa bonita, hermana." / "Pero en mi panadería a mi amá nadie la corrió." |
| c07 | Mauricio | two-shot | "Me contaron que aquí mi nana no combinaba." / "¿Es cierto eso, Fabián?" |
| c08 | Fabián | OTS (Mauricio, izq.) | "Fue una mala noche, licenciado." / "Andábamos nerviosos por su visita." |
| c09 | Clementina | OTS (Fabián, der.) | "¿Y mi sarape también fue por los nervios?" / "Usted lo tiró en ese escalón." |
| i01 | — | inserto | las manos de Clementina alisan el sarape |
| c10 | Mauricio | OTS (Fabián, der.) | "Ese sarape salió de los telares de mi padre." / "En mi fábrica nadie le falta al respeto a quien la levantó." |
| c11 | Fabián (súplica) | single | "Licenciado, apenas me hicieron gerente." / "Deme chance, se lo pido." |
| c12 | Mauricio | OTS (Fabián, der.) | "Un gerente que corre a su suegra no cuida a nadie." / "Mañana me entregas la oficina, Fabián." |
| r3 | — | single | mudo: a Fabián se le cae la cara, se afloja el cuello |
| c13 | Florinda | grupo | "Licenciado, mi esposo no es mala persona." / "Fue un error de una sola noche." |
| c14 | Clementina | OTS (Florinda, der.) | "¿Una noche, mija? Dormí en la central de camiones." / "Y tú ni siquiera me marcaste." |
| c15 | Fabián | OTS (Clementina, izq.) | "Suegra, pásele, la cena ya está servida." / "Esta siempre ha sido su casa." |
| c16 | Clementina | OTS (Fabián, der.) | "Gracias, Fabián, pero ya cené pan de pulque." / "Además, yo no combino con su casa." |
| c17 | Florinda (llanto) | single | "Mamá, perdóname, por favor." / "No me dejes así delante de todos." |
| c18 | Clementina | two-shot | "Te perdono, mija, porque soy tu madre." / "Pero desde hoy mi casa es la de tu hermano." |
| i02 | — | inserto | las manos de Clementina ponen el sarape en los hombros de Tereso |
| c19 | Clementina | OTS (Tereso, izq.) | "Este sarape lo tejí para la boda de tu hermana." / "Ahora es tuyo, Tereso. Tú sí me abriste." |
| c20 | Tereso | single | "Amá, no hacía falta nada de esto." / "Con tenerla conmigo me basta." |
| c21 | Mauricio | grupo (los tres de abajo) | "Tu mamá me contó lo del catre y los costales." / "Un hombre así lo quiero cerca, Tereso." |
| c22 | Tereso | OTS (Mauricio, der.) | "Gracias, licenciado, pero yo soy panadero." / "Si un día quiere pan, ya sabe dónde estoy." |
| c23 | Clementina | two-shot (con Mauricio) | "Así lo crié, Mauricio." / "Igualito que a ti, envuelto en mi rebozo." |
| r4 | — | two-shot | mudo: arriba, Florinda suelta el brazo de Fabián |
| c24 | Florinda | OTS (Fabián, izq.) | "Por tu cena me quedé sin madre, Fabián." / "Y sin hermano." |
| c25 | Fabián (gancho) | single | "¿Entregar mi oficina, yo?" / "Todavía no sabe lo que yo sé de esa fábrica, licenciado." |
| BLACK | — | — | 0,4 s |
| c26 | Clementina (CTA a cámara: sonrisa cómplice, pausa, ceja, se acomoda el rebozo, mira hacia la puerta de cristal, ladea la cabeza, asiente) | single | "¿Ustedes habrían perdonado a una hija así?" / "Escríbanmelo aquí abajo y síganme, que Fabián todavía guarda un secreto." |

26 clips hablados, 6 mudos, 378 palabras.

## Montaje
- Sin plano abierto ni de objetos: c01 arranca con Fabián ya hablando y "¿Suegra? ¿Usted qué hace bajándose de ese carro?" entra antes de los 2 s.
- Corte al terminar cada frase. Mismo personaje con frases seguidas = salto dentro de su clip. Reacciones de 1,0-1,2 s solo donde cuentan algo (r2-r4).
- Música VISTA: golpe sutil en el frame 0, suspenso hasta c19, cálida de c19 a c24 (el sarape para Tereso, "así lo crié"), suspenso en Florinda contra Fabián, el gancho y el CTA. BLACK de 0,4 s antes del CTA. SPEED = 1.15.
- El CTA solo nombra a Fabián, que se oye desde c01.
- Pronunciación a vigilar: "Clementina", "Arocha", "Tereso", "pan de pulque", "Florinda".
- QA: el sarape en el antebrazo izquierdo de Clementina hasta i02 y en los hombros de Tereso después; Fabián rapado de camisa blanca y Mauricio de traje azul (que no se confundan); Florinda con blusa verde esmeralda; el carro negro sin logos ni placas; Fabián y Florinda siempre arriba a la derecha y los demás abajo a la izquierda; nadie de espaldas que no sea el mismo personaje con su misma ropa.
