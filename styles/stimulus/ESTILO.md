## Formato y encuadre

**Constante**
- Vertical 9:16, 1080×1920. Los cambios caen en múltiplos de ~0.33 s, así que se asume 30 fps y se alinean los keyframes a frames de 1/30 s.
- Duración total 14–24.5 s: contenido hablado de 11.4 a 22 s, más un outro negro de 2.4–2.6 s.
- Una sola presentadora, centrada (x≈50 %), mirando a cámara y hablando inglés.
- Cabeza entre y≈20 % y 45 % (≈380–860 px).
- Cámara fija, sin trípode visible. Todo movimiento es zoom digital (escala del clip de video).
- Fondo de oficina real y luminoso: ladrillo, cristal, vigas o pared negra con neón de Stimulus. Hay movimiento ambiental (balón, gente).
- Plano medio a medio-largo, de cintura o rodillas hacia arriba. En el vídeo 59 es de cuerpo entero.
- Vestuario negro; en el vídeo 32 el fondo lleva camisetas.

**Varía**
- El plano base: del pecho hacia arriba hasta cuerpo entero.
- El fondo concreto.
- La duración total.

**Estructura de capas (de abajo arriba)**
1. Video de la presentadora, con keyframes de escala.
2. B-roll a pantalla completa o tarjetas flotantes.
3. Títulos grandes.
4. Subtítulos.
5. Iconos.
6. Flashes y transiciones.
7. Capa de outro negro.

## Subtítulos (spec exacta)

**Constantes**
- Fuente: DIN Next LT Arabic Bold.
- Tamaño: 60–64 px (altura de x ≈ 30 px).
  - El vídeo 59 usa un tamaño menor, 44–48 px; se acepta como variante.
- Bloques de 2–4 palabras en 1 línea, en sentence case tal como se habla, con puntuación visible. Sin mayúsculas forzadas.
- Ancho máximo 70–80 % del cuadro (x 8–88 %).
- Color base: blanco #FFFFFF.
- Sombra: `0 4px 10px rgba(0,0,0,.6)` (blur 8–10 px, 60 % negro). Sin contorno duro y sin caja.
- Alineación centrada, x=50 %.
- Posición vertical:
  - Sobre la presentadora o el b-roll de fotos: centro de línea en y≈50–55 % (≈960–1050 px).
  - Con un título grande activo: y≈50 %.
  - Sobre páginas de catálogo (fondo blanco): y≈76–83 % (≈1460–1590 px), texto negro #111 y sin sombra.
- Entrada:
  - Fade-in de 0.1–0.15 s.
  - Pop de escala 90→100 %. Opcionalmente, 6–8 px de blur al entrar, o arranque al 50 % de opacidad que sube a 100 % en 0.3 s.
- Cambio de bloque: corte seco, sin animación de salida. Si se quiere, crossfade de ≤0.15 s.
- Sincronía: el bloque entra en su primera palabra (±0.1 s) y dura hasta la siguiente frase.
- Escala: el texto escala junto con el punch-in de cámara.

**Resalte**
- Palabra o frase clave en cursiva bold y amarillo-lima **#E6F25A**. Es el color por defecto; rango visto: #E6F0A0 a #E8F26A. Ejemplos: "design", "unique,", "and find inspiration".
- Variantes puntuales:
  - Verde lima #6CD62B ("apply.").
  - Rojo #E8202A ("mock up.").
  - Amarillo #F4E04D ("100").
  - Crema #F3F0C8.
- Segunda línea de un bloque: a veces cursiva bold ~58 px.
- En el vídeo 32 y el 40, la línea de cierre o la segunda línea llevan una pastilla oscura difuminada (negro 60–70 %, bordes feathered, sin borde duro).

**Acumulación (CTA final y listas)**
- Hasta 4 líneas apiladas, interlineado ≈100–110 px, que no se borran.
- Rango y≈47–70 %. Texto típico: "Free Jersey design / and find inspiration / for your team's / next jersey!".
- Cada línea entra en su palabra y las anteriores se quedan.
- En el vídeo 32 la lista va alineada a la izquierda (x≈13 %), con una barra vertical fina amarillo-verdosa en x≈9 % que crece con cada línea. Color de línea crema #FFF0A0.

**Iconos inline**
- Sin emojis, salvo 🏀 o 👕 inline puntuales (~70 px).
- Iconos junto a la palabra clave:
  - Reloj rojo.
  - Camiseta naranja o azul.
  - PDF rojo.

## Títulos / textos grandes

**Regla constante.** Hay un gancho gigante en la zona superior (y 8–40 %), que entra entre 0 y 1.7 s y sale hacia 2.6–4.7 s.
- Palabra o cifra clave enorme en crema-amarillo (#F4F2A0 / #F5F08A; degradado #FFFBD0→#E6E8A0).
- **Aberración cromática** de 4–6 px: borde rojo/naranja a la izquierda, azul/cian a la derecha.
- Glow blanco-amarillo suave.
- Líneas secundarias en blanco, mucho más pequeñas.
- Entrada con pop de escala (80–130 %→100 %) + blur 0.2–0.3 s, o fade + blur.
- Salida con fade de 0.3 s, cruzada con el siguiente elemento.

**Variantes del gancho** (elige una por video)
- **Tres niveles** (vídeos 32 y 40):
  - Línea pequeña blanca, 50–85 px, y≈16 %.
  - Palabra enorme, 120–200 px, y≈23 %, ancho ≈80–85 % (≈860–920 px).
  - Línea final cursiva, 45–60 px, y≈28–31 %, alineada a la derecha (borde x≈85 %).
  - Segundo título a los 3.3 s, con el mismo formato.
  - Las líneas entran una a una (0.33 s, luego 1.67 s y 2.0 s en el vídeo 40).
- **Cifra gigante** (vídeos 54, 56, 58, 59):
  - Alto 190–330 px, centrada, y≈12–32 %.
  - Contador rápido que rueda hasta 100: 39→96→100, 33→93→100 o 7→47→98→100, con glitch RGB y blur en cada número.
  - Línea horizontal luminosa fina (degradado verde/blanco) debajo, y≈38 %.
  - Subtítulo blanco ~48–65 px debajo ("Soccer Jerseys", "Jersey Options").
- **Serif/itálica pesada** (vídeos 55 y 56):
  - "NEW JERSEYS", serif Didone en mayúsculas, 230–260 px por línea, ≈90 % de ancho, y 8–40 %, detrás de la presentadora, con glow y RGB split naranja/azul.
  - "SOCCER COACHES", cursiva pesada de ~150 px, líneas en y≈19 % y 31 %.

**«1 Free [PDF]»** (10.3–12.3 s, o 8–10.6 s)
- Serif cursiva blanca de 80–110 px con RGB split rojo/azul, centrada en y≈50 %.
- Icono PDF a la derecha: documento rojo-coral (#E8203A), esquina doblada y esquinas redondeadas, 75–110 px, glow rojo.
- Se mantiene mientras cambian los subtítulos.

**Icono PDF final**
- Entre ~16 y 20–22 s, en x≈78–80 %, y≈43–50 %, ~45–110 px, ligeramente girado.
- Entra con pop y rebote, cayendo desde 3 % más arriba.

**Textos CTA grandes** (vídeo 59)
- "Download it for Free" en blanco, "and start designing" en cursiva #F0F5A0 con blur de entrada, y "your next jersey." en blanco.
- Líneas en y≈47 %, 51 % y 56 %.

## Cortes, zooms y ritmo (reglas de cuándo)

**Escala base**
- 100 %. Entrada de punch-in: 108–120 %.
- Los saltos de escala son de golpe (0 frames de rampa). Se disparan en frase nueva, idea nueva o palabra clave ("steal", "100", "1 Free", "Download"). Nunca por cada palabra.
- Cada salto alterna entre 100 % y 108–120 %. A veces se cierra el plano al 125 % sobre un producto (la camiseta).

**Apertura**
- 0.00–0.33 s: arranque con zoom-blur o whip, 110–115 % con desenfoque, que se asienta a 100 % en 0.33 s.

**Tomas largas**
- Nunca estáticas: push-in lento de 100→106–115 % en 3–5 s (lineal o ease), o drift de 100→110 %.
- Al final del contenido, ese drift sube hasta ~110–115 %.

**Ritmo**
- Cambia algo en pantalla (zoom, texto, icono, b-roll) cada 1–3 s.
- Tomas de presentadora de 2–5 s.
- Inserts de foto de 0.7–2 s.
- Páginas de catálogo de 0.5–1.3 s (típico 0.67 s), cortes secos sincronizados con las palabras.

**Cambios de plano**
- Entre 6 y 17 por video: 6–8 en los más calmados (32, 40, 56, 58, 59) y hasta 17 en el 55.
- Jump cuts de reencuadre (100 %↔115–120 %) en frases nuevas; tras un inserto, el plano de vuelta suele ir más cerrado (108–120 %).

**Fin del contenido**
- Corte al outro 0–0.2 s después de la última palabra (ver Outro).

## B-roll y gráficos

**Constantes**
- B-roll solo en vídeos de producto y catálogo. Siempre es material de marca o fotos de jugadores/equipos. No hay stock genérico, salvo uno de futbolista en el 56.
- Fotos de jugadores o equipos a pantalla completa, 0.7–2 s cada una. Entran desenfocadas y se enfocan en ~0.3 s, con zoom lento de 100→105–106 %.
- Páginas del PDF o catálogo ("CLEAN / CLASSIC / CREATIVE COLLECTION") sobre fondo blanco, a pantalla completa.
  - Imagen en 0–85 % de la altura.
  - Cambio de página cada 0.67–1.3 s, con cortes secos y sin zoom.
  - Subtítulos negros en la franja inferior (y≈76–83 %).
  - Los rótulos de colección vienen en el asset; no se rehacen.
- Tarjetas flotantes tipo póster sobre la presentadora (vídeos 55 y 58):
  - Fondo blanco, esquinas redondeadas (~24 px), sombra suave.
  - Ancho ≈28–34 %.
  - 3 tarjetas escalonadas cada 0.7–1 s: izquierda, arriba-centro, derecha. En el 55 se pueden ampliar a una rejilla de 7.
  - Entran con pop o slide-up y deriva ligera.
  - Se quedan hasta que acaba el b-roll.

**Iconos**
- De línea blanca, 70–110 px, con pop de escala 0→110→100 % y fade de 0.15 s.
- Se quedan acumulados bajo la lista, y≈57–82 %.
- Aparecen en la palabra que ilustran (ojo "see it", mano "feel it", entrenador "know it's right").
- Iconos de color: reloj rojo, camiseta naranja o azul con glow.
- Check de lista (vídeo 59): círculo verde #22C55E de 36 px con check blanco, x≈17 %. Texto en MAYÚSCULAS cursivas de ~40 px con RGB split sutil, líneas en y≈49 %, 57 % y 67 %, que entran en 6.0, 7.0 y 7.67 s con slide-up + fade, más un subrayado neón verde-blanco a ~8.3 s.

## Transiciones y efectos

- **Zoom-blur radial o whip** (~0.33 s) al inicio del video y en cada entrada de foto de b-roll.
- **Flash cálido** al pasar a b-roll o volver a cámara: amarillo #FFFF70 al 80–90 % que baja en 0.3 s. Variantes de light leak rosa/amarillo/verde. Se usa en 1–3 puntos por vídeo.
- **Glitch RGB / desplazamiento horizontal** al entrar al catálogo y en números grandes.
- **Aberración cromática** (4–6 px) y glow en todo título grande.
- **Crossfade** de 0.2–0.3 s al retirar un título grande.
- **Flash blanco o lavado arcoíris** al salir del catálogo (≈0.3 s).
- **Salida al outro** (varía):
  - Barrido lateral: el video se desliza ~80–100 % a la izquierda, con blur horizontal ~0.3 s. El logo entra desde la derecha enfocándose.
  - Glitch/scanline y corte a negro.
  - Corte seco.
  - Escoge una; el barrido lateral es la más repetida (vídeos 32, 54, 58).
- **Neón** del logo del fondo con bloom suave, sin añadir nada.
- Sin viñeta, sin grano.

## Color

- Grading natural, cálido, con contraste medio-alto (negros densos en los fondos negros).
- Blancos limpios, colores de camiseta saturados, piel cálida.
- Sin viñeta ni grano.

**Paleta de marca**

| Uso | Hex |
|---|---|
| Texto base | #FFFFFF |
| Resalte lima | #E6F25A |
| Cifras gigantes | #F4F2A0 / #F5F08A |
| Crema (listas y degradados) | #FFF0A0 / #F6F3D2 |
| PDF rojo | #E8203A |
| Check verde | #22C55E |
| Flash amarillo | #FFFF70 |
| Texto sobre fondo blanco | #111111 |
| Outro | #000000 |

- Rojo #E8202A para énfasis negativo y verde #6CD62B para "apply": solo puntuales.

## Sonido

*No verificable en los cuadros; lo siguiente es lo recomendado para replicar el estilo.*

- Voz limpia, normalizada y dominante.
- Cama musical ligera, corporativa o upbeat, a -20/-25 dB bajo la voz (10–15 % de volumen relativo). Corte limpio al outro.
- SFX:
  - Whoosh en el whip inicial, en cada entrada de b-roll, en cada flash y en el barrido al outro.
  - Hit/impact en la entrada del título gigante.
  - Ticks o riser sobre el contador 0→100.
  - Pop o click en cada icono y cada línea de lista.
  - Pop/rebote en el icono PDF.
  - Whoosh corto en cada cambio de página de catálogo.
  - Sting o acorde corto al aparecer el logo del outro.

## Outro con logo (spec paso a paso con tiempos)

*T0 = inicio del outro. Es 0–0.2 s tras el final del contenido. Duración 2.4–2.6 s. Elementos: ring, wordmark, tagline, URL.*

**Fondo y logo**
- Fondo negro puro #000000. Solo blanco sobre negro.
- Logo horizontal centrado en y≈49–50 % (≈945–960 px).
- Ancho total del logo: x≈13–85 % (≈780 px).
- **Símbolo:** aro blanco grueso (trazo ≈18–20 px), diámetro 150–170 px, centrado en x≈25 %.
  - Dentro, "S" geométrica hecha de dos o tres bloques en paralelogramo diagonal, en blanco, con cortes negros limpios (estilo del neón).
- **Wordmark:** "STIMULUS" en mayúsculas, sans geométrica tipo DIN Bold con tracking amplio (~0.15 em).
  - Altura de mayúscula ≈65–75 px, ancho ≈510 px (x≈38–85 %).

**Tagline**
- "START YOUR FREE DESIGN TODAY." en mayúsculas bold blancas con tracking.
- Alineada a la izquierda con el borde izquierdo del wordmark (x≈38 %), y≈54–55 % (≈1040 px).
- Se ajusta el tamaño (≈26–30 px) para que su ancho iguale al de "STIMULUS" (≈510 px).
- Animación por palabras, con ligero slide vertical y fade, a pasos de 0.25–0.33 s:
  - T0+0.15: START.
  - T0+0.45: YOUR (o "START YOUR" + FREE).
  - T0+0.75: FREE (o DESIGN + TODAY.).
  - T0+1.0: DESIGN.
  - T0+1.2: TODAY. → completa.

**URL**
- "WWW.STIMULUSATHLETIC.COM" en blanco bold, ≈30–34 px, centrada en x=50 %.
- Entra en T0+0.15 desde y≈97 % (≈1860 px) y sube con ease-out a y≈90 % (≈1730 px) hacia T0+1.0.
- Se queda fija.

**Estado final**
- Desde T0+1.2 hasta el final, todo está estático durante ≈1.3 s.

**Entrada del logo (varía)**
- Con barrido lateral: el logo entra desde la derecha con blur horizontal y se enfoca en 0.3 s.
- Si se sale por corte o glitch, el logo ya está presente en T0 con un pop/fade de 0.15 s.

## Firma del estilo (checklist para revisar un render)

1. ¿Vertical 1080×1920, presentadora centrada con cabeza en y 20–45 %, fondo de oficina real?
2. ¿Arranque con zoom-blur o whip (110–115 %→100 % en 0.33 s)?
3. ¿Gancho gigante crema-amarillo (cifra, palabra serif o título en 3 niveles) con RGB split de 4–6 px y glow, y fuera antes de 5 s?
4. ¿Saltos de escala secos 100 %↔108–120 % en cada idea nueva, y push-ins lentos de 100→106–115 % en las tomas largas?
5. ¿Subtítulos DIN Bold blancos de 2–4 palabras, sentence case, sombra suave, centrados en y≈50–55 %, con palabras clave en cursiva amarillo-lima #E6F25A?
6. ¿Líneas acumuladas (hasta 4) al cierre y texto negro sobre blanco en las páginas de catálogo?
7. ¿Contador 0→100 con glitch, "1 Free" en serif cursiva con icono PDF rojo y/o iconos de línea con pop?
8. ¿Cambio de algo en pantalla cada 1–3 s? ¿Fotos o catálogo a pantalla completa con blur-in y cortes de 0.67 s?
9. ¿Flashes cálidos y glitch RGB en las transiciones, sin viñeta ni grano, con grading cálido de contraste medio-alto?
10. ¿Outro negro de 2.4–2.6 s con logo (aro + S + STIMULUS), tagline que se construye por palabras, URL subiendo de y 97 % a 90 % y 1.3 s final estático?
## Regla de cortes (cliente, 2026-11-11) — zoom EN el corte
- El cambio de zoom cae EXACTAMENTE en el frame del corte: el salto de encuadre disimula el corte. Un zoom a pocos frames de un corte se siente como dos saltos (y deja un clip suelto de 1–3 frames).
- Nunca un tramo de menos de 8 frames entre dos cortes, ni entre un zoom y un corte, ni entre un borde de b-roll y un corte. Si hay b-roll cerca, su borde se pega al corte (el burn lo tapa).
- Los tiempos `at` de words_edit NO son los cortes reales: el trim de video redondea cada segmento a frames y se atrasa hasta ~6 frames; además las tomas crudas traen jump cuts propios. Usar siempre los cortes del picture.
- Automatizado en `hfkit.py`: `picture_cuts(edit_v.mp4, segments, cache)` (cortes frame-exactos), `camera(..., bounds=[0]+CUTS+[D], snap_cuts=CUTS+bordes_b-roll)` (todo movimiento a ≤0.4 s de un corte arranca en el corte), `broll(..., cuts=CUTS)` (bordes pegados al corte si está a ≤0.4 s y cuantizados al frame), `cut_report()` avisa tramos <8 frames. Los burns viejos que caen a <0.6 s de un borde de b-roll se omiten (sin doble burn). Plantilla: `pieces/stimulus-02-hf/prep/gen.py`.
- Verificar con fotogramas consecutivos a 24 fps en cada corte y cada borde de b-roll.
