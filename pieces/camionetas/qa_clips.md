# QA clips — camionetas (Las Camionetas · Parte 1) (2026-11-04)

Método: los 36 clips de CLIPS (c01–c35 y r1) estaban en `clips/`; no faltaba ninguno. Hice una hoja de contactos a 2 fps por clip (scratchpad `qa_cam/`) y recortes ampliados de c02 (0–3 s, borde izquierdo), c08 (0–2 s, la bolsa), c28 (0.8–3.3 s, borde derecho), c34 (0–2.5 s, cara de Itzel) y c35 (4.5–7 s, manos). Transcribí todo con faster-whisper small y medium (es, tiempos por palabra; wav 16 kHz cargado con numpy). Comparé contra las hojas AMPARO, PAMELA, GONZALO e ITZELMORENA.
c01, c02 y c03 muestran su escena (vitrina con camionetas blancas, Amparo y Pamela); ninguno trae la hoja de personaje que corría a la vez.
**c17 está corrupto**: ffmpeg no lo puede leer ("Sample size 2023804116 is too large"; ni video ni audio).
Pronunciación: "Itzel", "doñita", "cotíceme", "seminuevos", "corporativo", "espaciosa" y "artesanías" se oyen bien. small escribe "apagarlas" en c20, pero medium oye "pagarlas", así que está bien. Whisper escribe "nomás" como "No más" en c05.
Ropa: Pamela (traje sastre rojo de falda, blusa blanca, gafete dorado, tacones negros), Gonzalo (traje azul marino, corbata verde, credencial blanca con cordón negro, reloj, sin barba) e Itzel (traje beige de pantalón, camisa blanca, gafete plateado, flats negros) se mantienen en todos sus clips. Amparo lleva sombrero café, trenza, rebozo azul, faja roja y falda negra en todos, **menos en c02, donde la figura del borde lleva un chal café**. El bordado de la blusa varía un poco entre clips (en c18 y c20 va más abajo), pero se acepta.
Camionetas: blancas en LOC_VITRINA (c01–c10, r1), plateadas/grises en LOC_EXHIBIDOR (c12–c23) y azul oscuro en LOC_AGENCIA (c24–c35). Ningún clip trae texto quemado. Contacto: Itzel le pone la mano en el brazo a Amparo con suavidad en c25 y en c29; ningún contacto es brusco.
Itzel se ve mestiza y morena, igual que en ITZELMORENA, en c24–c27 y c29–c33. No tiene rasgos asiáticos en ningún clip. **En c34 es otra mujer**: piel clara, pelo recogido y arete de perla.

## Veredicto por clip

- **c01** OK. Pamela en el borde derecho. La voz empieza en 0.70 s; para que hable desde el frame 0, usar desde 0.6 s.
- **c02** **Amparo, en el borde izquierdo, lleva un chal café en lugar del rebozo azul** (ampliado: 0–6 s). Como ella está en cuadro casi todo el clip, no se arregla recortando. → REGENERAR.
- **c03** OK. Amparo con su bolsa de palma y Pamela en el borde derecho.
- **c04** OK. Amparo de espaldas en primer plano (sombrero y rebozo azul) y Pamela de cuerpo entero junto a la camioneta blanca.
- **c05** OK. Amparo junto a la camioneta y Pamela al fondo.
- **c06** OK. Amparo de espaldas en primer plano.
- **c07** OK. Pamela en el borde derecho. La voz empieza en 1.14 s; se puede usar desde 1.0 s.
- **c08** **La bolsa cambia dentro del plano**: de 0 a 1 s Amparo sostiene una canasta clara de palma con hojas verdes, y a 1.5 s ya es la canasta café chica de su hoja. "¿De contado?" se dice de 0 a 0.9 s, así que recortar quitaría la línea. → REGENERAR.
- **c09** OK. Pamela en el borde derecho.
- **c10** OK. Pamela toca su gafete con el dedo, sin señalar a nadie. Amparo en el borde izquierdo.
- **r1** OK. Amparo de espaldas camina hacia las puertas, sin morph. La bolsa se ve más clara y lisa por la distancia, y se acepta. Whisper oye "¡Suscríbete!" a −50 dB, pero es una alucinación sobre el silencio: el clip no tiene diálogo.
- **c11** OK. Amparo sola en la jardinera con el celular.
- **c12** OK. Amparo y Gonzalo junto al escritorio y la camioneta plateada.
- **c13** OK. Amparo en el borde izquierdo. Gonzalo extiende la mano abierta.
- **c14** OK. Gonzalo en el borde derecho.
- **c15** OK. Gonzalo se recarga en la camioneta plateada y Amparo está en el borde izquierdo. Los carteles de autos que se ven al fondo son parte del set.
- **c16** OK. Gonzalo en el borde derecho. Al fondo, desenfocadas, hay camionetas blancas o plateadas; se acepta.
- **c17** **Archivo corrupto**: ffmpeg no lo puede decodificar, así que no tiene imagen ni audio utilizables. → REGENERAR (o bajarlo de nuevo de Flow si sigue allí). El prompt no cambia.
- **c18** OK. Gonzalo en el borde derecho. La voz empieza en 1.62 s; usar desde 1.5 s.
- **c19** OK, con un aviso de set: el fondo es un pasillo blanco con ventanas, sin camionetas ni escritorio. Como es un plano sobre el hombro, se acepta. Amparo de espaldas en primer plano, con sombrero, trenza y rebozo azul.
- **c20** OK. Gonzalo en el borde derecho. Dice "pagarlas" bien (según medium).
- **c21** OK. Gonzalo con la mano en el pecho, sin señalar. Amparo con la canasta en el borde izquierdo.
- **c22** OK. Gonzalo en el borde derecho. La voz empieza en 1.60 s; usar desde 1.5 s.
- **c23** OK. Amparo se va de espaldas hacia las puertas.
- **c24** OK. Itzel entra caminando a los 2 s, como pide el prompt. Camioneta azul oscuro.
- **c25** OK. Itzel le toca el brazo a Amparo con suavidad.
- **c26** OK. Amparo con la mano en la puerta de la camioneta azul y Itzel en el borde derecho.
- **c27** OK. Itzel le ofrece la llave con la mano abierta.
- **c28** **Hay dos Itzel**: de 0.8 a 3 s se ve una Itzel de beige desenfocada al fondo y, al mismo tiempo, otra en primer plano en el borde derecho. No se arregla recortando, porque la línea va de 1.64 a 3.88 s. → REGENERAR.
- **c29** OK. Itzel con la mano en el pecho y Amparo en el borde izquierdo.
- **c30** OK. Las dos, de cuerpo entero (flats negros), frente a las camionetas azul oscuro.
- **c31** OK. Itzel señala la camioneta con la mano abierta.
- **c32** OK. Itzel en el borde derecho. La voz empieza en 1.46 s; usar desde 1.4 s.
- **c33** OK. Itzel se toca el gafete. "Itzel" se oye bien.
- **c34** **Itzel no coincide con su hoja**: de 0 a 2.5 s se ve de frente y de perfil con piel clara, pelo negro recogido y arete de perla, y después sigue en el borde con esa misma cara. No tiene rasgos asiáticos, pero no es ITZELMORENA. Es la línea clave de la cita. → REGENERAR.
- **c35** (CTA) OK. Habla desde 0.00 s con carisma: se acomoda el sombrero, sonríe, asiente y hace gestos con la mano abierta. **Aviso**: de 5.2 a 5.6 s, mientras dice "compartan", hace un pulgar arriba y apunta con el índice hacia la cámara. Es amistoso, no acusador, y no se puede recortar a mitad de la frase; lo dejo, pero si la política es "nada de índice", hay que regenerarlo.

## Recortes (no hace falta regenerar)
- c01 → desde 0.6 s · c07 → desde 1.0 s · c18 → desde 1.5 s · c22 → desde 1.5 s · c32 → desde 1.4 s (la voz empieza tarde).
- c16 y c19 → avisos de set (camionetas claras al fondo; pasillo sin camionetas); se aceptan.

## REGENERAR
**c02, c08, c17, c28, c34**. Moví los mp4 a `clips/old/` y corregí los prompts en `clips.py` (`python -I clips.py c02 c08 c17 c28 c34`). El archivo carga y tiene 36 clips.
- ITZ (ancla de Itzel, sirve para todos sus clips): ahora dice "Mexican mestiza woman, warm brown morena skin, dark brown eyes, the exact face of her reference sheet, long straight black hair worn loose … black flat shoes".
- c02: Amparo en el borde "seen from behind … only her brown felt hat, grey-black braid and deep blue fringed rebozo visible; she wears the deep blue rebozo, never a brown shawl". Lleva las anclas de Pamela y Amparo, "Only these two characters appear" y "No other people".
- c08: "the bag is the same small brown woven palm-leaf basket with two handles as in her reference sheet from the first to the last frame, it never changes". Lleva las anclas de Pamela y Amparo y "No other people".
- c17: el prompt no cambia, porque el fallo es del archivo y no de la escena. Ya llevaba las anclas de Gonzalo y Amparo y "No other people".
- c28: "@{ITZELMORENA} seen from behind and blurred at the right edge … she stays at that edge the whole shot. Only these two characters appear, nobody in the background, a single Itzel". Lleva las anclas de Amparo e Itzel y "No other people".
- c34: Amparo habla "from the first second"; Itzel queda "seen from behind … her face is not shown", con el ancla ITZ nueva. Lleva "No other people". La línea no cambia, porque "Itzel" y "corporativo" se oyen bien.

## Transcripciones (faster-whisper medium; palabra@inicio-fin en segundos)
small coincide con medium en el texto. Las diferencias son de puntuación, salvo en c20, donde small oye "apagarlas" y medium "pagarlas" (lo correcto). c17 no se pudo leer. r1 no tiene diálogo.

- **c01** (-23 dB): Señorita,@0.80-1.38 buenas@1.62-1.78 tardes.@1.78-2.58 Me@2.90-3.10 interesan@3.10-3.66 esas@3.66-3.96 tres@3.96-4.26 camionetas@4.26-4.94 blancas@4.94-5.40 de@5.40-5.52 la@5.52-5.74 entrada.@5.74-5.98 ¿Me@6.86-7.08 ayuda@7.08-7.28 con@7.28-7.54 ellas?@7.54-7.82
- **c02** (-25 dB): ¿Las@1.02-1.56 tres?@1.56-1.86 ¡Ay,@2.08-2.32 señora,@2.38-2.60 no@2.66-2.80 me@2.80-2.88 haga@2.88-3.04 perder@3.04-3.32 el@3.32-3.58 tiempo!@3.58-3.90 ¡Mírese@4.70-5.00 nomás@5.00-5.38 cómo@5.38-5.64 viene!@5.64-5.96 Aquí@7.04-7.26 vendemos@7.26-7.74 lujo,@7.74-8.36 no@8.42-8.56 artesanías.@8.56-9.38
- **c03** (-19 dB): No@0.00-0.66 vine@0.66-0.88 a@0.88-0.98 vender@0.98-1.34 nada,@1.34-1.70 señorita.@2.00-2.46 Vine@3.16-3.42 a@3.42-3.80 comprar.@3.80-4.08 ¿Cuánto@5.28-5.62 cuesta@5.62-5.92 cada@5.92-6.24 una?@6.24-6.44
- **c04** (-20 dB): ¿De@0.00-0.74 veras@0.74-0.96 no@0.96-1.20 entiende?@1.20-1.62 Aunque@2.48-2.68 vendiera@2.68-3.12 todo@3.12-3.40 lo@3.40-3.58 que@3.58-3.72 trae@3.72-3.96 encima,@3.96-4.34 no@4.88-4.92 le@4.92-5.12 alcanza@5.12-5.42 ni@5.42-5.58 para@5.58-5.80 las@5.80-6.00 llantas.@6.00-6.74 Mejor@7.62-7.84 váyase@7.84-8.24 antes@8.24-8.48 de@8.48-8.64 que@8.64-8.72 la@8.72-8.90 saquen.@8.90-9.42
- **c05** (-23 dB): No@0.00-0.98 más@0.98-1.18 quiero@1.18-1.40 ver@1.40-1.68 por@1.68-1.94 dentro@1.94-2.20 esa@2.20-2.44 camioneta.@2.44-3.58 Antes@4.10-4.42 de@4.42-4.70 decidir,@4.70-5.64 quiero@5.98-6.08 ver@6.08-6.32 si@6.32-6.48 me@6.48-6.80 conviene.@6.80-7.22
- **c06** (-19 dB): Ni@0.88-1.44 se@1.44-1.58 le@1.58-1.76 ocurra@1.76-2.08 tocarla.@2.08-2.96 Esa@3.72-4.00 camioneta@4.00-4.38 vale@4.38-4.56 más@4.56-4.82 que@4.82-4.98 su@4.98-5.14 casa@5.14-5.44 y@5.44-5.74 todo@5.74-5.90 su@5.90-6.10 pueblo@6.10-6.36 juntos.@6.36-6.86
- **c07** (-20 dB): Pensaba@1.40-1.96 llevarme@1.96-2.48 las@2.48-2.74 tres@2.74-3.02 hoy@3.02-3.38 mismo,@3.38-3.84 de@4.64-4.80 contado.@4.80-5.58 Dígame@6.00-6.20 el@6.20-6.44 precio,@6.44-6.64 por@6.84-6.92 favor.@6.92-7.18
- **c08** (-22 dB): ¿De@0.00-0.46 contado?@0.46-0.90 Con@1.94-2.20 esa@2.20-2.42 bolsita@2.42-2.90 no@2.90-3.08 se@3.08-3.28 compra@3.28-3.54 ni@3.54-3.74 un@3.74-3.94 espejo.@3.94-4.64 Ya@5.28-5.50 deje@5.50-5.76 de@5.76-5.90 hacer@5.90-6.06 el@6.06-6.38 ridículo.@6.38-6.84
- **c09** (-24 dB): Entonces@0.00-1.34 dígame@1.34-1.68 su@1.68-1.94 nombre,@1.94-2.42 quiero@3.72-3.82 acordarme@3.82-4.36 de@4.36-4.66 quién@4.66-4.80 me@4.80-5.06 sacó@5.06-5.60 sin@5.60-5.92 escucharme.@5.92-6.60
- **c10** (-26 dB): Ahí@1.20-1.80 dice@1.80-2.12 en@2.12-2.36 el@2.36-2.54 gafete,@2.54-3.28 Pamela,@3.70-4.38 quejese@4.68-4.98 con@4.98-5.22 quien@5.22-5.42 quiera,@5.42-5.70 tengo@6.00-6.08 clientes@6.08-6.44 de@6.44-6.56 verdad@6.56-6.80 esperando.@6.80-7.24
- **c11** (-21 dB): Ya@0.52-0.92 salí@0.92-1.20 de@1.20-1.30 la@1.30-1.48 primera@1.48-1.72 agencia,@1.72-2.24 ya@2.44-2.54 vi@2.54-2.64 suficiente,@2.64-3.22 ni@3.58-3.68 me@3.68-4.00 preguntó@4.00-4.28 qué@4.28-4.40 buscaba,@4.40-4.98 nomás@5.24-5.42 me@5.42-5.58 vio@5.58-5.70 la@5.70-5.90 ropa,@5.90-6.22 ahora@6.42-6.54 voy@6.54-6.72 a@6.72-6.84 la@6.84-6.98 segunda,@6.98-7.32 quiero@7.62-7.76 saber@7.76-8.02 si@8.02-8.14 es@8.14-8.30 una@8.30-8.46 persona@8.46-8.84 o@8.84-9.06 es@9.06-9.20 toda@9.20-9.36 la@9.36-9.60 empresa.@9.60-9.82
- **c12** (-24 dB): ¡Buenas@0.00-1.24 tardes!@1.24-1.86 ¿Cuál@2.80-3.06 es@3.06-3.20 la@3.20-3.36 camioneta@3.36-3.96 más@3.96-4.34 fina@4.34-4.78 que@4.78-4.98 tienen?@4.98-5.32 ¿Cuál@6.02-6.16 me@6.16-6.48 recomienda?@6.48-6.98
- **c13** (-22 dB): Usted,@0.88-1.40 Doñita,@1.52-1.98 aquí@2.76-2.88 manejamos@2.88-3.38 otro@3.38-3.58 nivel@3.58-3.82 de@3.82-4.08 vehículos.@4.08-4.62 Los@5.66-5.80 seminuevos@5.80-6.28 están@6.28-6.48 allá@6.48-6.78 atrás.@6.78-7.10 A@7.70-7.80 lo@7.80-7.98 mejor@7.98-8.10 ahí@8.10-8.26 encuentra@8.26-8.60 algo@8.60-8.78 a@8.78-8.90 su@8.90-9.02 alcance.@9.02-9.42
- **c14** (-22 dB): No@0.00-0.66 le@0.66-0.98 pregunté@0.98-1.28 qué@1.28-1.40 me@1.40-1.66 alcanza.@1.66-3.08 Le@3.38-3.64 pregunté@3.64-4.12 cuál@4.12-4.32 es@4.32-4.50 la@4.50-4.68 mejor.@4.68-5.00 Quiero@5.70-5.98 verla@5.98-6.28 por@6.28-6.52 dentro.@6.52-6.80
- **c15** (-19 dB): La@1.14-1.62 mejor@1.62-2.10 ni@2.10-2.56 la@2.56-2.78 toque@2.78-3.02 doñita,@3.02-3.84 cuesta@4.36-4.64 más@4.64-4.92 de@4.92-5.04 lo@5.04-5.14 que@5.14-5.26 usted@5.26-5.42 va@5.42-5.60 a@5.60-5.78 ganar@5.78-6.02 en@6.02-6.20 toda@6.20-6.38 su@6.38-6.62 vida.@6.62-6.84
- **c16** (-19 dB): entonces@0.00-1.14 cotíceme@1.14-1.86 tres@1.86-2.12 iguales@2.12-3.88 quiero@3.88-4.26 saber@4.26-4.56 el@4.56-4.88 precio@4.88-5.22 y@5.22-5.74 cuándo@5.74-6.02 me@6.02-6.12 las@6.12-6.36 entregan@6.36-6.90
- **c17** (nan dB): 
- **c18** (-22 dB): Entonces,@1.80-2.26 llame@2.50-2.66 a@2.66-2.82 alguien@2.82-2.98 que@2.98-3.20 sí@3.20-3.42 quiera@3.42-3.62 venderme@3.62-4.06 las@4.06-4.38 tres.@4.38-4.62
- **c19** (-23 dB): No@0.00-0.80 insista,@0.80-1.54 soy@1.96-2.14 el@2.14-2.36 gerente@2.36-2.62 de@2.62-2.82 ventas.@2.82-3.98 Aquí@4.46-4.58 yo@4.58-4.84 decido@4.84-5.36 a@5.36-5.66 quién@5.66-5.74 se@5.74-5.96 atiende.@5.96-6.34 Y@7.36-7.54 si@7.54-7.62 yo@7.62-7.80 digo@7.80-7.96 que@7.96-8.22 no,@8.22-8.62 nadie@8.94-9.08 la@9.08-9.30 atiende.@9.30-9.56
- **c20** (-21 dB): ¿Y@1.04-1.92 si@1.92-2.12 pudiera@2.12-2.48 pagarlas@2.48-3.18 hoy@3.18-3.48 mismo?@3.48-4.02 ¿Seguiría@5.62-6.08 diciendo@6.08-6.52 que@6.52-6.82 no@6.82-7.04 merezco@7.04-7.48 que@7.48-7.60 me@7.60-7.84 atiendan?@7.84-8.52
- **c21** (-21 dB): Mire,@0.00-0.52 si@0.86-1.00 usted@1.00-1.20 se@1.20-1.38 lleva@1.38-1.54 esas@1.54-1.78 tres@1.78-2.00 hoy,@2.00-2.76 renuncio@3.56-3.88 aquí@3.88-4.16 mismo,@4.16-4.56 delante@4.80-5.08 de@5.08-5.34 todos.@5.34-5.62 Pero@6.86-7.02 ya@7.02-7.26 deje@7.26-7.50 de@7.50-7.64 soñar,@7.64-8.14 doñita.@8.26-8.64
- **c22** (-22 dB): Perfecto.@1.74-2.22 No@2.38-2.56 se@2.56-2.70 le@2.70-2.88 olvide@2.88-3.14 lo@3.14-3.32 que@3.32-3.46 acaba@3.46-3.68 de@3.68-3.90 prometer.@3.90-4.84 Delante@5.34-5.62 de@5.62-5.88 todos.@5.88-6.14
- **c23** (-21 dB): Ándele,@0.82-1.32 váyase@1.36-1.76 tranquila.@1.76-2.62 Cuando@3.66-3.88 regrese@3.88-4.28 por@4.28-4.50 sus@4.50-4.70 camionetas,@4.70-5.52 yo@5.96-6.04 mismo@6.04-6.28 le@6.28-6.48 abro@6.48-6.64 la@6.64-6.82 puerta.@6.82-7.08
- **c24** (-24 dB): Buenas@0.00-1.38 tardes@1.38-1.74 señorita,@1.74-3.00 quisiera@3.86-4.14 ver@4.14-4.42 tres@4.42-4.72 camionetas.@4.72-5.56 ¿Cuál@5.76-5.92 me@5.92-6.24 recomienda?@6.24-6.74
- **c25** (-21 dB): Claro@0.00-0.78 que@0.78-1.04 sí,@1.04-1.22 señora,@1.40-1.58 con@2.00-2.22 mucho@2.22-2.46 gusto.@2.46-3.02 Véalas@3.86-4.14 con@4.14-4.42 calma,@4.42-4.78 no@4.88-4.98 hay@4.98-5.16 prisa.@5.16-5.78 Empecemos@6.66-7.04 por@7.04-7.34 esta@7.34-7.68 y@7.68-8.24 luego@8.24-8.50 vemos@8.50-8.76 las@8.76-9.02 otras.@9.02-9.24
- **c26** (-23 dB): En@0.82-1.54 otra@1.54-1.76 agencia@1.76-2.18 me@2.18-2.40 dijeron@2.40-2.78 que@2.78-2.92 ni@2.92-3.06 la@3.06-3.26 tocara.@3.26-3.84 ¿Aquí@4.60-4.96 también?@4.96-5.26
- **c27** (-22 dB): No,@0.62-1.22 señora,@1.34-1.62 para@1.68-1.98 nada.@1.98-2.36 Súbase@3.26-3.56 si@3.56-3.74 gusta,@3.74-4.10 conózcala@4.56-4.92 por@4.92-5.20 dentro@5.20-5.50 y@6.28-6.88 pregúnteme@6.88-7.48 todo@7.48-7.80 lo@7.80-8.02 que@8.02-8.20 quiera.@8.20-8.50
- **c28** (-25 dB): ¿Y@1.70-2.26 si@2.26-2.42 al@2.42-2.52 final@2.52-2.92 no@2.92-3.20 me@3.20-3.40 llevo@3.40-3.64 ninguna?@3.64-4.00
- **c29** (-22 dB): No@0.68-1.28 pasa@1.28-1.56 nada,@1.56-1.84 señora.@2.14-2.26 Mi@3.04-3.18 deber@3.18-3.44 es@3.44-3.64 atenderla@3.64-4.18 bien,@4.18-4.54 compre@5.00-5.18 o@5.18-5.28 no@5.28-5.54 compre.@5.54-6.20 Usted@6.98-7.20 merece@7.20-7.60 conocer@7.60-7.98 sus@7.98-8.22 opciones.@8.22-8.80
- **c30** (-19 dB): De@0.00-0.68 estas@0.68-1.08 tres,@1.08-1.48 ¿cuál@1.72-1.94 escogería@1.94-2.54 usted@2.54-2.96 para@2.96-3.78 usarla@3.78-4.56 diario@4.56-5.16 y@5.16-5.66 salir@5.66-5.90 a@5.90-6.18 carretera?@6.18-6.52
- **c31** (-20 dB): Esta@0.00-0.60 no@0.60-1.26 es@1.26-1.44 la@1.44-1.56 más@1.56-1.76 cara,@1.76-2.10 pero@2.84-3.08 es@3.08-3.34 más@3.34-3.62 espaciosa,@3.62-4.42 gasta@4.82-5.00 menos@5.00-5.34 gasolina@5.34-5.88 y@5.88-7.32 le@7.32-7.50 va@7.50-7.60 a@7.60-7.76 durar@7.76-7.96 muchos@7.96-8.24 años.@8.24-8.68
- **c32** (-22 dB): Oiga,@1.66-2.26 ¿cómo@2.28-2.50 se@2.50-2.76 llama?@2.76-3.00 ¿Y@4.50-4.94 cuánto@4.94-5.28 tiempo@5.28-5.52 lleva@5.52-5.78 aquí?@5.78-6.18
- **c33** (-21 dB): Me@0.00-0.62 llamo@0.62-0.84 Itzel.@0.84-1.64 Llevo@2.06-2.42 seis@2.42-2.72 meses.@2.72-3.16 A@3.86-3.98 lo@3.98-4.16 mejor@4.16-4.28 no@4.28-4.50 tengo@4.50-4.70 mucha@4.70-4.94 experiencia,@4.94-5.62 pero@6.94-7.06 aprendí@7.06-7.46 que@7.46-7.60 aquí@7.60-7.80 todo@7.80-8.02 el@8.02-8.20 que@8.20-8.38 entra@8.38-8.60 merece@8.60-9.06 respeto.@9.06-9.60
- **c34** (-21 dB): Itzel,@1.98-2.42 mañana@3.06-3.28 a@3.28-3.44 las@3.44-3.58 10,@3.58-3.90 te@4.18-4.40 quiero@4.40-4.56 en@4.56-4.70 la@4.70-4.84 sala@4.84-5.04 de@5.04-5.28 juntas@5.28-5.56 del@5.56-5.74 corporativo.@5.74-6.38
- **c35** (-22 dB): ¿Ustedes@0.00-0.94 creen@0.94-1.12 que@1.12-1.30 Gonzalo@1.30-1.72 va@1.72-1.90 a@1.90-2.02 renunciar@2.02-2.56 delante@2.56-2.92 de@2.92-3.20 todos?@3.20-3.40 Denle@4.36-4.70 me@4.70-4.86 gusta@4.86-5.16 y@5.16-5.60 compartan@5.60-6.10 para@6.10-6.28 ver@6.28-6.50 la@6.50-6.68 segunda@6.68-7.02 parte.@7.02-7.42
- **r1** (-50 dB): 
