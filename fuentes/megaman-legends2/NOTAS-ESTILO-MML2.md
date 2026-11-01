---
type: note
status: active
tags: [megaman-legends-2, mml2, referencia-visual, referencia-musical, expeditions, mechayuki, ps1]
relatedTo: [mechayuki-expeditions, mechayuki-rules]
---

# Mega Man Legends 2: referencia de escenas y música para Expeditions

- **Fuente:** https://www.youtube.com/watch?v=BmmkfriGe24 (Gamer Cultur, "curiosidades", 20:36).
- **Notas del video:** `curiosidades-de-mega-man-legends-2.md`, generadas con la skill ver-youtube; la narración de curiosidades se ignora aquí.
- **Hojas de contacto:**
  - `contact_sheet_key_frames.jpg`: 26 fotogramas clave de gameplay (interiores, ruinas, ciudades, campo, nieve).
  - `_scan1-3.jpg`: un fotograma cada 10 s de todo el video.
  - `_labels2.jpg`: los rótulos "Estás escuchando".
- **Video descargado:** `_video/v.webm`, solo para estudio. No se publica ni se reutiliza ningún fotograma ni audio.

## Lo que se ve (para replicar el look, no los assets)
**Interiores** (casa de Roll, tiendas, la casa de 1:30 y 2:20):
- **Paredes en dos tramos:** abajo un zócalo verde azulado de paneles en relieve con marco más oscuro; encima un friso o moldura de madera, y arriba enlucido crema o papel con motivo pequeño.
- **Madera:** molduras de techo y rodapiés de madera oscura.
- **Suelos:** tablones cálidos o baldosa terracota con juntas oscuras.
- **Muebles:** de madera robusta, con biseles y herrajes de metal remachado; lámpara de pie cálida y cuadros con marco.
- **Puertas:** muy decoradas (marcos con remaches y paneles).
- **Luz:** interior cálido y bastante saturado; sombras suaves horneadas en las esquinas.

**Ruinas y mazmorras** (2:10, 5:30, 6:20, 9:20, 10:10, 13:40):
- **Material:** bloques de piedra gris verdosa con grabados geométricos tipo circuito o glifo, en relieve, en paredes, suelo y pilares.
- **Arquitectura:** pasillos estrechos, pilares cuadrados con capitel, agujeros redondos en la pared, cofres.
- **Luz:** fondo negro, viñeta oscura; la luz cae sobre el suelo cerca del personaje.

**Ciudades** (Calinca 7:20, Pokte/Nino 10:30 y 10:40, Saul Kada 11:30, nieve 15:20):
- **Casas:** estuco crema o blanco con esquinas y bandas de madera marrón, base de piedra.
- **Tejados:** a dos aguas de teja terracota, con chimeneas.
- **Fachadas:** ventanas hundidas con contraventanas verdes, jardineras con flores, toldos de rayas verdes, carteles colgantes ("Shop").
- **Calle:** plazas de losa, farolas de hierro, árboles en maceta, el mar azul al fondo.

**Exteriores:**
- campo de hierba verde muy saturada, colinas suaves, cielo azul con nubes blancas (y arcoíris en 11:00);
- zonas de nieve con abetos.

**Paleta y técnica:**
- texturas pintadas a mano con bordes oscuros horneados;
- verdes azulados, cremas, terracotas y piedra gris verdosa;
- poco polígono pero mucho volumen por las cajas en relieve (molduras, marcos, bandas);
- HUD: cápsula de energía vertical (amarilla y verde) y radar abajo a la izquierda.

**Aplicado en Expedition 01 (storyboard v2, `pieces/expedition-01-bedroom/engine/film.js`, "MML2 look kit"):**
- **Kit de texturas `MT`:** stone, carved, wainscot, plaster, paper, wood, darkWood, flag, roof, stucco, awning, earth, rug.
- **Elementos de escenario:**
  - `reliefWall`: zócalo de paneles, rodapié, moldura y cornisa;
  - `stoneCourses`: hiladas de bloques tallados con profundidad variable;
  - `ruinPillar`, `rubble`, `bookshelf`;
  - la mazmorra del dormitorio con muro de ruina, pilares, vigas y techo de tierra con hueco de luz;
  - `tudorRoom` reconstruido con relieve y vigas;
  - la ciudad `mmlTown`: casas con tejado, chimenea, contraventanas, jardineras, toldo, carteles INN/BAKERY, farolas, árboles en maceta, fuente y mar.
- **Iluminación:** Lambert con luz real (clave cálida, relleno frío, rayo del techo) y niebla negra en la mazmorra.

## Música que suena en el video (estilo de referencia, NO se usa)
Medido con earshot sobre 14 s de cada tema. Los valores son orientativos: la narración en español va encima.

| Tema (rótulo del video) | Momento | Tempo / tono (aprox.) | Cómo suena | Uso como referencia de estilo |
|---|---|---|---|---|
| Nino – Under Siege | ~3:25 | ~178 BPM, La mayor | Orquestal enérgico: percusión orquestal, pizzicato de cuerdas, metales; heroico y luminoso | Escena de acción o "ciudad bajo ataque" |
| Saul Kada – Racing | ~4:47 | ~108 BPM, Mi menor | Jazz-funk juguetón: guitarra rítmica, piano, batería con escobillas o redoble; alegre | Minijuego, momento cómico |
| Nino Klaymoor Battle | ~6:17 | ~132 BPM, Mi menor | Batalla de jefe: cuerdas en ostinato, metales, percusión orquestal; heroico y "cool" | El JEFE (mystery object) |
| Noite Ii Yo (canción de cierre) | ~7:57 | ~89 BPM, La mayor | Balada vocal soñadora, romántica y melancólica, con cuerdas | Cierre emotivo, despedida |
| Staff Roll Credits | ~8:05 | — | Créditos orquestales | Outro |
| Calinca – Mine | ~9:27 | ~132 BPM, Do menor | Exploración de ruina o mina: percusivo, jazzístico-orquestal, con pulso constante | La MAZMORRA (presente) |
| Ruins Full of Water | ~11:00 | — | Tema de ruina, ambiente acuático | Mazmorra tranquila |
| Mondo Island | ~14:37 | — (mezcla con voz) | Jazz suave, relajado y "cool", con aire de isla | CIUDADES del pasado / pueblo |
| Glyde's Base – Outside | ~18:57 | denso, ~7 golpes/s | Percusivo y agresivo, casi techno | Base enemiga (no se usa) |

**Música ORIGINAL para Expedition 01** (se compone en producción; el plan va en `pieces/expedition-01-bedroom/storyboard.md`):
- **Mazmorra (presente):**
  - ~128 BPM en menor (Do o Mi menor), al estilo "Calinca Mine";
  - ostinato de marimba y pizzicato con contrabajo caminante;
  - percusión de mano y caja suave, clarinete grave, pad oscuro.
- **Pasado / ciudades:**
  - ~104 BPM en mayor, al estilo "Mondo Island" (jazz suave de pueblo);
  - guitarra acústica rítmica, contrabajo, escobillas, clarinete o flauta y marimba.
- **Manual del cuerpo humano:**
  - ~90 BPM, de laboratorio curioso;
  - caja de música y celesta, pizzicato, bajo suave.
- **Jefe (objeto misterioso):**
  - ~132 BPM en Mi menor, al estilo "Klaymoor Battle";
  - cuerdas en ostinato, golpes de metal, timbales.
- **Cierre:** ~88 BPM, balada cálida (al estilo "Noite Ii Yo", sin voz cantada).

**Reglas de la música:**
- Todo compuesto en código con one-shots CC0 (VSCO-2, como `music4`/`music5`): instrumentos reales, no chiptune.
- Nunca se usan los temas de Capcom: en YouTube largo darían reclamaciones de Content ID.
