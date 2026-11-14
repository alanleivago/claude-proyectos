# QA clips — buen-hijo (El Buen Hijo · Parte 1) (2026-11-04)

Método: los 32 clips de CLIPS (c01–c32) estaban en `clips/` y ffmpeg leyó todos (720x1280 con audio; 6, 8 o 10 s según el prompt). Hice una hoja de contactos a 2 fps por clip (scratchpad `qa_hijo/`) más ampliaciones de c03 y c06 (2 s, mano de la bolsita), c16 (0.5 y 1 s, borde izquierdo), c22 (0, 3 y 7.5 s, llaves), c25 (4.6 y 5 s) y c29 (0, 0.8 y 3 s, la jarra). Transcribí todo con faster-whisper small y medium (es, tiempos por palabra; wav 16 kHz cargado con numpy, CPU int8 porque falta cublas64_12.dll). Comparé contra ABUNDIO, TADEO, ROMAN, PETRA, AURELIA y las 5 LOC.
Ropa: Abundio (camisa beige, pantalón café oscuro, cinturón y zapatos cafés, bigote gris), Tadeo (camisa verde salvia, chinos gris claro, tenis blancos, rizado, sin barba), Román (suéter/camisa azul marino, pantalón negro, reloj plateado), Petra (blusa rosa, rebozo gris, falda café, zapatos negros) y Aurelia (blusa blanca bordada, delantal turquesa, falda oscura, chongo canoso) se mantienen en todos sus clips, también de espaldas y en los bordes. No hay gente ajena ni duplicados de personas.
Objetos: una sola carpeta negra (c18, solo Román), una sola maleta negra (c22–c27) y un solo llavero (c22: en la mano a 0 s, en la mesa desde ~1 s). **En c29 hay una segunda jarra de barro igual a la de Aurelia sobre la mesa** (0–2.5 s). **En c06 Petra lleva la bolsita en la mano derecha** y Tadeo está a su izquierda; en c03 y c07 la lleva en la izquierda y Tadeo va a su derecha.
Ningún clip trae texto quemado (el grafiti de la cortina en c25/c26 es el de LOC_PERSIANA). Contacto: Tadeo y Petra del brazo (c03, c06), Abundio con la mano en el hombro de Román (c19) y Aurelia extiende la mano hacia Tadeo (c28), todo suave. Nadie señala con el dedo.
Pronunciación: las 61 frases salen completas, sin líneas inventadas ni repetidas. "Abundio" no se dice en ningún clip; "Tadeo", "Román", "Aurelia", "samaritano" e "inventario" se oyen bien en medium (small escribe "Roman" y "Tómenme" en c03; medium oye "Tómeme").

## Veredicto por clip
- **c01** OK. Habla desde 0.00 s; Román en el borde derecho.
- **c02** OK. Román de espaldas en el borde derecho. La voz empieza en 1.72 s → usar desde 1.6 s.
- **c03** OK. Del brazo por el paso de cebra; bolsita en la mano izquierda de Petra.
- **c04** OK. Abundio en el borde izquierdo.
- **c05** OK. Abundio se levanta; Román sentado en primer plano con el reloj.
- **c06** **Bolsita en la mano derecha y Tadeo del lado contrario** al de c03 y c07 (ampliado a 2 s). Se nota al intercalar c03 → c06 → c07 y dura todo el clip. → REGENERAR.
- **c07** OK. Tadeo sale de cuadro por la izquierda a 7.5 s ("ya me voy"), caminando; no desaparece de golpe.
- **c08** OK. Abundio gira hacia la entrada; Tadeo en el borde izquierdo.
- **c09** OK. Abundio en el borde derecho.
- **c10** OK. Tadeo en el borde izquierdo.
- **c11** OK. Abundio de pie al fondo a la derecha.
- **c12** OK. Román de pie detrás, a la derecha.
- **c13** OK. Abundio al fondo a la derecha.
- **c14** OK. Tadeo de espaldas en el borde izquierdo hasta 2 s; sale por el push-in.
- **c15** OK. Abundio en el borde derecho.
- **c16** OK. Tadeo en el borde izquierdo (ampliado a 0.5 y 1 s: es uno solo).
- **c17** OK. Tadeo empieza de espaldas y se gira; Román en el borde derecho.
- **c18** OK. Una sola carpeta; Tadeo al fondo a la izquierda.
- **c19** OK. Mano de Abundio en el hombro de Román; Tadeo de espaldas a la izquierda.
- **c20** OK. Abundio en el borde derecho hasta ~2 s; sale de cuadro por el push-in.
- **c21** OK. Tadeo en el borde izquierdo hasta ~2.5 s, sale por el push-in.
- **c22** OK. Deja un solo llavero en la mesa; una maleta.
- **c23** OK. Abundio y Román junto a la escalera.
- **c24** OK. Abundio de espaldas en el borde derecho; Tadeo se da vuelta para salir a 9.5 s.
- **c25** OK. Cartones, maleta y cortina de LOC_PERSIANA; push-in continuo (ampliado a 4.6 y 5 s).
- **c26** OK. El celular se ve de canto: no se ve la pantalla y no sale nada de ella. No es over-the-shoulder, pero sirve.
- **c27** OK, con aviso: la puerta de la nana es de madera clara con tableros y en c28 es café oscura (la de LOC_ZAGUAN). Es contraplano, se acepta.
- **c28** OK. Aurelia extiende la mano hacia Tadeo (borde izquierdo).
- **c29** **Jarra duplicada**: además de la jarra de barro que Aurelia sirve hay otra igual en la mesa (ampliado a 0.8 s), visible de 0 a ~2.5 s, justo durante "Tú me criaste, nana" (1.18–2.52 s). Recortar quita la línea. → REGENERAR.
- **c30** OK. Una taza; Tadeo en el borde izquierdo.
- **c31** OK. Tadeo en el borde izquierdo.
- **c32** (CTA) OK. Habla desde 0.00 s, sonríe, asiente, ladea la cabeza y gesticula con la mano abierta (4.5–5.5 s). No señala.

## Recortes (no hace falta regenerar)
- c02 → desde 1.6 s (voz en 1.72 s). La voz también empieza tarde en c03 (1.38), c05 (1.30), c06 (1.34), c08 (1.58), c11 (1.32), c16 (1.22), c17 (1.12), c22 (2.00), c23 (1.14), c28 (0.94), c29 (1.18) y c30 (1.26); cortar ~0.1 s antes de la primera palabra.
- Avisos que se aceptan: c26 (celular sin pantalla visible), c27/c28 (puerta distinta en el contraplano).

## REGENERAR
**c06, c29**. Moví sus mp4 a `clips/old/` y corregí los prompts en `clips.py` (`python -I clips.py c06 c29`). El archivo carga y tiene 32 clips. Los dos prompts ya llevaban el ancla con `@{ASSET}` de cada personaje (también el del borde) y "No other people".
- c06: Petra de frente; Tadeo a su derecha, "blurred at the LEFT edge of the frame", del brazo como al cruzar; "Her LEFT hand (on the right side of the frame) holds the small white plastic bag for the whole shot; her right hand never holds the bag".
- c29: "There is only ONE clay coffee pot in the whole kitchen, the one in Aurelia's hand: no other clay pot, jug or jar on the table, the table holds only the woven placemat and the one white cup".

## Transcripciones (faster-whisper small; palabra@inicio-fin en segundos; dB = RMS)
small y medium coinciden en todo el texto salvo puntuación, "Roman/Román", "Tómenme" (c03, medium: "Tómeme"), "buscaras" (c26, medium: "buscara") y "a la gente" (c23 medium; small oye bien "la gente").
- **c01** (-25 dB): Tu@0.00-0.68 hermano@0.68-1.16 no@1.16-1.30 sirve@1.30-1.76 para@1.76-1.96 nada,@1.96-2.34 Roman.@2.44-2.66 Todo@4.42-4.70 lo@4.70-4.94 de@4.94-5.04 la@5.04-5.16 fábrica@5.16-5.66 va@5.66-6.24 a@6.24-6.30 ser@6.30-6.42 para@6.42-6.66 ti.@6.66-6.88
- **c02** (-28 dB): y@1.72-2.32 hoy@2.32-2.50 mismo@2.50-2.94 se@2.94-3.46 va@3.46-3.62 de@3.62-3.72 esta@3.72-3.90 casa.@3.90-4.20
- **c03** (-24 dB): Tómenme@1.38-1.98 del@1.98-2.12 brazo@2.12-2.46 doñita,@2.46-2.90 yo@4.12-4.58 la@4.58-4.72 cruzo,@4.72-5.02 no@5.06-5.16 tenga@5.16-5.34 miedo.@5.34-5.60
- **c04** (-23 dB): me@0.00-0.52 parece@0.52-0.80 bien@0.80-1.08 papá@1.08-2.40 yo@2.40-2.60 si@2.60-2.76 vengo@2.76-3.00 diario@3.00-3.42 a@3.42-3.52 la@3.52-3.60 fábrica@3.60-4.12 él@4.12-5.14 nomás@5.14-5.50 anda@5.50-5.74 de@5.74-5.96 buen@5.96-6.14 samaritano@6.14-6.92
- **c05** (-23 dB): cuando@1.30-1.80 regrese@1.80-2.30 que@2.30-2.76 me@2.76-2.88 de@2.88-2.98 cuentas@2.98-4.40 y@4.40-4.66 si@4.66-4.78 trae@4.78-5.02 otro@5.02-5.18 cuento@5.18-5.62 se@5.62-6.26 va@6.26-6.42 esta@6.42-6.64 misma@6.64-6.84 noche@6.84-7.12
- **c06** (-24 dB): Dios@1.34-1.94 te@1.94-2.16 lo@2.16-2.30 pague@2.30-2.66 muchacho@2.66-3.22 salí@3.22-4.24 por@4.24-4.40 mis@4.40-4.56 medicinas@4.56-5.24 y@5.24-5.92 ya@5.92-6.06 no@6.06-6.20 supe@6.20-6.50 cómo@6.50-6.76 regresar@6.76-7.50
- **c07** (-24 dB): Aquí@0.88-1.28 está@1.28-1.48 su@1.48-1.62 casa,@1.62-1.84 doña@1.94-2.10 Petra.@2.10-2.46 Ya@3.44-3.78 me@3.78-3.90 voy,@3.90-4.10 que@4.44-4.62 mi@4.62-4.74 papá@4.74-5.02 me@5.02-5.12 está@5.12-5.26 esperando.@5.26-5.54
- **c08** (-22 dB): ¿Qué@1.58-2.10 horas@2.10-2.28 son@2.28-2.48 estas,@2.48-2.74 Tadeo?@2.98-3.24 El@4.48-4.72 proveedor@4.72-5.20 te@5.20-5.36 esperó@5.36-5.76 una@5.76-6.06 hora@6.06-6.34 en@6.34-6.44 la@6.44-6.54 fábrica.@6.54-7.00
- **c09** (-23 dB): Perdón,@0.00-0.80 papá.@0.88-2.26 Una@2.34-2.64 señora@2.64-2.96 no@2.96-3.18 podía@3.18-3.42 cruzar@3.42-3.76 la@3.76-3.92 avenida@3.92-4.50 y@5.26-5.80 la@5.80-5.92 acompañé@5.92-6.40 a@6.40-6.42 su@6.42-6.54 casa.@6.54-6.78
- **c10** (-23 dB): Y@0.00-0.98 por@0.98-1.18 una@1.18-1.34 desconocida@1.34-2.10 plantaste@2.10-2.76 al@2.76-2.88 proveedor,@2.88-3.44 siempre@3.82-4.86 tienes@4.86-5.42 un@5.42-5.60 pretexto.@5.60-6.30
- **c11** (-23 dB): Voy@1.32-2.04 ahorita@2.04-2.40 a@2.40-2.50 la@2.50-2.56 fábrica,@2.56-2.92 papá.@3.04-3.72 Todavía@4.34-4.84 puedo@4.84-5.06 revisar@5.06-5.54 los@5.54-5.64 pedidos.@5.64-6.04
- **c12** (-22 dB): Tu@0.70-1.18 hermano@1.18-1.62 sí@1.62-1.76 sabe@1.76-2.06 lo@2.06-2.24 que@2.24-2.38 es@2.38-2.50 el@2.50-2.60 compromiso.@2.60-3.30 Tú@4.28-4.66 no@4.66-4.78 más@4.78-4.94 quieres@4.94-5.16 quedar@5.16-5.42 bien@5.42-5.66 con@5.66-5.90 todos.@5.90-6.20
- **c13** (-26 dB): mañana@0.00-0.74 me@0.74-0.96 quedo@0.96-1.18 más@1.18-1.32 tarde@1.32-1.64 si@1.64-1.86 quieres@1.86-2.14 nada@2.14-3.28 más@3.28-3.48 déjame@3.48-3.80 arreglarlo@3.80-4.34
- **c14** (-22 dB): Ya@0.00-1.28 me@1.28-1.44 cansé@1.44-1.90 de@1.90-2.00 tus@2.00-2.20 buenas@2.20-2.48 obras.@2.48-2.88 Agarra@4.08-4.76 tus@4.76-4.90 cosas@4.90-5.28 y@5.28-5.90 te@5.90-6.06 vas@6.06-6.30 hoy@6.30-6.60 mismo.@6.60-6.94
- **c15** (-27 dB): ¿Me@0.00-0.50 estás@0.50-0.66 corriendo@0.66-1.14 por@1.14-1.36 esto,@1.36-1.56 papá?@1.64-2.16 Siempre@3.48-3.92 he@3.92-4.04 hecho@4.04-4.22 todo@4.22-4.54 para@4.54-5.52 que@5.52-5.66 estés@5.66-5.84 orgulloso@5.84-6.36 de@6.36-6.52 mí.@6.52-6.68
- **c16** (-26 dB): Ya@1.22-1.78 no@1.78-1.96 hagas@1.96-2.22 drama,@2.22-2.50 Tadeo.@2.68-3.06 Mi@4.46-4.60 papá@4.60-4.88 ya@4.88-4.98 decidió.@4.98-5.46
- **c17** (-27 dB): Román,@1.12-1.52 tú@1.62-1.66 sabes@1.66-1.86 que@1.86-2.06 anoche@2.06-2.34 terminé@2.34-2.78 tu@2.78-2.88 inventario.@2.88-3.46 Díselo,@5.48-5.88 dile@6.08-6.20 que@6.20-6.38 yo@6.38-6.56 sí@6.56-6.66 cumplo.@6.66-7.00
- **c18** (-27 dB): Yo@0.86-1.32 nunca@1.32-1.54 te@1.54-1.76 pedí@1.76-2.00 ayuda.@2.00-2.30 No@3.42-3.66 me@3.66-3.78 lo@3.78-3.88 eches@3.88-4.02 en@4.02-4.24 cara@4.24-4.50 en@4.50-5.20 frente@5.20-5.38 de@5.38-5.58 mi@5.58-5.68 papá.@5.68-6.00
- **c19** (-23 dB): Román@0.72-1.12 se@1.12-1.26 va@1.26-1.36 a@1.36-1.44 quedar@1.44-1.60 con@1.60-1.80 la@1.80-1.94 fábrica@1.94-2.38 y@2.38-2.44 con@2.44-2.64 todo.@2.64-2.90 Necesito@4.08-4.48 a@4.48-4.58 alguien@4.58-4.84 responsable.@4.84-6.08
- **c20** (-26 dB): No@0.00-0.84 te@0.84-0.96 estoy@0.96-1.14 pidiendo@1.14-1.52 nada,@1.52-1.78 papá.@1.90-3.04 No@3.20-3.62 más@3.62-3.78 quiero@3.78-3.92 entender.@3.92-4.34 ¿Por@6.02-6.40 una@6.40-6.60 hora@6.60-6.80 de@6.80-6.94 retraso@6.94-7.44 ya@7.44-7.56 no@7.56-7.68 quieres@7.68-7.90 verme?@7.90-8.16
- **c21** (-28 dB): Mi@0.00-1.70 decisión@1.70-2.28 está@2.28-2.50 tomada.@2.50-2.98
- **c22** (-27 dB): Ahí@2.00-2.38 está@2.38-2.52 todo@2.52-2.72 lo@2.72-2.90 de@2.90-3.00 la@3.00-3.12 casa,@3.12-3.34 nada@4.10-4.72 más@4.72-4.92 me@4.92-5.06 voy@5.06-5.20 con@5.20-5.36 mi@5.36-5.48 ropa.@5.48-5.76
- **c23** (-25 dB): Déjalo@1.14-1.62 ir,@1.62-1.88 Roman,@1.88-2.06 si@3.48-3.66 tanto@3.66-4.00 le@4.00-4.16 importa@4.16-4.46 la@4.46-4.68 gente@4.68-4.94 de@4.94-5.12 la@5.12-5.24 avenida@5.24-6.28 que@6.28-6.50 alguien@6.50-6.78 de@6.78-6.92 ahí@6.92-7.06 lo@7.06-7.18 reciba.@7.18-7.64
- **c24** (-25 dB): No@0.80-1.44 te@1.44-1.58 voy@1.58-1.70 a@1.70-1.78 molestar@1.78-2.14 más,@2.14-2.38 papá.@2.46-3.44 Pero@3.82-4.28 esa@4.28-4.48 señora@4.48-4.80 necesitaba@4.80-5.52 ayuda.@5.52-5.80 Y@6.90-7.54 lo@7.54-7.66 volvería@7.66-8.08 a@8.08-8.16 hacer.@8.16-8.30
- **c25** (-25 dB): Y@0.82-1.34 ahora@1.34-1.52 ¿dónde@1.52-1.78 voy@1.78-1.94 a@1.94-2.04 pasar@2.04-2.26 la@2.26-2.46 noche?@2.46-2.72 Siempre@4.42-4.80 pensé@4.80-5.18 que@5.18-5.28 si@5.28-5.42 hacía@5.42-5.62 todo@5.62-5.80 bien,@5.80-6.12 algún@6.74-7.70 día@7.70-7.96 iba@7.96-8.16 a@8.16-8.26 quererme.@8.26-8.62
- **c26** (-22 dB): La@0.68-1.24 nana@1.24-1.42 Aurelia@1.42-1.82 siempre@1.82-2.06 me@2.06-2.30 dijo@2.30-2.48 que@2.48-2.64 la@2.64-2.78 buscaras@2.78-3.28 si@3.28-3.38 necesitaba@3.38-3.94 algo.@3.94-4.22 Mañana@5.34-5.90 temprano@5.90-6.40 voy@6.40-6.54 a@6.54-6.68 verla.@6.68-6.98
- **c27** (-28 dB): Nana,@0.94-1.46 perdón@1.72-1.98 por@1.98-2.12 venir@2.12-2.36 así.@2.36-2.62 Mi@3.52-3.90 papá@3.90-4.18 me@4.18-4.28 corrió@4.28-4.56 a@4.56-4.62 noche.@4.62-4.84
- **c28** (-24 dB): Ay,@0.94-1.66 mi@1.80-1.90 niño,@1.90-2.22 pásale.@2.42-2.88 Aquí@3.62-4.22 tienes@4.22-4.58 casa@4.58-4.98 el@4.98-5.20 tiempo@5.20-5.60 que@5.60-5.82 quieras.@5.82-6.40
- **c29** (-23 dB): Tú@1.18-1.58 me@1.58-1.74 criaste,@1.74-2.16 nana.@2.26-2.52 Siempre@4.22-4.56 le@4.56-4.70 he@4.70-4.74 dado@4.74-4.90 vergüenza@4.90-5.38 a@5.38-5.46 mi@5.46-5.56 papá.@5.56-5.90
- **c30** (-27 dB): Escúchame@1.26-1.86 bien,@1.86-2.16 Tadeo.@2.28-2.64 Yo@4.20-4.34 sé@4.34-4.58 por@4.58-4.78 qué@4.78-4.88 tu@4.88-5.04 papá@5.04-5.42 te@5.42-5.54 trata@5.54-5.84 así.@5.84-6.18
- **c31** (-24 dB): Y@0.96-1.68 por@1.68-1.90 muchos@1.90-2.24 años@2.24-2.74 me@2.74-3.10 hizo@3.10-3.38 guardar@3.38-3.84 silencio.@3.84-4.54
- **c32** (-22 dB): ¿Qué@0.00-0.72 secreto@0.72-1.20 creen@1.20-1.46 que@1.46-1.58 guarda@1.58-1.94 la@1.94-2.04 nana@2.04-2.28 Aurelia?@2.28-2.76 Denle@4.44-4.80 me@4.80-4.92 gusta@4.92-5.22 y@5.22-5.40 compartan@5.40-6.00 para@6.00-6.22 ver@6.22-6.42 la@6.42-6.56 segunda@6.56-6.86 parte.@6.86-7.26
