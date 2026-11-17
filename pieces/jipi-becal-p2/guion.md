---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, mexi-stories, parte2, remake-transformado, madrastra-justicia, suegra-nuera, becal, campeche, sombrero-jipi]
relatedTo: [jipi-becal, atrium-vista]
---
# La Cueva de Bécal · Parte 2

Continúa `pieces/jipi-becal`. La Parte 1 terminó con el plazo invertido (para el sábado, los doce sombreros los teje Zoraida) y con Zoraida llamándole a su hijo a escondidas: "Mijo, no le hagas caso a tu abuela. Ya anda muy confundida." Aquí se arranca desde esa llamada: castigo de la villana y desenlace del giro (la mentira de que Nicté "se fue con otro"). Diálogos, detalles y CTA nuevos.

Marca **MEXI STORIES**, la misma de la Parte 1 (edit.py, BRAND = "MEXI", SPEED = 1.15). No entra en la rotación. Sin Navidad.

Son 28 clips hablados de dos frases cortas (el CTA de 10 s), 3 insertos i* y 4 mudos r*: 35 clips. 375 palabras. El montaje apunta a 1:45-2:05 (con la aceleración de 1.15) y a 2 s o menos por tramo.

**Título:** Le escribía a su hijo haciéndose pasar por su nuera… y él bajó de la plataforma un día antes 😳 | La Cueva de Bécal · Parte 2

## Premisa
Gancho (0-2 s), con recordatorio: Zoraida, con su blusa de leopardo, sentada en el banquito de la cueva con un sombrero a medio tejer, susurra al celular dorado: "Mijo, tu abuela me tiene tejiendo en la cueva. Vente hoy mismo y sácame de aquí."

Lisandro llega un día antes de la plataforma (como la abuela en la P1). La abuela: "Tu mujer durmió en una cama, mijo. La que está en la cueva es tu madre." Zoraida sube por la escalera y se hace la víctima: "Tu abuela ya no sabe lo que dice." Sale Nicté. Lisandro: "Tú me mandaste mensajes… que eras feliz con otro." Nicté: "Tu mamá tenía mi celular desde hace semanas." La abuela le da el celular rosa que traía Zoraida en su bolsita dorada.

Desenlace del giro: "Estos mensajes salían todas las noches. Y tú me llamabas justo después, amá." Zoraida: "Lo hice por tu bien. Esa tejedora no es mujer para ti." Le pide a Nicté que diga que fue un malentendido: "Usted me quitó a mi esposo, doña Zoraida. Eso no fue ningún malentendido."

Castigo (los ganchos de la P1 al revés): Lisandro le quita el celular dorado, "para que rindas más, ¿no?". La abuela: "Desde hoy, el cuartito de la palma es tuyo. Y el petate también." "Y los doce sombreros siguen esperando." Nicté: "La escalera se queda abajo, doña Zoraida. Usted sube cuando quiera. Yo no soy como usted." Zoraida baja a la cueva.

Reconciliación: "Perdóname por creerle." / "Ya llegaste. Eso es lo único que me importa." La abuela: "Una familia se teje como un sombrero: hilo por hilo, y sin mentiras." Gancho: Zoraida sola en la cueva: "Doce sombreros, dice. Ya van a ver quién teje a quién." BLACK y CTA de Nicté a cámara.

## Qué cambia respecto a la P2 de Atrium (madrastra, 336K) y a la P1
| Atrium P2 (madrastra) | jipi-becal-p2 |
|---|---|
| El padre echa a la madrastra de la casa | La villana no se va: baja a la cueva, duerme en el petate y teje los doce sombreros |
| Sin objeto | El celular: Lisandro le quita el dorado "para que rindas" (su propia frase de la P1) y la escalera queda abajo |
| La hija perdona en silencio | Nicté deja la escalera abajo: "Yo no soy como usted" |
| Giro: la casa | Desenlace de la mentira: los mensajes de "ya no me busques" los mandaba Zoraida desde el celular de Nicté y luego le llamaba a su hijo para consolarlo |
| CTA del padre | CTA de Nicté: "¿Ustedes la dejarían salir de esa cueva?" |

Los dos CTA de la P1 eran "¿Ustedes creen que Lisandro le va a creer a su madre? Dale me gusta y sígueme para ver la segunda parte." (jipi) y "¿Qué harían ustedes con un hijo así?…" (pulsera). El de esta parte y el de pulsera-mexcaltitan-p2 son distintos entre sí. Ninguna frase de lines.json está en el lines.json de otra pieza (chequeo automático).

## Personajes
Las 3 hojas de personaje y las 2 locaciones de la Parte 1, copiadas a chars/ (se resuben con `make_sheets.py --reupload`, que salta las carpetas jipi-becal* en el control de duplicados), y una hoja nueva. Misma ropa que en la Parte 1.
| Hoja | Quién | Aspecto fijo |
|---|---|---|
| APOLONIA_CHABLE | Apolonia, 81, la abuela | pelo blanco en chongo bajo, huipil blanco bordado, rebozo negro, bastón en la mano DERECHA |
| ZORAIDA_CANUL | Zoraida, 56, la suegra (villana) | pelo corto cardado color vino, lentes de carey en la cabeza, blusa de leopardo, capri blanco, pulseras de oro, abanico negro en la mano DERECHA, bolsita dorada en el hombro IZQUIERDO |
| NICTE_UCAN | Nicté, 27, la nuera (CTA) | chongo bajo con mechones, vestido azul cielo deslavado, mandil beige, dedos vendados con tela blanca |
| **LISANDRO_PECH** (nueva) | Lisandro, 30, el nieto, esposo de Nicté | alto y fuerte, pelo negro corto, sin barba; playera gris jaspeada, jeans, botas cafés (ropa de civil, sin overol ni uniforme); maleta de lona azul marino solo en r1-c02 |

Presentación del personaje nuevo: Lisandro en r1 (two-shot mudo con la abuela, de las rodillas para arriba, ropa completa).

Locaciones: LOC_CUEVABECAL (c01, c27) y LOC_PATIOBECAL (todo lo demás, mismo día, luz de media mañana). Geografía fija del patio: boca de la cueva, silla de plástico y Zoraida a la IZQUIERDA; Lisandro en MEDIO bajo el árbol; Nicté y la abuela a la DERECHA bajo los arcos (Nicté a la izquierda de la abuela). La escalera está metida en la boca de la cueva todo el video.

Utilería, una de cada una: escalera de madera, sombrero a medio tejer en su horma (cueva), celular de funda rosa (de Nicté), celular de funda dorada (de Zoraida), abanico de encaje negro, bolsita dorada, maleta de lona azul marino (Lisandro, al llegar). Pantallas siempre apagadas o de espaldas, sin texto.

Sin armas, sangre, cifras de dinero ni deudas. Sin uniformes ni niños. Edades adultas en número en los prompts (81, 56, 30, 27).

## Encuadres (copia de costal-cuyutlan)
32 planos con gente + 3 insertos: 18 OTS (56 %), 7 single (22 %: la llamada, el celular, el llanto falso, reacciones, Zoraida en la cueva, CTA), 4 two-shot (12 %) y 3 de grupo (9 %). El que sale de espaldas va con su @{ASSET} y su ropa vista desde atrás. Cada OTS/two/grupo tiene su respaldo single (intentos 4-6 o `--one`).

## Diálogo (lines.json, fuente única)
| clip | quién | encuadre | frases |
|---|---|---|---|
| c01 | Zoraida (cueva, al celular) | single | "Mijo, tu abuela me tiene tejiendo en la cueva." / "Vente hoy mismo y sácame de aquí." |
| r1 | — | two-shot | mudo: llega Lisandro con su maleta, junto a la abuela (presentación) |
| c02 | Lisandro | OTS (abuela de espaldas, der.) | "Abuela, me bajé un día antes de la plataforma." / "¿Dónde está Nicté?" |
| c03 | Apolonia | OTS (Lisandro, izq.) | "Tu mujer durmió en una cama, mijo." / "La que está en la cueva es tu madre." |
| i01 | — | inserto | las manos con pulseras de oro suben por la escalera |
| c04 | Zoraida | OTS (Lisandro, der.) | "¡Mijo! Gracias a Dios que llegaste." / "Mira cómo me tiene tu abuela." |
| c05 | Lisandro | OTS (Zoraida, izq.) | "Amá, me dijiste que Nicté se fue con otro." / "Y la abuela dice que nunca salió de esa cueva." |
| c06 | Zoraida | OTS | "Tu abuela ya no sabe lo que dice." / "Esa muchacha te tiene engañado." |
| r2 | — | grupo | mudo: Nicté bajo los arcos, Lisandro voltea, a Zoraida se le congela la sonrisa |
| c07 | Nicté | OTS (Lisandro, izq.) | "Lisandro… ¿de veras eres tú?" / "Pensé que ya no querías saber de mí." |
| c08 | Lisandro | two-shot | "Tú me mandaste mensajes, Nicté." / "Que ya no te buscara, que eras feliz con otro." |
| c09 | Nicté | OTS | "Yo no te escribí nada, Lisandro." / "Tu mamá tenía mi celular desde hace semanas." |
| c10 | Apolonia | OTS (Lisandro, izq.) | "Aquí está ese celular, mijo." / "Lo traía tu madre en su bolsita dorada." |
| i02 | — | inserto | la mano vieja pone el celular rosa en la mano de Lisandro |
| c11 | Lisandro | single | "Estos mensajes salían todas las noches." / "Y tú me llamabas justo después, amá." |
| c12 | Zoraida | OTS | "Lo hice por tu bien, mijo." / "Esa tejedora no es mujer para ti." |
| c13 | Lisandro | OTS | "¿Por mi bien me hiciste creer que me dejó?" / "Tres semanas sin dormir, amá." |
| c14 | Apolonia | grupo (los cuatro) | "Y a ella la tenías abajo, sin escalera." / "Para que nunca pudiera contestarle." |
| c15 | Zoraida | OTS (Nicté, der.) | "Nicté, mija, tú sabes que yo te quiero." / "Dile que todo fue un malentendido." |
| c16 | Nicté | OTS (Zoraida, izq.) | "Usted me quitó a mi esposo, doña Zoraida." / "Eso no fue ningún malentendido." |
| r3 | — | single | mudo: a Zoraida se le cae la sonrisa falsa, aprieta la bolsita |
| c17 | Lisandro | OTS | "Ahora tu celular me lo quedo yo, amá." / "Para que rindas más, ¿no?" |
| i03 | — | inserto | la mano con pulseras entrega el celular dorado |
| c18 | Zoraida (llanto falso) | single | "¿Me vas a dejar sin celular, mijo?" / "Soy tu madre." |
| c19 | Lisandro | two-shot | "Por eso me duele más, amá." / "Porque a mí también me mentiste." |
| c20 | Apolonia | OTS (Zoraida, izq.) | "Desde hoy, Zoraida, el cuartito de la palma es tuyo." / "Y el petate también." |
| c21 | Zoraida | OTS (abuela, der.) | "¿Dormir en el petate, suegra?" / "Eso es para las tejedoras." |
| c22 | Apolonia | OTS | "Nicté durmió ahí tres semanas sin quejarse." / "Y los doce sombreros siguen esperando." |
| c23 | Nicté | OTS (Zoraida, izq.) | "La escalera se queda abajo, doña Zoraida." / "Usted sube cuando quiera. Yo no soy como usted." |
| r4 | — | single | mudo: Zoraida baja por la escalera a la cueva con su abanico |
| c24 | Lisandro | two-shot | "Perdóname por creerle, Nicté." / "Debí venir desde el primer mensaje." |
| c25 | Nicté | OTS (Lisandro, izq.) | "Ya llegaste, Lisandro." / "Eso es lo único que me importa." |
| c26 | Apolonia | grupo (los tres) | "Una familia se teje como un sombrero, mijos." / "Hilo por hilo, y sin mentiras." |
| c27 | Zoraida (cueva) | single | "Doce sombreros, dice." / "Ya van a ver quién teje a quién." |
| BLACK | — | — | 0,4 s |
| c28 | Nicté (CTA a cámara: sonrisa cómplice, pausa, ceja, se acomoda un mechón con los dedos vendados, ladea la cabeza, mira hacia la cueva, asiente) | single | "¿Ustedes la dejarían salir de esa cueva?" / "Cuéntenmelo en los comentarios y síganme, que esto todavía no se acaba." |

28 clips hablados, 7 mudos, 375 palabras.

## Montaje
- Sin plano abierto ni de objetos: c01 arranca con Zoraida ya hablando y "tu abuela me tiene tejiendo en la cueva" entra antes de los 2 s.
- Corte al terminar cada frase. Mismo personaje con frases seguidas = salto dentro de su clip. Reacciones de 1,0-1,2 s solo donde cuentan algo (r2-r4).
- Música MEXI: golpe sutil en el frame 0, suspenso hasta c24, cálida de c24 a c27 (perdón y "hilo por hilo"), suspenso en el gancho y el CTA. BLACK de 0,4 s antes del CTA. SPEED = 1.15.
- El CTA no nombra a nadie ("la", la cueva): se entiende por el video.
- Pronunciación a vigilar: "Nicté", "Zoraida", "Lisandro", "plataforma", "petate", "malentendido".
- QA: Zoraida con leopardo, pelo vino y abanico negro también en la cueva; Lisandro sin uniforme ni overol, playera gris; la escalera siempre metida en la boca de la cueva; Zoraida siempre a la izquierda, Nicté y la abuela a la derecha; pantallas sin texto; nadie de espaldas que no sea el mismo personaje con su misma ropa.
