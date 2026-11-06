---
type: note
status: active
tags: [roblox, guion, variedad, estructura, gneef, greenbrorants, redfish1, anti-repeticion]
relatedTo: [styles/roblox/STYLE.md]
---

# Variedad entre historias: misma estructura, otra historia

**Problema:** `pieces/rbx-thursday` y `pieces/rbx-sock` usaron el mismo esqueleto frase por frase: "In this town…", calle, cartero, Mr. Ortega, abuela, escuela, "I wear this hood", "My little sister Pip is four", incidente, "that's when I realized", epílogo del pueblo. Los canales de referencia repiten la **lógica** y no el **elenco**: cada historia tiene su propio mundo, sus lugares, su gente y sus gags.

**Fuentes (132 historias):**
- 18 transcripciones de `Ref roblox/<canal>/*.txt`.
- 106 notas de GreenBroRants en `fuentes/roblox-cartoon/` (shorts de más de 1 M de vistas).
- 25 notas nuevas hechas con ver-youtube el 2026-11-04: 15 top de Gneef y 10 top de redfish1.

Cada fuente pasó por la API, que devolvió una ficha estructural en JSON. Excluyendo compilaciones y listas, el reparto queda así: **GreenBroRants 95, Gneef 21, redfish1 16**. Las fichas están en `scratchpad/fichas/*.json` (carpeta temporal). Los conteos son aproximados, ±2-3 por categoría, porque las notas de GreenBro parafrasean y no transcriben. Por eso la frase de apertura exacta de ese canal está subcontada.

## 1. El esqueleto que sí se repite

| # | Beat | Qué es | Dónde cae (mediana de 132) |
|---|---|---|---|
| 1 | Regla | La premisa en la primera frase. El título es la regla. | 0-3 s |
| 2 | Mecanismo + castigo | Cómo funciona la regla y qué pasa si la rompes. "You see," es opcional. | 3-10 s |
| 3 | El mundo se adapta | 0-6 gags. **Media 2.4; moda 3**; 21 de 132 tienen **0**. Cada gag sale de la mecánica de la regla. | 10-25 % |
| 4 | Héroe con rareza | Defecto o rareza en 38 %, sin presentación en 31 %, estatus dentro de la regla ("I'm paper") en 7 %, nombre + habilidad en 8 %. | 15-30 % |
| 5 | Incidente | La regla golpea a alguien o se rompe. | **mediana 30 %** (cuartiles 25-40 %) |
| 6 | Intento fallido / escalada | Está en 98 de 132 (74 %). | 35-60 % |
| 7 | Giro | La regla o el villano significan otra cosa, o el héroe usa algo plantado. | **mediana 68 %** (cuartiles 58-75 %) |
| 8 | Ejecución | Frases cortas, onomatopeyas, cortes rápidos. | 70-92 % |
| 9 | Final + última línea seca | Callback tierno, chiste oscuro, ritual nuevo o amenaza. | últimos 5-10 s |

Duración: mediana 108 s (cuartiles 88-131 s).

Lo único realmente fijo es esto: **regla en la frase 1, siembra temprana que se cobra en el giro, incidente a un tercio, giro a dos tercios, última línea corta**. Todo lo demás cambia de video a video.

**Correcciones a lo que teníamos en STYLE.md:**
- El giro "literal" (la regla dice X pero no dice Y) es solo el **13 %** (17 de 132). El giro más común es la **reinterpretación**: la regla o el villano eran otra cosa. Está en el **52 %** (68 de 132). Ejemplos: la luz de la luna son los niños, el tenedor es un niño cenando, los guardias son los atrapados, el gigante no duerme hace 900 años. Le siguen el objeto plantado o la herramienta de un mentor (14 %) y el juego o habilidad plantados (13 %).
- "El pueblo adopta el truco" es un final raro: 6 de 132. Los más comunes son el **callback tierno** (41 %) y el **chiste oscuro o amenaza** (33 %). redfish1 cierra con chiste oscuro en 11 de 16.

## 2. Lo que varía, y cuánto

### Fórmula de apertura (132)
| Fórmula | N | % | Ejemplo |
|---|---|---|---|
| "In this world, …" | 45 | 34 % | "In this world, everyone lives on their own tiny planet." |
| "In this town, …" | 25 | 19 % | "In this town, if you hug someone, you swap ages." |
| "In my town, …" | 6 | 5 % | "In my town, a 300-foot giant tucks everyone into bed at 9pm." |
| "Everyone / Every X has / lives…" (sin marco) | 18 | 14 % | "Everyone has a wind-up key in their back." / "Inside every vending machine lives a tiny worker." |
| Primera persona, sin regla al inicio | 11 | 8 % | "I've always known there was something wrong with our lunch lady." / "My dad taught me to drive when I was nine." |
| "Once a year / Every night at…" | 4 | 3 % | "Once a year, on Up Day, the rain falls upward." |
| Imperativo / prohibición | 3 | 2 % | "Nobody is allowed in Grandma's backyard, not even the dog." |
| Otra afirmación del mundo | 20 | 15 % | "The sun has a bedtime, just like you." / "When you turn 70, they take you to the Grandparent Factory." |

Cada canal tiene su tic: Gneef abre con "In this world" en 15 de 21, redfish con "In my town" en 4 de 16. GreenBro mezcla todo: con marco ("In this town/world") solo en 44 de 95.

### Mundo / escala
| Mundo | N | Ejemplos |
|---|---|---|
| Pueblo | 58 (44 %) | Incluso aquí la geografía es propia: pueblo en un cañón con casas en cornisas, el árbol en la colina, la plaza con 27 jaulas. |
| El mundo entero o el planeta | 35 (27 %) | Imanes, precios sobre la cabeza, teletransporte cada hora. |
| Reino de fantasía | 9 | El castillo sobre el caracol, el reino de los perros perdidos, Atlas. |
| Escuela | 6 | La cocinera sospechosa, "If you move you turn invisible". |
| Mar / bajo el agua | 5 | Everyone Lives Underwater, el barco eterno. |
| Casa / familia | 5 | La trampilla de la abuela, la casita del árbol. |
| Torre / búnker | 4 | One Tower, 60 seconds to the bunker. |
| Espacio / cielo | 4 | Every Kid Is Born On The Moon, Own Planet. |
| Otros | 6 | Servidor de juego, circo, tren eterno, bosque, futuro. |

Gneef usa el "mundo entero" en 11 de 21: escala grande y una sola sociedad.

### Lugares
- Media de **6.7 lugares distintos** por video. Los más repetidos son genéricos: cuarto (21), calle (18), aula (15), pasillo de la escuela (11), plaza (11). Pero **casi ningún video repite el orden de otro**.
- El primer lugar es una calle genérica en ~18 de 132. En el resto la historia arranca **en el lugar de la regla**: el piso 1 de la torre, la colonia lunar, la cafetería, la plaza de las jaulas, el árbol de la colina.
- El clímax ocurre en un **lugar que solo existe en ese mundo**: la fábrica de cajas de música, el escenario en las nubes, el piso cero, la luna con linternas, el Wanderer, el planeta-sol con ruedas, el cuerpo del gigante, el reino de las mascotas, la playa en otro planeta.

### Ser querido
| Tipo | N | % |
|---|---|---|
| Nadie (el héroe solo o todo el mundo en juego) | 21 | 16 % |
| Papá | 18 | 14 % |
| Otro (gemelo perdido, ángel guardián, la casa que camina, la letra B) | 16 | 12 % |
| Mejor amigo | 15 | 11 % |
| Mamá | 12 | 9 % |
| Abuelo | 10 | 8 % |
| Mascota | 9 | 7 % |
| Abuela | 8 | 6 % |
| **Hermano/a menor** | 8 | **6 %** |
| Ambos padres | 5 | 4 % |
| Hermano/a mayor | 4 | 3 % |
| Crush | 4 | 3 % |
| Bully / rival | 1 | 1 % |
| Pueblo entero | 1 | 1 % |

El nombre del ser querido **nunca se repite entre videos**, salvo en las sagas con "Part 2/3", como Mr. Wink. Gneef reparte entre mejor amigo (7) y papá (7). Nosotros usamos la hermana menor, que es el 6 %, dos veces seguidas y con el mismo nombre.

### Presentación del héroe
- Rareza o defecto: 50 (38 %). Sin presentación, empieza en acción: 41 (31 %). Nombre + habilidad ("My name is Max, and I'm the best fake sleeper alive"): 10. Estatus en la regla ("I'm paper"): 9. Oficio: 3. Otro: 10.
- La edad aparece en 9, siempre **dentro de una frase de trama** ("I'm 12, I knew exactly what would happen"). Nunca como presentación ("Me? I'm ten").
- La rareza es distinta en cada video y siempre es la llave: handstands, fake sleeper, fling, la historia aburrida, password123, mal perdedor.

### Gags de "cómo se adapta el mundo"
- Cuántos: 0 → 21 videos, 1 → 6, 2 → 38, **3 → 44**, 4 → 17, 5 → 4, 6 → 2. Gneef y redfish rondan 3.2; GreenBro, 2.1. Nosotros pusimos 5 en los dos.
- **Gente "de pueblo" que aparece en los gags** (videos que la usan, de 132): escuela/maestra 44, abuela 24, vecino con nombre 23, abuelo 17, policía 13, alcalde 12, bebés 10, **cartero 10 (8 %)**, perro 9, pizzero 3, panadero 2, bodas 1.
- 39 videos (30 %) no usan **ninguno**: los gags son de gente que solo existe por la regla, como guardias, jueces de vuelo, el tipo que lleva 1000 años o los imanes que se pegan.
- **La combinación cartero + abuela + escuela aparece en 1 de 132** (1,000,000 Steps). Nosotros la usamos en los dos videos, más el mismo vecino con nombre.
- Comparando todos los pares de videos (8.646), solo **9** comparten 3 o más tipos de gente de pueblo y **ninguno** comparte 4. Thursday y Sock comparten 4: cartero, abuela, escuela y Mr. Ortega.

### Incidente: cómo empieza
El sistema de la regla falla (se rompe, se vuelve peligroso, cambia): 32 (24 %). Alguien querido en peligro: 27 (20 %). Alguien querido se va o se lo llevan: 25 (19 %). Llega un monstruo o visitante: 18 (14 %). El héroe rompe la regla: 15 (11 %). El héroe la rompe a propósito por alguien: 9 (7 %). Otro: 6.

### Quién resuelve
El héroe solo: 66 (50 %). El héroe con su ser querido: 44 (33 %). Todo el pueblo: 11. El ser querido salva al héroe: 3. Un mentor: 2.

### Final
Callback tierno: 54 (41 %). Chiste oscuro o amenaza: 44 (33 %). Ritual o nueva normalidad: 18 (14 %). Gancho de secuela: 10 (8 %). El mundo copia el truco del héroe: 6 (5 %).

### Distancia entre historias (medida)
Se compararon 8 columnas por par de videos: apertura, mundo, ser querido, presentación del héroe, incidente, giro, quién resuelve y final.
- Promedio en las refs: **1.97 de 8 columnas iguales**. Por canal: Gneef 2.5, GreenBro 2.0, redfish 2.9. Pares con 6 o más iguales: 27 de 4.795 pares del mismo canal.
- **Thursday contra Sock: 5 de 8 iguales** ("In this town", pueblo, hermana menor, el héroe solo, ritual) **más 4 personajes de pueblo compartidos**. Solo el 3 % de los pares de refs coincide en 5 o más columnas. Ningún par de refs comparte 4 personajes de pueblo, y solo 1 par de 8.646 combina 5 o más columnas con 3 o más personajes compartidos.

## 3. Tabla: 30 videos top

| Título | Vistas | Canal | Apertura | Mundo | Lugares en orden | Ser querido | Giro |
|---|---|---|---|---|---|---|---|
| In This Town, You Get 1,000,000 Steps 👣 | 34 M | Gneef | In this town | Pueblo, contador de pasos en el pecho | calle → escuela → almacén → patio → casa → parque → colina → río | hermanita bebé Rosie | lectura literal (solo cuenta pies → manos) |
| Everyone Has A String On Their Back 🧶 | 31 M | Gneef | In this world | Mundo de hilos que suben a las nubes | mercado → pijamada → casa de la abuela → calle → nubes → escenario del titiritero → cuarto | mejor amigo Theo | objeto plantado (tijeras de la abuela) |
| The Most Boring Story 😴🌛 | 29 M | GreenBro | In this town | La luna arropa a los niños | calle → ventana de Jayden → cuarto → luna → cráteres → cama | mejor amigo Jayden | habilidad plantada (la historia aburrida) |
| The Knocker Copies Your Voice ❄️ | 29 M | Gneef | In this town | Pueblo nevado, criatura que miente | puerta delantera → pasillo → puerta trasera (recreo en flashback) | papá (quitanieves) | juego plantado (Knocker del recreo) |
| Never Be Caught Awake At Night 😴 | 28 M | Gneef | In this world | Pueblo con toque de queda, Lullaby | cuarto → calle → fábrica de juguetes → caja de música gigante → estante | mejor amigo Dex | herramienta del abuelo (la caja termina) |
| If You Hug Someone You Swap Ages 🤯 | 28 M | GreenBro | In this town | Pueblo, abrazo = cambio de edad | boda → calle → cumpleaños → porche → árbol → colina → lago | abuelo de 90 | lectura literal (hasta el próximo abrazo) |
| Every Person Is Made Of A Certain Material 📄🧱 | 26 M | GreenBro | In this world | Gente de vidrio, goma, piedra o papel | escuela → pileta → patio → puerta → ruta → río | el bully Brick | el defecto es la llave (papel = desliza) |
| Everyone Lives In One Tower ⚠️ | 26 M | Gneef | In this world | Torre de un millón de pisos | piso 1 → escalera → ascensor → piso 0 → sala de máscaras | papá | reinterpretación (los guardias son los atrapados) |
| Suspicious Lunch Lady 😱 | 24 M | GreenBro | 1ª persona | Escuela, cafetería mágica | cafetería → pasillos → cocina → ático → casa | abuela | el defecto es la llave (alergias) + receta de la abuela |
| Everyone Has Their Own Planet 🪐 | 23 M | Gneef | In this world | Planetas personales | mi planeta → planeta del abuelo → planeta de Nia → planeta-escuela → el Wanderer → lago | mejor amiga Nia | juego plantado (fling) |
| Everyone Lives Underwater 🫧 | 22 M | Gneef | Everyone… | Bajo el mar | calle submarina → tienda → cancha → escuela del arrecife → superficie → barco | mejor amigo Marlowe | juego plantado |
| The Sun Makes Sure Everyone Is Awake 🌞 | 21 M | GreenBro | In this world | El sol despierta a todos | ventanas → planeta-sol → ruedas → recreo → pueblo | papá (chofer nocturno) | habilidad plantada (el sol carga con movimiento) |
| Every Kid Is Born On The Moon 🌙 | 21 M | Gneef | Everyone… | Colonia lunar de niños | colonia → torre de lanzamiento → casas → cohete → lado oculto → mina | hermana mayor Nova | habilidad plantada + revelación |
| Every Time You Lie You Shrink 😱 | 21 M | GreenBro | In this town | Mentir encoge | casa → aula → pasillo → cuarto → cuarto de Lily → casa en llamas → ducto | hermana Lily | habilidad plantada (ser diminuto) |
| The Alphabet Is Alive 😱 | 21 M | GreenBro | In this world | Letras vivas en jaulas | plaza → camino a la escuela → cuarto → cuarto de Ben → calle → biblioteca | hermano Ben | reinterpretación (Z se comió la letra 27) |
| We Glitched The System 🌭 | 20 M | Gneef | In this world | Servidor de juego con NPCs | Main St → puesto de panchos → limonada → edificio admin → borde del mapa | crush (NPC de la limonada) | objeto plantado |
| When You Get Angry, You Age 1 Year 🤯 | 20 M | Gneef | In this world | La ira envejece | calle → fábrica → consultorio → picnic → escuela | papá | reinterpretación |
| You Teleport Every Hour ✨ | 20 M | Gneef | In this world | Teletransporte cada hora | aula → cuarto → bus → estación → tren nocturno → techo del tren → cabina | mejor amigo Leo | reinterpretación |
| Your Superpower Is Your Opposite ⚡ | 20 M | Gneef | In this world | Poder = lo opuesto a ti | Día de Prueba → gremio → aula → silla de prueba → muelle → faro | nadie | lectura literal |
| In This World, Everyone Is A Magnet 🧲 | 19 M | Gneef | In this world | Imanes rojos y azules | calle → bus → casa → aula → lago helado → bosque nevado | papá (mismo polo, no se pueden abrazar) | el defecto es la llave |
| Mr. Smiles Finds Everyone 🫣 | 19 M | GreenBro | In my town | Gigante que juega a las escondidas | calle → casas → camión de mudanza → buzón → bajo un auto | mejor amigo Owen | reinterpretación |
| In This World, You Have A Price 💸 | 17 M | Gneef | In this world | Precio sobre la cabeza | calle → porche → aula → cancha → biblioteca → casa de la abuela | abuela de $5 | reinterpretación |
| In This World, Your House Walks 🏠 | 17 M | Gneef | In this world | Las casas caminan de noche | calle → cancha → casa Bertha → cuarto → escalera → comisaría | la casa misma | juego plantado |
| Kids Are Giant Until 18 Years Old ⏳ | 17 M | Gneef | In this world | Niños gigantes | casa → montaña → sendero nevado → grieta → cumbre | papá guardaparques | el defecto es la llave |
| Earth Login 🌍 | 8.8 M | redfish | In this world | El cielo es una pantalla de login | ventana → ciudad → helicóptero → cielo → teclado | nadie | el defecto es la llave (password123) |
| Bedtime Giant 🌙 | 2.7 M | redfish | In my town | Gigante que acuesta a todos | cuarto gamer → calles → comisaría → avión → lago → techo | nadie | reinterpretación (el gigante no duerme) |
| The tree on the hill 🌳 | 2.5 M | redfish | In my town | Árbol que devuelve lo enterrado | árbol → colina → casa → pueblo → hoyo → estanque | abuelo | lectura literal (enterrar algo vivo) |
| You are what you eat 🍔 | 2.5 M | redfish | In this world | Eres lo último que comiste | casa → sofá → calles → local de nuggets → heladera → sobre las nubes | abuelo (ciruela) | objeto plantado (la ciruela) |
| Everyone votes who goes to space 🚀 | 2.5 M | redfish | In this world | Votación diaria al espacio | Tierra → estudio de TV → baño → cohete → planeta playa → puerta de casa | mamá | reinterpretación (era vacación) |
| Mr. Wink 😉 (Part 3) | 2.0 M | redfish | In my town | Globo-villano que guiña a una puerta | porche → puertas → ayuntamiento → sobre las nubes → rosal de mamá | mamá | el defecto es la llave (muerde) |

En 30 hits no hay dos que compartan el mismo mundo, el mismo recorrido de lugares y el mismo ser querido. El cartero aparece en 3 de los 30 top (1,000,000 Steps, Own Planet, Powers When You Need It), y siempre porque la regla lo vuelve gracioso: en Steps reparte en pogo y en Own Planet el correo se lanza de planeta a planeta.

## 4. Checklist anti-repetición (para cada guion nuevo)

Se revisa contra **todos** los guiones anteriores del estilo (`pieces/rbx-*/script.md`), no solo el último.

**Mundo y lugares**
- [ ] El mundo sale de la premisa, no del suburbio por defecto. Si la regla habla del mar, del cielo, de una torre, de un tren o de la escuela, la historia vive ahí. Solo la mitad de las refs usan "un pueblo" genérico.
- [ ] Los lugares se eligen por lo que hace la regla, y su orden no copia el de un guion anterior. Prohibido el recorrido calle → cartero → vecino → abuela → escuela → casa → ventana/techo.
- [ ] Hay al menos **un lugar que solo existe en este mundo** (la fábrica de cajas de música, el piso cero, el escenario en las nubes, el planeta del abuelo, la cueva de medias). Ahí ocurre el clímax.

**Elenco**
- [ ] El ser querido sale de la trama y cambia en cada video: mamá, papá, mejor amigo, abuelo, mascota, el bully, el crush, nadie. Nunca dos videos seguidos con el mismo tipo, y **nunca el mismo personaje con nombre** (Pip ya se usó dos veces).
- [ ] No hay vecinos fijos. Mr. Ortega, el cartero y la abuela del gag no vuelven. Los gags de adaptación usan gente que la regla vuelve graciosa: novios en la boda si la regla son los abrazos, guardias si es una torre, nadadores si es el mar.
- [ ] Los padres solo aparecen si la regla los necesita. No se mete "Dad nailed more boards / Mom bought forty pairs" por costumbre.

**Apertura**
- [ ] La fórmula de la primera frase rota entre "In this town", "In this world", "In my town", "Everyone has…", "Every X…", "Once a year / Every night at 9…", "You must / Never…", "Nobody is allowed…" y la primera persona ("I've always known…", "My dad taught me…"). No se repite la del video anterior.
- [ ] "You see," va solo cuando el mecanismo necesita explicación. No es obligatorio.
- [ ] "So nobody here…" / "So in this town…" no van siempre en la tercera frase.

**Gags de adaptación**
- [ ] Entre 0 y 5 gags, **según la premisa**: hay hits con 0 que entran directo al conflicto. Cada gag tiene que salir de la mecánica de la regla, no de un "personaje de pueblo" que se recicla.
- [ ] Ningún gag repite la plantilla de otro video ("Grandma has been doing X for sixty years", "the mailman does X", "at school there's a rule…").

**Héroe**
- [ ] Presentación distinta en cada video: rareza ("I've never…"), su estatus dentro de la regla ("I'm paper"), una costumbre, un oficio de la familia, o ninguna (empieza en acción). Prohibido "Me? I'm ten" y "I wear this hood every day".
- [ ] La rareza del héroe es la llave del final y es distinta a la de los videos anteriores (staring contest y medias desparejas ya se usaron).

**Incidente, giro y final**
- [ ] El tipo de incidente rota: se llevan a alguien, alguien en peligro, el sistema de la regla falla, llega un visitante, el héroe rompe la regla.
- [ ] El giro no siempre es "the rule says X but never says Y". Otras opciones: la regla o el villano significan otra cosa (el tipo más usado), un juego o habilidad plantados, el objeto del abuelo, el defecto del héroe, un sacrificio.
- [ ] La frase del giro no se repite: "And that's when I realized something" se usó dos veces. Alternativas de las refs: "Then I saw it", "I remembered…", "That's when I got it", "Here's the thing about…", "But you don't fight the school planet either".
- [ ] Quién resuelve rota: el héroe solo, el héroe con su ser querido, todo el pueblo, el ser querido salva al héroe.
- [ ] El final rota entre el mundo copia el truco, un ritual nuevo, un callback tierno, un chiste oscuro y una amenaza abierta. "After that, everything changed" no aparece dos veces seguidas.

**Antes de escribir:** completar la ficha de abajo y compararla, columna por columna, con las fichas de los videos anteriores (`pieces/rbx-*/ficha.md`). Si una columna coincide con el video anterior, se cambia.

### Ficha de premisa (rellenar antes del guion)

```
Título (regla en 3-7 palabras + emoji):
Regla en una frase:
Mecanismo (cómo funciona) y castigo:
Fórmula de apertura (elegir una distinta a la del último video):
Mundo / escala (pueblo, escuela, torre, mar, cielo, planeta, reino, tren, casa…):
Por qué este mundo y no otro (qué parte de la regla lo pide):
Lugares en orden (3-6), con el lugar único donde ocurre el clímax:
Gags de adaptación (0-5), cada uno derivado de la mecánica:
   1.
   2.
   3.
Gente que aparece en los gags (no repetir de videos anteriores):
Héroe: cómo se presenta (o "sin presentación") y su rareza/habilidad plantada:
Ser querido (tipo + nombre nuevo) y por qué la trama lo necesita:
Antagonista o fuerza (nombre propio solo si se lo merece):
Incidente (tipo + disparador concreto) y en qué % cae:
Intento fallido (1-2):
Tipo de giro + la frase exacta del giro (que no se haya usado):
Quién resuelve:
Tipo de final + última línea (2-7 palabras, loop o eco de la regla):
Coincidencias con el video anterior (deben ser solo la estructura):
```

## 5. Nuestros dos guiones contra la checklist

`pieces/rbx-thursday/script.md` (Thursday Sky) y `pieces/rbx-sock/script.md` (Never Lose A Sock) comparten casi frase por frase el esqueleto. Lo que se repitió:

| Bloque | Thursday Sky | Never Lose A Sock | Problema |
|---|---|---|---|
| Frase 1 | "In this town, nobody looks up on Thursday nights." | "In this town, you never lose a sock." | Misma fórmula "In this town" + negación |
| Frase 2 | "You see, something lives in the sky…" | "You see, every sock that goes missing ends up with the Sock Man…" | "You see," + monstruo que se acerca |
| Frase 3 | "So on Thursdays, the whole town…" | "So nobody here takes their socks off. Ever." | "So…" en el mismo lugar |
| Gags | ventanas tapiadas → **mailman** → pizza guy → **Mr. Ortega** → **Grandma** (60 años) → **regla de la escuela** | bebés → **mailman** → **Mr. Ortega** → **Grandma** (desde 1971) → **sock check en la escuela** | Mismo elenco de pueblo y mismo orden; mismo chiste de la abuela con años + remate seco ("She's honestly pretty good at it" / "She says she doesn't miss them") |
| Monstruo | "We call it the Watcher. Nobody knows what it looks like." | "Nobody's ever seen the Sock Man. But some nights…" | Misma línea de misterio en el mismo lugar |
| Héroe | "Me? I'm ten. **I wear this hood every day.** …never blinked first. Not once." | "**I wear this hood every day.** …never worn a matching pair. Not once." | Frase del héroe idéntica + misma plantilla "never… Not once." |
| Ser querido | "**My little sister Pip is four.** She doesn't get the rule yet." | "**My little sister Pip is four.** She has yellow socks…" | Mismo personaje, misma edad, misma línea, mismo papel (rompe la regla por inocencia) |
| Incidente | "Until one Thursday…" Pip saca una tabla | "Until one Saturday…" Pip pierde una media | Mismo arranque y misma causa: la hermana chica rompe la regla |
| Escalada | El monstruo baja cada jueves; papá clava tablas, mamá no duerme | El brazo sale del ducto; mamá compra 40 pares | Monstruo que se acerca por etapas + padres de fondo |
| Intento fallido | Tiza en el techo, frazadas: "It came lower." ×2 | 40 pares nuevos: "Didn't matter." | Misma lista corta de intentos inútiles |
| Giro | "**And that's when I realized something.** The rule says… But it never says…" | "**And that's when I realized something.** He only comes when he has a pair…" | Frase de giro idéntica y mismo tipo (lectura literal) |
| Clímax | El héroe solo, en el techo de su casa | El héroe solo, en la cueva bajo la casa | Mismo "héroe solo usa su rareza" |
| Epílogo | "**After that, everything changed.** Now… the whole town… Grandma brings cookies." | "**After that, everything changed.** Now nobody… Grandma only knits lefts. Mr. Ortega…" | Frase idéntica + ritual del pueblo + callback de la abuela y del vecino |
| Última línea | "…I see it up there, practicing." | "…don't go looking for the other one." | Bien: es distinta |
| Mundo | Suburbio genérico de noche | Suburbio genérico de noche | El mundo no sale de la premisa (el cielo y la lavandería solo aparecen al final) |
| Lugares | calle → casas → escuela → casa → ventana → techo | porche/calle → escuela → lavandería → casa → parque → living → cueva | Mismo recorrido de pueblo antes del incidente |

Pasados por la misma ficha de la API, los dos guiones coinciden en 5 de 8 columnas: "In this town", pueblo, hermana menor, el héroe resuelve solo y final de ritual. Además tienen 5 gags cada uno, con 4 personajes de pueblo compartidos, el incidente al 33-38 % y el giro al 68-72 %. Entre las refs, el promedio es 2 de 8. Solo el 3 % de los pares llega a 5, y ninguno comparte 4 personajes de pueblo.

**Qué conservar:** la regla en la frase 1, la siembra y el cobro (staring contest → mirar; medias desparejas → par que no combina), la lectura literal y la última línea seca. **Qué cambiar desde el próximo:** todo lo que está en negrita en la tabla.
