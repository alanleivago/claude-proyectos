---
type: summary
status: active
tags: [atrium-novelas, vista, capos, premisas, telenovela]
relatedTo: [atrium-novelas, atriumstories, referencias3]
---
# Atrium vs VISTA · qué tipo de historia funciona

El scrape es del 2026-11-07 (Apify `clockworks/tiktok-scraper`, perfil completo).
- **@atriumstories_:** 39 posts entre el 14-oct y el 7-nov. Tiene 133.9K seguidores y una mediana de 52K vistas.
- **@vistastoriestv:** 25 posts. Solo 8 son novelas, todas entre el 4 y el 7 de noviembre. Los otros 17 son clips viejos de Odyssey y Obama y quedan fuera. La cuenta tiene 4.2K seguidores y una mediana de 27K vistas en las novelas.

La tabla completa está en [ranking.md](ranking.md) y los datos en [meta.json](meta.json). Los análisis plano a plano están en `videos/<id>_analisis.md` (10 nuevos). Además se reutilizaron 5 de `fuentes/atriumstories/videos/`.

Hay que tener dos cosas en cuenta al leer las cifras:
- Las muestras son chicas, sobre todo en VISTA, donde hay 3 videos por tipo como máximo.
- Los posts del 6 y 7 de noviembre llevan menos de 48 h publicados, así que sus vistas todavía pueden subir.

## Rendimiento por tipo

**Atrium** (xMed = vistas divididas entre la mediana de la cuenta)

| tipo | n | media | mediana | xMed mediana | mediana solo P1 | máx |
|---|---|---|---|---|---|---|
| humillación-revancha (leche, empanadas) | 4 | 555K | 226K | 4.3 | 934K (n=2) | 1.7M |
| hacienda-herencia | 4 | 183K | 186K | 3.6 | 321K (n=2) | 330K |
| **capos / patrón poderoso** | **12** | **339K** | **162K** | **3.1** | **298K (n=7)** | **1.5M** |
| trabajo-negocio | 3 | 94K | 117K | 2.2 | 78K | 126K |
| familia (madrastra, padre perdido) | 5 | 27K | 25K | 0.5 | 27K | 39K |
| bondad recompensada | 5 | 70K | 17K | 0.3 | 16K | 268K |
| humilde con dignidad (jardinero) | 2 | 15K | 15K | 0.3 | 18K | 18K |
| infidelidad | 4 | 16K | 14K | 0.3 | 14K | 26K |

Comparando capos con todo lo demás en Atrium, capos tiene una mediana de 162K contra 30K del resto y una media de 339K contra 141K.

**VISTA**

| tipo | n | media | mediana | xMed | pieza |
|---|---|---|---|---|---|
| **capos** | **3** | **143K** | **116K** | **4.3** | reten-sierra 267K, medalla-mezcal 116K, reten-sierra-p2 46K |
| humillación-revancha | 3 | 25K | 8.3K | 0.3 | agua-hacienda 61K, chocolate-rancho 8.3K, canasta 5.6K |
| familia | 2 | 0.7K | 0.7K | 0.03 | tele-nueva 1.1K, regreso-20 245 (tenía menos de 1 h al hacer el scrape) |

Comparando capos con el resto en VISTA, capos tiene una mediana de 116K contra 5.6K. Es unas 20 veces más.

## Qué pieza nuestra es cada video de VISTA

Los videos se cruzaron con los `caption.txt` de las piezas por título exacto.

| vistas | video | pieza | remake de |
|---|---|---|---|
| 267K | El Retén P1 | `pieces/reten-sierra` | Atrium El Retén (1.1M) |
| 116K | La media medalla P1 | `pieces/medalla-mezcal` | Atrium Amparo/llave (1.5M) |
| 61K | Jarro de agua P1 | `pieces/agua-hacienda` | Atrium Leche (1.7M) |
| 46K | El Retén P2 | `pieces/reten-sierra-p2` | — |
| 8.3K | La Taza de Chocolate P1 | `pieces/chocolate-rancho` | Atrium Leche |
| 5.6K | La Canasta P1 | `pieces/canasta` | — |
| 1.1K | La Tele Nueva P1 | `pieces/tele-nueva` | — |
| 245 | El Regreso P1 | `pieces/regreso-20` | — |

## ¿Se confirma lo de capos?

**Sí, en VISTA se confirma con claridad. En Atrium también, aunque con un matiz.**

- **En VISTA**, los 3 videos de capos son los 3 primeros de la cuenta.
  - El Retén P2 (46K) le gana a cualquier P1 de otro tipo salvo agua-hacienda. Es el único caso en que una segunda parte rinde así.
- **En Atrium**, capos es el tipo con más volumen y con mejor consistencia.
  - 7 P1 tienen una mediana de 298K, y 6 de ellos superan los 220K. El único flojo es "En el desierto no hay perdón", con 53K.
  - Atrium publica capos cada 1 a 3 días porque le rinde siempre.
  - El matiz: los dos picos más altos son de otros tipos. Leche (1.7M, humillación-revancha) es el mayor de la cuenta. La hacienda vacía (312K) y la de no ser su sangre (330K) están a la par de los capos.
- **En los dos casos lo que gana es el poder.** El "patrón poderoso" sale de capos, de hacienda y de las revanchas del humilde que vuelve rico. Los tipos sin una figura de poder (infidelidad, familia, jardinero, bondad) quedan por debajo de 0.5 xMed en Atrium y por debajo de 0.05 en VISTA.

## Otros hallazgos

1. **La Parte 1 lo es todo.** En Atrium, la mediana de las P1 es 85K y la de las continuaciones 43K. Cada serie cae fuerte en la parte siguiente:
   - Avioneta: 298K → 43K
   - Veinte años: 275K → 27K
   - Hacienda: 312K → 29K
   - Amparo: 1.5M → 60K
   - La única P2 que aguanta es la de Leche (284K), porque se entiende sola.
2. **El ritmo de corte separa ganadores de perdedores, también dentro de VISTA.** Son los mismos guiones con distinta duración media de plano:
   - Atrium, los ganadores van a 1.6–1.9 s por plano (Retén, Leche, Amparo, avioneta, veinte años).
   - VISTA, ganadores: Retén P1 a 2.7 s y medalla a 2.2 s. Agua-hacienda va a 2.9 s.
   - VISTA, perdedores: chocolate a 3.5 s, canasta a 3.6 s y Retén P2 a 4.3 s.
   - **Objetivo: ≤2 s de media y 60–90 planos en 2:00–2:50.**
3. **El gancho tiene que ser un gesto o una amenaza visible en los primeros 2 s**, sin presentación:
   - leche tirada,
   - muchacho sujetado del hombro,
   - chofer en pánico ante el retén,
   - fajos más "patrón, tenemos un problema",
   - avioneta más camionetas cerrando la pista.
   - Los flojos abren con conversación estática: "Firme aquí, don Prudencio" en chocolate o el anciano pidiendo revisar el coche en mecánico. Chocolate además nunca muestra la taza tirada que promete el título.
4. **La cuenta atrás y la cifra concreta.** "Cinco minutos", "15 días", "200 mil dólares", "medio millón", "tres minutos, comandante". Todos los capos que ganan tienen un reloj y un precio.
5. **El protector poderoso que "no vino solo".** El placer central es la inversión: el abusador cree que manda y llegan las camionetas o los jinetes. VISTA ganó con una matriarca, Candelaria, en el papel que Atrium le da a Don Aurelio. Una mujer mayor al mando funciona igual o mejor.
6. **El CTA: pregunta a cámara más "para ver la segunda parte"**, dicho por el protagonista. Atrium ya lo hace en todos los videos, así que no diferencia. Los comentarios suben cuando la pregunta es un dilema ("¿Joaquín lo perdonará?" sacó 1.690 comentarios; hacienda vacía, 1.332).
7. **Los remakes de las tres refs de 1M+ fueron nuestros tres mejores.** Copiar la estructura de un ganador probado rinde más que una premisa propia de otro tipo. Pero dentro de la misma ref (Leche), la pieza más lenta y sin el gesto visible (chocolate) se cayó a 8K.

## Fórmula de los que mejor funcionan (Parte 1, 2:00–2:50)

| seg | función | cómo |
|---|---|---|
| 0–3 | Gancho de poder o peligro | In medias res. Un subordinado entra con "Patrón, tenemos un problema" o "esta muchacha venía escondida". También sirve una camioneta que frena o un gesto de humillación visible. Nada de presentaciones. |
| 3–25 | El abusador pone precio y plazo | Cifra concreta más cuenta atrás. El abusador se cree dueño de la escena (comandante, licenciado, rival, socio). |
| 25–60 | Duelo de miradas y primera revelación | El protagonista contesta tranquilo ("¿Usted cree que vine solo?"). Aparece un objeto que guarda un secreto: reloj, medalla, llave, nota de voz. |
| 60–100 | Montaje paralelo | El público ve llegar las camionetas o descubre al traidor antes que los personajes. Hay un dato nuevo cada 5–10 s. |
| 100–150 | Inversión de poder a medias | Llegan los refuerzos, el abusador duda y queda una lealtad en el aire. El castigo NO se muestra. |
| último 5 s | Cliffhanger y CTA | Primer plano largo de 5–10 s del protagonista mirando a cámara. Lanza una pregunta-dilema ("¿Creen que va a ceder?") y "Sigue la página, dale me gusta y comparte para ver la segunda parte". |

El título sigue esta plantilla: "[Abusador] le [hizo X]… y no sabía [quién era / con quién se metía] 😳 | [Nombre de la serie] · Parte 1". Encima va el plot de 2 líneas, una pregunta y el CTA.

Personajes tipo:
- un patrón o patrona de 55 a 75 años, sereno, con sombrero, guayabera o chaleco y cadena con medalla;
- un escolta o lugarteniente que pregunta lo que el público necesita saber;
- un abusador con cargo, de bigote y lentes o con traje;
- un joven en apuros que provoca empatía;
- un traidor interno.

Locaciones que funcionan: pista de tierra, rancho al atardecer, mezcalera, sierra, convoy de camionetas negras entre polvo. Todo con luz dorada.

### Cómo hacer capos con Flow/Omni sin armas ni sangre

Atrium enseña revólveres y soldados armados (Retén). Nosotros no podemos, y aun así reten-sierra hizo 267K sin enseñarlas. El poder se cuenta con estos recursos:
- **Presencia:** escoltas de pie con las manos cruzadas, lentes oscuros, el escolta que se acerca al oído.
- **Llegadas:** convoy de camionetas que llega entre polvo, jinetes en la loma, portón que se cierra.
- **Detalles de poder:** fajos dentro de un maletín cerrado (no en la mano), el anillo, la medalla, el reloj, el radio ("¿ya están en posición?").
- **Cómo hablan:** silencios, frases de tres palabras, el que habla bajito es el que manda.
- **Las consecuencias, fuera de cuadro:** un teléfono que suena, "se lo llevaron", un lugar vacío en la mesa.

Para la autoridad corrupta conviene usar un cargo civil (licenciado, inspector, delegado, "el de la aduana") o un jefe rival antes que militares o policías con uniforme.

**Palabras que hay que suavizar en el diálogo**, porque Omni y los subtítulos las bloquean o las marcan:

| en vez de | decir |
|---|---|
| matar / lo mataron | "no volvió", "lo desaparecieron del mapa", "ya no está" |
| pistola, cuerno, fierro, balas, plomo | "lo arreglamos a mi manera", "mis muchachos ya saben" |
| sicarios, pistoleros | "mi gente", "los muchachos", "la escolta" |
| narco, cártel, droga, mercancía, la carga | "el negocio", "lo que traemos", "la carga del patrón" |
| secuestro, levantón | "se lo llevaron", "lo tienen" |
| cuota, derecho de piso | "lo de cada semana", "la cooperación" |
| federales, ejército, soldados | "el delegado", "la gente del licenciado", "los del gobierno" (sin uniforme en cuadro) |
| sangre (si es violencia) | dejarla solo como "de mi sangre", con sentido de familia |
| "te voy a matar" | "no te va a alcanzar la vida para arrepentirte" |

## 10 premisas nuevas

Las 1 a 8 son de capos o patrón poderoso, porque es el tipo ganador. La 9 y la 10 son de hacienda y de revancha, los otros dos tipos fuertes. Ninguna repite el conflicto de una pieza existente: retén, medalla, veladoras, encendedor, fierro y hacienda-sangre ya están hechas.

1. **El Jefe Nuevo.** Un recién llegado con traje y tres camionetas entra a la fonda de doña Chela a cobrarle "lo de cada semana": 50 mil antes del domingo. Ella le sirve café y solo le pide que se lo lleve a la mesa del fondo. Ahí desayuna, desde hace 30 años, el hombre que le dio el pueblo a él.
2. **La Viuda del Aguacate.** Un notario cambia las escrituras de la huerta de Doña Esperanza, en Michoacán, y le da 72 horas para salir. Ella saca del ropero un celular viejo de su difunto y marca el único número guardado: "Dígale a don Nicandro que la viuda de Ramón ya lo necesita".
3. **El Velorio del Patrón.** En el velorio de don Cipriano, los hijos corren a la cocinera de 25 años. El contador lee que el anillo del patrón es para ella, y los doce hombres de la escolta solo obedecen a quien trae ese anillo.
4. **El Valet.** El valet de un restaurante de lujo le niega el lugar a un viejo con una troca sucia y se la raya "por estorbo". En cinco minutos el estacionamiento se llena de camionetas negras: el viejo es el dueño de la plaza y viene a la boda de la hija del gerente.
5. **El Chofer de Veinte Años.** El hijo del patrón acusa al chofer Lencho de llevarse el maletín y lo hinca delante de todos. Lencho no se defiende, solo pide que revisen la cámara de la camioneta. En la grabación sale quien abrió la cajuela.
6. **La Madrina de la Central.** Un agiotista le quita el tráiler a Toño el día que nace su hija y se burla: "¿Y quién te va a ayudar?". Toño entra a la Central de Abastos a buscar a Doña Eva, la que decide quién vende y quién no, y ella manda cerrar las puertas.
7. **La Gasolinera.** El encargado de una gasolinera en la carretera humilla a un anciano que paga con monedas y lo saca de la fila. Atrás vienen siete camionetas a cargar. Son del anciano, igual que media carretera, y el encargado tiene 10 minutos para devolver cada moneda.
8. **El Mariachi del Patrón.** En la fiesta de un ganadero rico, el anfitrión no le paga al mariachi viejo y lo corre a empujones. A medianoche, don Rosendo entra sin invitación: "Ese señor me cantó en todos mis cumpleaños". El ganadero le debe toda la cosecha.
9. **La Cosecha Embargada** (hacienda-herencia). El día que entierran al patriarca, el yerno se lleva las trilladoras y le deja a Rebeca una carta del banco: 20 días para pagar 3 millones. Los jornaleros que el yerno despidió vuelven de madrugada con sus propias manos, y en el costal de semillas del abuelo hay algo más que semillas.
10. **El Bolero** (humillación-revancha, fórmula Leche). Un licenciado le escupe los zapatos a un bolero de 19 años y le tira las monedas a la coladera. Un taquero lo levanta y le da de comer. Quince años después, el licenciado entra a firmar el crédito que lo salva, y el que firma es el bolero. Se evitan menores: el bolero es adulto en las dos épocas.
