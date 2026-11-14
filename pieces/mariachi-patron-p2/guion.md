---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, vista, parte2, historia-propia, capos]
relatedTo: [mariachi-patron, viuda-aguacate-p2, atrium-vista]
---
# El Mariachi del Patrón · Parte 2

Continúa `pieces/mariachi-patron`. La Parte 1 terminó con Higinio confesando "Gildardo es mi hijo" y preguntando a cámara si debía perdonarlo. Aquí llega el castigo, sin armas ni sangre: los escoltas cierran los arcos, Gildardo confiesa en la tarima, Eulogio deja el radio y se va a pie, y Rosendo se lleva el ganado como pago de la cosecha. El plazo de la Parte 1 ("hasta que amanezca") se cumple al final, con el sol saliendo sobre los agaves.

Marca **VISTA**, la misma de la Parte 1 (edit.py, BRAND = "VISTA"; música y marca de `pieces/_marcas/VISTA`, arriba al centro). No entra en la rotación. Sin Navidad.

Son 323 palabras en frases de 3 a 6 palabras, salvo el CTA. Hay 47 clips: 34 hablados de 6 s (el CTA de 10 s), 8 insertos i* y 5 reacciones mudas r*. El montaje apunta a 2:10-2:30 con 2 s o menos por plano. Guion pasado por la skill humanizer.

**Título:** Lo corrió de su fiesta sin saber que era su padre… y el patrón lo puso a cantar por limosna 😳 | El Mariachi del Patrón · Parte 2

## Premisa
Abre con los escoltas de Rosendo cerrando los arcos del patio. Rosendo ordena que nadie salga, ni los invitados ni Gildardo. Gildardo niega a su padre ("ese señor no es nada mío") y Higinio cuenta que la mamá se lo llevó chiquito y le cambió el apellido. A Gildardo le daba vergüenza un mariachi en su fiesta, así que Rosendo lo sube a la tarima y le hace decir por el micrófono, delante de todos, que el mariachi es su padre y que lo corrió sin pagarle.

Eulogio dice que nomás obedecía. Rosendo le quita el trabajo: deja el radio en la mesa y se va a pie hasta el pueblo. Antes de irse le pide perdón a Higinio, que contesta que a nadie se le trata así.

Casi amanece. Gildardo no tiene la cosecha completa y Rosendo se lleva su ganado, hasta la última vaca. Maclovio le recuerda que así los dejó a ellos, sin la renta.

Momento cálido: Higinio lo buscó muchos años y le escribió cartas. A Gildardo su mamá le dijo que el padre los había dejado. "Ella se fue, mijo. Yo me quedé esperándote." Gildardo le dice "apá" por primera vez.

Rosendo deja que Higinio decida. Higinio le devuelve el ganado con una condición: un año tocando con él en la plaza, por limosna. Maclovio le dice que mañana a las ocho y que el estuche lo carga él. Higinio le entrega la guitarra. Amanece, Rosendo reclama sus mañanitas y Gildardo saca la guitarra para su padre: hoy canta con ellos. CTA de Higinio a cámara con dilema. Historia cerrada, sin Parte 3.

## Personajes (las hojas de la Parte 1, copiadas a chars/)
| Hoja | Quién | Aspecto fijo |
|---|---|---|
| HIGINIO_LUMBRERAS | don Higinio, 74, el mariachi (protagonista, padre de Gildardo) | bigote blanco grueso, pelo blanco hacia atrás; traje de charro negro gastado, botones de plata, moño rojo; sombrero en la mano hasta el CTA |
| MACLOVIO_ZAVALETA | Maclovio, 24, nieto violinista (sobrino de Gildardo) | pelo negro lacio con raya, lentes de alambre; camisa blanca, pantalón negro |
| GILDARDO_MONTEMAYOR | Gildardo, 56, el ganadero | pelo engominado, bigote de herradura; camisa vaquera blanca bordada, chaleco de cuero crema, reloj de oro |
| EULOGIO_MANCERA | Eulogio, 40, su gente | cabeza rapada, barba corta; camisa vaquera gris, chamarra de cuero negra; radio |
| ROSENDO_CABANAS | don Rosendo, 77, el protector | barba blanca corta, sombrero de fieltro negro; traje gris oscuro, camisa negra, anillo de plata |

Sin personajes nuevos. Locación: LOC_PATIOGANADERO. Luz: noche con foquitos (c01-c14), azul del alba (c15-c30), amanecer dorado (i07-c34).

Utilería, una de cada una: sombrero de charro negro con bordado de plata (manos de Higinio), micrófono de pie en la tarima (c07, c09), radio negro (mano derecha de Eulogio, luego en la mesa en i03), guitarra vieja y estuche negro gastado (de Higinio a Gildardo en i06; Gildardo la saca en i08), camiones ganaderos sin logos ni placas (i05). Ocho camionetas negras al fondo.

## Diálogo (lines.json)
| clip | quién | frases |
|---|---|---|
| i01 | — | escoltas de traje negro se forman bajo los arcos; camionetas con faros detrás |
| c01 | Rosendo | "Que nadie salga de la hacienda." / "Ni los invitados, ni tú." |
| c02 | Gildardo | "Don Rosendo, es un malentendido." / "Ese señor no es nada mío." |
| r1 | Higinio | mudo: baja la mirada, el sombrero contra el pecho |
| c03 | Higinio | "Su mamá se lo llevó chiquito." / "Le cambió el apellido, Rosendo." |
| c04 | Rosendo | "¿Te daba vergüenza tu padre?" / "¿Un mariachi en tu fiesta?" |
| c05 | Gildardo | "Mis invitados son gente importante." / "No lo iban a entender." |
| c06 | Rosendo | "Pues que lo entiendan hoy." / "Súbete a esa tarima." |
| i02 | — | las botas de Gildardo suben a la tarima hacia el micrófono |
| c07 | Gildardo (tarima) | "Señores, escúchenme un momento." / "Este mariachi es mi padre." |
| r2 | Higinio | mudo: le brillan los ojos, mira hacia la tarima |
| c08 | Rosendo | "Ahora diles lo que hiciste." / "Que todos lo oigan." |
| c09 | Gildardo (tarima) | "Lo corrí sin pagarle." / "Y le tiré su sombrero." |
| c10 | Eulogio | "Don Rosendo, yo nomás obedecía." / "El patrón me lo ordenó." |
| c11 | Rosendo | "Deja ese radio en la mesa." / "Ya no trabajas para él." |
| i03 | — | la mano de chamarra negra deja el radio sobre el mantel blanco |
| c12 | Rosendo | "Y te vas a pie." / "Hasta el pueblo, caminando." |
| c13 | Eulogio | "Perdóneme, don Higinio." / "No sabía quién era usted." |
| c14 | Higinio | "No importa quién sea uno." / "A nadie se le trata así." |
| i04 | — | Eulogio de espaldas se va solo por el camino de tierra |
| r3 | Maclovio | mudo: sonrisa pequeña, orgulloso de su abuelo |
| c15 | Rosendo | "Ahora la cosecha, Gildardo." / "Ya casi amanece." |
| c16 | Gildardo | "No la tengo completa, don Rosendo." / "Deme un año más." |
| c17 | Rosendo | "Entonces me llevo tu ganado." / "Hasta la última vaca." |
| i05 | — | camiones ganaderos salen por el portón del corral al alba |
| r4 | Gildardo | mudo: pálido, mira el corral vacío |
| c18 | Gildardo | "Es todo lo que tengo." / "Me va a dejar sin nada." |
| c19 | Maclovio | "Así nos dejó usted, tío." / "Sin la renta del mes." |
| c20 | Higinio | "Te busqué muchos años, mijo." / "Nunca contestaste una carta." |
| c21 | Gildardo | "Mi mamá dijo que nos dejó." / "Que no me quería." |
| c22 | Higinio | "Ella se fue, mijo." / "Yo me quedé esperándote." |
| r5 | Gildardo | mudo: le brillan los ojos, baja la cabeza |
| c23 | Gildardo | "Yo no sabía nada, apá." / "Y aun así lo corrí." |
| c24 | Rosendo | "Tú decides, Higinio." / "¿Le devuelvo su ganado?" |
| c25 | Higinio | "Devuélvaselo todo, Rosendo." / "Pero con una condición." |
| c26 | Higinio | "Un año tocando conmigo." / "En la plaza, por limosna." |
| c27 | Gildardo | "¿Yo de mariachi, apá?" / "¿Delante de toda la gente?" |
| c28 | Rosendo | "Tu padre tocó seis horas." / "Ahora te toca a ti." |
| c29 | Maclovio | "Mañana a las ocho, tío." / "Y el estuche lo carga usted." |
| i06 | — | la mano vieja entrega el estuche a las manos del reloj de oro |
| c30 | Gildardo | "Está bien, apá." / "Un año con usted." |
| i07 | — | sale el sol sobre los agaves detrás de los arcos |
| c31 | Rosendo | "Ya amaneció, compadre." / "Y me debes mis mañanitas." |
| c32 | Higinio | "Todavía es tu día, Rosendo." / "Mijo, sácame la guitarra." |
| i08 | — | Gildardo abre el estuche y le pasa la guitarra a la mano vieja |
| c33 | Gildardo | "Aquí está, apá." / "Hoy canto con ustedes." |
| BLACK | — | 0,4 s |
| c34 | Higinio (a cámara, se pone el sombrero) | "¿Ustedes creen que Gildardo merece otra oportunidad?" / "Denle me gusta y sigan la página para más historias." |

## Montaje
- Sin plano abierto de arranque: i01 (~1 s) y "que nadie salga" antes de los 2 s. La primera línea no lleva cifras.
- Corte al terminar cada frase; el mismo personaje salta dentro de su clip.
- Música VISTA: golpe sutil en el frame 0, suspenso hasta c20, cálida de c20 a c24, suspenso hasta el final. BLACK 0,4 s antes del CTA.
- El CTA solo nombra a Gildardo, que se oye desde la Parte 1 y en c15 y c24 de esta.
- Pronunciación a vigilar: "Higinio", "Rosendo", "Gildardo", "limosna", "mañanitas", "esperándote".
