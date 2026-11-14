# QA clips — reten-sierra (2026-11-04)

Método: hoja de contactos a 2 fps por clip (scratchpad `qa/`) + faster-whisper small (es, word timestamps); dudosos re-escuchados con medium.
Hallazgo general: **Garza no se parece a GARZAVERDE en casi ningún plano suyo**. Sale como 5-6 hombres distintos (chamarra cobre/negra, polo verde, camisa negra, calvo con barba, uniforme negro de policía). Solo c07, c27 y c32 lo dan en camuflaje con bigote (sin herradura, sin la cara gruesa de la hoja, y ninguno igual a otro).

## Veredicto por clip

- **c01** OK.
- **c02** OK.
- **c03** OK (whisper small oye "Te odoro"; medium oye "Teodoro" bien).
- **c04** Garza en camuflaje pero SIN bigote ni lentes, y su cara se ve de 4.5 s en adelante. **Recortar: usar 0.0–4.0 s** (plano abierto, caras chicas). Sin diálogo (el "¡Suscríbete!" de whisper es alucinación en el ambiente).
- **c05** Garza INCORRECTO todo el clip: joven de chamarra cobre/negra, sin bigote ni camuflaje. → REGENERAR.
- **c06** Hombro azul marino con parche de POLICÍA en primer plano de 0.0 a ~4.5 s, encima de todo el diálogo (0.0–6.7). No se puede recortar. → REGENERAR.
- **c07** OK. Garza en camuflaje con bigote y aviadores, diente de oro; cara más delgada que la hoja, sin gorra (aceptable).
- **c08** OK.
- **c09** Garza INCORRECTO: joven de polo verde, sin bigote, sentado al volante de la troca roja. → REGENERAR.
- **c10** OK.
- **c11** Garza INCORRECTO: camisa negra + chaleco, sin bigote, sin lentes, sin camuflaje (pinta de policía). → REGENERAR.
- **r1** OK.
- **c12** OK. Dice "págale" (tú) en vez de "páguele"; aceptable en habla mexicana. Del lado derecho (0–3 s) asoma el hombro de Candelaria con ropa clara estampada, no la chamarra café (borroso, menor).
- **c13** OK.
- **r2** OK.
- **c14** Garza INCORRECTO: hombre de camisa oscura DENTRO de la troca, sin bigote. → REGENERAR.
- **c15** OK.
- **c16** Garza INCORRECTO: calvo con barba y camisa negra, dentro de la troca. → REGENERAR.
- **c17** OK. El radio aparece en su mano a ~1.5 s, desde abajo del cuadro (no se ve al nieto pasárselo; aceptable).
- **c18** OK.
- **c19** OK, sin diálogo (solo un grito/ambiente a ~3 s). Los jinetes bajan por un camino de tierra; no se ve el retén.
- **c20** Garza INCORRECTO: soldado joven bien rasurado, sin bigote. Lleva camuflaje, pero la cara no es la de la hoja. → REGENERAR.
- **c21** OK (Soldado flaco con camuflaje y radio).
- **c22** OK. Solo la primera línea, a propósito.
- **c23** Garza INCORRECTO: el mismo hombre de chamarra cobre/negra de c05. → REGENERAR.
- **c24** OK. Detalle menor: la cabeza rapada en primer plano (0–2 s) lleva ropa oscura, no camuflaje; está borrosa y sale de cuadro a ~2 s.
- **c25** **Garza con UNIFORME NEGRO/AZUL DE POLICÍA** (insignias, condecoraciones), sin bigote. → REGENERAR.
- **c26** Candelaria OK. Al fondo, todo el clip, camionetas azul marino rotuladas "POLICÍA" (texto en el plano, y no casa con el retén militar). Ver lista opcional.
- **c27** Garza aceptable: camuflaje, bigote grueso y diente de oro (sin lentes ni gorra). Texto: una pila "ALKALINA" sobre una caja en primer plano de 0.0 a ~4.5 s, encima del diálogo (1.4–5.4). Raro pero no grave.
- **c28** Candelaria SIN la chamarra café (solo la camisa verde); rompe la continuidad con c24/c26/c29 de la misma escena. Audio OK. Ver lista opcional.
- **r4** Garza INCORRECTO: joven de chamarra negra con una pila AA en la mano. → REGENERAR.
- **c29** OK de imagen y audio. **Subtítulo quemado "-comandante."** de ~2.0 a ~4.5 s, encima de la línea 1 (1.8–4.0). No se puede recortar: tapar o difuminar en el montaje.
- **c30** Garza INCORRECTO: chamarra de piel cobre/negra, peinado engominado, sin bigote. → REGENERAR. (Whisper small oye un "¿Sí?" suelto a 7.2 s; medium no lo oye. Si se reusa, cortar en 5.5 s.)
- **c31** Imagen OK, pero el **AUDIO ES INVENTADO/GALIMATÍAS** de 1.3 a 9.3 s ("...de la atrestación de la asión y rociéndose también la pesida"); no dice ninguna de sus 3 líneas. Sale igual con small y con medium. → REGENERAR.
- **c32** Garza en camuflaje con bigote, chaleco y radio. **Labios cerrados mientras habla el radio** (1.6–3.5 s, revisado a 5 fps) y luego sonríe: correcto. De 0.0 a ~1.0 s hay otro encuadre: una figura entra y en primer plano aparece una batería de auto rotulada "GARZA". **Recortar: usar 1.0–8.0 s.**
- **c33** Candelaria OK y audio OK. Al fondo, todo el clip, patrullas azules rotuladas "POLICÍA ESTATAL" (texto, y no cuadra con el retén militar). Ver lista opcional.

## Recortes que arreglan el fallo
- c04 → 0.0–4.0 s
- c32 → 1.0–8.0 s
- c30 (solo si no se regenera) → 0.0–5.5 s

## REGENERAR
**c05, c06, c09, c11, c14, c16, c20, c23, c25, c30, r4, c31**
- c05, c09, c11, c14, c16, c20, c23, c30, r4: Garza no es GARZAVERDE (otra cara y otra ropa).
- c06: hombro de policía en primer plano encima del diálogo.
- c25: Garza con uniforme de policía.
- c31: audio galimatías, sin ninguna línea del guion.

Opcional, baja prioridad: c28 (Candelaria sin chamarra, rompe la continuidad), c26 y c33 (patrullas "POLICÍA" al fondo).

## Transcripciones (faster-whisper small; palabra@inicio-fin en segundos)

### c01
- [0.96–3.08] Abuela, ahí está el retén de Garza.
  - Abuela,@0.96-1.54 ahí@1.96-2.08 está@2.08-2.24 el@2.24-2.32 retén@2.32-2.62 de@2.62-2.68 Garza.@2.68-3.08
- [4.30–6.98] Dicen que ahí cobran por pasar.
  - Dicen@4.30-4.88 que@4.88-5.00 ahí@5.00-5.10 cobran@5.10-5.44 por@5.44-5.56 pasar.@5.56-6.98

### c02
- [1.54–7.22] despacio Emiliano despacio avísale a teodoro que se detengan atrás de la loma
  - despacio@1.54-2.18 Emiliano@2.18-2.70 despacio@2.70-3.76 avísale@3.76-4.96 a@4.96-5.10 teodoro@5.10-5.46 que@5.46-5.66 se@5.66-5.80 detengan@5.80-6.34 atrás@6.34-6.64 de@6.64-6.78 la@6.78-6.90 loma@6.90-7.22

### c03
- [1.22–6.04] Te odoro, párense atrás de la loma, que nadie se asome.
  - Te@1.22-1.78 odoro,@1.78-2.04 párense@2.50-2.90 atrás@2.90-3.12 de@3.12-3.24 la@3.24-3.34 loma,@3.34-3.64 que@3.90-5.32 nadie@5.32-5.54 se@5.54-5.72 asome.@5.72-6.04

### c04
(sin diálogo; whisper alucina «¡Suscríbete!» en el silencio/ambiente)

### c05
- [1.02–5.14] Buenas tardes señora, ¿para dónde lleva tanto ganado?
  - Buenas@1.02-1.66 tardes@1.66-1.98 señora,@1.98-2.24 ¿para@3.46-3.78 dónde@3.78-3.98 lleva@3.98-4.30 tanto@4.30-4.58 ganado?@4.58-5.14

### c06
- [0.00–6.66] a la feria de Parral comandante, 80 cabezas con sus papeles en regla.
  - a@0.00-0.58 la@0.58-0.68 feria@0.68-0.96 de@0.96-1.10 Parral@1.10-1.48 comandante,@1.48-2.16 80@3.34-3.96 cabezas@3.96-5.14 con@5.14-5.44 sus@5.44-5.62 papeles@5.62-6.06 en@6.06-6.28 regla.@6.28-6.66

### c07
- [1.48–6.40] los papeles no me interesan bonito reloj
  - los@1.48-2.80 papeles@2.80-3.28 no@3.28-3.48 me@3.48-3.60 interesan@3.60-4.26 bonito@4.26-5.50 reloj@5.50-6.40

### c08
- [1.26–2.88] Era de mi esposo.
  - Era@1.26-2.12 de@2.12-2.30 mi@2.30-2.42 esposo.@2.42-2.88
- [4.58–6.76] ¿Hay algún problema comandante?
  - ¿Hay@4.58-5.44 algún@5.44-5.68 problema@5.68-6.08 comandante?@6.08-6.76

### c09
- [0.00–3.76] El problema es que este camino tiene dueño.
  - El@0.00-0.88 problema@0.88-1.34 es@1.34-2.28 que@2.28-2.40 este@2.40-2.60 camino@2.60-2.94 tiene@2.94-3.24 dueño.@3.24-3.76
- [5.32–8.62] Son 500 mil y aquí no pasó nada.
  - Son@5.32-5.60 500@5.60-5.88 mil@5.88-6.36 y@6.36-7.70 aquí@7.70-7.92 no@7.92-8.06 pasó@8.06-8.30 nada.@8.30-8.62

### c10
- [1.28–5.32] ¿500 mil por pasar por un camino de todos?
  - ¿500@1.28-1.96 mil@1.96-2.46 por@2.46-3.78 pasar@3.78-4.12 por@4.12-4.38 un@4.38-4.50 camino@4.50-4.84 de@4.84-5.02 todos?@5.02-5.32

### c11
- [0.78–2.28] Cuidado cómo me habla, señora.
  - Cuidado@0.78-1.30 cómo@1.30-1.56 me@1.56-1.74 habla,@1.74-1.94 señora.@2.02-2.28
- [5.38–8.74] Aquí yo decido quién pasa y quién se queda.
  - Aquí@5.38-5.84 yo@5.84-6.04 decido@6.04-6.42 quién@6.42-6.60 pasa@6.60-7.02 y@7.02-8.06 quién@8.06-8.26 se@8.26-8.46 queda.@8.46-8.74

### c12
- [0.00–4.94] Abuela, mejor págale. Esos hombres no perdonan.
  - Abuela,@0.00-1.74 mejor@1.88-2.06 págale.@2.06-2.50 Esos@3.32-3.92 hombres@3.92-4.18 no@4.18-4.38 perdonan.@4.38-4.94

### c13
- [0.00–8.86] Eso mismo pensó tu abuelo en este mismo retén hace 20 años, pagó lo que le pidieron y aún así no volvió a casa.
  - Eso@0.00-1.02 mismo@1.02-1.26 pensó@1.26-1.76 tu@1.76-1.84 abuelo@1.84-2.60 en@2.60-2.86 este@2.86-3.08 mismo@3.08-3.38 retén@3.38-3.94 hace@3.94-4.46 20@4.46-4.80 años,@4.80-5.22 pagó@5.76-6.26 lo@6.26-6.36 que@6.36-6.48 le@6.48-6.60 pidieron@6.60-7.10 y@7.10-7.58 aún@7.58-7.74 así@7.74-8.04 no@8.04-8.18 volvió@8.18-8.54 a@8.54-8.60 casa.@8.60-8.86

### c14
- [0.00–7.46] ¿Qué tanto platican? Si no hay dinero no hay paso y con una llamada tengo aquí 20 patrullas.
  - ¿Qué@0.00-1.18 tanto@1.18-1.46 platican?@1.46-2.04 Si@2.48-2.66 no@2.66-2.80 hay@2.80-2.90 dinero@2.90-3.22 no@3.22-3.44 hay@3.44-3.56 paso@3.56-3.88 y@3.88-4.76 con@4.76-5.32 una@5.32-5.50 llamada@5.50-5.92 tengo@5.92-6.18 aquí@6.18-6.42 20@6.42-6.74 patrullas.@6.74-7.46

### c15
- [1.02–3.28] ¿Usted cree que vine sola, comandante?
  - ¿Usted@1.02-1.52 cree@1.52-1.80 que@1.80-1.94 vine@1.94-2.16 sola,@2.16-2.50 comandante?@2.78-3.28
- [4.66–6.00] A mí no me va a asustar.
  - A@4.66-4.84 mí@4.84-4.98 no@4.98-5.12 me@5.12-5.26 va@5.26-5.40 a@5.40-5.52 asustar.@5.52-6.00

### c16
- [0.00–2.78] Entonces arreglemos esto rápido, señora.
  - Entonces@0.00-1.04 arreglemos@1.04-1.68 esto@1.68-1.94 rápido,@1.94-2.38 señora.@2.54-2.78
- [4.84–6.84] Aquí las reglas las pongo yo.
  - Aquí@4.84-5.50 las@5.50-5.66 reglas@5.66-6.06 las@6.06-6.22 pongo@6.22-6.58 yo.@6.58-6.84

### c17
- [1.78–8.22] En su retensi, pero no a sus órdenes. Te odoro. Ya, que se acerquen todos.
  - En@1.78-2.34 su@2.34-2.48 retensi,@2.48-3.14 pero@3.26-3.46 no@3.46-3.64 a@3.64-3.76 sus@3.76-3.86 órdenes.@3.86-5.20 Te@5.20-5.62 odoro.@5.62-5.92 Ya,@6.70-6.96 que@7.34-7.42 se@7.42-7.54 acerquen@7.54-7.94 todos.@7.94-8.22

### c18
- [1.68–6.48] Ahí vamos, patrona. Arriba, muchachos, vámonos.
  - Ahí@1.68-2.56 vamos,@2.56-2.80 patrona.@2.92-3.58 Arriba,@4.42-5.30 muchachos,@5.34-5.90 vámonos.@6.04-6.48

### c19
(sin diálogo; whisper alucina «¡Ahhh!» en el silencio/ambiente)

### c20
- [2.76–6.14] ¿Qué hizo, señora? ¿A quién le habló?
  - ¿Qué@2.76-3.20 hizo,@3.20-3.44 señora?@3.48-3.68 ¿A@5.50-5.64 quién@5.64-5.76 le@5.76-5.88 habló?@5.88-6.14

### c21
- [0.00–4.82] comandante nos están rodeando son más de 40
  - comandante@0.00-1.04 nos@1.04-1.50 están@1.50-1.76 rodeando@1.76-2.20 son@2.20-4.16 más@4.16-4.36 de@4.36-4.50 40@4.50-4.82

### c22
- [1.60–3.66] ¿Qué pasó, comandante?
  - ¿Qué@1.60-2.72 pasó,@2.72-3.00 comandante?@3.10-3.66

### c23
- [0.58–2.16] Dígales que se calmen, señora.
  - Dígales@0.58-1.14 que@1.14-1.34 se@1.34-1.46 calmen,@1.46-1.84 señora.@1.88-2.16
- [3.96–4.88] Nadie quiere problemas.
  - Nadie@3.96-4.22 quiere@4.22-4.42 problemas.@4.42-4.88

### c24
- [0.82–7.30] El problema lo empezó usted. Hace cinco minutos me quería cobrar medio millón.
  - El@0.82-1.58 problema@1.58-2.00 lo@2.00-2.22 empezó@2.22-2.62 usted.@2.62-2.94 Hace@4.42-4.74 cinco@4.74-5.10 minutos@5.10-5.54 me@5.54-5.80 quería@5.80-6.06 cobrar@6.06-6.46 medio@6.46-6.82 millón.@6.82-7.30

### c25
- [0.70–2.86] Está hablando con un comandante.
  - Está@0.70-1.38 hablando@1.38-1.68 con@1.68-2.02 un@2.02-2.14 comandante.@2.14-2.86
- [4.46–6.44] Esto le va a salir muy caro.
  - Esto@4.46-4.86 le@4.86-5.06 va@5.06-5.20 a@5.20-5.34 salir@5.34-5.52 muy@5.52-5.94 caro.@5.94-6.44

### c26
- [0.00–6.68] Y usted está hablando con Candelaria Ibarra, ¿tiene esposa comandante?
  - Y@0.00-1.50 usted@1.50-1.72 está@1.72-2.02 hablando@2.02-2.38 con@2.38-2.70 Candelaria@2.70-3.44 Ibarra,@3.44-4.04 ¿tiene@4.48-5.52 esposa@5.52-6.00 comandante?@6.00-6.68

### c27
- [1.44–3.06] que tiene que ver mi familia.
  - que@1.44-1.88 tiene@1.88-2.10 que@2.10-2.26 ver@2.26-2.44 mi@2.44-2.58 familia.@2.58-3.06
- [4.24–5.36] A ella no la meta.
  - A@4.24-4.68 ella@4.68-4.80 no@4.80-4.98 la@4.98-5.10 meta.@5.10-5.36

### c28
- [0.00–2.18] Yo también tenía un esposo.
  - Yo@0.00-0.86 también@0.86-1.18 tenía@1.18-1.52 un@1.52-1.68 esposo.@1.68-2.18
- [3.42–5.32] Una tarde salió por este camino
  - Una@3.42-3.70 tarde@3.70-4.04 salió@4.04-4.46 por@4.46-4.68 este@4.68-4.88 camino@4.88-5.32
- [6.00–7.42] y nunca volvió.
  - y@6.00-6.62 nunca@6.62-6.88 volvió.@6.88-7.42

### c29
- [1.76–3.98] La oferta cambió comandante.
  - La@1.76-2.48 oferta@2.48-2.84 cambió@2.84-3.30 comandante.@3.30-3.98
- [5.08–9.26] Usted quita sus patrullas de mi camino y se va del municipio hoy.
  - Usted@5.08-5.72 quita@5.72-6.00 sus@6.00-6.20 patrullas@6.20-6.74 de@6.74-6.84 mi@6.84-6.94 camino@6.94-7.34 y@7.34-7.90 se@7.90-8.02 va@8.02-8.16 del@8.16-8.32 municipio@8.32-8.96 hoy.@8.96-9.26

### c30
- [0.66–4.98] ¿Y si no? ¿Sabe quién me puso en este retén?
  - ¿Y@0.66-1.18 si@1.18-1.32 no?@1.32-1.50 ¿Sabe@3.22-3.54 quién@3.54-3.74 me@3.74-3.92 puso@3.92-4.22 en@4.22-4.36 este@4.36-4.56 retén?@4.56-4.98
- [7.16–7.38] ¿Sí?
  - ¿Sí?@7.16-7.38

### c31
- [1.34–5.00] en poseen las contación de su vida en los entrantos
  - en@1.34-1.86 poseen@1.86-2.18 las@2.18-2.28 contación@2.28-2.80 de@2.80-2.94 su@2.94-3.08 vida@3.08-3.40 en@3.40-4.80 los@4.80-4.92 entrantos@4.92-5.18
- [5.54–9.32] de la atrestación de la asión y rociendos también la pesida.
  - de@5.54-5.62 la@5.62-5.74 atrestación@5.74-6.28 de@6.28-6.42 la@6.42-6.56 asión@6.56-7.72 y@7.72-7.90 rociendos@7.90-8.48 también@8.48-8.72 la@8.72-8.88 pesida.@8.88-9.32

### c32
- [1.64–3.46] Comandante, ya vamos llegando.
  - Comandante,@1.64-2.40 ya@2.74-2.84 vamos@2.84-3.02 llegando.@3.02-3.46

### c33
- [1.10–2.82] ¿Creen que el comandante va a ceder?
  - ¿Creen@1.10-1.54 que@1.54-1.68 el@1.68-1.80 comandante@1.80-2.30 va@2.30-2.50 a@2.50-2.64 ceder?@2.64-2.82
- [4.46–7.28] Denle me gusta y compartan para ver la segunda parte.
  - Denle@4.46-4.74 me@4.74-4.88 gusta@4.88-5.18 y@5.18-5.38 compartan@5.38-6.00 para@6.00-6.18 ver@6.18-6.40 la@6.40-6.52 segunda@6.52-6.84 parte.@6.84-7.28

### r1
(sin diálogo)

### r2
(sin diálogo)

### r4
(sin diálogo; whisper alucina «¡Suscríbete!» en el silencio/ambiente)


## Revisión 2 (clips regenerados, 2026-11-04)

Método igual que la 1: hoja de contactos a 2 fps (scratchpad `qa2r/`), tramos dudosos a 5 fps; faster-whisper small con tiempos por palabra y medium de control (audio a WAV con ffmpeg).
Hallazgo general: **Garza ahora sí es GARZAVERDE** en los 10 clips suyos: corpulento, bigote negro de herradura, aviadores espejados, camuflaje verde olivo con gorra, de pie afuera de la troca roja. Ninguno con uniforme de policía. Los parches de pecho tienen texto ilegible ("ARMY", "MUSAPC"); son chicos, se toleran.

- **c05** OK. Afuera, recargado en la troca roja; la cámara se acerca hasta el primer plano. Línea completa (1.30–5.94).
- **c06** No existe `clips/c06.mp4` → sigue pendiente.
- **c09** OK. Antebrazo sobre el espejo de la troca, afuera. Las 2 líneas completas (0.00–8.42).
- **c11** Imagen OK (afuera, puerta abierta, radio en el chaleco). Audio: las 2 líneas bien (1.38–7.48; medium oye "hablas" en vez de "habla", leve), pero a **8.18–9.14 s dice una línea INVENTADA, "Los asesinos ya están"** (baja, −28 dB). **Recortar: usar 0.0–7.9 s.**
- **c14** OK. Saluda con la mano y luego se inclina hacia la ventanilla, afuera. Las 3 líneas (1.02–9.06). El acercamiento es continuo, sin salto (revisado a 5 fps).
- **c16** OK. Afuera, apoyado en el espejo; acercamiento continuo. Las 2 líneas (0.00–6.10); habla desde el frame 0.
- **c20** Garza OK de 0 a 2 s. **Morph**: se quita los lentes (2.0–2.6 s), su cara sin lentes se ve más delgada (2.6–3.6 s) y luego **los lentes reaparecen solos en su cara** (3.6–4.0 s), sin que se los vuelva a poner. Diálogo 4.20–7.20 con lentes. **Recortar: usar 4.0–8.04 s** (se pierde el gesto de quitarse los lentes).
- **c23** OK. Manos a medio levantar, jinetes al fondo. Las 2 líneas (0.00–5.08).
- **c25** OK. Sombrero crema de Candelaria en primer plano, camuflaje correcto, sin rastro de policía. Las 2 líneas (0.96–6.48).
- **c30** OK. Las 2 líneas (1.28–5.40); ya no se oye el "¿Sí?" suelto.
- **r4** OK. Silencio, acercamiento lento, Garza correcto. Al final (5.0–6.0 s) los lentes se ven menos espejados, sin importancia. Whisper alucina «¡Suscríbete!» en el ambiente (−45 dB, no hay voz).
- **c31** OK. Candelaria igual a la hoja (sombrero crema, trenza gris, chamarra café, camisa verde). Las 3 líneas: "Por eso vine en persona" 1.36–3.28, "Tiene cinco minutos" 4.22–5.64 (small oye "Tienes", medium recortado oye "Tiene"; aceptable), "Ahora usted decide" 7.40–8.46. Detalle menor: no se ve el gesto de cerrar el reloj; el reloj sale de cuadro hacia ~2 s.

### Recortes revisión 2
- c11 → 0.0–7.9 s (quita la línea inventada)
- c20 → 4.0–8.04 s (quita el morph de los lentes)

### REGENERAR2
**c06** (no existe todavía el clip). Todo lo demás se arregla recortando o está OK.

### Transcripciones revisión 2 (faster-whisper small; palabra@inicio-fin en segundos)

### c05
- [1.30–5.94] Buenas tardes señora, ¿para dónde lleva tanto ganado?
  - Buenas@1.30-2.12 tardes@2.12-2.50 señora,@2.50-2.76 ¿para@4.16-4.60 dónde@4.60-4.82 lleva@4.82-5.12 tanto@5.12-5.40 ganado?@5.40-5.94

### c09
- [0.00–8.42] El problema es que este camino tiene dueño. Son 500 mil y aquí no pasó nada.
  - El@0.00-0.88 problema@0.88-1.28 es@1.28-1.52 que@1.52-1.64 este@1.64-1.84 camino@1.84-2.28 tiene@2.28-2.68 dueño.@2.68-3.26 Son@4.24-4.64 500@4.64-4.92 mil@4.92-5.42 y@5.42-6.70 aquí@6.70-7.00 no@7.00-7.88 pasó@7.88-8.10 nada.@8.10-8.42

### c11
- [1.38–7.48] Cuidado cómo me habla señora, aquí yo decido quién pasa y quién se queda.
  - Cuidado@1.38-1.92 cómo@1.92-2.18 me@2.18-2.38 habla@2.38-2.64 señora,@2.64-2.96 aquí@5.04-5.36 yo@5.36-5.56 decido@5.56-6.00 quién@6.00-6.20 pasa@6.20-6.62 y@6.62-6.78 quién@6.78-7.00 se@7.00-7.14 queda.@7.14-7.48
- [8.18–9.14] (medium) «Los asesinos ya están.» — línea INVENTADA, bajo (−28 dB); cortar antes de 7.9 s

### c14
- [1.02–9.06] ¿Qué tanto platican? Si no hay dinero, no hay paso. Y con una llamada tengo aquí 20 patrullas.
  - ¿Qué@1.02-1.64 tanto@1.64-1.92 platican?@1.92-2.54 Si@3.44-3.68 no@3.68-3.84 hay@3.84-3.94 dinero,@3.94-4.30 no@4.66-4.82 hay@4.82-4.94 paso.@4.94-5.26 Y@6.18-6.60 con@6.60-6.80 una@6.80-6.98 llamada@6.98-7.38 tengo@7.38-7.68 aquí@7.68-7.94 20@7.94-8.34 patrullas.@8.34-9.06

### c16
- [0.00–6.10] Entonces arreglemos esto rápido señora, aquí las reglas las pongo yo.
  - Entonces@0.00-0.94 arreglemos@0.94-1.60 esto@1.60-1.78 rápido@1.78-2.18 señora,@2.18-2.52 aquí@4.00-4.60 las@4.60-4.80 reglas@4.80-5.24 las@5.24-5.44 pongo@5.44-5.80 yo.@5.80-6.10

### c20
- [4.20–7.20] ¿Qué hizo, señora? ¿A quién le habló?
  - ¿Qué@4.20-4.66 hizo,@4.66-4.92 señora?@4.96-5.16 ¿A@6.52-6.64 quién@6.64-6.78 le@6.78-6.90 habló?@6.90-7.20

### c23
- [0.00–2.24] Dígales que se calmen, señora.
  - Dígales@0.00-1.12 que@1.12-1.32 se@1.32-1.46 calmen,@1.46-1.92 señora.@1.96-2.24
- [3.96–5.08] Nadie quiere problemas.
  - Nadie@3.96-4.32 quiere@4.32-4.54 problemas.@4.54-5.08

### c25
- [0.96–3.16] Está hablando con un comandante.
  - Está@0.96-1.62 hablando@1.62-1.90 con@1.90-2.24 un@2.24-2.36 comandante.@2.36-3.16
- [4.48–6.48] Esto le va a salir muy caro.
  - Esto@4.48-4.88 le@4.88-5.06 va@5.06-5.20 a@5.20-5.32 salir@5.32-5.52 muy@5.52-5.96 caro.@5.96-6.48

### c30
- [1.28–5.40] y si no, ¿sabe quién me puso en este retén?
  - y@1.28-1.80 si@1.80-1.96 no,@1.96-2.14 ¿sabe@3.16-3.90 quién@3.90-4.08 me@4.08-4.26 puso@4.26-4.58 en@4.58-4.72 este@4.72-4.94 retén?@4.94-5.40

### r4
(sin diálogo; whisper small alucina «¡Suscríbete!» a 4.6–6.0 s en el ambiente, RMS −45 dB)

### c31
- [1.36–5.64] Por eso vine en persona. Tienes cinco minutos.
  - Por@1.36-2.20 eso@2.20-2.44 vine@2.44-2.68 en@2.68-2.88 persona.@2.88-3.28 Tienes@4.22-4.88 cinco@4.88-5.14 minutos.@5.14-5.64
- [7.40–8.46] Ahora usted decide.
  - Ahora@7.40-7.70 usted@7.70-8.00 decide.@8.00-8.46

