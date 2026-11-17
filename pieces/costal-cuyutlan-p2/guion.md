---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, mexi-stories, parte2, remake-transformado, capos, colima, cuyutlan, salinas, hermano-traidor]
relatedTo: [costal-cuyutlan, reten-sierra, atrium-vista]
---
# La Sal de Cuyutlán · Parte 2

Continúa `pieces/costal-cuyutlan`. La Parte 1 terminó con el plazo invertido ("antes de la primera gota, mueve esa camioneta"), con Evelio, el hermano de Atanasio, bajando de la camioneta blanca ("La mitad era mía, Atanasio") y con las primeras gotas sobre los costales. Aquí se arranca desde esa lluvia: castigo del villano (Leónidas) y desenlace del giro (Evelio vendió lo que no era suyo). Diálogos, detalles y CTA nuevos.

El Retén de Atrium no tiene P2 analizada en `fuentes/atrium-vista/videos/`; el ritmo emocional sigue la P2 de Evaristo (7706270980758441247, 390K): arranque en plena tensión, el traidor se defiende, alguien con autoridad lo desmiente, castigo y cierre con un dilema a cámara.

Marca **MEXI STORIES**, la misma de la Parte 1 (edit.py, BRAND = "MEXI", SPEED = 1.15). No entra en la rotación. Sin Navidad.

Son 26 clips hablados de dos frases cortas (el CTA de 10 s), 2 insertos i* y 5 mudos r*: 33 clips. 388 palabras. El montaje apunta a 1:40-2:00 (con la aceleración de 1.15) y a 2 s o menos por tramo.

**Título:** Su hermano le vendió el bordo a escondidas… pero la tierra nunca fue suya 😳 | La Sal de Cuyutlán · Parte 2

## Premisa
Gancho (0-2 s), con recordatorio: Leónidas, frente a su camioneta blanca, con la llovizna en el sombrero: "Ya cayó la primera gota, viejo, y aquí sigo. Su hermano me vendió este bordo con todo y lluvia."

Atanasio: "Mi hermano le vendió lo que no era suyo." Evelio: "La mitad me tocaba. Mi apá nos lo dejó a los dos." Llega Remigia (nueva, 78), la salinera más vieja, con un papel amarillento: "Tu apá no les dejó nada a ustedes dos. Se lo dejó al pueblo, y yo estuve ahí. Lo firmó delante de toda la asamblea." Leónidas se burla del papel; Atanasio: "Pregúntele a cualquiera de los que están aquí." Los salineros asienten a lo lejos.

Desenlace del giro: Leónidas se vuelve contra Evelio ("usted me vendió puro aire") y Evelio contra él ("me dijo que era un trato limpio"). Xóchitl: "¿Más que a su propia sangre?" Evelio confiesa: "Yo nomás quería irme de aquí. Toda la vida oliendo a sal, como mi apá."

Castigo del villano: "Ya llovió, señor. Su plazo se acabó." La camioneta blanca se atasca en el lodo y nadie la empuja: "Aquí nadie empuja lo que vino a quitarnos. Por la playa se llega caminando." "¿Con estos zapatos?" "Ya le dije que se le notaba en los zapatos." Leónidas se va a pie por el bordo, con los mocasines en el lodo.

Castigo del traidor: Evelio pide perdón y ofrece irse; Atanasio: "Irte es lo fácil. Ahora vas a cargar los costales a la caseta, uno por uno." Xóchitl le da el primer costal: "Usted me enseñó que la sal no espera, tío." Cálida: Remigia ("tu padre estaría orgulloso de ti") y Atanasio ("un hermano no se vende, pero la confianza se tiene que volver a ganar"). Gancho: Evelio solo en la caseta: "Lo que mi hermano no sabe… es quién me presentó a ese señor." BLACK y CTA de Atanasio a cámara.

## Qué cambia respecto a la P1 y a las otras Partes 2
| Parte 1 | costal-cuyutlan-p2 |
|---|---|
| El plazo es la lluvia | Ya llueve: el plazo se cumple contra Leónidas |
| Leónidas dice que compró la mitad del bordo | El papel de la asamblea: el bordo es del pueblo, Evelio vendió lo que no era suyo |
| La camioneta blanca atravesada bloquea el bordo | La camioneta se atasca en el lodo y nadie la empuja: Leónidas se va a pie |
| Evelio se quiere ir para siempre | Irse es lo fácil: carga los costales a la caseta bajo la lluvia |
| CTA "¿Ustedes perdonarían a un hermano así?" | CTA "¿Ustedes lo pondrían a cargar sal o lo correrían del pueblo?" |

Ninguna frase de lines.json está en el lines.json de otra pieza (chequeo automático).

## Personajes
Las 4 hojas de personaje y LOC_SALINASCUYUT de la Parte 1, copiadas a chars/ (se resuben con `make_sheets.py --reupload`, que salta las carpetas costal-cuyutlan* en el control de duplicados), y una hoja nueva. Misma ropa que en la Parte 1.
| Hoja | Quién | Aspecto fijo |
|---|---|---|
| ATANASIO_VARELA | Atanasio, 69, salinero viejo (CTA) | pelo blanco rizado, barba blanca de días, camisa azul cielo arremangada, pantalón blanco de manta, botas de hule, trapo blanco al cuello |
| LEONIDAS_PAZOS | Leónidas, 52, el fuereño (villano) | alto y pesado, bigote delgado, sombrero de paja crema (el único con sombrero), polo negra, pantalón beige, hebilla de plata, mocasines cafés |
| EVELIO_VARELA | Evelio, 62, el hermano (traidor) | bajito y panzón, calvo arriba, lentes redondos, camisa guinda de manga corta, pantalón gris |
| XOCHITL_VARELA | Xóchitl, 31, la hija | pelo corto a la quijada, aretitos de plata, playera amarilla mostaza, overol de mezclilla, botas de hule |
| **REMIGIA_SOTELO** (nueva) | Remigia, 78, la salinera más vieja | bajita y encorvada, trenza gris larga, sin sombrero, blusa morada deslavada, falda café larga, rebozo negro anudado, sandalias de hule; papel viejo amarillento doblado |

Presentación del personaje nuevo: Remigia en r1 (plano medio de las rodillas para arriba, ropa completa).

Locación: LOC_SALINASCUYUT con llovizna constante y lodo brillante; la caseta de palma (c25) es una de las casetas de la misma locación. Geografía fija: a la IZQUIERDA la camioneta azul con costales, Xóchitl en la caja, Atanasio junto a la puerta trasera y Remigia a su derecha; a la DERECHA la camioneta blanca atravesada, Leónidas delante y Evelio junto a la puerta abierta.

Utilería, una de cada una: costales blancos de rafia con sal, camioneta azul vieja, camioneta blanca de doble cabina sin logos ni placas, papel viejo amarillento con letra ilegible. Sin armas, sangre, cifras de dinero ni deudas. Sin uniformes ni niños. Edades adultas en número en los prompts (78, 69, 62, 52, 31).

## Encuadres (copia de jipi-becal-p2)
31 planos con gente + 2 insertos: 16 OTS (52 %), 8 single (26 %: presentación, confesión, reacción, la camioneta atascada, Leónidas a pie, la protesta de Evelio, el gancho, CTA), 4 two-shot (13 %) y 3 de grupo (10 %). El que sale de espaldas va con su @{ASSET} y su ropa vista desde atrás. Cada OTS/two/grupo tiene su respaldo single (intentos 4-6 o `--one`).

## Diálogo (lines.json, fuente única)
| clip | quién | encuadre | frases |
|---|---|---|---|
| c01 | Leónidas | OTS (Atanasio de espaldas, izq.) | "Ya cayó la primera gota, viejo, y aquí sigo." / "Su hermano me vendió este bordo con todo y lluvia." |
| c02 | Atanasio | OTS (Leónidas, der.) | "Mi hermano le vendió lo que no era suyo, señor." / "Este bordo nunca ha sido de uno solo." |
| c03 | Evelio | OTS (Atanasio, izq.) | "La mitad me tocaba, Atanasio." / "Mi apá nos lo dejó a los dos." |
| r1 | — | single | mudo: llega Remigia con el papel (presentación) |
| c04 | Remigia | OTS (Evelio, der.) | "Tu apá no les dejó nada a ustedes dos, Evelio." / "Se lo dejó al pueblo, y yo estuve ahí." |
| i01 | — | inserto | las manos de Remigia abren el papel bajo la llovizna |
| c05 | Remigia | OTS (Leónidas, der.) | "Lo firmó delante de toda la asamblea, señor." / "Este bordo no se vende, ni por mitades." |
| c06 | Leónidas | grupo | "¿Y ese papel viejo qué vale, señora?" / "Yo tengo la firma de su hermano." |
| c07 | Atanasio | OTS (Leónidas, der.) | "Vale más que su camioneta, señor." / "Pregúntele a cualquiera de los que están aquí." |
| r2 | — | grupo | mudo: los salineros asienten a lo lejos, Leónidas mira alrededor |
| c08 | Leónidas | two-shot (con Evelio) | "Usted me vendió puro aire, Evelio." / "Me juró que nadie iba a reclamar." |
| c09 | Evelio | OTS (Leónidas, izq.) | "Usted me dijo que era un trato limpio." / "Y que mi hermano ni se iba a enterar." |
| c10 | Xóchitl | OTS (Evelio, der.) | "¿Y usted le creyó, tío?" / "¿Más que a su propia sangre?" |
| c11 | Evelio (confesión) | single | "Yo nomás quería irme de aquí, mija." / "Toda la vida oliendo a sal, como mi apá." |
| c12 | Atanasio | OTS (Evelio, der.) | "Esa sal te dio de comer, Evelio." / "Y hoy casi se la regalas a un fuereño." |
| r3 | — | single | mudo: Evelio baja la cabeza, gotas en los lentes |
| c13 | Atanasio | OTS (Leónidas, der.) | "Ya llovió, señor. Su plazo se acabó." / "Mueva esa camioneta y váyase de Cuyutlán." |
| c14 | Leónidas | single | "No se mueve, viejo. Se atascó en el lodo." / "Que me ayuden a empujarla." |
| i02 | — | inserto | la llanta de la camioneta blanca gira en el lodo |
| c15 | Xóchitl | OTS (Leónidas, der.) | "Aquí nadie empuja lo que vino a quitarnos." / "Por la playa se llega caminando, señor." |
| c16 | Leónidas | OTS (Atanasio, izq.) | "¿Caminando? ¿Con estos zapatos?" / "Mis abogados van a oír de usted." |
| c17 | Atanasio | OTS (Leónidas, der.) | "Ya le dije que se le notaba en los zapatos." / "Que le vaya bonito, señor." |
| r4 | — | single | mudo: Leónidas se va a pie por el bordo, de espaldas, con los mocasines en el lodo |
| c18 | Evelio | OTS (Atanasio, izq.) | "Atanasio, perdóname. No sé qué me pasó." / "Si quieres, me voy y no vuelvo." |
| c19 | Atanasio | two-shot (con Evelio) | "Irte es lo fácil, Evelio." / "Ahora vas a cargar los costales a la caseta, uno por uno." |
| c20 | Evelio | single | "¿Yo solo, con este aguacero?" / "Son los costales de todo el pueblo." |
| c21 | Xóchitl | OTS (Evelio, der.) | "Usted me enseñó que la sal no espera, tío." / "Ándele, que se nos deshace." |
| r5 | — | two-shot | mudo: Evelio carga un costal al hombro, Xóchitl lo mira desde la caja |
| c22 | Remigia | grupo (con Atanasio y Xóchitl) | "Tu padre estaría orgulloso de ti, Atanasio." / "Y muy triste por tu hermano." |
| c23 | Atanasio | two-shot (con Xóchitl) | "Un hermano no se vende, mija." / "Pero la confianza se tiene que volver a ganar." |
| c24 | Xóchitl | OTS (Atanasio, der.) | "Entonces que empiece hoy, apá." / "Con la sal en la espalda." |
| c25 | Evelio (gancho, en la caseta) | single | "Lo que mi hermano no sabe…" / "es quién me presentó a ese señor." |
| BLACK | — | — | 0,4 s |
| c26 | Atanasio (CTA a cámara: sonrisa cómplice, pausa, ceja, se seca la lluvia con el trapo del cuello, ladea la cabeza, mira las charcas, asiente) | single | "¿Ustedes lo pondrían a cargar sal o lo correrían del pueblo?" / "Díganmelo en los comentarios y síganme, que alguien más anda metido en esto." |

26 clips hablados, 7 mudos, 388 palabras.

## Montaje
- Sin plano abierto ni de objetos: c01 arranca con Leónidas ya hablando y "Ya cayó la primera gota, viejo" entra antes de los 2 s.
- Corte al terminar cada frase. Mismo personaje con frases seguidas = salto dentro de su clip. Reacciones de 1,0-1,2 s solo donde cuentan algo (r2-r5).
- Música MEXI: golpe sutil en el frame 0, suspenso hasta c22, cálida de c22 a c25 ("tu padre estaría orgulloso", "un hermano no se vende"), suspenso en el gancho y el CTA. BLACK de 0,4 s antes del CTA. SPEED = 1.15.
- El CTA no nombra a nadie ("lo"): se entiende por el video.
- Pronunciación a vigilar: "Cuyutlán", "Xóchitl", "Remigia", "asamblea", "fuereño", "aguacero".
- QA: llovizna en todos los planos de exteriores (ni seco ni tormenta); Leónidas el único con sombrero; la camioneta blanca a la derecha y la azul a la izquierda, sin letras ni placas; el papel sin texto legible; Remigia sin sombrero; nadie de espaldas que no sea el mismo personaje con su misma ropa.
