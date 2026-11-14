---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, majestic, parte2, historia-propia, capos]
relatedTo: [chofer-patrona, mariachi-patron-p2, viuda-aguacate-p2, atrium-vista]
---
# El Chofer de la Patrona · Parte 2

Continúa `pieces/chofer-patrona`. La Parte 1 terminó con la grabación de la tableta: Valente le entregó el maletín a la troca blanca de Treviño, "el que se llevó a tu padre". Aquí llegan el castigo y el desenlace del giro familiar, sin armas ni sangre. El pagaré de Treviño es falso, porque el patrón estaba internado el día de la "firma" y Lencho lo llevó al hospital. La troca blanca era del difunto marido. Treviño devuelve el maletín y las llaves y se va de la sierra, y Valente queda de chofer de Lencho. El payoff: el papá le pidió a Lencho que cuidara a Valente, y por eso pidió la cámara en vez de acusarlo.

Marca **MAJESTIC**, la misma de la Parte 1 (edit.py, BRAND = "MAJESTIC"; música y marca de `pieces/_marcas/MAJESTIC`, arriba a la izquierda). No entra en la rotación. Sin Navidad.

Son 373 palabras en frases de 3 a 7 palabras, salvo el CTA. Hay 46 clips: 34 hablados de 6 s (el CTA de 10 s), 8 insertos i* y 4 reacciones mudas r*. El montaje apunta a 2:00-2:20 con 2 s o menos por plano.

**Título:** Le dio el maletín al hombre que arruinó a su padre… y el chofer tenía la prueba de que todo era mentira 😳 | El Chofer de la Patrona · Parte 2

## Premisa
Abre con un recordatorio de 1 s: en la tableta, la chamarra vino entrega el maletín por la ventana de la troca blanca. Eusebia: "¿A Treviño le diste mi maletín?" Valente confiesa que Treviño le dijo que su papá le debía y que, si no pagaba, perdían el rancho. Tenía papeles con su firma y no quiso que su madre sufriera. Lencho niega con la cabeza: el patrón no le debía nada, y él lo manejó hasta su último día.

Brígido avisa que la troca blanca viene subiendo; Treviño viene por la otra mitad. Eusebia ordena abrir el portón y cerrarlo cuando entre. Treviño baja sonriente con su carpeta: el pagaré dice doce de mayo. Lencho: ese día el patrón estaba internado y él mismo lo llevó. A Treviño se le borra la sonrisa. Eusebia: "Usted ya le quitó todo a mi marido. A mi hijo no se lo lleva." Treviño quiere irse; el portón está cerrado y primero va el maletín. Luego Eusebia le quita la troca blanca, que era de su marido. Valente la reconoce: Treviño le había dicho que se la llevó el banco. Treviño entrega las llaves y sale a pie por la puerta chica del portón, sin volver a la sierra.

Castigo de Valente: le pide perdón a "don Lencho" por hincarlo. Lencho sabía que era él y por eso pidió la cámara. "¿Por qué no me acusó?" "Su papá me pidió que lo cuidara." Eusebia lo pone de chofer: desde hoy Valente maneja y Lencho va atrás. Chema se queda y lleva la caballeriza. La troca blanca es para Lencho, porque el patrón así lo hubiera querido. Valente le abre la puerta de atrás a Lencho: "¿A dónde lo llevo?" "Al panteón, joven. Vamos a ver a su papá." CTA de Lencho a cámara, recargado en la troca blanca. Historia cerrada, sin Parte 3.

## Personajes
Las 6 hojas de la Parte 1, copiadas a chars/, y una hoja nueva.
| Hoja | Quién | Aspecto fijo |
|---|---|---|
| FLORENCIO_ARAMBULA | Lencho, 61, chofer (protagonista) | bigote canoso grueso, pelo gris corto; guayabera blanca, pantalón gris oscuro con polvo en las rodillas; llave con cordón rojo en la mano derecha; sin sombrero; de pie toda la Parte 2 |
| VALENTE_MONTALVO2 | Valente, 31, hijo de la patrona | bigote fino, barba de pocos días, pelo hacia atrás; chamarra de gamuza vino, camiseta negra, cadena de oro delgada |
| EUSEBIA_MONTALVO | doña Eusebia, 72, la patrona | chongo bajo plateado; vestido negro, rebozo negro, aretes de perla, dos anillos de oro en la mano derecha |
| BRIGIDO_TOSTADO | Brígido, 48, jefe de la escolta | sombrero vaquero negro (el único con sombrero), saco negro, camisa blanca sin corbata; radio en la mano derecha |
| CHEMA_ARAMBULA | Chema, 23, hijo de Lencho | pelo rizado corto, cicatriz en la ceja izquierda; camisa de mezclilla deslavada arremangada |
| **LISANDRO_TREVINO** (nueva) | el licenciado Treviño, 66 | cara ancha con papada, calvo arriba con canas a los lados, lentes redondos dorados (el único con lentes); traje de lino crema, camisa azul pálido sin corbata, mocasines cafés; carpeta de piel café en la mano IZQUIERDA |

Locación: LOC_COCHERARANCHO (el mismo patio de grava, ya con la mañana dorada). Treviño siempre a la DERECHA junto a la troca blanca, con el portón detrás.

Utilería, una de cada una: llave con cordón rojo (mano DERECHA de Lencho), radio negro (mano derecha de Brígido), tableta negra (i01, imagen plana DENTRO de la pantalla), carpeta de piel café (mano izquierda de Treviño), maletín negro cerrado (i05, sobre el cofre de la camioneta negra), llavero de la troca (i06 a la mano de Eusebia; c30-c31 a Lencho; CTA). La troca blanca vieja sin logos ni placas. Camionetas negras al fondo.

## Diálogo (lines.json)
| clip | quién | frases |
|---|---|---|
| i01 | — | recordatorio: en la tableta, la chamarra vino entrega el maletín por la ventana de la troca blanca |
| c01 | Eusebia | "¿A Treviño le diste mi maletín?" / "¿A ese hombre, Valente?" |
| c02 | Valente | "Me dijo que mi papá le debía." / "Que si no pagaba, perdíamos el rancho." |
| c03 | Eusebia | "¿Y por qué no me dijiste nada?" / "Soy tu madre, mijo." |
| c04 | Valente | "Tenía papeles con su firma, madre." / "No quería que usted sufriera." |
| r1 | Lencho | mudo: niega despacio con la cabeza |
| c05 | Lencho | "Su papá no le debía nada, joven." / "Yo sé por qué se lo digo." |
| c06 | Valente | "¿Usted qué sabe de mi papá?" / "Usted nomás lo manejaba." |
| c07 | Lencho | "Lo manejé hasta su último día." / "Y nunca fue a ver a Treviño." |
| c08 | Brígido | "Patrona, la troca blanca viene subiendo." / "Treviño viene por más." |
| c09 | Valente | "Me escribió anoche, madre." / "Quería la otra mitad hoy." |
| c10 | Eusebia | "Que abran el portón, Brígido." / "Y cuando entre, lo cierran." |
| i02 | — | se abre el portón y entra la troca blanca levantando polvo |
| i03 | — | los escoltas cierran el portón detrás de ella y se quedan de manos cruzadas |
| i04 | — | se abre la puerta de la troca; bajan los mocasines y el pantalón de lino crema |
| c11 | Treviño | "Buenos días, doña Eusebia." / "Vengo a ver a su muchacho." |
| c12 | Eusebia | "Vino a devolverme algo, licenciado." / "Mi maletín." |
| c13 | Treviño | "Su esposo me firmó un pagaré." / "El doce de mayo, señora." |
| c14 | Lencho | "Ese día el patrón estaba internado." / "Yo mismo lo llevé, licenciado." |
| r2 | Treviño | mudo: se le borra la sonrisa y se sube los lentes |
| c15 | Eusebia | "Usted ya le quitó todo a mi marido." / "A mi hijo no se lo lleva." |
| c16 | Treviño | "Señora, yo nomás vine a platicar." / "Ya me retiro." |
| c17 | Brígido | "El portón está cerrado, licenciado." / "Primero el maletín." |
| i05 | — | la manga de lino crema deja el maletín cerrado sobre el cofre de la camioneta negra |
| c18 | Eusebia | "Y esa troca blanca se queda." / "Era de mi marido." |
| r3 | Valente | mudo: mira la troca, le brillan los ojos, la reconoce |
| c19 | Valente | "Es la troca de mi papá." / "Usted me dijo que se la llevó el banco." |
| c20 | Eusebia | "Las llaves, licenciado." / "Y no lo quiero ver en la sierra." |
| i06 | — | el llavero de la troca cae en la palma con dos anillos de oro |
| i07 | — | Treviño, de espaldas, sale solo por la puerta chica del portón; dos escoltas a los lados |
| c21 | Eusebia | "Ahora tú, Valente." / "Le debes algo a Lencho." |
| c22 | Valente | "Perdóneme, don Lencho." / "Lo hinqué por algo que hice yo." |
| c23 | Lencho | "Yo sabía que era usted, joven." / "Por eso pedí la cámara." |
| c24 | Valente | "¿Y por qué no me acusó?" / "Tenía con qué." |
| c25 | Lencho | "Su papá me pidió que lo cuidara." / "Y eso hice." |
| r4 | Valente | mudo: le brillan los ojos y baja la cabeza |
| c26 | Eusebia | "Desde hoy tú manejas, Valente." / "Y Lencho va en el asiento de atrás." |
| c27 | Valente | "¿Le voy a manejar a Lencho?" / "Está bien, madre. Me lo gané." |
| c28 | Chema | "¿Y yo, patrona?" / "Su hijo nos corrió a los dos." |
| c29 | Eusebia | "Aquí nadie se va, Chema." / "Y la caballeriza ahora la llevas tú." |
| c30 | Eusebia | "Y esa troca es tuya, Lencho." / "Mi marido así lo hubiera querido." |
| c31 | Lencho | "Gracias, patrona." / "Se la voy a cuidar como a él." |
| i08 | — | la manga vino abre la puerta de atrás de la camioneta negra; la guayabera blanca se acerca |
| c32 | Valente | "Súbase, don Lencho." / "¿A dónde lo llevo?" |
| c33 | Lencho | "Al panteón, joven." / "Vamos a ver a su papá." |
| BLACK | — | 0,4 s |
| c34 | Lencho (a cámara, recargado en la troca blanca, golpea el techo dos veces y suena el llavero) | "¿Ustedes creen que Valente de veras cambió… o nomás se asustó?" / "Denle me gusta y sigan la página para más historias." |

## Montaje
- Sin plano abierto: i01 (recordatorio en la tableta) dura 0,9 s como máximo y "¿A Treviño le diste mi maletín?" entra antes de los 2 s. La primera línea no lleva cifras.
- Corte al terminar cada frase. Cuando el mismo personaje dice varias frases seguidas (c29-c30, Eusebia), se salta dentro de sus clips. Reacciones de 1,0-1,2 s solo donde cuentan algo (r1-r4).
- Música MAJESTIC: golpe sutil en el frame 0 y suspenso hasta c21, cálida de c21 a i08 (perdón, "su papá me pidió que lo cuidara", la troca para Lencho) y suspenso hasta el final. BLACK de 0,4 s antes del CTA.
- El CTA solo nombra a Valente, que se oye en toda la historia.
- Pronunciación a vigilar: "Treviño", "Eusebia", "Brígido", "internado", "pagaré", "caballeriza", "panteón", "nomás".
- QA: Brígido es el único con sombrero y Treviño el único con lentes; la grabación de i01 se ve plana dentro de la tableta; Lencho de pie todo el video; la troca blanca igual en i02, i04, i06 y el CTA (vieja, sin logos ni placas); nadie con armas.
