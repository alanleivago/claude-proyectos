---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, vista, parte2, historia-propia, capos]
relatedTo: [fonda-chela, reten-sierra-p2, atrium-vista]
---
# El Jefe Nuevo · Parte 2

Continúa `pieces/fonda-chela`. La Parte 1 terminó con el café acabado y la pregunta de Macario: "¿Se queda en el pueblo o se va?". Aquí se cobra la cuenta pendiente sin armas ni sangre. El poder se ve en órdenes, en lealtades que cambian de dueño (el Güero, las llaves de las camionetas), en el convoy que escolta a Saúl al paso y en el campanario que marca el plazo.

Marca **VISTA**, la misma de la Parte 1 (edit.py, BRAND = "VISTA"; música y marca de agua de `pieces/_marcas/VISTA`). Sin Navidad.

Son 398 palabras en frases de 8 palabras como máximo, salvo el CTA. Hay 48 clips: 34 hablados de 6–10 s, 8 insertos i* y 6 reacciones mudas r*. El montaje apunta a 2:20–2:40 con una media de 2 s o menos por plano.

**Título:** Lo puso a devolver casa por casa… y a servir mesas en la fonda que quiso cobrar 😳 | El Jefe Nuevo · Parte 2

## Premisa
Abre con el final de la Parte 1: la mano del anillo deja el jarro vacío junto al maletín cerrado y Macario dice que ya se acabó el café. Ahora decide Chela. Su sentencia: Saúl devuelve los doscientos mil casa por casa, a pie, antes de que suenen las doce. Sus tres camionetas y sus muchachos ya obedecen a Macario. El Güero deja las llaves en la mesa y le dice que aquí todos le deben un plato a Chela.

Saúl recorre la calle con el maletín. Tavo lleva la cuenta en una libretita, el convoy lo sigue al paso y el reloj marca casi las once. En la fonda Chela no lo corre: lo deja un año de mesero ("Él dijo que no era mesero", callback a la Parte 1). Le explica a Tavo que correrlo es fácil y que mejor aprenda a servir. Macario le dice que siempre fue más justa que él.

A las doce suena la campana y Saúl vuelve con el maletín vacío: cuarenta y una casas y no falta un peso. Se pone el mandil y atiende la mesa del fondo. Entonces el Güero le cuenta a Macario que Saúl mandaba la mitad cada domingo al que se lo recomendó, y ese hombre come en la mesa de Macario. "Chela, guárdeme un café el domingo. Vamos a tener visita." CTA de Chela a cámara con dilema y anuncio de la tercera parte.

## Personajes (las MISMAS hojas de la Parte 1, copiadas a chars/)
| Hoja | Quién | Aspecto fijo |
|---|---|---|
| CHELA_VILLEGAS | doña Chela, 66, dueña de la fonda (protagonista) | chongo bajo gris, aretes de oro chicos; blusa lila y mandil blanco |
| TAVO_VILLEGAS2 | Tavo, 24, su sobrino y mesero | pelo negro corto, lampiño; camisa blanca de manga corta con cuello y bolsa, mandil negro de mesero |
| SAUL_BETANCOURT2 | Saúl, 40, el jefe nuevo, ya caído | pelo negro engominado con canas en las sienes, barba corta completa; traje gris carbón con cuadro fino, camisa negra sin corbata, reloj plateado en la muñeca izquierda. Desde c27 lleva además un mandil negro de mesero |
| ROLANDO_GUERO2 | el Güero, 35, su ex segundo, ahora con Macario | rubio rapado con raíz oscura, cara redonda, chivo; chamarra de piel negra, playera negra; radio |
| MACARIO_LEDESMA2 | don Macario, 74, el patrón | bigote blanco grueso, sombrero de fieltro gris; guayabera crema, anillo de oro con piedra negra en la mano derecha |

Locaciones: LOC_FONDACHELA y LOC_CALLEFONDA (las de la Parte 1). El campanario (i02, i07) va sin hoja: torre encalada con una campana de bronce, sin reloj ni letras.

Utilería, una de cada una: el jarro de barro (vacío en i01; lleno en c28, r5 y r6), el anillo de Macario, el radio del Güero, el maletín de piel negro (cerrado hasta i08, donde se ve vacío), tres llaves de camioneta, una libretita de Tavo, el reloj plateado de Saúl, sobres blancos cerrados (nada de billetes a la vista) y un mandil negro de mesero para Saúl.

Saúl: la nota del usuario dice que sus clips a veces dan "políticas" con la hoja. Por eso su descripción en clips.py es muy detallada (cara, pelo con canas, barba unida al bigote, traje con cuadro fino, reloj en la izquierda), para que el intento sin hoja (NOREF, intento 5) se parezca.

## Planos
PP = primer plano de una sola persona (gaze + ONE + ALONE, nunca sobre el hombro). Los insertos van sin caras; el texto de acción de los mudos es el del prompt.

| # | plano | quién | línea / acción | clip |
|---|---|---|---|---|
| **1. Gancho (0-2 s): el jarro vacío junto al maletín cerrado; se acabó el café y decide Chela** |||||
| 1 | inserto | · | on a plain wooden table at the back, an old man's hand in a cream guayabera sleeve with one heavy gold ring with a flat black stone on his right hand sets down one empty  | i01 |
| 2 | PP | Macario | "Ya se acabó el café, muchacho." | c01·0 |
| 3 | PP | Macario | "Ahora la que decide es Chela." | c01·1 |
| 4 | PP mudo | Saúl | muda: he swallows and looks toward the counter, worried | r1 |
| 5 | PP | Saúl | "Doña Chela, se lo suplico." | c02·0 |
| 6 | PP | Saúl | "Le regreso hasta el último peso." | c02·1 |
| 7 | PP | Chela | "Esos pesos no son míos, joven." | c03·0 |
| 8 | PP | Chela | "Son de todo el pueblo." | c03·1 |
| 9 | PP | Chela | "Casa por casa se los regresa." | c04·0 |
| 10 | PP | Chela | "Antes de que suenen las doce." | c04·1 |
| 11 | inserto | · | a small whitewashed village church bell tower with one old bronze bell hanging still, against a clear blue late-morning sky; no clock face, no text, no people. | i02 |
| 12 | PP | Saúl | "¿Casa por casa, y a pie?" | c05·0 |
| 13 | PP | Saúl | "Son más de cuarenta casas, doña." | c05·1 |
| 14 | PP | Macario | "A pie, muchacho, como llegó la gente honrada." | c06·0 |
| 15 | PP | Macario | "Las camionetas ya no son tuyas." | c06·1 |
| 16 | inserto | · | a hand in a black leather jacket sleeve sets three black car keys on a plain wooden table beside one closed black leather briefcase. Only the hand, no faces. | i03 |
| 17 | PP | Güero | "Los muchachos ya no trabajan pa' usted." | c07·0 |
| 18 | PP | Güero | "Desde hoy obedecen a don Macario." | c07·1 |
| 19 | PP mudo | Saúl | muda: he turns his head toward the door, surprised and hurt, his mouth half open | r2 |
| 20 | PP | Saúl | "Güero, cinco años conmigo." | c08·0 |
| 21 | PP | Saúl | "¿Y así me pagas?" | c08·1 |
| 22 | PP | Güero | "Usted le cobró a doña Chela, jefe." | c09·0 |
| 23 | PP | Güero | "Aquí todos le debemos un plato." | c09·1 |
| **2. Casa por casa, a pie, antes de las doce (la calle)** |||||
| 24 | inserto | · | one man in a dark charcoal grey suit walks slowly alone down the middle of the street carrying one closed black leather briefcase; two black SUVs with no logos roll slowl | i04 |
| 25 | PP | Tavo | "Primero doña Lucha, la de las tortillas." | c10·0 |
| 26 | PP | Tavo | "A ella le cobró tres mil." | c10·1 |
| 27 | inserto | · | at an old wooden door of an adobe house, an elderly woman's wrinkled hand in a flowered sleeve receives one plain white closed envelope from a man's hand in a dark charco | i05 |
| 28 | PP | Saúl | "Aquí está lo suyo, señora." | c11·0 |
| 29 | PP | Saúl | "Perdóneme, no vuelve a pasar." | c11·1 |
| 30 | PP | Tavo | "Faltan treinta y ocho casas, señor." | c12·0 |
| 31 | PP | Tavo | "Y ya van a dar las once." | c12·1 |
| 32 | inserto | · | a silver wristwatch on a man's left wrist in a dark charcoal grey suit sleeve, the hands near eleven o'clock, a dusty sunny street behind out of focus; no readable text. | i06 |
| 33 | PP | Saúl | "No voy a llegar, muchacho." | c13·0 |
| 34 | PP | Saúl | "Ayúdame con la mitad, ándale." | c13·1 |
| 35 | PP | Tavo | "Usted cobró con tres camionetas." | c14·0 |
| 36 | PP | Tavo | "Ahora devuelva a pie, solito." | c14·1 |
| **3. La sentencia de Chela: un año de mesero (cama cálida)** |||||
| 37 | PP | Macario | "¿Y después de las doce, Chela?" | c15·0 |
| 38 | PP | Macario | "¿Lo corro del pueblo para siempre?" | c15·1 |
| 39 | PP | Chela | "No, don Macario." | c16·0 |
| 40 | PP | Chela | "Que se quede aquí, a servir mesas." | c16·1 |
| 41 | PP mudo | Macario | muda: a slow small smile under his white mustache | r3 |
| 42 | PP | Chela | "Él dijo que no era mesero." | c17·0 |
| 43 | PP | Chela | "Desde hoy lo es, un año entero." | c17·1 |
| 44 | PP | Tavo | "Tía, ¿por qué no lo corrió?" | c18·0 |
| 45 | PP | Tavo | "Ese señor nos quería quitar todo." | c18·1 |
| 46 | PP | Chela | "Correrlo es fácil, mijo." | c19·0 |
| 47 | PP | Chela | "Que aprenda a servir, como yo aprendí." | c19·1 |
| 48 | PP | Macario | "Usted siempre fue más justa que yo, Chela." | c20·0 |
| 49 | PP | Macario | "Por eso este pueblo es suyo." | c20·1 |
| **4. Las doce: vuelve con el maletín vacío y se pone el mandil** |||||
| 50 | inserto | · | the old bronze bell in a small whitewashed village church bell tower starts to swing and ring, clear blue noon sky; no clock face, no text, no people. | i07 |
| 51 | PP | Güero | "Don Macario, ya van a dar las doce." | c21·0 |
| 52 | PP | Güero | "Ahí viene, con el maletín vacío." | c21·1 |
| 53 | inserto | · | hands in dark charcoal grey suit sleeves set one open black leather briefcase on a plain wooden table; it is completely empty inside. Only the hands, no faces. | i08 |
| 54 | PP | Saúl | "Cuarenta y una casas, don Macario." | c22·0 |
| 55 | PP | Saúl | "No falta ni un peso, se lo juro." | c22·1 |
| 56 | PP | Macario | "Tarde, pero cumpliste, muchacho." | c23·0 |
| 57 | PP | Macario | "Ahora escucha lo que dice Chela." | c23·1 |
| 58 | PP | Chela | "Aquí tiene su mandil, joven." | c24·0 |
| 59 | PP | Chela | "Las mesas no se limpian solas." | c24·1 |
| 60 | PP | Saúl | "¿Yo de mesero, doña Chela?" | c25·0 |
| 61 | PP | Saúl | "¿Delante de todo el pueblo?" | c25·1 |
| 62 | PP | Macario | "Delante de todos, como cobraste." | c26·0 |
| 63 | PP | Macario | "O te vas sin nada, tú escoges." | c26·1 |
| 64 | PP mudo | Saúl | muda: he lowers his head and nods slowly | r4 |
| 65 | PP | Saúl | "Está bien, doña Chela." | c27·0 |
| 66 | PP | Saúl | "¿Qué mesa atiendo primero?" | c27·1 |
| 67 | PP | Chela | "La del fondo, joven." | c28·0 |
| 68 | PP | Chela | "Café de olla, con canela, calientito." | c28·1 |
| **5. Gancho a la Parte 3: la mitad iba a otro** |||||
| 69 | PP | Güero | "Don Macario, le falta saber una cosa." | c29·0 |
| 70 | PP | Güero | "Saúl no cobraba nomás para él." | c29·1 |
| 71 | PP | Macario | "¿Para quién, Güero?" | c30·0 |
| 72 | PP | Macario | "Dime el nombre, aquí delante de Chela." | c30·1 |
| 73 | PP | Güero | "Mandaba la mitad cada domingo." | c31·0 |
| 74 | PP | Güero | "Al mismo que se lo recomendó a usted." | c31·1 |
| 75 | PP mudo | Macario | muda: his serene face hardens, he slowly sets down one brown clay mug of café de olla on the table | r5 |
| 76 | PP | Macario | "Ese hombre come en mi mesa." | c32·0 |
| 77 | PP | Macario | "Todos los domingos, aquí mismo." | c32·1 |
| 78 | PP mudo | Saúl | muda: he freezes and looks toward the back table, worried | r6 |
| 79 | PP | Macario | "Chela, guárdeme un café el domingo." | c33·0 |
| 80 | PP | Macario | "Vamos a tener visita." | c33·1 |
| **CTA con carisma (después del BLACK): Chela en su mostrador, a cámara** |||||
| 81 | negro | · | 0,4 s | BLACK |
| 82 | PP a cámara | Chela | "¿Ustedes le hubieran dado otra oportunidad a Saúl?" | c34·0 |
| 83 | PP a cámara | Chela | "Denle me gusta y compartan para ver la tercera parte." | c34·1 |

## Montaje
- Sin presentación: i01 dura ~1 s (el jarro vacío junto al maletín, que recuerda el final de la Parte 1) y "Ya se acabó el café" suena antes de los 2 s.
- Corte solo al terminar la frase. Mismo personaje con varias frases: salto dentro de su clip. Insertos de 1–1,5 s entre réplicas para bajar la media.
- Música: golpe sutil en el frame 0 y suspenso hasta c16; cama cálida de c16 a i07 (la sentencia de Chela y "más justa que yo"); suspenso desde la campana (i07) hasta el final.
- i07 (la campana) puede llevar su sonido bajito bajo la música; el resto de mudos, ganancia 0.
- Fundido a negro de 0,4 s antes del CTA. Marca VISTA STORIES en todo el video.
- Palabras a vigilar en la pronunciación: "Macario", "suplico", "tortillas", "mandil", "canela". No hay "trabajo".
