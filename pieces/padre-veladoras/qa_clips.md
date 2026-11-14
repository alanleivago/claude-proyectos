# QA clips — padre-veladoras (2026-11-04)

Método: hoja de contactos a 2 fps por clip (scratchpad `qa_padre/`), recortes ampliados (c02, c04, c05, c07, c10, c12, c14, c19, c21, c30, c34, r1), faster-whisper small y medium (es, tiempos por palabra, audio pasado a wav 16 kHz). La cola de c29 se volvió a escuchar con medium por separado.
Pronunciación: "Anselmo", "Rufino", "Ramiro Salcedo", "Víboras", "veladoras", "motociclistas" y "repletas" bien en todos. "Padrecito" sale con seseo ("Padresito" en small), que es normal. c33 "Vas a prender" bien (medium; small oye "aprender" por la liga de la "a").
Ropa constante en toda la pieza: Anselmo con traje gris carbón, alzacuello, lentes sin montura y rosario rojo oscuro; Rufino con cola de caballo, candado, aro, chaleco café con víboras crema y camiseta negra; Chato con bandana verde, camisa de cuadros azul y el chaleco; Ramiro con sombrero café, guayabera azul claro y bigote blanco; Mauro con traje azul marino, camisa blanca y aviadores. No hay texto quemado ni contacto físico brusco.
**Identidad de Anselmo:** la hoja lo muestra lampiño. En c04 sale con **barba canosa recortada** y en c12 con barba de varios días. En c15, c21 y c25 hay una sombra de barba leve, que se acepta.

## Veredicto por clip

- **c01** OK. Anselmo de espaldas (canoso, traje gris) y Rufino coinciden con sus hojas. Dos motociclistas al fondo con chaleco. La voz empieza en 1.5 s.
- **c02** OK. El hombro del borde izquierdo es de Rufino (brazo tatuado, aro, chaleco).
- **c03** OK.
- **c04** **Anselmo con barba**: sale con candado y barba canosa recortada todo el clip, y la hoja (y c02/c06) lo muestran lampiño. No se arregla recortando. → REGENERAR.
- **c05** OK. Sopla las veladoras. Anselmo en el borde derecho (canoso, lentes, traje gris) coincide.
- **c06** OK.
- **c07** OK. Anselmo en el borde derecho coincide.
- **c08** OK.
- **c09** OK.
- **c10** **Persona ajena y locación equivocada**: no está en la capilla lateral (sale la nave principal con bancas), y al fondo hay una **mujer de pelo largo con chamarra de mezclilla** todo el clip (0–8 s). Además no hace juego con c12, que sí está en la capilla. → REGENERAR.
- **c11** OK.
- **c12** OK de audio. **Aviso**: Anselmo tiene barba de varios días, más marcada en la segunda mitad. Va justo después de c10 en el montaje. Si al regenerar c10 sale lampiño, el contraste se va a notar: valorar regenerarlo.
- **c13** OK. Mauro al fondo coincide. **Aviso menor**: Ramiro lleva una segunda medalla con listón que no tiene en c11 (misma escena). Se nota poco.
- **c14** **Rosario en la espalda**: Anselmo, de espaldas en primer plano, lleva el rosario con la cruz colgando por la espalda de 0 a ~1.4 s, y desaparece después. La voz empieza en 1.0 s, así que no se puede quitar recortando el inicio. Arreglo: **recortar en espacio el 15 % derecho** (crop x 0–612 de 720 y escalar ×1.18) durante 0–1.5 s, o todo el clip. Si se ve blando, regenerar.
- **c15** OK. Rufino en el borde izquierdo coincide.
- **c16** OK. El tatuaje con letras del antebrazo es parte del personaje, no texto quemado.
- **r1** **Arranca con otra escena**: de 0 a ~2.9 s sale una **mujer llorando con blusa verde** y hombres detrás (ajeno a la pieza). Desde 3.0 s viene el plano aéreo correcto de las camionetas. → **recortar a 3.0–6.04** (3 s de aéreo). Sin diálogo; lo que oye whisper es alucinación.
- **c17** OK. Mauro y Ramiro en el asiento de atrás coinciden.
- **c18** OK. Mauro desenfocado en el borde derecho (barba, aviadores, traje azul marino) coincide.
- **c19** OK. Ramiro va en el asiento delantero, junto a la ventana.
- **c20** OK. Anselmo en el borde derecho coincide.
- **c21** **Persona ajena en el borde**: de 0 a ~1.3 s asoma por el borde izquierdo una **mujer de pelo oscuro con blusa blanca de encaje** (Rufino tendría que estar fuera de cuadro). La voz empieza en ~1.0 s ("A alguien…"), así que no se puede recortar el inicio. → REGENERAR.
- **c22** OK. Medium no oye "Ya casi estamos" y small sí (0.0–1.5).
- **c23** OK de imagen. **Repite "Vienen repletas de gente"** (5.84–7.20) → **recortar a 0.0–5.78**. Afuera se ve otra iglesia blanca en vez de la fachada rosa del atrio. Se acepta, porque el atrio aparece en c26.
- **c24** OK.
- **c25** OK. Plano doble: Anselmo y Rufino coinciden.
- **c26** OK. Mauro, los vaqueros de camisa blanca y la fachada rosa del atrio.
- **c27** OK. Rufino de espaldas (cola de caballo, aro, chaleco con víbora) coincide.
- **c28** OK. Ramiro en el borde izquierdo (sombrero café, guayabera) coincide. Dice los tres "Sí".
- **c29** OK de imagen. **Audio para escuchar**: "lo que le dijiste" va bajo y rápido (6.1–6.9 s, unos 5 dB menos). Small y medium no lo oyen. Medium con el texto como pista sí lo oye. Probablemente sirve subiendo la ganancia de esa cola. Si no se entiende, regenerar.
- **c30** OK. La cola de caballo cae hacia el frente en la segunda mitad, que es aceptable.
- **c31** OK. Rufino en el borde derecho y Anselmo al fondo junto al altar coinciden.
- **c32** OK.
- **c33** OK. Se acomoda el sombrero.
- **r2** OK. Rufino prende las veladoras con un cerillo y Anselmo sonríe al fondo. Sin diálogo; "Suscríbete y dale like" es alucinación de whisper.
- **c34** (CTA) Tiene buen carisma: asiente, sonríe, se acomoda los lentes y gesticula con el rosario. Pero **le aparece de golpe una pañoleta amarilla en la mano** (~3.5–5 s) y al fondo hay **varias mujeres con chamarras de mezclilla** (las mismas de c10, ajenas a la pieza) durante casi todo el clip. → REGENERAR.

## Recortes (no hace falta regenerar)
- r1 → 3.0–6.04 (quita a la mujer llorando de otra escena).
- c23 → 0.0–5.78 (quita "Vienen repletas de gente" repetido).
- c14 → recorte en espacio, 15 % derecho (×1.18), al menos de 0 a 1.5 s (quita el rosario colgando por la espalda).
- c29 → subir la ganancia de 6.1–6.9 s ("lo que le dijiste"); escucharlo.

## REGENERAR
**c04, c10, c21, c34**. Los mp4 se movieron a `clips/old/` y sus prompts en `clips.py` ya están corregidos (`python -I clips.py c04 c10 c21 c34`):
- Ancla de Anselmo (ANS, afecta a todos los prompts nuevos): "completely clean-shaven face with no beard and no stubble".
- c04: barba canosa. Además del ancla, el prompt repite "his face smooth and clean-shaven like in his reference sheet".
- c10: nave principal y mujer de mezclilla al fondo. Ahora dice "alone" en la capilla lateral, "the crucifix on the wall right behind him (not the main nave, no pews)" y "Nobody else in the frame, no other people in the background".
- c21: mujer de blusa de encaje en el borde. Ahora el borde izquierdo es `{RUF}` de espaldas con su ancla ("only his tattooed arm, black ponytail and sleeveless dark brown leather vest visible") y el prompt dice "No other people, no women".
- c34: pañoleta que aparece y mujeres al fondo. Ahora dice "gestures with the dark red wooden rosary in his hand; he holds nothing else, no scarf, no cloth" y "The church behind him is empty: empty wooden pews, no other people". Se mantiene el carisma y los gestos.

Opcional: c12 (barba de varios días; ver si contrasta con el c10 nuevo).

## Transcripciones (faster-whisper small; palabra@inicio-fin en segundos)
Correcciones de medium: c03 "Respeto," = "¿Respeto?"; c05 "va a ser" = "va a hacer"; c07/c09/c14 "Padresito" = "Padrecito"; c12 "el que mandes rufino" = "El que manda es Rufino"; c26 "usted se quedan" = "Ustedes se quedan"; c29 + "lo que le dijiste" (6.1–6.9, bajo); c33 "Vas a aprender" = "Vas a prender". r1 y r2 no tienen diálogo: lo que sale es alucinación.

- **c01**: Padrecito,@1.60-2.10 usted@2.22-2.40 y@2.40-2.56 yo@2.56-2.72 tenemos@2.72-2.94 que@2.94-3.22 hablar.@3.22-3.44 Desde@4.76-4.94 hoy,@4.94-5.30 esta@5.62-5.86 iglesia@5.86-6.24 es@6.24-6.38 nuestro@6.38-6.64 punto@6.64-6.94 de@6.94-7.12 reunión.@7.12-7.58
- **c02**: Esta@0.00-0.80 es@0.80-0.92 la@0.92-1.02 casa@1.02-1.30 de@1.30-1.48 Dios,@1.48-1.88 no@2.32-2.40 un@2.40-2.54 taller.@2.54-2.80 Aquí@4.74-4.96 se@4.96-5.18 entra@5.18-5.48 con@5.48-5.70 respeto.@5.70-6.34
- **c03**: Respeto,@1.88-2.72 nosotros@3.08-3.52 no@3.52-3.94 le@3.94-4.06 pedimos@4.06-4.48 permiso@4.48-5.18 a@5.18-5.42 nadie.@5.42-5.82
- **c04**: Entonces@1.00-1.62 les@1.62-1.94 voy@1.94-2.10 a@2.10-2.20 pedir@2.20-2.50 que@2.50-3.12 se@3.12-3.26 retiren.@3.26-4.00 Por@5.02-5.64 las@5.64-5.80 buenas.@5.80-6.02
- **c05**: Uy,@2.90-3.22 se@3.32-3.40 apagaron@3.40-3.78 sus@3.78-3.94 veladoras@3.94-4.66 y@4.66-5.28 ¿ahora@5.28-5.46 qué@5.46-5.62 va@5.62-5.76 a@5.76-5.82 ser,@5.82-5.96 padrecito?@6.10-6.54
- **c06**: No@1.26-1.82 se@1.82-2.00 burle@2.00-2.30 de@2.30-2.44 mi@2.44-2.56 fe.@2.56-2.78 Dios@4.24-4.66 está@4.66-4.96 viendo@4.96-5.26 todo@5.26-5.66 lo@5.66-5.90 que@5.90-6.04 hace.@6.04-6.32
- **c07**: y@0.76-1.48 su@1.48-1.66 dios@1.66-2.02 va@2.02-2.16 a@2.16-2.22 bajar@2.22-2.52 a@2.52-2.60 defenderlo?@2.60-3.26 Aquí@4.42-4.82 lo@4.82-5.00 espero,@5.00-5.38 Padresito.@5.78-6.40
- **c08**: Hey@1.32-1.84 Rufino,@1.84-2.30 ya@2.98-3.10 se@3.10-3.22 va@3.22-3.34 el@3.34-3.42 padre.@3.42-3.68 Seguro@4.40-4.86 va@4.86-5.00 a@5.00-5.06 pedir@5.06-5.26 ayuda.@5.26-5.64
- **c09**: ¿Qué@0.94-1.46 pasó,@1.46-1.88 Padresito?@2.04-2.66 ¿Le@4.06-4.22 va@4.22-4.36 a@4.36-4.42 marcar@4.42-4.74 a@4.74-4.88 Dios?@4.88-5.08
- **c10**: Ramiro,@0.00-1.72 soy@2.00-2.12 Anselmo.@2.12-2.64 Necesito@3.64-4.24 tu@4.24-4.36 ayuda.@4.36-4.62
- **c11**: ¿Qué@1.40-2.04 pasó@2.04-2.34 padre?@2.34-2.62 ¿Está@2.96-3.08 bien?@3.08-3.30 ¿Quiénes@4.96-5.60 son?@5.60-5.78
- **c12**: Se@0.00-1.06 metieron@1.06-1.42 seis@1.42-1.64 motociclistas@1.64-2.48 a@2.48-2.56 la@2.56-2.64 parroquia.@2.64-3.20 Me@3.96-4.00 apagaron@4.00-4.38 las@4.38-4.52 veladoras@4.52-5.04 y@5.04-5.14 se@5.14-5.26 burlaron@5.26-5.68 de@5.68-5.80 mí.@5.80-5.96 Les@6.86-6.96 dicen@6.96-7.24 los@7.24-7.40 víboras,@7.40-8.00 el@8.46-8.52 que@8.52-8.62 mandes@8.62-8.94 rufino.@8.94-9.34
- **c13**: Ese@1.22-1.78 hombre@1.78-2.02 acaba@2.02-2.26 de@2.26-2.48 cometer@2.48-2.84 un@2.84-2.98 grave@2.98-3.20 error.@3.20-3.48 Voy@4.06-4.22 en@4.22-4.38 camino,@4.38-4.68 padre.@4.82-4.98 Mauro,@6.22-6.78 prepara@7.16-7.44 las@7.44-7.60 camionetas.@7.60-8.06
- **c14**: Miren@0.82-1.46 quién@1.46-1.72 volvió.@1.72-2.34 ¿Qué@3.36-3.60 pasó,@3.60-3.92 Padresito?@4.04-4.56 ¿Ya@5.24-5.32 viene@5.32-5.52 Dios@5.52-5.80 a@5.80-5.94 salvarlo?@5.94-6.48
- **c15**: Les@0.00-1.44 recomiendo@1.44-2.02 que@2.02-2.18 se@2.18-2.34 vayan.@2.34-2.72 Todavía@4.52-4.92 están@4.92-5.22 a@5.22-5.34 tiempo.@5.34-5.62
- **c16**: Me@0.98-1.66 está@1.66-1.88 amenazando,@1.88-2.58 padrecito.@2.68-3.28 De@4.64-4.72 aquí@4.72-4.96 no@4.96-5.18 nos@5.18-5.36 movemos.@5.36-6.02
- **c17**: Patrón,@1.62-2.14 ¿qué@2.48-2.58 tan@2.58-2.78 cercano@2.78-3.24 es@3.24-3.38 usted@3.38-3.62 al@3.62-3.80 padre?@3.80-4.06 Desde@5.02-5.30 cuándo@5.30-5.66 lo@5.66-5.76 conoce.@5.76-6.18
- **c18**: Anselmo@1.60-2.00 no@2.00-2.16 es@2.16-2.30 nada@2.30-2.46 más@2.46-2.76 un@2.76-2.92 cura.@2.92-3.98 Es@4.54-4.94 como@4.94-5.14 un@5.14-5.30 hermano@5.30-5.78 para@5.78-5.96 mí.@5.96-6.16
- **c19**: Hace@0.00-0.52 veinte@0.52-0.86 años@0.86-1.16 mi@1.16-1.36 familia@1.36-1.74 se@1.74-1.92 quedó@1.92-2.20 sin@2.20-2.32 nada,@2.32-2.62 todos@3.42-3.96 nos@3.96-4.22 dieron@4.22-4.44 la@4.44-4.60 espalda.@4.60-5.16 Anselmo@6.54-7.10 fue@7.10-7.66 el@7.66-7.78 único@7.78-8.04 que@8.04-8.26 no@8.26-8.40 se@8.40-8.54 fue.@8.54-8.74
- **c20**: Y@0.00-0.66 entonces,@0.66-1.04 padrecito,@1.24-1.80 ¿a@3.38-3.58 quién@3.58-3.72 le@3.72-3.88 marcó?@3.88-4.26 Que@5.40-5.54 me@5.54-5.70 conoce,@5.70-6.16 aquí@6.74-6.92 no@6.92-7.06 viene@7.06-7.24 nadie@7.24-7.50 a@7.50-7.64 salvarlo.@7.64-8.18
- **c21**: a@0.00-1.06 alguien@1.06-1.32 que@1.32-1.52 te@1.52-1.64 conoce.@1.64-2.24 Eso@4.44-4.74 espero@4.74-5.16 por@5.16-6.04 tu@6.04-6.18 bien.@6.18-6.42
- **c22**: Ya@0.00-0.80 casi@0.80-1.08 estamos.@1.08-1.50 Que@2.64-3.22 nadie@3.22-3.52 se@3.52-3.70 adelante.@3.70-4.18 Con@4.92-5.52 Rufino@5.52-5.98 quiero@5.98-6.22 hablar@6.22-6.48 yo.@6.48-6.80
- **c23**: Rufino,@1.38-1.90 afuera@2.18-2.44 hay@2.44-2.54 cinco@2.54-2.76 camionetas.@2.76-3.38 Vienen@4.24-4.76 repletas@4.76-5.28 de@5.28-5.40 gente,@5.40-5.64 vienen@5.82-5.98 repletas@5.98-6.56 de@6.56-6.68 gente.@6.68-6.96
- **c24**: ¿Y@2.08-2.56 quién@2.56-2.76 es@2.76-2.92 ese?@2.92-3.10 ¿Usted@4.44-4.68 conoce@4.68-5.16 a@5.16-5.40 Ramiro@5.40-5.86 Salcedo?@5.86-6.38
- **c25**: Es@0.00-1.42 Ramiro@1.42-1.80 Salcedo.@1.80-2.50 Lo@3.50-4.30 conozco@4.30-4.78 desde@4.78-4.96 hace@4.96-5.30 muchos@5.30-5.66 años.@5.66-6.08
- **c26**: usted@0.82-1.54 se@1.54-1.82 quedan@1.82-2.16 aquí@2.16-2.34 afuera.@2.34-2.72 A@4.46-4.84 Rufino@4.84-5.30 lo@5.30-5.62 atiendo@5.62-5.98 yo@5.98-6.14 solo.@6.14-6.44
- **c27**: Así@0.74-1.30 que@1.30-1.50 tú@1.50-1.66 eres@1.66-1.86 rufino,@1.86-2.30 tú@3.14-3.62 le@3.62-3.76 apagaste@3.76-4.22 las@4.22-4.42 veladoras@4.42-4.96 al@4.96-5.08 padre,@5.08-5.36 y@6.20-6.54 también@6.54-6.76 te@6.76-6.94 burlaste@6.94-7.38 de@7.38-7.56 él.@7.56-7.72
- **c28**: Sí,@0.00-0.84 señor.@0.96-1.08 Sí,@2.32-2.66 fui@2.70-2.84 yo.@2.84-3.06 Sí.@4.32-4.64
- **c29**: 6@1.04-1.76 hombres@1.76-2.20 contra@2.20-2.56 un@2.56-2.74 cura.@2.74-3.56 A@4.28-4.64 ver,@4.64-4.82 repíteme@5.10-5.48 en@5.48-5.64 la@5.64-5.76 cara@5.76-6.06
- **c30**: Yo@0.00-0.76 no@0.76-0.90 le@0.90-1.02 dije@1.02-1.20 nada,@1.20-1.50 señor.@1.58-1.82 El@2.70-2.78 padre@2.78-3.02 entendió@3.02-3.48 mal.@3.48-3.72 Le@4.78-4.92 pregunté@4.92-5.40 si@5.40-5.50 su@5.50-5.68 dios@5.68-5.96 iba@5.96-6.14 a@6.14-6.36 bajar@6.36-6.50 a@6.50-6.56 defenderlo@6.56-7.22 y@7.94-8.38 me@8.38-8.54 burlé@8.54-8.86 de@8.86-9.02 él.@9.02-9.22
- **c31**: ¿Me@0.00-0.36 estás@0.36-0.58 diciendo@0.58-1.04 que@1.04-1.32 el@1.32-1.46 padre@1.46-1.72 miente?@1.72-2.26 Ahora@3.60-3.90 míralo@3.90-4.34 a@4.34-4.42 la@4.42-4.50 cara@4.50-4.82 y@5.58-6.30 pídele@6.30-6.70 perdón.@6.70-7.14
- **c32**: Perdóneme,@0.94-1.62 padre.@1.96-1.96 No@3.26-3.60 sabía@3.60-3.90 lo@3.90-4.04 que@4.04-4.16 hacía.@4.16-4.44
- **c33**: Con@0.00-0.34 el@0.34-0.48 padre@0.48-0.72 Anselmo@0.72-1.28 nadie@1.28-1.56 se@1.56-1.78 mete.@1.78-2.06 Vas@2.92-3.28 a@3.28-3.42 aprender@3.42-3.70 una@3.70-4.10 por@4.10-4.34 una@4.34-4.52 las@4.52-4.70 veladoras@4.70-5.24 que@5.24-5.36 apagaste.@5.36-5.92 Y@6.80-7.14 el@7.14-7.24 domingo@7.24-7.58 te@7.58-7.74 quiero@7.74-7.96 aquí,@7.96-8.22 en@8.58-8.68 primera@8.68-8.98 fila.@8.98-9.38
- **c34**: ¿Ustedes@0.62-1.10 creen@1.10-1.32 que@1.32-1.44 Rufino@1.44-1.84 va@1.84-1.98 a@1.98-2.02 venir@2.02-2.20 el@2.20-2.36 domingo?@2.36-2.76 Denle@4.28-4.72 me@4.72-4.86 gusta@4.86-5.14 y@5.14-5.38 compartan@5.38-6.02 para@6.02-6.22 ver@6.22-6.46 la@6.46-6.62 segunda@6.62-7.00 parte.@7.00-7.44
- **r1**: Subtítulos@3.94-5.34 realizados@5.34-5.34 por@5.34-5.34 la@5.34-5.34 comunidad@5.34-5.34 de@5.34-5.34 Amara@5.34-5.34 .org@5.34-5.34
- **r2**: (vacío)
