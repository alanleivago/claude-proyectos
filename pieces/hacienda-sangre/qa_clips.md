# QA clips — hacienda-sangre (2026-11-04)

Método: hoja de contactos a 2 fps por clip (scratchpad `qa_hs/`) + faster-whisper small (es, word timestamps); dudosos re-escuchados con medium (c02, c03, c06, c07, c09, c14, c17, c22, c25, c27).
Pronunciación: "Cárdenas" bien (c09, c25), "Isauro" bien (c09 "Don Isauro", c14 "abuelo Isauro"; small oye "y Zauro", medium oye bien), "heredó" bien (c09). "herede" en c06 bien (medium: "no quiero que herede ni un metro").
Sin morphs ni personajes que aparezcan de golpe en ningún clip de esta pieza.

## Veredicto por clip

- **c01** OK.
- **c02** OK. Repite "Yo soy el mismo, yo soy el mismo de siempre" (3.7–6.3), suena a repetición expresiva; aceptable. Si se quiere la frase limpia: usar 0.0–2.6 + 4.95–8.0 (salto en el corte).
- **c03** OK de imagen. Posible tartamudeo "de esta, de esta hacienda" a 5.3–6.1 (small lo oye, medium no): escuchar. Ver lista opcional.
- **c04** OK.
- **c05** OK (la voz empieza en 0.0 con "Y tú…", no está cortada).
- **c06** OK.
- **c07** OK. "La hacienda… la hacienda no está a su nombre" (4.5–6.9), repetición con pausa dramática; aceptable.
- **c08** OK.
- **c09** OK. "Don Isauro", "heredó", "Mateo Cárdenas" bien dichos.
- **r1** OK. Es la escena correcta (Octavio de perfil en el bufete), sin cruce con el retén. Sin diálogo.
- **c10** OK.
- **c11** **CRUCE CON EL OTRO PROYECTO**: es el retén militar (comandante en camuflaje con bigote y aviadores, troca roja, mujer con sombrero) todo el clip, y dice "Los papeles no me interesan… Bonito reloj". → REGENERAR.
- **c12** **CRUCE CON EL OTRO PROYECTO**: soldado en camuflaje con radio en el retén todo el clip, dice "Comandante, ya vamos llegando". → REGENERAR.
- **c13** OK ("Ya escuchaste" lo oye small como "Y escuchaste").
- **c14** Mateo (de espaldas, en primer plano a la derecha) lleva **camisa crema** en vez de la chamarra verde, todo el clip (0–10 s). Además el San Isidro es un santo de pie **sin el arado ni los bueyes** de PROP_SANISIDRO, y no casa con c15/c33, donde sí los lleva. Audio OK. No se arregla recortando. → REGENERAR.
- **c15** OK. San Isidro con arado y bueyes, como la hoja.
- **c16** OK. Detalle menor: hacia 4.5 s aparece una segunda taza blanca sobre la mesa al fondo a la derecha.
- **c17** OK (medium: "si ni yo sabía dónde iba", falta el "a"; aceptable).
- **c18** OK.
- **c19** OK.
- **c20** OK.
- **c21** OK de audio. En 0.0–~2.0 s se ve **la maleta abierta sobre la cama**, y en c19 la cama ya está vacía (fallo de continuidad). Sale de cuadro con el push-in hacia 2 s, pero la línea empieza en 0.74. Ver lista opcional.
- **r2** OK. Sin diálogo (lo que oye whisper en 4.6 s es alucinación sobre el silencio, media de −42 dB).
- **c22** OK (medium: "Eso lo va a saber Mateo primero").
- **c23** OK.
- **c24** OK. El banco es otro decorado (vestíbulo con ventanas en arco, sin el mostrador de mármol de c23/c25). Ver lista opcional.
- **c25** OK. "Mateo Cárdenas" bien dicho. Quintero coincide con la hoja.
- **r3** OK. Sin diálogo ("¡Suscríbete!" es alucinación de whisper en el silencio).
- **c26** **SUBTÍTULOS QUEMADOS** en el centro del cuadro: "Eso no puede ser." de ~0.5 a ~2.0 s y "Yo puse esa tierra de garantía en todos mis créditos." de ~3.0 a ~6.0 s, encima de todo el diálogo (0.0–6.1). No se puede recortar. → REGENERAR.
- **c27** (intento sin imagen de referencia) **Quintero no coincide**: cara más ancha, sombra de barba y cejas gruesas. En la hoja y en c23/c25 sale lampiño y de cara fina. El traje y la corbata sí coinciden. Además dice **otra variante**: "Por eso le hablo, don Octavio. / Sus créditos vencen este viernes. / Y la garantía ya no es suya." Tiene el mismo sentido, pero no es la del prompt ni la variante aceptada. El banco también es otro (ventanas en arco, beige). → REGENERAR (el audio serviría si se acepta la cara).
- **c28** OK.
- **c29** OK (camisa gris en vez de azul clara, menor).
- **c30** **Octavio no coincide**: pelo canoso más oscuro, piel más morena, otra cara. Salta al cortar desde c28, que es el mismo plano. Audio OK. → REGENERAR.
- **c31** OK.
- **c32** OK. Sin diálogo, termina con media sonrisa.
- **c33** OK.

## Recortes
Ningún fallo grave se arregla recortando. Solo opcional: c02 → 0.0–2.6 + 4.95–8.0 si se quiere quitar el "yo soy el mismo" repetido.

## REGENERAR
**c11, c12, c14, c26, c27, c30**
- c11, c12: cruzados con el proyecto del retén (soldados en camuflaje, otras líneas).
- c14: Mateo con camisa crema y San Isidro sin arado ni bueyes.
- c26: subtítulos quemados encima de todo el diálogo.
- c27: Quintero con otra cara (barba, cara ancha) y otra variante de las líneas.
- c30: Octavio con otra cara (no casa con c28).

Opcional, baja prioridad: c03 (escuchar el posible "de esta, de esta"), c21 (maleta en la cama 0–2 s, contra c19), c24 (banco con otro decorado).

## Transcripciones (faster-whisper small; palabra@inicio-fin en segundos)
Correcciones de medium: c06 "quiero querer de" = "quiero que herede"; c14 "y Zauro" = "Isauro"; c17 "¿Sin y yo" = "si ni yo"; c22 "lo vas a ver" = "lo va a saber"; c13 "Y escuchaste" = "Ya escuchaste".

- **c01**: Aquí@0.78-1.26 está@1.26-1.48 la@1.48-1.58 prueba,@1.58-1.8 Mateo.@1.92-2.32 No@3.5-3.68 eres@3.68-3.86 de@3.86-4.02 mi@4.02-4.12 sangre.@4.12-4.44 30@5.2-5.52 años@5.52-5.88 engañado@5.88-6.46 en@6.46-6.54 mi@6.54-6.64 propia@6.64-6.88 casa.@6.88-7.22
- **c02**: Papá,@1.1-1.54 yo@1.6-1.66 no@1.66-1.78 sabía@1.78-2.08 nada.@2.08-2.38 Yo@3.72-4.16 soy@4.16-4.32 el@4.32-4.48 mismo,@4.48-4.82 yo@5.04-5.24 soy@5.24-5.38 el@5.38-5.52 mismo@5.52-5.8 de@5.8-5.92 siempre.@5.92-6.26
- **c03**: No@0.92-1.52 me@1.52-1.66 digas,@1.66-1.96 papá.@2.04-2.66 Tienes@3.54-3.96 hasta@3.96-4.14 mañana@4.14-4.54 para@4.54-4.92 irte@4.92-5.32 de@5.32-5.46 esta@5.46-5.68 de@5.68-5.84 esta@5.84-6.06 hacienda.@6.06-6.5
- **c04**: Octavio,@1.74-2.3 por@2.36-2.48 favor,@2.48-2.9 él@4.02-4.48 no@4.48-4.62 tiene@4.62-4.84 la@4.84-5.04 culpa@5.04-5.34 de@5.34-5.58 nada.@5.58-5.88
- **c05**: y@0.0-0.84 tú@0.84-1.02 no@1.02-1.2 me@1.2-1.36 hables,@1.36-1.76 Teresa.@1.86-2.02 Contigo@4.22-4.68 voy@4.68-4.86 a@4.86-5.0 arreglar@5.0-5.28 cuentas@5.28-5.82 después.@5.82-6.16
- **c06**: Arturo,@0.0-1.1 quiero@1.58-1.8 a@1.8-1.96 Mateo@1.96-2.36 fuera@2.36-2.66 del@2.66-2.92 testamento.@2.92-3.58 Hoy@4.38-4.7 mismo,@4.7-5.06 no@5.52-5.68 quiero@5.68-5.92 querer@5.92-6.14 de@6.14-6.32 ni@6.32-6.46 un@6.46-6.54 metro.@6.54-6.86
- **c07**: Don@1.04-1.6 Octavio,@1.6-2.08 eso@2.48-2.6 no@2.6-2.76 se@2.76-2.9 puede.@2.9-3.18 La@4.5-4.68 hacienda,@4.68-5.08 la@5.42-5.84 hacienda@5.84-6.12 no@6.12-6.3 está@6.3-6.46 a@6.46-6.56 su@6.56-6.64 nombre.@6.64-6.94
- **c08**: ¿Cómo@0.0-0.6 que@0.6-0.8 no?@0.8-1.0 Es@2.62-3.12 mi@3.12-3.28 hacienda.@3.28-3.76 30@4.42-4.88 años@4.88-5.22 levantándola@5.22-5.98 con@5.98-6.18 mis@6.18-6.32 manos.@6.32-6.66
- **c09**: Era@0.0-0.7 de@0.7-0.84 su@0.84-0.98 suegro,@0.98-1.42 Don@1.7-1.8 Isauro,@1.8-2.3 y@2.54-3.84 en@3.84-3.96 su@3.96-4.08 testamento@4.08-4.76 se@4.76-5.52 la@5.52-5.68 heredó@5.68-6.18 a@6.18-6.66 su@6.66-6.8 nieto,@6.8-7.52 Mateo@8.32-8.86 Cárdenas.@8.86-9.44
- **r1**: (sin diálogo; whisper alucina en el silencio de r2/r3, ignorar)
- **c10**: Aquí@0.0-0.52 dice,@0.52-0.88 para@1.62-1.76 mi@1.76-1.94 nieto@1.94-2.28 Mateo,@2.28-2.98 el@3.3-3.32 que@3.32-3.46 crió@3.46-3.8 mi@3.8-3.88 Teresa.@3.88-4.24 No@5.48-5.68 dice@5.68-5.9 nada@5.9-6.18 de@6.18-6.36 sangre,@6.36-6.72 don@6.88-6.94 Octavio.@6.94-7.44
- **c11**: Los@0.0-0.58 papeles@0.58-1.04 no@1.04-1.24 me@1.24-1.34 interesan.@1.34-2.26 Bonito@5.0-5.64 reloj.@5.64-6.34
- **c12**: Comandante,@1.68-2.46 ya@2.78-2.86 vamos@2.86-3.04 llegando.@3.04-3.5
- **c13**: Y@1.06-1.62 escuchaste,@1.62-2.1 mamá,@2.22-3.6 para@3.64-4.76 él,@4.76-5.04 yo@5.4-5.68 nunca@5.68-5.88 fui@5.88-6.16 nada.@6.16-6.44
- **c14**: Toma,@0.52-1.0 era@2.04-2.22 de@2.22-2.38 tu@2.38-2.54 abuelo@2.54-2.88 y@2.88-2.98 Zauro.@2.98-3.44 Lo@4.28-4.54 cargaba@4.54-4.96 a@4.96-5.06 todas@5.06-5.22 partes.@5.22-5.8 Él@7.52-7.64 te@7.64-7.8 quería@7.8-8.12 más@8.12-8.34 que@8.34-8.52 a@8.52-8.64 nadie.@8.64-8.88
- **c15**: Mi@0.0-0.5 abuelo@0.5-0.82 decía@0.82-1.1 que@1.1-1.28 Sanicidro@1.28-1.94 cuida@1.94-2.28 el@2.28-2.36 que@2.36-2.48 siembra.@2.48-2.94 Ahora@4.62-5.2 me@5.2-5.38 toca@5.38-5.56 sembrar@5.56-5.98 en@5.98-6.12 otro@6.12-6.3 lado.@6.3-6.56
- **c16**: siéntate@1.58-2.1 muchacho@2.1-2.6 el@2.6-4.62 café@4.62-4.86 está@4.86-5.08 recién@5.08-5.52 hecho@5.52-5.8 sabía@5.8-6.52 que@6.52-6.68 ibas@6.68-6.86 a@6.86-6.98 venir@6.98-7.22
- **c17**: ¿Cómo@1.18-1.8 que@1.8-1.98 sabía,@1.98-2.34 don@2.42-2.5 Nicanor?@2.5-2.96 ¿Sin@4.1-4.68 y@4.68-4.8 yo@4.8-4.94 sabía@4.94-5.24 dónde@5.24-5.46 iba?@5.46-5.78
- **c18**: Tu@1.44-1.96 abuelo@1.96-2.32 me@2.32-2.4 lo@2.4-2.52 pidió@2.52-2.9 antes@2.9-3.16 de@3.16-3.32 morir.@3.32-4.14 Si@4.76-5.18 un@5.18-5.3 día@5.3-5.44 lo@5.44-5.62 corren,@5.62-6.04 abrele@6.5-6.84 la@6.84-6.98 puerta.@6.98-7.2 Esa@8.26-8.5 tierra@8.5-8.76 es@8.76-8.94 de@8.94-9.08 él.@9.08-9.22
- **c19**: Ya@0.86-1.42 se@1.42-1.56 fue?@1.56-1.74 Qué@3.5-3.72 bueno.@3.72-4.02 Uno@5.36-5.58 menos@5.58-5.92 en@5.92-6.14 esta@6.14-6.36 casa.@6.36-6.64
- **c20**: Te@0.0-0.76 lo@0.76-0.9 advirtió@0.9-1.34 mi@1.34-1.48 papá,@1.48-2.0 que@3.02-3.26 tu@3.26-3.42 soberbia@3.42-4.1 te@4.1-4.66 iba@4.66-4.82 a@4.82-4.94 costar@4.94-5.26 caro.@5.26-5.74
- **c21**: Me@0.74-1.38 vas@1.38-1.62 a@1.62-1.74 decir@1.74-2.14 quién@2.14-2.46 es@2.46-2.7 el@2.7-2.82 padre?@2.82-3.14 Tengo@4.44-5.08 derecho@5.08-5.4 a@5.4-5.62 saberlo.@5.62-6.14
- **r2**: (sin diálogo; whisper alucina en el silencio de r2/r3, ignorar)
- **c22**: Eso@0.0-1.44 lo@1.44-1.62 vas@1.62-1.78 a@1.78-1.94 ver@1.94-2.08 Mateo@2.08-2.54 primero.@2.54-2.94 Tú@4.0-4.66 perdiste@4.66-5.18 ese@5.18-5.4 derecho@5.4-5.82 hoy@5.82-6.28 en@6.28-6.4 la@6.4-6.48 mañana.@6.48-6.8
- **c23**: Don@0.0-0.94 Octavio,@0.94-1.38 revise@1.86-2.2 los@2.2-2.42 papeles@2.42-2.78 de@2.78-2.9 la@2.9-3.02 hacienda.@3.02-3.38 No@4.32-4.9 podemos@4.9-5.22 darle@5.22-5.46 el@5.46-5.66 préstamo.@5.66-6.04
- **c24**: como@0.86-1.46 que@1.46-1.64 no@1.64-1.84 tengo@1.84-2.48 20@2.48-2.84 años@2.84-3.08 con@3.08-3.32 ustedes@3.32-3.66 esa@3.66-4.94 tierra@4.94-5.34 vale@5.34-5.98 el@5.98-6.12 triple@6.12-6.46 de@6.46-6.64 lo@6.64-6.76 que@6.76-6.88 pido@6.88-7.18
- **c25**: La@0.0-1.34 propiedad@1.34-1.82 está@1.82-2.1 a@2.1-2.2 nombre@2.2-2.46 de@2.46-2.64 Mateo@2.64-3.06 Cárdenas.@3.06-3.7 Desde@4.74-5.3 hoy,@5.3-5.64 nada@6.32-6.6 se@6.6-6.84 mueve@6.84-7.14 sin@7.14-7.3 su@7.3-7.46 firma.@7.46-7.84
- **r3**: (sin diálogo; whisper alucina en el silencio de r2/r3, ignorar)
- **c26**: Eso@0.0-1.0 no@1.0-1.18 puede@1.18-1.36 ser.@1.36-1.78 Yo@2.62-3.1 puse@3.1-3.44 esa@3.44-3.66 tierra@3.66-4.0 de@4.0-4.18 garantía@4.18-4.74 en@4.74-4.88 todos@4.88-5.18 mis@5.18-5.46 créditos.@5.46-6.1
- **c27**: Por@0.0-0.76 eso@0.76-0.96 le@0.96-1.12 hablo,@1.12-1.4 don@1.46-1.54 Octavio.@1.54-2.02 Sus@3.38-3.6 créditos@3.6-4.12 vencen@4.12-4.52 este@4.52-4.76 viernes.@4.76-5.22 Y@6.38-7.04 la@7.04-7.14 garantía@7.14-7.74 ya@7.74-8.14 no@8.14-8.28 es@8.28-8.4 suya.@8.4-8.7
- **c28**: donde@0.0-0.98 está@0.98-1.26 Mateo,@1.26-1.7 Nicanor?@1.76-2.2 Sé@3.7-4.04 que@4.04-4.18 está@4.18-4.36 aquí.@4.36-4.64
- **c29**: Buenos@0.0-1.38 días@1.38-1.8 don@1.8-2.04 Octavio,@2.04-2.68 aquí@3.92-4.32 no@4.32-4.5 entra@4.5-4.76 nadie@4.76-5.16 sin@5.16-5.66 pedir@5.66-5.98 permiso.@5.98-6.56
- **c30**: Esa@1.16-1.9 hacienda@1.9-2.32 es@2.32-2.46 mía.@2.46-2.84 Dile@4.64-5.0 que@5.0-5.2 venga@5.2-5.54 a@5.54-5.8 hablar@5.8-6.02 conmigo.@6.02-6.52
- **c31**: Ya@0.0-0.9 no@0.9-1.08 es@1.08-1.24 suya,@1.24-1.58 don@1.58-1.74 Octavio.@1.74-2.28 Ahora@3.52-3.84 usted@3.84-4.28 es@4.28-5.3 el@5.3-5.44 que@5.44-5.54 va@5.54-5.68 a@5.68-5.74 tocar@5.74-5.92 la@5.92-6.16 puerta.@6.16-6.4
- **c32**: (sin diálogo; whisper alucina en el silencio de r2/r3, ignorar)
- **c33**: ¿Ustedes@1.14-1.74 perdonarían@1.74-2.34 a@2.34-2.46 don@2.46-2.54 Octavio?@2.54-3.04 Denle@4.44-4.74 me@4.74-4.88 gusta@4.88-5.16 y@5.16-5.42 compartan@5.42-6.04 para@6.04-6.28 ver@6.28-6.48 la@6.48-6.6 segunda@6.6-6.9 parte.@6.9-7.28

## Revisión 2 (regenerados: c11, c12, c14, c26, c27, c30)

Método igual que arriba: hoja de contactos a 2 fps (scratchpad `qa_hs/r2/`) y recortes a tamaño completo de las caras dudosas. El audio se pasó a wav de 16 kHz mono con ffmpeg y luego se transcribió con faster-whisper small y medium (es, tiempos por palabra).
Ninguno trae nada del proyecto del retén. No hay morphs, texto quemado ni líneas inventadas o repetidas.

- **c11** OK. Primer plano de Octavio en el bufete (libreros, papeles en la mesa) que empuja hacia la cara. Cara y traje como en la hoja. Dice las 2 líneas del prompt.
- **c12** OK. Teresa llora en la recámara (crucifijo, cabecera tallada), con el hombro verde olivo de Mateo en primer plano. La blusa azul y la cara coinciden con la hoja. Dice las 2 líneas del prompt.
- **c14** OK. Mateo lleva la chamarra de pana verde olivo sobre la playera azul marino, como en la hoja, todo el clip. El San Isidro es el labrador con arado y dos bueyes de PROP_SANISIDRO. Teresa coincide con su hoja. "abuelo Isauro" se oye bien (small oye "y Zauro"; medium, "Isauro").
- **c26** OK. **Ya no tiene subtítulos**: el cuadro está limpio a 1.2 y 4.5 s. Octavio coincide con la hoja y tiene la mano en el mostrador de mármol. El banco tiene ventanas en arco, como c24. Medium se salta "Eso no puede ser" (0.0–1.7), pero small la oye y se ve la boca moviéndose.
- **c27** OK. Quintero coincide con la hoja: lampiño, cara fina, traje gris pizarra, corbata azul clara y pin. Las manos están juntas sobre el mostrador de mármol. Dice **las 3 líneas exactas del prompt** ("Su plazo termina este viernes. / Y el terreno ya no está a su nombre."). La voz arranca hacia 0.7 s.
- **c30** OK. Octavio coincide con la hoja y con c28: pelo y bigote canosos, traje café oscuro de tres piezas, corbata vino. Comparé la cara de cerca a 0.5, 2.0, 4.5 y 7.0 s. Está en la pickup negra frente al corral del ranchito y hace el gesto por la ventana. Dice las 2 líneas del prompt. La voz termina a 5.8 s y el resto es reacción en silencio.

### Transcripciones R2 (small; correcciones de medium entre paréntesis)
- **c11**: Don@1.32-2.16 Isauro@2.16-2.68 sabía@2.68-3.12 algo.@3.12-3.50 ¿Y@4.70-5.42 nadie@5.42-5.78 me@5.78-5.96 avisó?@5.96-6.36
- **c12**: No@1.16-1.88 te@1.88-2.06 vayas@2.06-2.44 así,@2.44-2.78 mi@2.88-3.00 amor.@3.00-3.36 Esta@5.00-5.54 también@5.54-5.98 es@5.98-6.22 tu@6.22-6.32 casa.@6.32-6.68
- **c14**: Toma,@0.54-1.02 era@2.04-2.24 de@2.24-2.38 tu@2.38-2.52 abuelo@2.52-2.86 y@2.86-2.96 Zauro.@2.96-3.36 Lo@4.58-5.02 cargaba@5.02-5.42 a@5.42-5.52 todas@5.52-5.66 partes.@5.66-6.22 Él@6.92-7.02 te@7.02-7.16 quería@7.16-7.44 más@7.44-7.68 que@7.68-7.84 a@7.84-7.94 nadie.@7.94-8.16 (medium: "Isauro"@2.94-3.80)
- **c26**: Eso@0.00-0.98 no@0.98-1.16 puede@1.16-1.34 ser.@1.34-1.68 Yo@2.72-3.00 puse@3.00-3.34 esa@3.34-3.56 tierra@3.56-3.92 de@3.92-4.08 garantía@4.08-4.70 en@4.70-4.82 todos@4.82-5.06 mis@5.06-5.34 créditos.@5.34-5.96
- **c27**: Por@0.00-1.04 eso@1.04-1.26 le@1.26-1.42 hablo,@1.42-1.70 don@1.76-1.82 Octavio.@1.82-2.32 Su@3.48-3.62 plazo@3.62-3.94 termina@3.94-4.38 este@4.38-4.60 viernes,@4.60-5.04 y@5.74-6.30 el@6.30-6.42 terreno@6.42-6.86 ya@6.86-7.38 no@7.38-7.50 está@7.50-7.70 a@7.70-7.80 su@7.80-7.88 nombre.@7.88-8.16 (medium: "Por"@0.68)
- **c30**: Esa@0.80-1.54 hacienda@1.54-2.02 es@2.02-2.20 mía.@2.20-2.94 Dile@2.94-4.30 que@4.30-4.50 venga@4.50-4.76 a@4.76-4.86 hablar@4.86-5.02 conmigo.@5.02-5.56 (medium: "mía"@2.34-3.98, "Dile"@4.30)

### REGENERAR2
**Ninguno.** Los 6 regenerados pasan y no hace falta recortar nada.
