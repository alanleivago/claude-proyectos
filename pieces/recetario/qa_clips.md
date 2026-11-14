# QA clips — recetario (El Recetario · Parte 1) (2026-11-04)

Método: los 31 clips de CLIPS (c01–c31) estaban en `clips/`. ffmpeg decodificó 30 (720x1280 con audio, 6 u 8 s según el prompt). **c19 está corrupto** ("Sample size too large", 0 fotogramas legibles; 1.3 MB): no se puede usar. Hice una hoja de contactos a 2 fps por clip (scratchpad `qa_rec/`) más ampliaciones de c11 (2 y 5.6 s, el cajón), c16 (1 s, la tele), c23 (0.3, 3, 4 y 7 s, el fondo) y c24 (0.3 y 1.5 s, Leopoldo). Detección de cortes internos (scene > 0.12): solo c02 tiene uno, a 4.96 s. Transcribí con faster-whisper small y medium (es, tiempos por palabra; wav 16 kHz cargado con numpy, CPU int8). Comparé contra MIREYA, CHENCHO, HORTENSIA, SAMANTA, LEOPOLDO, las 3 LOC y PROP_RECETARIO.
Ropa: Mireya (vestido lila de tirantes con florecitas, arracadas, sandalias blancas), Chencho (playera verde menta con manchas, jeans), Hortensia (vestido de casa floral azul, chongo gris, cadenita), Samanta (traje gris claro, blusa blanca, aretes de perla) y Leopoldo (camisa lavanda a rayitas, reloj plateado) se mantienen en todos sus clips, también de espaldas y en los bordes. Chencho tiene la barba más rala que en su hoja, pero igual en todos los clips. **Excepciones: en c24 el Leopoldo del borde es otro hombre** (lampiño, sin barba ni bigote, pelo más claro) y **en c23 hay un cliente ajeno** sentado al fondo a la izquierda (0–7 s).
Objetos: una sola libreta café en todo el material (c11 en el cajón, c18 Hortensia, c20–c22 y c30 Chencho, c23 Leopoldo). La batidora no sale en ningún plano (solo se nombra). El celular de c28 lo tiene solo Samanta y el video de Leopoldo queda dentro de la pantalla. La tele de c16 muestra a una mujer de pelo largo oscuro y blusa blanca dentro del marco, con un cintillo de noticias con letras ilegibles; la tele mide ~90 px de ancho y está desenfocada.
Texto quemado: ninguno (solo el cintillo de c16, dentro de la tele). Contacto: Hortensia le pasa un vasito a Chencho (c01), nada brusco. Nadie señala con el dedo.
Pronunciación: "Hortensia" no se dice en ningún clip; "Leopoldo", "batidora", "malagradecida", "igualito", "licenciada" y "Mireya" se oyen bien (whisper escribe "Mireia"/"Mirella", es la misma pronunciación). **c04 repite "ni la usabas, ni la usabas tanto"** (small y medium coinciden). c10 dice "a ver cuánto dura" en vez de "duras" (los dos modelos), se acepta. En c22 small oye un "Sí." de otra voz a 3.30–3.94 s; medium no, y cae en la pausa entre frases.

## Veredicto por clip
- **c01** OK. Hortensia habla desde 0.00 s; Chencho entra por el borde derecho con el push-in.
- **c02** OK, con recorte: corte interno a 4.96 s (salta a primerísimo plano). La voz va de 1.20 a 3.54 s → usar 1.1–4.9 s.
- **c03** OK. Chencho en el borde derecho. Habla desde 0.00 s.
- **c04** **Repite la frase**: "ni la usabas, ni la usabas tanto" (4.14–6.50 s), sin pausa entre las dos (la segunda empieza a 5.42 s, pegada a la primera). Recortar a 4.1 s quita "Ni la usabas tanto". → REGENERAR.
- **c05** OK. Chencho en el borde derecho.
- **c06** OK. Mireya en el borde derecho.
- **c07** OK. Hortensia en el borde izquierdo.
- **c08** OK. Chencho y Hortensia comiendo; el refri sale más redondo, se acepta.
- **c09** OK. El marco de la puerta pasa en primer plano a 0–0.5 s por el movimiento de cámara; Chencho de pie detrás, a la derecha.
- **c10** OK. Mireya en el borde izquierdo. "dura" en vez de "duras".
- **c11** OK. Empaca los moldes y sale de cuadro; la cámara descubre el cajón de la mesa con UNA libreta (5–6 s). No la toca.
- **c12** OK. Mireya de espaldas en el borde derecho; Samanta prueba un vasito.
- **c13** OK. Samanta de pie en el borde izquierdo.
- **c14** OK. Mireya de espaldas en el borde derecho; mano abierta.
- **c15** OK. Samanta al fondo a la izquierda.
- **c16** OK, con aviso: la mujer de la tele queda dentro de la pantalla pero lleva blusa blanca (no el vestido lila) y hay un cintillo ilegible; la tele es chica y está desenfocada. Hortensia de espaldas en el borde izquierdo.
- **c17** OK. Chencho en el borde derecho.
- **c18** OK, con aviso: saca la libreta de un cajón del mueble del fregadero, no del cajón de la mesa que se ve en c11. Una sola libreta; Chencho en el borde derecho.
- **c19** **Archivo corrupto** (no decodifica). → REGENERAR.
- **c20** OK. Chencho en el borde derecho con la libreta en la mano.
- **c21** OK. Hortensia de espaldas en el borde izquierdo; libreta contra el pecho.
- **c22** OK, con aviso: aquí Chencho queda a la izquierda y Hortensia a la derecha, al revés que en c20 (c21 está en medio y es contraplano, se acepta). Si se oye el "Sí" de otra voz a 3.30–3.94 s, cortar entre 3.1 y 4.3 s (es la pausa entre frases).
- **c23** **Cliente ajeno** sentado al fondo a la izquierda (camisa gris, con taza), visible de 0 a ~7 s, durante las dos frases. Recortar no lo quita. → REGENERAR.
- **c24** **Leopoldo cambiado**: el hombre del borde izquierdo es lampiño, sin barba ni bigote y con el pelo más claro (ampliado a 0.3 y 1.5 s), no el de la hoja ni el de c23/c25. Está en cuadro todo el clip. → REGENERAR.
- **c25** OK. Prueba el vasito con cuchara; Chencho de espaldas en el borde derecho.
- **c26** OK. Chencho en el borde izquierdo.
- **c27** OK. Samanta en el borde derecho.
- **c28** OK. Solo Samanta tiene celular (mano derecha) y el video queda dentro de la pantalla; Mireya en el borde izquierdo.
- **c29** OK. Samanta al fondo a la derecha.
- **c30** OK. Una libreta; Hortensia a la derecha, riendo.
- **c31** (CTA) OK. Mueve los labios desde el frame 0, pero el audio empieza a 0.76 s → usar desde 0.66 s. Se acomoda el pelo detrás de la oreja, ladea la cabeza, sonríe y gesticula con la mano abierta (4.5–6 s). No señala.

## Recortes (no hace falta regenerar)
- c02 → 1.1–4.9 s (corte interno a 4.96 s).
- c31 → desde 0.66 s (voz a 0.76 s).
- c22 → si hace falta, quitar 3.1–4.3 s (el "Sí" que oye small).
- La voz también empieza tarde en c02 (1.20), c07 (1.48), c08 (0.82), c09 (0.90), c10 (0.96), c11 (0.80), c13 (0.96), c15 (1.26), c16 (0.66), c18 (0.98, "¿Y" largo), c20 (1.62), c21 (1.12), c24 (1.26), c25 (1.36), c26 (1.16) y c30 (1.46); cortar ~0.1 s antes de la primera palabra.
- Avisos que se aceptan: c16 (mujer de la tele con blusa blanca y cintillo ilegible), c18 (otro cajón), c22 (lados cambiados respecto a c20), c10 ("dura"), barba de Chencho más rala que en la hoja.

## REGENERAR
**c04, c19, c23, c24**. Moví sus mp4 a `clips/old/` y corregí los prompts en `clips.py` (`python -I clips.py c04 c19 c23 c24`). El archivo carga y tiene 31 clips; faltan exactamente esos 4. Todos los prompts ya llevaban el ancla con `@{ASSET}` de cada personaje (también el del borde) y "No other people".
- c04: Mireya "standing, blurred at the LEFT edge"; "He says each sentence only once, without repeating any words".
- c19: Chencho "holding the open worn brown leather notebook in BOTH hands in front of his chest"; Hortensia "standing, blurred at the LEFT edge of the frame, her hands empty" (mismo lado que en c20).
- c23: Leopoldo con la libreta "in BOTH hands over the table"; Chencho en el borde DERECHO "his hands empty"; "The café is closed and empty: no customers at the other tables, nobody in the background".
- c24: Leopoldo "at the LEFT edge … always the same man as in his reference: black hair slicked back, short trimmed black beard and black moustache clearly visible, lavender pinstriped shirt"; Hortensia a la izquierda de Chencho (lado derecho del cuadro); café vacío como en c23.

## Transcripciones (faster-whisper small; palabra@inicio-fin en segundos; dB = RMS)
small y medium coinciden en el texto salvo puntuación, "Mireya/Mireia/Mirella", "Checho" y "entregó" (c05, small; medium: "Chencho", "entrego"), "prove" (c12, small; medium: "probé") y el "Sí." de c22 (solo small). medium corta el final de c07 y el inicio de c09 y c30; small los oye completos. c19 no se transcribió (corrupto).
- **c01** (-25 dB): Agarren,@0.00-0.88 que@1.12-1.20 para@1.20-1.44 eso@1.44-1.60 los@1.60-1.80 hizo,@1.80-2.14 están@2.62-3.68 bien@3.68-4.10 buenos.@4.10-4.66 ¿Verdad,@5.00-5.46 chencho?@5.50-5.82
- **c02** (-26 dB): No,@1.20-1.70 mamá.@1.84-2.24 Esos@2.54-2.74 son@2.74-2.92 de@2.92-3.02 un@3.02-3.10 pedido.@3.10-3.54
- **c03** (-20 dB): me@0.00-0.38 levanté@0.38-0.80 a@0.80-0.84 las@0.84-1.00 cuatro@1.00-1.36 para@1.36-1.66 hacerlos@1.66-2.20 y@2.20-3.76 mi@3.76-3.86 batidora@3.86-4.42 no@4.42-5.68 está@5.68-5.84 en@5.84-5.96 su@5.96-6.08 lugar@6.08-6.40
- **c04** (-23 dB): la@0.00-1.26 vendí,@1.26-1.66 mi@2.12-2.34 mamá@2.34-2.62 necesitaba@2.62-3.00 unos@3.00-3.14 zapatos,@3.14-4.10 ni@4.14-4.62 la@4.62-4.74 usabas,@4.74-5.42 ni@5.42-5.76 la@5.76-5.90 usabas@5.90-6.26 tanto.@6.26-6.50
- **c05** (-25 dB): Con@0.00-1.42 esa@1.42-1.64 batidora@1.64-2.18 hago@2.18-2.44 todo,@2.44-2.82 Checho.@3.00-3.42 Sin@4.66-5.10 la@5.10-5.24 batidora@5.24-6.02 no@6.02-6.26 entregó@6.26-6.66 nada.@6.66-6.94
- **c06** (-27 dB): Ay,@0.00-0.50 ya,@0.62-0.84 no@1.04-1.12 exageres.@1.12-2.10 Son@2.54-2.82 puros@2.82-3.16 vacitos.@3.16-3.78 Eso@4.00-4.16 cualquiera@4.16-4.62 lo@4.62-5.88 hace.@5.88-6.12
- **c07** (-26 dB): Ustedes@1.48-2.04 nunca@2.04-2.22 me@2.22-2.50 han@2.50-2.58 valorado.@2.58-3.16 Todo@4.42-4.70 lo@4.70-4.94 que@4.94-5.08 gano@5.08-5.42 se@5.42-5.84 va@5.84-5.98 en@5.98-6.10 esta@6.10-6.32 casa.@6.32-6.62
- **c08** (-24 dB): Pues@0.82-1.50 para@1.50-1.78 eso@1.78-2.00 eres@2.00-2.34 de@2.34-2.50 la@2.50-2.62 familia.@2.62-3.06 Aquí@3.90-4.38 todos@4.38-4.60 ponemos@4.60-5.06 algo.@5.06-5.36
- **c09** (-28 dB): ya@0.90-1.34 me@1.34-1.50 cansé@1.50-1.86 de@1.86-1.92 ser@1.92-2.10 la@2.10-2.26 sirvienta@2.26-2.80 de@2.80-2.88 todos.@2.88-3.14 Me@4.16-4.60 voy@4.60-4.76 de@4.76-4.90 esta@4.90-5.06 casa.@5.06-5.32
- **c10** (-26 dB): ¡Ándale,@0.96-1.56 vete,@1.70-2.00 a@3.54-3.82 ver@3.82-3.96 cuánto@3.96-4.40 dura@4.40-4.64 sin@4.64-4.86 nosotros!@4.86-5.32
- **c11** (-27 dB): Mis@0.80-1.40 moldes@1.40-1.92 y@1.92-2.02 mis@2.02-2.20 cosas,@2.20-2.50 nada@2.62-2.82 más.@2.82-3.16
- **c12** (-25 dB): Mirella,@0.00-1.46 prove@1.92-2.24 tus@2.24-2.46 postres@2.46-2.90 en@2.90-3.04 la@3.04-3.16 feria.@3.16-3.54 Quiero@4.50-5.06 ponerlos@5.06-5.56 en@5.56-6.02 todas@6.02-6.54 mis@6.54-6.88 tiendas.@6.88-7.42
- **c13** (-25 dB): ¿En@0.96-1.44 serio,@1.44-1.68 licenciada?@1.74-2.28 Yo@3.10-3.26 los@3.26-3.44 hacía@3.44-3.82 en@3.82-4.66 la@4.66-4.74 cocina@4.74-5.14 de@5.14-5.26 mi@5.26-5.40 mamá.@5.40-5.88
- **c14** (-23 dB): pues@0.00-0.66 ahora@0.66-0.90 vas@0.90-1.14 a@1.14-1.26 tener@1.26-1.48 tu@1.48-1.72 propia@1.72-2.04 cocina@2.04-2.58 y@2.58-4.74 tu@4.74-4.88 nombre@4.88-5.26 en@5.26-5.66 cada@5.66-5.88 empaque.@5.88-6.32
- **c15** (-26 dB): Esto@1.26-1.86 es@1.86-1.98 lo@1.98-2.10 que@2.10-2.22 siempre@2.22-2.52 soñé.@2.52-3.08
- **c16** (-23 dB): Mira@0.66-1.26 nomás,@1.26-1.70 mamá.@1.74-2.40 Mireya@2.76-3.36 salió@3.36-3.68 en@3.68-3.74 la@3.74-3.86 tele.@3.86-4.16 Dicen@4.96-5.38 que@5.38-5.50 sus@5.50-5.68 postres@5.68-6.10 ya@6.10-6.22 están@6.22-6.42 en@6.42-6.54 todas@6.54-6.68 partes.@6.68-7.20
- **c17** (-25 dB): Y@0.00-1.28 a@1.28-1.38 nosotros,@1.38-1.82 ni@2.24-2.72 una@2.72-2.90 visita,@2.90-3.46 mal@4.80-5.24 agradecida.@5.24-5.94
- **c18** (-25 dB): ¿Y@0.00-0.98 esto@0.98-1.18 qué@1.18-1.42 es?@1.42-1.78 Es@3.76-4.18 su@4.18-4.30 libreta.@4.30-4.86 La@5.50-5.76 olvido@5.76-6.12 aquí.@6.12-6.42
- **c20** (-30 dB): ¿Y@1.62-2.36 si@2.36-2.52 Mireya@2.52-2.92 se@2.92-3.04 entera?@3.04-3.42
- **c21** (-26 dB): Ni@1.12-1.66 se@1.66-1.84 acuerda@1.84-2.34 que@2.34-2.46 existe.@2.46-2.92 Algo@4.04-4.56 nos@4.56-4.68 tenía@4.68-4.92 que@4.92-5.04 tocar,@5.04-5.34 ¿no?@5.56-5.62
- **c22** (-26 dB): Se@0.00-1.10 las@1.10-1.24 ofrecemos@1.24-1.86 a@1.86-2.06 la@2.06-2.14 competencia.@2.14-3.04 Sí.@3.30-3.94 Que@4.38-4.68 otros@4.68-4.90 las@4.90-5.12 hagan@5.12-5.60 y@5.60-6.16 nosotros@6.16-6.44 cobramos.@6.44-7.12
- **c23** (-26 dB): ¿Cómo@0.00-1.84 consiguieron@1.84-2.44 estas@2.44-2.64 recetas?@2.64-3.14 Mireya@4.30-4.82 sabe@4.82-5.16 que@5.16-5.36 están@5.36-5.58 aquí.@5.58-5.84
- **c24** (-27 dB): Son@1.26-1.74 de@1.74-1.90 mi@1.90-2.00 familia,@2.00-2.46 don@2.58-2.66 Leopoldo.@2.66-3.28 En@4.46-4.60 la@4.60-4.70 cocina@4.70-5.06 de@5.06-5.18 mi@5.18-5.32 mamá@5.32-6.04 aprendió@6.04-6.58 todo.@6.58-6.82
- **c25** (-24 dB): Sabe@1.36-2.14 igualito@2.14-2.62 al@2.62-2.72 de@2.72-2.82 Mireya.@2.82-3.26 Me@3.94-4.54 quedo@4.54-4.80 con@4.80-4.94 todas.@4.94-5.22 Trato@5.98-6.32 hecho.@6.32-6.56
- **c26** (-26 dB): Ahora@1.16-1.86 sí@1.86-2.26 Mireya@2.26-3.26 nos@3.26-3.46 va@3.46-3.62 a@3.62-3.72 mantener.@3.72-4.02
- **c27** (-24 dB): Licenciada@0.00-0.96 mañana@0.96-1.64 presento@1.64-2.30 mi@2.30-2.44 receta@2.44-2.82 nueva@2.82-3.10 nadie@3.10-4.84 más@4.84-5.08 la@5.08-5.20 conoce@5.20-5.68
- **c28** (-25 dB): Mirella,@0.00-1.48 mira@1.86-1.98 esto.@1.98-2.36 Don@3.42-3.82 Leopoldo@3.82-4.32 acaba@4.32-4.50 de@4.50-4.70 anunciar@4.70-5.38
- **c29** (-22 dB): esa@0.00-0.70 receta@0.70-1.10 estaba@1.10-1.34 en@1.34-1.48 mi@1.48-1.60 libreta.@1.60-2.12 ¿Quién@3.16-3.76 se@3.76-3.84 la@3.84-3.98 dio?@3.98-4.14
- **c30** (-29 dB): Pobrecita,@1.46-2.06 y@3.14-3.36 todavía@3.36-3.74 no@3.74-3.96 sabe@3.96-4.28 lo@4.28-4.44 que@4.44-4.58 le@4.58-4.68 espera.@4.68-5.04
- **c31** (-21 dB): ¿Ustedes@0.76-1.24 creen@1.24-1.46 que@1.46-1.56 fue@1.56-1.70 mi@1.70-1.84 propia@1.84-2.08 familia?@2.08-2.64 Denle@4.28-4.62 me@4.62-4.74 gusta@4.74-5.02 y@5.02-5.16 compartan@5.16-5.74 para@5.74-5.92 ver@5.92-6.10 la@6.10-6.20 segunda@6.20-6.48 parte.@6.48-6.88
