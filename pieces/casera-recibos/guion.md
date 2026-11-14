---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, majestic, parte1, historia-propia, navidad, referencias3]
relatedTo: [masa-honrada, tiendita-justa, nochebuena, posada, referencias3]
---
# La Casera de los Recibos · Parte 1

Historia propia y navideña inspirada en la premisa n.º 5 de `fuentes/referencias3/resumen.md` (ref ★ 7702576886957755670 de @relatos.de.vida.9, 1.4M; análisis en `fuentes/referencias3/videos/7702576886957755670_analisis.md`). No es copia: en la ref es una estudiante de 18 años con su papá y la universidad. Aquí Maricela es una enfermera adulta, la echan a dos días de Nochebuena, la recoge la vecina con ponche, y la que va a cachar a la casera es la jefa de enfermeras, haciéndose pasar por inquilina nueva el día de la posada.

Estructura de los virales: injusticia concreta en el gancho (nueve veces la misma luz), amenaza, nadie se atreve, desalojo en Navidad, refugio cálido, el punto débil (la lista del hospital), la jefa duda y arma el plan, y un gancho con ironía dramática: Chelo le renta el cuarto a Graciela sin saber quién es.

**Navidad** (1 de cada 3 piezas): posada, piñata de estrella, ponche y Nochebuena. Sin nacimiento ni Niño, sin aguinaldo ni dinero navideño, sin niños. Un solo adorno por locación: luces y piñata en el patio, luces y olla de ponche en la sala.

Marca **MAJESTIC** (edit.py, BRAND = "MAJESTIC"): marca de agua MAJESTIC STORIES arriba a la izquierda y música de `pieces/_marcas/MAJESTIC`. Son 519 palabras, unos 225–240 s de voz en bruto; el montaje apunta a 2:00–2:20.

**Título:** Les cobraba la misma luz nueve veces… y la echó a la calle antes de Nochebuena 😳 | La Casera de los Recibos · Parte 1

## Premisa
Maricela, enfermera llegada de su pueblo, saca la cuenta: doña Chelo cobra el mismo recibo de luz completo a cada una de sus nueve inquilinas y nunca devuelve el depósito. Doña Chelo la echa a la calle con sus maletas a dos días de Nochebuena.

Doña Pachita, la vecina de enfrente, la recoge con ponche y le da la pista: las inquilinas le llegan porque el hospital recomienda la casa. Graciela, la jefa de enfermeras, no puede sacarla de la lista con una libreta y decide verlo ella misma, como la "inquilina nueva" que llega la noche de la posada.

Gancho: Chelo, feliz, le renta el cuarto por teléfono ("las enfermeras nunca me dan problemas"), y del otro lado sonríe Graciela.

## Personajes (hojas en Flow, nombres únicos en pieces/)
| Hoja | Quién | Aspecto fijo (ref → color nuevo) | Voz |
|---|---|---|---|
| MARICELA_ORNELAS | la enfermera, 31 años (= Itzel, aquí adulta con trabajo) | pelo negro a los hombros detrás de las orejas; suéter azul marino, jeans (ref: trenza, sudadera guinda); sin uniforme | mujer adulta, firme y cálida |
| CHELO_VALDIVIA | doña Chelo, la casera (= doña Matilde) | pelo corto permanentado cobrizo; bata verde esmeralda con florecitas blancas, cadena de oro (ref: bata morada floreada) | mujer mayor, fría, de dulzura falsa |
| NANCY_GUILLEN | la inquilina con miedo, 33 años (= Dani) | pelo rizado castaño; chamarra polar lila sobre playera blanca; sin lentes (ref: lentes y mezclilla) | mujer adulta, nerviosa |
| PACHITA_ROBLES | doña Pachita, la vecina que la recoge (= doña Lucha, que en la ref solo se menciona) | chongo blanco; chal rojo tejido sobre vestido gris | mujer anciana, tierna y pícara |
| GRACIELA_MONDRAGON | la jefa de enfermeras (= la licenciada Rocío) | pelo corto castaño con un mechón gris; blazer gris carbón, blusa blanca; sin gafete | mujer, seria y lista |

Locaciones (hojas SIMPLES, sin letreros ni nacimiento):
- LOC_PATIOCHELO: patio de la casa de huéspedes, pared terracota, puerta de madera, una tira de focos navideños y una piñata roja de estrella. Se usa de mañana, de tarde y de noche (también la banqueta de enfrente).
- LOC_COCINACHELO: pared amarillo pálido, mesa con hule a cuadros, refri blanco sin papeles, una olla.
- LOC_SALAPACHITA: sala humilde de noche, sofá café, mesita con olla de ponche y jarritos, una tira de focos en la ventana.
- LOC_OFIHOSPITAL: oficina sencilla, escritorio de madera con carpetas lisas, pared verde pálido, ventana (de día y de noche).

Utilería, una de cada una:
- Papel blanco doblado sin letras en la mano DERECHA (c01, c03).
- Libreta café cerrada en la mano DERECHA (c24).
- Dos maletas azul oscuro (c15, r3).
- Jarrito de barro con ponche en las dos manos (c17, c19, c33).
- Celular al oído con la mano DERECHA (c30, c31, c32).

Nadie lleva sombrero, gorra ni lentes. Nadie señala con el dedo. Sin uniformes de enfermera ni gafetes.

## Geografía (planos de una sola persona, mirada a un lado)
- Patio de día: Chelo a la DER., junto a la puerta; Maricela a la IZQ.
- Cocina: Maricela a la IZQ.; Nancy y Chelo a la DER.
- Banqueta de noche: Maricela a la IZQ., sentada en su maleta; Nancy (en la puerta) y Pachita a la DER.
- Sala de Pachita: Maricela a la IZQ.; Pachita a la DER.
- Oficina: Maricela a la IZQ.; Graciela a la DER., detrás del escritorio.
- Gancho: Chelo sola al teléfono en el patio de noche; Graciela sola al teléfono en su oficina de noche.

## Guion (fuente única: lines.json)

## 1. Gancho / la cuenta · patio, mañana de diciembre (suspenso; golpe en el frame 0)

- **c01** MARICELA (con el recibo doblado): Doña Chelo, la luz de toda la casa llega en un solo recibo. / ¿Por qué nos la cobra completa a cada una?
- **c02** CHELO (junto a la puerta): Porque la casa es mía, y aquí mando yo. / ¿Algún problema, enfermera?
- **c03** MARICELA (con el recibo): Sí, señora. Saqué la cuenta de todo el año. / Nos cobró la misma luz nueve veces.
- **c04** CHELO: Tres meses aquí y ya me salió contadora. / En esta casa, la que reclama se va.

## 2. Nadie se atreve · cocina

- **c05** NANCY (bajito, mira a la puerta): Maricela, ¿cómo se te ocurre reclamarle? / A la que reclama, no le devuelve el depósito.
- **c06** MARICELA: ¿Y a ti te lo devolvió alguna vez? / Dime la verdad, Nancy.
- **c07** NANCY: A mí no… ni a ninguna de las que se han ido. / Pero nadie dice nada. No tenemos a dónde ir.
- **c08** CHELO (en la puerta de la cocina): Qué bonita platicadita, muchachas. / Nancy, a tu cuarto. Y tú, Maricela, quédate.
- **r1** (Nancy baja la mirada, asustada, muda)

## 3. La amenaza · patio, tarde (Chelo acomoda la piñata)

- **c09** CHELO (bajo la piñata de estrella): Este año la posada de la casa va a quedar preciosa. / Lástima que tú no la vas a ver, Maricela.
- **c10** MARICELA: Faltan dos días para Nochebuena, doña Chelo. / Ni a mi pueblo puedo ir.
- **c11** CHELO: Eso no es asunto mío, mija. / Hoy en la noche te me vas, con todo y maletas.
- **c12** MARICELA: Ese depósito lo junté a puros turnos de noche. / Devuélvamelo y me voy.
- **c13** CHELO: ¿Devolverte? Del hospital me llegan muchachas como tú cada año. / Estoy en su lista desde hace quince años.
- **r2** (Maricela entrecierra los ojos: acaba de entender algo, muda)

## 4. El desalojo · banqueta de noche, a dos días de Nochebuena

- **c14** NANCY (en la puerta entreabierta): Maricela, perdóname. Doña Chelo nos prohibió abrirte. / Si te ayudo, mañana me saca a mí.
- **c15** MARICELA (sentada en su maleta): Métete, Nancy, que hace mucho frío. / Esto no se va a quedar así.
- **r3** (Maricela sola en la banqueta con sus maletas, luces navideñas al fondo, muda)

## 5. El ponche de doña Pachita (entra la cama cálida)

- **c16** PACHITA: Ay, mija, ¿qué hace aquí afuera con este frío? / Ándele, véngase a mi casa, que tengo ponche calientito.
- **c17** MARICELA (en el sofá, con un jarrito de ponche): Gracias, doña Pachita. / Doña Chelo me echó por sacarle las cuentas.
- **c18** PACHITA: Esa Chelo lleva años haciendo lo mismo, mija. / Y las muchachas le siguen llegando del hospital.
- **c19** MARICELA (se le ocurre algo): Ella misma me dijo que está en la lista del hospital. / Si la sacan de esa lista, se le acaban las inquilinas.
- **c20** PACHITA (sonrisa pícara): Pues ahí está, mija. / Mañana se me va derechito al hospital.

## 6. El hospital · oficina de la jefa

- **c21** MARICELA: Jefa Graciela, vengo por la casa de doña Chelo Valdivia. / La que recomiendan a las enfermeras nuevas.
- **c22** GRACIELA (detrás del escritorio): Doña Chelo lleva quince años en nuestra lista. / Y nunca hemos tenido una sola queja.
- **c23** MARICELA: Nadie se queja porque a la que se queja la corre. / Como a mí, a dos días de Nochebuena.
- **c24** MARICELA (con la libreta): Aquí están las cuentas de la luz, mes por mes. / Y mensajes de ocho compañeras que pasaron por lo mismo.
- **c25** GRACIELA: Maricela, con una libreta no puedo sacarla de la lista. / Lo tengo que ver con mis propios ojos.
- **c26** MARICELA: Si va como jefa, le va a enseñar otra casa. / Delante de la gente, es puro amor.
- **c27** GRACIELA (sonrisa lenta): Entonces no voy como jefa. / ¿Esa señora no anda buscando quién ocupe su cuarto?
- **c28** MARICELA: Sí, jefa. Lo quiere rentar para Nochebuena. / El mismo día de su posada.
- **c29** GRACIELA: Pues que me lo enseñe a mí. / Voy a ser su inquilina nueva.

## 7. Gancho para la Parte 2 (vuelve el suspenso)

- **c30** CHELO (al teléfono, en el patio de noche): Sí, señora, el cuarto ya está libre. / Véngase el veinticuatro, a la hora de la posada.
- **c31** CHELO (al teléfono): ¿Usted también es enfermera? Qué bueno. / Las enfermeras nunca me dan problemas.
- **c32** GRACIELA (al teléfono, en su oficina de noche): Ahí estaré, doña Chelo. / No me la pierdo por nada.
- **r4** (Graciela baja el teléfono y sonríe de reojo, muda)

## CTA (después de BLACK 0.4 s)

- **c33** MARICELA (CTA a cámara, en la sala de Pachita con su jarrito; lo alza un poco, ladea la cabeza, sonríe): ¿Ustedes creen que doña Chelo va a caer en su propia posada? / Síganme para ver la segunda parte, y denle me gusta.

## Notas de política y de Omni
- **Edades:** sin niños ni estudiantes. Maricela (31) y Nancy (33) se ven claramente adultas.
- **Dinero:** sin cifras ni billetes. Se dice "la misma luz nueve veces", "el depósito", "un solo recibo". El recibo es un papel doblado sin letras. La Navidad no toca dinero.
- **Navidad:** posada, piñata de estrella, ponche y Nochebuena. Sin nacimiento, sin Niño, sin imágenes religiosas.
- **Autoridad:** Graciela es jefa de enfermeras en ropa de oficina, sin gafete ni logos del hospital. Ni policía ni cerrajero en cuadro.
- **Verbos suaves:** nadie empuja, avienta maletas ni grita. Las maletas ya están en la banqueta.
- **SOFT:** desde el 2.º intento cambia también las frases fuertes ("la que reclama se va", "me echó", "te me vas, con todo y maletas", "la corre").
- **Pronunciación a vigilar:** "Maricela", "Chelo", "Pachita", "Graciela", "ponche calientito", "platicadita", "veinticuatro", "Nochebuena", "inquilinas".
