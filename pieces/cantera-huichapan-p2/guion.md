---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, majestic-stories, parte2, remake-transformado, patron-injusticia, huichapan, hidalgo, cantera]
relatedTo: [cantera-huichapan, atrium-vista]
---
# La Cantera de Huichapan · Parte 2

Continúa `pieces/cantera-huichapan`. La Parte 1 terminó con Rosalba en la caseta: "Sotero, súbete a la caseta. Antes de que acabe el turno. Escuché cada palabra. Por el celular de Abdías." Se sigue el ritmo emocional de "Su jefe les cobraba lo que era gratis" de @atriumstories_ (7698054444662934815, **141K vistas**, 85 s, 32 planos; análisis: `fuentes/atrium-vista/videos/7698054444662934815_analisis.md`): sentencia en el despacho, excusa del "malentendido", la prueba, el orgullo herido del villano, despido con devolución o denuncia, amenaza en el patio y réplica del honesto, agradecimiento y ascenso, el equipo gratis para todos. Diálogos, detalles y CTA nuevos; sin cifras.

Marca **MAJESTIC STORIES**, la misma de la Parte 1 (edit.py, BRAND = "MAJESTIC"). No entra en la rotación. Sin Navidad.

Son 30 clips hablados de dos frases cortas (el CTA de 10 s), 6 insertos i* y 5 reacciones mudas r* (r4 es la presentación de Bonifacio): 41 clips, 376 palabras. El montaje apunta a 1:50-2:10 con 2 s o menos por tramo; si pasa, se recortan frases de c09-c11.

**Título:** Les cobró a todos lo que era gratis… y la patrona lo hizo devolverlo en la mano de cada uno 😳 | La Cantera de Huichapan · Parte 2

## Premisa
Gancho (0-2 s), recordatorio de menos de 1 s: el celular encendido en la bolsa de la camisa de Abdías. Rosalba, en la caseta: "Les cobraste a todos lo que era gratis, Sotero. Hoy se te acaba el turno."

Sotero llega con la libreta del almacén: "Todo fue un malentendido… lo cobraba para reponer lo que se pierde." Rosalba: "El equipo lo compro yo. Cada caja de ese estante." Sotero culpa a Abdías ("revoltoso"); ella: "Abdías no dijo nada que tú no dijeras." Saca la libreta negra de Sotero, con el nombre de cada cantero que le pagó. Sotero: "Esa libreta no prueba nada", y luego el orgullo herido: "Toda mi vida cuidando esta cantera… ¿y así me lo paga? Algo me tenía que tocar a mí." Rosalba: "Tu trabajo era cuidar sus manos y sus ojos." Despido: las llaves del almacén en el escritorio, devolverle a cada uno lo que le cobró, en su mano y delante de todos, antes de que acabe el turno (el plazo de la P1), o la ley. "Como usted mande."

Patio al acabar el turno. Sotero: "Me quitaste el patio, muchacho. Esto te lo voy a cobrar." Abdías: "Ya cobró bastante, don Sotero. Ahora le toca devolver." Rosalba llega: "Yo le creo a Abdías. Empieza por él, y que todos lo vean." Sotero baja la cabeza.

Recompensa: Rosalba le da las gracias y lo nombra encargado del patio. Abdías reparte las cajas de guantes y lentes: "Desde hoy, aquí nadie paga su equipo." Don Bonifacio (presentación muda), el cantero mayor que ya no veía bien la piedra, recibe sus lentes: "Usted me enseñó a labrar… ahora me toca cuidarlo." "Hace mucho que nadie nos cuidaba, patrona." BLACK y CTA de Rosalba a cámara.

## Qué cambia respecto a la P2 de Atrium
| Atrium P2 | Remake P2 |
|---|---|
| "Les quitaste el pan a 100 familias" | "Les cobraste a todos lo que era gratis, Sotero. Hoy se te acaba el turno." (sin cifras, con el plazo de la P1) |
| El comprobante y "fue un malentendido" | La libreta del almacén; Rosalba: "El equipo lo compro yo. Cada caja de ese estante." |
| 100 trabajadores × 1.800 pesos; cámaras con audio | La libreta negra de Sotero con el nombre de cada cantero que le pagó; lo oyó por el celular de Abdías (P1) |
| "20 años… ¿y nadie me lo reconoce? Tomé lo que me tocaba" | "Toda mi vida cuidando esta cantera… ¿y así me lo paga? Algo me tenía que tocar a mí." |
| Entrega casco y llaves; Seguridad lo acompaña | Deja las llaves del almacén en el escritorio; sin guardias ni uniformes |
| Devolver hasta el último peso o denuncia | Devolver a cada uno lo suyo, en su mano y delante de todos, antes de que acabe el turno, o la ley |
| "Esto no se queda así, Tomás" / "Ya se quedó así" | "Esto te lo voy a cobrar" / "Ya cobró bastante. Ahora le toca devolver." + "Yo le creo a Abdías" |
| Tomás supervisor; aplauso de los obreros | Abdías encargado del patio; reparte guantes y lentes; don Bonifacio recibe sus lentes |
| Narrador con moraleja y "sigue la página" | Rosalba a cámara: "¿Ustedes le habrían dado otra oportunidad a Sotero? Dale me gusta y sígueme para más historias de la cantera." |

## Personajes
Las 3 hojas de personaje y las 2 locaciones de la Parte 1, que se copian a chars/ (`make_sheets.py` las toma de pieces/cantera-huichapan/chars y en `--reupload` salta las carpetas cantera-huichapan* en el control de duplicados), y una hoja nueva. Misma ropa que en la Parte 1 (anclas ROS, ABD y SOT idénticas en clips.py). **Al escribir esta P2 la Parte 1 todavía no tenía chars/: hay que generar primero sus hojas.**
| Hoja | Quién | Aspecto fijo |
|---|---|---|
| ROSALBA_MONROY | Rosalba, 52, dueña de la cantera (CTA) | melena corta gris plateada, aretes de perla; abrigo largo camel sobre cuello de tortuga crema |
| ABDIAS_CARBAJAL | Abdías, 31, cantero | bigote delgado; camisa rojo ladrillo empolvada, paliacate gris al cuello |
| SOTERO_VERASTEGUI | Sotero, 56, supervisor (villano) | calvo, piocha gris, lentes redondos; camisa de cuadros mostaza, chaleco acolchado verde liso sin letras, lápiz amarillo en la oreja derecha |
| **BONIFACIO_URIBE** (nueva) | don Bonifacio, 64, cantero mayor | pelo blanco corto, barba blanca de días, sin lentes; sombrero de palma gastado, camisa azul cielo empolvada, pantalón beige |

Presentación del personaje nuevo con plano medio MUDO antes de que lo nombren: Bonifacio r4.

Locaciones: LOC_CASETACANT (c01-c16; Rosalba a la DERECHA junto a la ventana, Sotero a la IZQUIERDA junto a la puerta y el estante) y LOC_CANTERAHUICH al acabar el turno (Abdías a la IZQUIERDA en su mesa de labrado, Sotero y Rosalba a la DERECHA, Bonifacio al CENTRO).

Utilería, una de cada una: celular con la pantalla encendida en la bolsa de Abdías (i01, como en la P1), libro de registro café (Sotero, c02-c09), libreta negra (Rosalba, mano DERECHA, c08; abierta en i02 sin nada legible), llavero de llaves de latón (i03), caja de guantes de carnaza y lentes transparentes (i05, c25-c26).

Sin armas, sangre, cifras de dinero ni deudas. Sin uniformes, cascos ni chalecos con letras; sin niños. Edades adultas en número en los prompts (64, 56, 52, 31).

## Diálogo (lines.json, fuente única)
| clip | quién | frases |
|---|---|---|
| i01 | — | mudo (ver clips.py) |
| c01 | Rosalba | "Les cobraste a todos lo que era gratis, Sotero." / "Hoy se te acaba el turno." |
| c02 | Sotero | "Patrona, ya le traje la libreta del almacén." / "Todo fue un malentendido." |
| c03 | Sotero | "Lo cobraba para reponer lo que se pierde." / "Los muchachos todo lo rompen." |
| c04 | Rosalba | "¿Reponer? El equipo lo compro yo, Sotero." / "Cada caja de ese estante." |
| c05 | Rosalba | "¿Y por eso medio patio corta sin lentes?" / "¿Por eso Abdías labra con las manos?" |
| c06 | Sotero | "Ese Abdías le llenó la cabeza, patrona." / "Siempre ha sido un revoltoso." |
| c07 | Rosalba | "Abdías no dijo nada que tú no dijeras." / "Escuché cada palabra, con tu voz." |
| c08 | Rosalba | "Y esta es tu libreta negra." / "Con el nombre de cada cantero que te pagó." |
| i02 | — | mudo (ver clips.py) |
| r1 | — | mudo (ver clips.py) |
| c09 | Sotero | "Esa libreta no prueba nada, patrona." / "Son puros apuntes." |
| c10 | Sotero | "Toda mi vida cuidando esta cantera…" / "¿y así me lo paga?" |
| c11 | Sotero | "Algo me tenía que tocar a mí." / "Nadie me daba nada de más." |
| c12 | Rosalba | "Tu trabajo era cuidar sus manos y sus ojos." / "No venderles lo que ya era suyo." |
| c13 | Rosalba | "Estás despedido, Sotero." / "Deja las llaves del almacén en el escritorio." |
| i03 | — | mudo (ver clips.py) |
| c14 | Rosalba | "Y le vas a devolver a cada uno lo que le cobraste." / "En su mano, delante de todos." |
| c15 | Rosalba | "Antes de que acabe el turno." / "O mañana lo arreglas con la ley." |
| c16 | Sotero | "Está bien, patrona." / "Como usted mande." |
| i04 | — | mudo (ver clips.py) |
| c17 | Sotero | "Me quitaste el patio, muchacho." / "Esto te lo voy a cobrar." |
| c18 | Abdías | "Ya cobró bastante, don Sotero." / "Ahora le toca devolver." |
| c19 | Rosalba | "Yo le creo a Abdías, Sotero." / "Empieza por él, y que todos lo vean." |
| r2 | — | mudo (ver clips.py) |
| c20 | Rosalba | "Abdías, gracias por no quedarte callado." / "Sin ti, esto seguiría igual." |
| c21 | Abdías | "No podía seguir viendo eso, patrona." / "Mis compañeros cortaban a ciegas." |
| c22 | Rosalba | "Esta cantera necesita a alguien derecho en el patio." / "Desde hoy, el encargado eres tú." |
| r3 | — | mudo (ver clips.py) |
| c23 | Abdías | "¿Yo, patrona?" / "Le juro que aquí nadie vuelve a pagar por cuidarse." |
| c24 | Rosalba | "Entonces empieza ya." / "Las cajas de la caseta son de ellos." |
| i05 | — | mudo (ver clips.py) |
| c25 | Abdías | "Compañeros, guantes y lentes para todos." / "Desde hoy, aquí nadie paga su equipo." |
| r4 | — | mudo (ver clips.py) |
| c26 | Abdías | "Don Bonifacio, estos son suyos." / "Ya no corte sin lentes." |
| c27 | Bonifacio | "Ya no veía bien la piedra, muchacho." / "Gracias por acordarte de este viejo." |
| c28 | Abdías | "Usted me enseñó a labrar, don Bonifacio." / "Ahora me toca cuidarlo." |
| i06 | — | mudo (ver clips.py) |
| c29 | Bonifacio | "Hace mucho que nadie nos cuidaba, patrona." / "Dios se lo pague." |
| r5 | — | mudo (ver clips.py) |
| c30 | Rosalba | "¿Ustedes le habrían dado otra oportunidad a Sotero?" / "Dale me gusta y sígueme para más historias de la cantera." |

30 clips hablados, 11 mudos, 376 palabras.
