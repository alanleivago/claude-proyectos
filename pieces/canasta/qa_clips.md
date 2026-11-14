# QA clips — canasta (La Canasta · Parte 1) (2026-11-04)

Método: los 36 clips de CLIPS (c01–c34, r1, r2) estaban en `clips/`; no faltaba ninguno. Hice una hoja de contactos a 2 fps por clip (scratchpad `qa_can/`) y recortes ampliados (c03 1.5–2.8 s y su fondo, c08 0–0.7 s, c12 6–8 s, c18 6.5–8 s, c28 cara de Refugio, r1 0–1.3 s). Transcribí todo con faster-whisper small y medium (es, tiempos por palabra; wav 16 kHz hecho con ffmpeg y cargado con numpy) y medí el volumen de c34, r1 y c33.
Pronunciación: "Refugio", "Eusebio", "Horacio", "Federico", "paquetitos", "vergüenza", "comprándole", "desconocida" y "acuérdate" se oyen bien. Whisper escribe "nomás" como "No más" y "mandamás" como "manda más", que es lo esperado.
Ropa: Horacio (traje negro, camisa blanca, corbata azul rey, sin barba), Maribel (blusa rosa, pantalón negro, gafete azul), Eusebio (camisa azul claro, pantalón azul marino, bigote canoso) y Federico (traje gris oxford, camisa gris sin corbata, barba corta) se mantienen en todos sus clips. Revisé los pantalones en los planos de cuerpo entero (c03, c06, c18, c19, c24, c27, c28, r1, r2, c32). Refugio lleva cárdigan mostaza, blusa blanca y falda azul marino en todos los clips menos en **c28, donde aparece con un gafete azul de empleada**. La canasta de mimbre con chicles es la misma en todos. No hay texto quemado: solo letreros verdes de salida en la pared del vestíbulo, que son parte del set. No hay contacto brusco: el brazo de c19/c21 y el abrazo de r1 son suaves. **Sí hay un dedo acusador en c18.**

## Veredicto por clip

- **c01** OK. Refugio de espaldas y desenfocada a la derecha, igual que en su hoja. La voz empieza en 1.04 s; para que hable desde el frame 0, usar desde 0.9 s.
- **c02** OK. Horacio en el borde izquierdo.
- **c03** OK, con un aviso: **hay un corte interno a ~2.1 s** con cambio de eje (en el primer plano Maribel está a la izquierda y Horacio a la derecha; en el segundo, al revés). Cae justo entre "¿qué haces comprándole?" (termina en 2.04) y "Si le compras hoy" (empieza en 2.62), así que se puede usar como dos planos o cortar ahí. Refugio aparece al fondo en los dos planos (verificado con ampliación) y es una sola persona.
- **c04** OK. Horacio en el borde izquierdo.
- **c05** OK. Horacio está solo.
- **c06** OK. Maribel de cuerpo entero (pantalón negro y flats) y Refugio de espaldas con la falda azul marino.
- **c07** OK. El hombro de Maribel sale en el borde izquierdo durante 0–0.5 s.
- **c08** OK. Maribel empieza de perfil y gira la cabeza hacia la cámara en 0.3 s; es un giro natural, no un morph.
- **c09** OK. Horacio está solo, con el celular y la carpeta.
- **c10** OK. Maribel en el borde izquierdo.
- **c11** OK. Refugio en el borde derecho.
- **c12** OK si se recorta: **a los ~7.2 s, Refugio (a la derecha, de espaldas) se convierte en una mujer joven de pelo negro**. El diálogo termina en 6.48 s. **Usar 0–7.0 s.**
- **c13** OK. Horacio en el borde izquierdo y Refugio a la derecha con la canasta.
- **c14** OK. Maribel de espaldas en primer plano, con la coleta y la blusa rosa.
- **c15** OK. El vestíbulo es distinto (ventiladores de techo y letreros rojos de extintor), pero es un primer plano y se acepta. Horacio en el borde izquierdo.
- **c16** OK. Refugio de espaldas a la derecha.
- **c17** OK. Horacio en el borde izquierdo.
- **c18** **Dedo acusador**: de 4 a 6 s Horacio señala con el dedo índice, justo mientras dice "Acompañe a la señora" (3.5–5.9 s). Rompe la política "sin dedo acusador" y no se puede recortar. → REGENERAR.
- **c19** OK. Eusebio le ofrece el brazo con suavidad. Los dos salen de cuerpo entero y la ropa coincide con sus hojas.
- **c20** OK. Eusebio en el borde derecho.
- **c21** OK. Eusebio en el borde izquierdo, con el brazo enlazado.
- **c22** OK. Refugio en el borde derecho.
- **c23** OK. Horacio en el borde izquierdo de 0 a ~2 s.
- **c24** OK. Maribel sale de las puertas con el vaso y se lo da a Refugio con suavidad.
- **c25** OK. Maribel de espaldas en el borde derecho.
- **c26** OK. Horacio en el borde izquierdo.
- **c27** OK. Horacio levanta la mano abierta, sin señalar. Eusebio está a su lado.
- **c28** **Refugio lleva un gafete azul con credencial** (el de Maribel) durante todo el clip. En su hoja no lo lleva y en ningún otro clip tampoco. → REGENERAR.
- **r1** OK si se recorta: en 0–0.3 s se ve un brazo oscuro en el borde izquierdo antes de que entre Federico. **Usar desde 0.4 s.** La maleta es negra con rueditas (el prompt dice gris oscuro), lo cual se acepta. La salita coincide con LOC_SALITA (ventana de arco).
- **c29** OK. Refugio en el borde izquierdo con la canasta. Entre "Mamá" (0.68–1.10) y "ya estoy en casa" (2.22) hay una pausa larga; se puede cerrar en el montaje.
- **c30** OK, con un aviso de set: el fondo tiene ventanas rectangulares con cortinas, no la ventana de arco de LOC_SALITA que sale en r1, c29 y c34. Como el fondo está desenfocado, se acepta. Federico en el borde derecho.
- **r2** OK. Federico, Refugio y Horacio, una sola vez cada uno. La lluvia es ligera y el suelo está mojado.
- **c31** OK. Refugio de espaldas a la derecha, con la canasta.
- **c32** OK. Horacio en el borde izquierdo y Refugio al fondo con su ropa.
- **c33** OK. Federico en el borde derecho. La sorpresa crece sin morph.
- **c34** (CTA) **Mudo y quieto**: el audio está en silencio digital (−91 dB de media) y Refugio está de pie, inmóvil, sin hablar y sin gesticular. Falta el CTA completo. → REGENERAR.

## Recortes (no hace falta regenerar)
- c12 → usar 0–7.0 s (antes del morph de Refugio).
- r1 → usar desde 0.4 s (quita el brazo del borde).
- c01 → usar desde 0.9 s (la voz empieza en 1.04 s).
- c03 → corte interno a 2.1 s, entre las dos frases; usarlo como dos planos.
- c15 y c30 → avisos de set (otro vestíbulo / otras ventanas); se aceptan.

## REGENERAR
**c18, c28, c34**. Moví los mp4 a `clips/old/` y corregí sus prompts en `clips.py` (`python -I clips.py c18 c28 c34`); el archivo carga y tiene 36 clips.
- c18: dedo acusador. Ahora dice "calmly shows the way out with an open palm, fingers together, his hand kept low; he never points a finger at anyone". Refugio en el borde: "@{REFUGIO} … seen from behind and blurred in the foreground (only her grey low bun and mustard-yellow cardigan visible)". Lleva las anclas de Horacio, Eusebio y Refugio, y "No other people".
- c28: gafete en Refugio. Ahora dice "Refugio wears no lanyard and no ID card, only her mustard-yellow cardigan over her white blouse exactly as in her reference sheet; only Maribel and Eusebio wear lanyards". Lleva las anclas de Refugio, Maribel y Eusebio, y "No other people".
- c34: CTA mudo. Ahora dice "alone, looking straight into the camera and talking to the viewer from the very first second… her lips moving clearly; while she speaks she nods, tilts her head, smiles and gestures with one open hand toward her wicker basket". Las líneas no cambian (no hubo fallo de pronunciación). Lleva el ancla de Refugio y "No other people".

## Transcripciones (faster-whisper small; palabra@inicio-fin en segundos)
Medium coincide con small en el texto de los 36 clips. Las diferencias son solo de ortografía: "Nomás" en c09 y "mandamás" en c08. En c18 medium oye "acompaña a la señora" y small "Acompáñala, señora" (el clip se regenera de todos modos). c33 "¿Sumamá?" = "¿Su… mamá?" (medium: "¿Su mamá?"). c34, r1 y r2 no tienen diálogo; en c34 eso es el fallo.

- **c01**: ¿Quién@1.04-1.54 metió@1.54-1.82 aquí@1.82-2.00 a@2.00-2.12 esta@2.12-2.28 señora?@2.28-2.62 Aquí@4.26-4.44 no@4.44-4.58 más@4.58-4.76 entra@4.76-4.98 gente@4.98-5.28 importante.@5.28-5.92 Agarre@7.24-7.74 su@7.74-7.94 canasta@7.94-8.36 y@8.36-8.58 salga@8.58-8.94 de@8.94-9.02 aquí.@9.02-9.24
- **c02**: Yo@0.00-0.68 no@0.68-0.82 vengo@0.82-1.06 a@1.06-1.16 pedir@1.16-1.36 nada,@1.36-1.74 señor.@1.82-2.10 Vendo@3.06-3.36 mis@3.36-3.56 chicles,@3.56-4.06 no@4.56-4.76 ando@4.76-4.96 pidiendo@4.96-5.38 limosna.@5.38-6.00 No@6.88-7.28 tiene@7.28-7.48 por@7.48-7.68 qué@7.68-7.82 hablarme@7.82-8.24 así.@8.24-8.48
- **c03**: Maribel,@0.00-0.66 ¿qué@1.16-1.26 haces@1.26-1.46 comprándole?@1.46-2.04 Si@2.62-2.72 le@2.72-2.86 compras@2.86-3.22 hoy,@3.22-3.48 mañana@4.00-4.26 tenemos@4.26-4.70 aquí@4.70-5.02 a@5.02-5.16 todo@5.16-5.38 el@5.38-5.54 mercado.@5.54-5.88
- **c04**: No@1.38-2.02 más@2.02-2.18 fueron@2.18-2.40 dos@2.40-2.64 paquetitos@2.64-3.34 licenciado.@3.34-4.00
- **c05**: Ya@0.86-1.42 mero@1.42-1.70 Horacio,@1.70-2.10 ya@2.24-2.28 mero.@2.28-2.62 En@3.60-3.90 cuanto@3.90-4.10 Federico@4.10-4.68 firme,@4.68-5.14 esta@5.42-5.58 empresa@5.58-5.86 es@5.86-6.10 mía@6.10-6.38 y@6.38-7.60 aquí@7.60-7.76 voy@7.76-7.94 a@7.94-8.06 decidir@8.06-8.52 yo@8.52-8.70 quién@8.70-8.92 entra.@8.92-9.30
- **c06**: Señora,@0.00-1.26 espérese.@1.40-1.80 Soy@2.26-2.54 Maribel.@2.54-2.98 Disculpelo.@3.62-4.26 No@5.30-5.68 todos@5.68-5.98 aquí@5.98-6.22 somos@6.22-6.50 así.@6.50-6.82
- **c07**: Gracias@0.00-1.12 muchacha@1.12-1.72 yo@1.72-2.30 soy@2.30-2.50 refugio@2.50-3.28 dime@3.28-4.40 una@4.40-4.64 cosa@4.64-5.02 ese@5.02-5.66 señor@5.66-6.04 siempre@6.04-6.38 trata@6.38-6.70 así@6.70-6.96 a@6.96-7.02 la@7.02-7.10 gente@7.10-7.40
- **c08**: Es@0.00-0.86 el@0.86-0.98 licenciado@0.98-1.44 Horacio,@1.44-1.84 el@2.00-2.06 administrador.@2.06-2.78 Desde@3.44-3.60 que@3.60-3.84 el@3.84-3.96 dueño@3.96-4.20 anda@4.20-4.42 fuera@4.42-4.66 del@4.66-4.88 país,@4.88-5.24 se@5.66-5.76 siente@5.76-6.06 el@6.06-6.20 manda@6.20-6.48 más.@6.48-6.70 Al@7.74-7.92 que@7.92-8.06 no@8.06-8.20 le@8.20-8.32 hace@8.32-8.46 caso,@8.46-8.82 lo@9.10-9.18 corre.@9.18-9.46
- **c09**: ¡Tú@0.00-0.46 tranquilo,@0.46-0.88 Federico!@0.98-1.40 ¡Tú@1.86-1.98 descansa!@1.98-2.50 No@3.82-4.00 más@4.00-4.16 fírmame@4.16-4.54 los@4.54-4.70 permisos@4.70-5.74 y@5.74-5.90 yo@5.90-6.02 me@6.02-6.12 encargo@6.12-6.48 de@6.48-6.58 todo.@6.58-6.84 Aquí@7.76-8.04 todo@8.04-8.30 está@8.30-8.52 en@8.52-8.64 orden.@8.64-8.84
- **c10**: ¿Y@1.30-1.86 no@1.86-2.00 te@2.00-2.16 da@2.16-2.30 miedo@2.30-2.64 que@2.64-2.88 te@2.88-3.06 vea@3.06-3.34 platicando@3.34-3.96 conmigo?@3.96-4.52
- **c11**: Claro@0.00-0.84 que@0.84-1.06 me@1.06-1.18 da@1.18-1.30 miedo@1.30-1.62 doña@1.62-1.92 refugio,@1.92-2.48 necesito@3.36-3.80 este@3.80-3.96 empleo,@3.96-4.88 pero@5.00-5.38 no@5.38-5.56 le@5.56-5.68 voy@5.68-5.78 a@5.78-5.92 ayudar@5.92-6.14 a@6.14-6.30 humillar@6.30-6.60 a@6.60-6.74 nadie.@6.74-7.02
- **c12**: Maribel,@1.68-2.16 aquí@2.80-2.96 se@2.96-3.10 viene@3.10-3.26 a@3.26-3.38 cumplir,@3.38-3.88 no@4.14-4.22 a@4.22-4.30 platicar.@4.30-4.92 Regrese@5.66-6.02 a@6.02-6.12 su@6.12-6.24 lugar.@6.24-6.48
- **c13**: Ya@0.00-0.74 la@0.74-0.88 atendí,@0.88-1.30 licenciado.@1.32-1.84 La@3.52-3.72 señora@3.72-4.00 no@4.00-4.30 está@4.30-4.52 molestando@4.52-5.10 a@5.10-5.22 nadie.@5.22-5.50
- **c14**: A@0.00-1.02 ver@1.02-1.12 si@1.12-1.24 te@1.24-1.36 queda@1.36-1.56 claro.@1.56-1.90 Mientras@2.92-3.28 Federico@3.28-3.78 no@3.78-3.96 esté,@3.96-4.18 aquí@4.76-5.04 mando@5.04-5.38 yo.@5.38-5.56 Y@6.62-6.84 conmigo@6.84-7.34 no@7.34-7.68 se@7.68-7.82 discute.@7.82-8.30
- **c15**: La@0.82-1.38 muchacha@1.38-1.82 ya@1.82-2.00 le@2.00-2.12 explicó@2.12-2.60 todo,@2.60-2.88 si@3.80-4.10 quiere@4.10-4.38 que@4.38-4.54 me@4.54-4.70 vaya@4.70-4.92 me@4.92-5.14 voy,@5.14-5.42 pero@6.20-6.46 no@6.46-6.64 la@6.64-6.80 amenace.@6.80-7.32
- **c16**: Ahora@1.12-1.66 también@1.66-2.00 me@2.00-2.16 va@2.16-2.28 a@2.28-2.36 decir@2.36-2.52 cómo@2.52-2.82 hacer@2.82-3.06 las@3.06-3.22 cosas.@3.22-3.50 Le@4.26-4.76 compran@4.76-5.14 dos@5.14-5.32 chicles@5.32-5.72 y@5.72-6.24 ya@6.24-6.36 se@6.36-6.48 siente@6.48-6.74 la@6.74-6.90 dueña.@6.90-7.26
- **c17**: No@0.00-1.26 necesito@1.26-1.90 que@1.90-2.04 me@2.04-2.18 compren@2.18-2.62 nada@2.62-3.02 para@3.02-3.86 que@3.86-4.02 me@4.02-4.16 respeten.@4.16-4.76
- **c18**: Don@1.08-1.80 Eusebio,@1.80-2.24 venga.@2.46-2.70 Acompáñala,@3.52-4.12 señora,@4.22-4.52 a@5.14-5.44 la@5.44-5.54 salida.@5.54-5.90
- **c19**: Venga@0.00-1.02 conmigo,@1.02-1.42 señora.@1.50-1.72 Cuidado@3.22-3.66 con@3.66-3.84 el@3.84-3.96 escalón,@3.96-4.54 si@4.82-5.22 gusta,@5.22-5.48 deme@5.74-5.90 el@5.90-6.00 brazo.@6.00-6.30
- **c20**: Le@0.94-1.42 pedí@1.42-1.70 que@1.70-1.78 la@1.78-1.92 sacara,@1.92-2.38 no@2.66-2.92 que@2.92-3.06 la@3.06-3.18 acompañara@3.18-3.68 de@3.68-3.80 paseo.@3.80-4.28 Por@5.22-5.38 eso@5.38-5.54 luego@5.54-5.76 no@5.76-5.92 se@5.92-6.04 quieren@6.04-6.30 ir.@6.30-6.54
- **c21**: Don@0.00-1.02 Eusebio@1.02-1.58 no@1.58-1.74 más@1.74-1.96 está@1.96-2.22 siendo@2.22-2.52 amable.@2.52-3.10 Ya@3.98-4.56 me@4.56-4.72 voy,@4.72-5.00 como@5.46-5.76 usted@5.76-6.04 quiere.@6.04-6.46
- **c22**: pues@0.00-1.18 apúrele@1.18-1.72 y@1.72-2.58 no@2.58-3.42 la@3.42-3.54 quiero@3.54-3.72 ver@3.72-3.92 vendiendo@3.92-4.38 nada@4.38-4.70 aquí@4.70-5.02 afuera.@5.02-5.40
- **c23**: Con@0.00-0.46 esta@0.46-0.68 canasta@0.68-1.18 he@1.18-1.32 salido@1.32-2.14 adelante@2.14-2.14 toda@2.14-2.44 mi@2.44-2.70 vida.@2.70-2.98 Nunca@3.82-4.14 me@4.14-4.28 había@4.28-4.38 dado@4.38-4.64 vergüenza@4.64-5.14 cargarla.@5.14-5.80 Hasta@6.46-6.84 hoy,@6.84-7.16 que@7.58-7.78 usted@7.78-7.96 quiso@7.96-8.34 hacérmela@8.34-8.80 sentir.@8.80-9.18
- **c24**: Doña@0.80-1.46 Refugio,@1.46-1.96 espérese.@2.16-2.62 Tómese@3.28-3.62 un@3.62-3.74 vasito@3.74-4.10 de@4.10-4.24 agua@4.24-4.44 antes@4.44-4.76 de@4.76-4.92 irse.@4.92-5.32
- **c25**: Muy@0.98-1.46 bien,@1.46-1.66 Maribel.@1.68-2.02 Cuando@3.50-3.74 me@3.74-3.94 pidas@3.94-4.16 un@4.16-4.36 permiso,@4.36-4.90 acuérdate@5.46-6.00 de@6.00-6.20 este@6.20-6.34 día.@6.34-6.58
- **c26**: La@0.00-0.70 muchacha@0.70-1.10 no@1.10-1.34 necesita@1.34-1.82 que@1.82-2.10 yo@2.10-2.26 la@2.26-2.40 defienda.@2.40-2.98 Lo@3.54-3.84 que@3.84-3.96 necesita@3.96-4.52 es@4.52-4.74 un@4.74-4.88 patrón@4.88-5.44 que@5.44-6.32 no@6.32-6.48 la@6.48-6.62 castigue@6.62-7.16 por@7.16-7.36 tener@7.36-7.62 buen@7.62-7.86 corazón.@7.86-8.38
- **c27**: Ya@0.82-1.30 estuvo,@1.30-1.60 señora.@1.64-1.86 Váyase@2.54-2.92 y@2.92-3.20 no@3.20-3.30 vuelva.@3.30-3.66 Don@4.68-4.88 Eusebio,@4.88-5.34 a@5.72-5.80 esta@5.80-5.94 señora@5.94-6.24 no@6.24-6.40 me@6.40-6.48 la@6.48-6.56 vuelve@6.56-6.80 a@6.80-6.86 pasar.@6.86-7.06
- **c28**: Gracias@1.14-1.84 Maribel,@1.84-2.38 gracias@2.68-2.98 Don@2.98-3.18 Eusebio,@3.18-3.80 una@4.38-4.78 nunca@4.78-5.14 olvida@5.14-5.66 quien@5.66-6.00 le@6.00-6.20 tendió@6.20-6.56 la@6.56-6.70 mano.@6.70-7.02
- **c29**: Mamá,@0.68-1.10 ya@2.22-2.30 estoy@2.30-2.46 en@2.46-2.62 casa.@2.62-2.88 Hoy@4.14-4.28 te@4.28-4.40 quiero@4.40-4.60 presentar@4.60-5.30 en@5.30-5.42 la@5.42-5.50 empresa@5.50-5.88 para@6.50-6.92 que@6.92-7.06 conozcan@7.06-7.54 a@7.54-7.66 la@7.66-7.76 señora@7.76-8.04 que@8.04-8.26 la@8.26-8.38 fundó.@8.38-8.74
- **c30**: Ayer@1.04-1.54 fui@1.54-1.72 con@1.72-1.92 mi@1.92-2.06 canasta@2.06-2.48 Federico.@2.48-3.20 Quería@3.90-4.34 ver@4.34-4.52 cómo@4.52-4.74 tratan@4.74-5.24 ahí@5.24-5.48 a@5.48-5.62 una@5.62-5.78 desconocida.@5.78-6.60 Hoy@7.64-7.80 quiero@7.80-8.06 que@8.06-8.20 lo@8.20-8.34 veas@8.34-8.64 tú@8.64-8.76 también.@8.76-9.08
- **c31**: Otra@1.32-2.04 vez@2.04-2.18 usted,@2.18-2.52 ayer@3.66-4.02 le@4.02-4.16 advertí@4.16-4.66 que@4.66-4.98 no@4.98-5.12 volviera.@5.12-5.52
- **c32**: ¿Así@1.94-2.42 recibes@2.42-2.82 a@2.82-2.96 mi@2.96-3.04 mamá@3.04-3.36 cuando@3.36-3.46 no@3.46-3.68 estoy?@3.68-3.92
- **c33**: ¿Sumamá?@0.00-2.52
- **c34**: (vacío)
- **r1**: (vacío)
- **r2**: (vacío)
