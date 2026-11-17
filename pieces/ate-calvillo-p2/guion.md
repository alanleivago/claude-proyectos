---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, mexi-stories, parte2, remake-transformado, padre-hijos-herencia, justicia-familiar, aguascalientes, calvillo, guayaba]
relatedTo: [ate-calvillo, costal-cuyutlan-p2, atrium-vista]
---
# El Ate de Calvillo · Parte 2

Continúa `pieces/ate-calvillo`. La Parte 1 terminó con el plazo invertido ("Antes de que cuaje el ate, Marcela, me dejas las llaves"), la camioneta a nombre de Cleofas y el gancho: "Y el lunes te presentas en la empacadora. Ya es hora de que conozcas a tu patrón." Aquí se arranca desde ese gancho: desenlace del giro (la empacadora es de Cleofas y él pidió el puesto para su hijo), castigo de la villana (Marcela se va a pie, en camión, como lo mandaron a él) y el hijo que se queda a empezar desde abajo. Diálogos, detalles y CTA nuevos.

Ritmo emocional del Final de don Evaristo (7706344565933985054, bloques 5-9): el hijo se quiebra y pide perdón, el padre perdona sin cambiar su decisión ("volver a confiar va a tomar tiempo"), la villana sale, recompensa para la hija humilde, catarsis y cierre a cámara. La salida de la villana sigue el Final de la madrastra (7705499092683590942, bloques 5-6): humillación devuelta y amenaza al irse.

Marca **MEXI STORIES**, la misma de la Parte 1 (edit.py, BRAND = "MEXI", SPEED = 1.15). No entra en la rotación. Sin Navidad.

Son 24 clips hablados de dos frases cortas (el CTA de 10 s), 1 inserto y 5 mudos: 30 clips. 369 palabras. El montaje apunta a 1:30-1:50 (con la aceleración de 1.15) y a 2 s o menos por tramo.

**Título:** Su hijo era gerente de la empacadora… y no sabía quién era el dueño 😳 | El Ate de Calvillo · Parte 2

## Premisa
Gancho (0-2 s), con recordatorio: Eleazar, pálido junto al portón: "¿Mi patrón? ¿La empacadora es suya, apá? Yo llevo años de gerente ahí."

Desenlace del giro: Cleofas la compró con la guayaba del cañón y pidió que le dieran el puesto a su hijo; quería ver qué hacía con un poquito de poder, y lo usó para subirlo a un camión. El lunes empieza desde abajo, cortando guayaba en la huerta de su hermana. Marcela se burla ("¿qué va a decir la gente en Calvillo?") y ataca a Gertrudis; Cleofas: "Ella me dio de comer sin saber de las huertas. Tú viniste por mí en cuanto supiste."

Castigo de la villana: el ate cuaja y la pala queda parada en el cazo. "Ya cuajó, Marcela. Se te acabó el tiempo. Las llaves ya están en mi mesa." "¿Con estos tacones, por toda la terracería?" "En camión, como me mandaron a mí." Marcela le ordena a Eleazar que se vayan; él se queda: "Yo me quedo aquí, a cortar guayaba con mi hermana." Marcela se va a pie por la calle de tierra, en tacones.

Perdón (bloque 5 de Evaristo): Eleazar llora, "lo dejé solo en esa ventanilla"; Cleofas: "Te perdono, mijo, pero las huertas no cambian. Y volver a confiar en ti me va a tomar tiempo." Eleazar se quita el reloj dorado y carga una canasta de guayabas. Cálida: Gertrudis ("esas canastas no se cargan solas") y Cleofas ("le das la mano hasta al que me dejó en la central"). Gancho: Marcela al teléfono en la calle: "Pero el viejo no sabe lo que firmó Eleazar." BLACK y CTA de Cleofas.

## Qué cambia respecto a la P1 y a las otras Partes 2
| Parte 1 | ate-calvillo-p2 |
|---|---|
| "Ya es hora de que conozcas a tu patrón" | La empacadora es de Cleofas y él pidió el puesto: el lunes empieza cortando guayaba |
| El plazo: antes de que cuaje el ate | El ate cuaja (la pala queda parada): Marcela pierde la camioneta |
| Lo subieron a un camión sin bajarse del carro | Marcela se va a la central en camión, a pie y en tacones |
| El hijo culpa a su esposa | El hijo se queda con su padre y su hermana; Marcela se va sola |
| CTA "¿le devolverían las llaves a un hijo así?" | CTA "Si fuera su hijo, ¿le darían la canasta o el boleto de camión?" |

Ninguna frase de más de 3 palabras de lines.json está en el lines.json de otra pieza (chequeo automático).

## Personajes
Las 4 hojas de personaje y LOC_ATECALVILLO de la Parte 1, copiadas a chars/ (se resuben con `make_sheets.py --reupload`, que salta las carpetas ate-calvillo* en el control de duplicados). Sin hojas nuevas ni personajes nuevos (no hace falta plano de presentación). Misma ropa que en la Parte 1.
| Hoja | Quién | Aspecto fijo |
|---|---|---|
| CLEOFAS_ELIZALDE | Cleofas, 74, el padre guayabero (CTA) | delgado y curtido, bigote blanco grueso, sombrero de palma claro, camisa a cuadros café y crema, paliacate rojo, jeans deslavados, botas café |
| GERTRUDIS_ELIZALDE | Gertrudis, 41, la hija humilde | trenza negra larga, blusa azul cielo arremangada, mandil rosa, falda azul marino; menea el cazo con la pala |
| MARCELA_COLLADO | Marcela, 44, la nuera (villana) | pelo castaño rojizo lacio, lentes de sol en la cabeza, labios rojos, blusa de satín verde esmeralda, jeans blancos, tacones nude, bolsa blanca chica |
| ELEAZAR_ELIZALDE | Eleazar, 48, el hijo | robusto, rapado, candado negro, polo vino, pantalón caqui, mocasines cafés, reloj dorado (se lo quita en r4) |

Locación: LOC_ATECALVILLO, la misma tarde dorada; la calle de tierra frente al portón (r3, c23) es parte de la misma locación. Geografía fija: a la IZQUIERDA el fogón con el cazo (Gertrudis meneando, Cleofas a su derecha); a la DERECHA el portón verde (Marcela, y Eleazar a su derecha). La llave negra de la camioneta está en la mesita junto a Cleofas (fin de la P1).

Utilería, una de cada una: cazo de cobre con ate rosa y pala de madera, sombrero de palma, llave negra de la camioneta, bolsa blanca chica, camioneta gris oscuro de doble cabina, canasta de guayabas amarillas, celular negro liso. Sin armas, sangre, cifras de dinero ni deudas. Sin uniformes ni niños. Edades adultas en número en los prompts (74, 48, 44, 41).

## Encuadres (copia de costal-cuyutlan-p2)
29 planos con gente + 1 inserto: 15 OTS (52 %), 7 single (24 %: la herida, el plazo cumplido, los tacones, Eleazar se queda, Marcela a pie, el gancho, CTA), 4 two-shot (14 %) y 3 de grupo (10 %, todos mudos). El que sale de espaldas va con su @{ASSET} y su ropa vista desde atrás. Cada OTS/two/grupo tiene su respaldo single (intentos 4-6 o `--one`).

## Diálogo (lines.json, fuente única)
| clip | quién | encuadre | frases |
|---|---|---|---|
| c01 | Eleazar | OTS (Cleofas de espaldas, izq.) | "¿Mi patrón? ¿La empacadora es suya, apá?" / "Yo llevo años de gerente ahí." |
| c02 | Cleofas | OTS (Eleazar, der.) | "La compré con la guayaba del cañón, mijo." / "Y yo pedí que te dieran ese puesto." |
| c03 | Marcela | OTS (Cleofas, izq.) | "¿Y nunca nos dijo nada, suegro?" / "Nos dejó creer que era mérito de él." |
| c04 | Cleofas | single | "Quería ver qué hacía mi hijo con un poquito de poder." / "Y lo usó para subirme a un camión." |
| r1 | — | grupo | mudo: la noticia cae; la pala se detiene, Eleazar mira al suelo |
| c05 | Eleazar | OTS (Cleofas, izq.) | "¿Me va a correr, apá?" / "Ahí está toda mi vida, mi gente, mi oficina." |
| c06 | Cleofas | OTS (Eleazar, der.) | "No te corro. El lunes empiezas desde abajo." / "Cortando guayaba en la huerta de tu hermana." |
| c07 | Marcela | two-shot (con Eleazar) | "¿Mi marido, cortando guayaba como peón?" / "¿Qué va a decir la gente en Calvillo?" |
| c08 | Gertrudis | OTS (Marcela, der.) | "Que por fin trabaja con las manos, cuñada." / "Como mi apá toda su vida." |
| c09 | Marcela | OTS (Gertrudis, izq.) | "Tú cállate, que ya te quedaste con todo." / "Por eso le meneabas el ate a diario." |
| c10 | Cleofas | OTS (Marcela, der.) | "Ella me dio de comer sin saber de las huertas." / "Tú viniste por mí en cuanto supiste." |
| i01 | — | inserto | el ate cuajado, la pala parada en el cazo |
| c11 | Gertrudis | two-shot (con Cleofas) | "Apá, ya cuajó el ate." / "Mire, ya no se mueve la pala." |
| c12 | Cleofas | single | "Ya cuajó, Marcela. Se te acabó el tiempo." / "Las llaves ya están en mi mesa." |
| c13 | Marcela | single | "¿Y cómo quiere que me vaya, a pie?" / "¿Con estos tacones, por toda la terracería?" |
| c14 | Cleofas | OTS (Marcela, der.) | "En camión, como me mandaron a mí." / "La central te queda cerquita, Marcela." |
| r2 | — | grupo | mudo: Marcela mira la camioneta que ya no es suya |
| c15 | Marcela | OTS (Eleazar, der.) | "Eleazar, vámonos de aquí." / "No me vas a dejar sola con esta gente." |
| c16 | Eleazar | single | "Vete tú, Marcela." / "Yo me quedo aquí, a cortar guayaba con mi hermana." |
| c17 | Marcela | OTS (Eleazar, der.) | "¿Me cambias por una canasta de guayabas?" / "Te vas a acordar de este día, Eleazar." |
| r3 | — | single | mudo: Marcela se va a pie por la calle de tierra, de espaldas, en tacones |
| c18 | Eleazar | OTS (Cleofas, izq.) | "Perdóneme, apá. Lo dejé solo en esa ventanilla." / "No sé cómo voy a reparar eso." |
| c19 | Cleofas | two-shot (con Eleazar) | "Te perdono, mijo, pero las huertas no cambian." / "Y volver a confiar en ti me va a tomar tiempo." |
| r4 | — | two-shot | mudo: Eleazar se quita el reloj dorado y lo guarda; Cleofas lo mira |
| c20 | Gertrudis | OTS (Eleazar, der.) | "Pues a trabajar, hermano." / "Esas canastas de guayaba no se cargan solas, y el ate tampoco espera." |
| c21 | Cleofas | OTS (Gertrudis, izq.) | "Tu mamá te enseñó bien, Gertrudis." / "Le das la mano hasta al que me dejó en la central." |
| c22 | Gertrudis | OTS (Cleofas, der.) | "Usted me enseñó, apá." / "En esta casa nadie se queda en la calle." |
| r5 | — | grupo | mudo: Eleazar carga una canasta de guayabas; padre e hija sonríen |
| c23 | Marcela (gancho, en la calle, al teléfono) | single | "Ya me corrieron, comadre." / "Pero el viejo no sabe lo que firmó Eleazar." |
| BLACK | — | — | 0,4 s |
| c24 | Cleofas (CTA a cámara: sonrisa pícara, pausa, ceja, se toca el ala del sombrero, prueba el ate de la pala, ladea la cabeza, asiente y guiña) | single | "Si fuera su hijo, ¿le darían la canasta o el boleto de camión?" / "Díganmelo abajo y síganme, que Marcela todavía no dice su última palabra." |

24 clips hablados, 6 mudos (1 inserto), 369 palabras.

## Montaje
- Sin plano abierto ni de objetos: c01 arranca con Eleazar ya hablando y "¿Mi patrón?" entra antes de los 2 s.
- Corte al terminar cada frase. Reacciones de 1,0-1,2 s solo donde cuentan algo (r1-r5).
- Música MEXI: golpe sutil en el frame 0, suspenso hasta c19, cálida de c19 a c23 (el perdón, las canastas, "tu mamá te enseñó bien"), suspenso en el gancho y el CTA. BLACK de 0,4 s antes del CTA. SPEED = 1.15.
- El CTA solo nombra a Marcela, que se oye en todo el video.
- Pronunciación a vigilar: "Calvillo", "Cleofas", "Gertrudis", "Eleazar", "empacadora", "cuajó", "terracería".
- QA: Cleofas siempre con sombrero y paliacate; Gertrudis junto al cazo a la izquierda; Marcela y Eleazar en el portón a la derecha; la camioneta gris oscuro afuera; Eleazar sin la llave (la tiene su padre) y con el reloj hasta r4; ningún texto legible; nadie de espaldas que no sea el mismo personaje con su misma ropa.
