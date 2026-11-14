# QA clips — suegra (La Suegra · Parte 1) (2026-11-04)

Método: los 31 clips de CLIPS (c01–c31) estaban en `clips/`. ffmpeg decodificó los 31 sin errores (720x1280 con audio aac, 6 u 8 s según el prompt). Hice una hoja de contactos a 2 fps por clip (scratchpad `qa_sue/`) más ampliaciones de c01 (0.5 s), c07 (2 s), c09 (1 s), c11 (1 s), c13 (0.3 s), c16 (0.5 s), c25 (2 s), c27 (0.5 s) y c30 (3 s). Detección de cortes internos (scene > 0.12): ninguno. Transcribí con faster-whisper small y medium (es, tiempos por palabra; wav 16 kHz cargado con numpy, CPU int8). Comparé contra PALOMA, RODRIGO, SOCORRO, PANCHO, YADIRA, IRENE, las 3 LOC y PROP_CONTROL.
Ropa: Rodrigo (camisa amarillo pálido remangada, pantalón azul marino, cinturón café, reloj negro en la muñeca IZQUIERDA), Socorro (vestido verde oscuro con florecitas, chongo gris, arracadas), Pancho (playera azul marino deslavada, shorts cargo caqui), Yadira (playera durazno, pijama azul con florecitas, chongo) e Irene (blazer azul marino, blusa blanca, melena corta) se mantienen en todos sus clips, también de espaldas y en los bordes. Paloma lleva la blusa verde salvia, el colgante y las arracadas en todos. **Excepciones: en c09 Paloma lleva pantalón de punto VERDE (conjunto) sin cinturón, y en c27 pantalón NEGRO**, en vez del pantalón gris claro de c07 y del resto. En c16 el pantalón de Paloma (borde derecho, 0–2 s) se ve gris medio, más oscuro que en c15; se acepta (está en sombra). En c29 la camisa de Rodrigo tiene bolsillo en el pecho (los demás clips no). La bolsa negra de Paloma va siempre en el mismo hombro (c01, c04, c06, c14–c16), aunque es el derecho y no el izquierdo del prompt; es coherente, se acepta.
Gente: nadie ajeno ni duplicado en ningún clip (fondos de oficina vacíos en c17–c22).
Objetos: UN solo control, solo en c30, en la mano derecha de Socorro, negro y pequeño, sin deformarse. UNA sola blusa manchada (c11–c13). **c11: Paloma sostiene la blusa con la mano IZQUIERDA**; en c12 y c13, con la DERECHA.
Lados: llegada (Socorro a la izquierda, Rodrigo y Paloma a su derecha; Paloma a la derecha de Rodrigo), mañana, azotea, salida y oficina son coherentes. **Ultimátum: en c23, c24 y c26 Rodrigo queda a la IZQUIERDA y Socorro a la DERECHA; en c28 y c29, al revés** (Socorro izquierda, Rodrigo derecha).
Texto quemado: ninguno (solo el cartel verde de salida de emergencia al fondo de c19, sin letras legibles). Contacto: ninguno. Nadie señala con el dedo (Socorro abre los brazos en c21 y levanta la mano abierta en c10).
Pronunciación: "Socorro", "Yadira", "aguántame", "avergonzarme", "egoísta" y "cochera" se oyen bien. **c21 dice "que no era tan egoísta" en vez de "Qué nuera tan egoísta"** (small y medium coinciden; en c05 medium sí oye "nuera"). **c13 repite "Yadira, Yadira"**. c18: small no oye "¿Doña Socorro?", medium sí (0.00–1.88) y hay voz a nivel normal en 0.75–1.75 s; se acepta. c16: medium escribe "órganizate", small "organizate"; se acepta. c20: small oye "Estoy ya en la oficina", medium no; se acepta.

## Veredicto por clip
- **c01** OK. Rodrigo habla desde 0.00 s; Paloma en el borde derecho con la bolsa.
- **c02** OK. Rodrigo de espaldas en el borde derecho, reloj en la muñeca izquierda.
- **c03** OK. Paloma entra por la izquierda con la bolsa. Voz a 1.56 s.
- **c04** OK. Pancho acostado a la derecha, manos en la nuca.
- **c05** OK. Paloma en primer plano a la derecha (sale de cuadro a ~3.5 s).
- **c06** OK. Paloma en el borde derecho.
- **c07** OK. Yadira en el borde derecho con la taza; Paloma sostiene la puerta del refri con la mano derecha (igual que en c09).
- **c08** OK. Paloma en el borde izquierdo; Yadira bebe de la taza al final.
- **c09** **Cambio de ropa**: Paloma lleva pantalón de punto verde salvia, sin cinturón (0–3.5 s, mientras dice la primera frase). Recortar desde 4 s pierde "Era para mis almuerzos de la semana". → REGENERAR.
- **c10** OK. Paloma en el borde derecho; Socorro agita la mano abierta.
- **c11** **Mano cambiada**: sostiene la blusa con la mano izquierda (0–6 s); en c12 y c13 la lleva en la derecha. → REGENERAR.
- **c12** OK. Paloma en el borde izquierdo con la blusa; Yadira con ojos cerrados y hombros encogidos.
- **c13** OK, con recorte: repite "Yadira" (3.36–3.78 y 4.12–4.64 s) → usar hasta 3.9 s. Yadira al fondo a la derecha, nítida pero en su lado.
- **c14** OK. Paloma en el borde derecho con la bolsa; trastes sucios en la barra.
- **c15** OK. Socorro en el borde izquierdo; Paloma sale de cuadro a ~7 s.
- **c16** OK, con aviso: pantalón de Paloma más oscuro (gris medio) a 0–2 s. Paloma en el borde derecho.
- **c17** OK. Paloma de espaldas, sentada a la izquierda; sin gafete.
- **c18** OK. Mano derecha en el pecho; Socorro en el borde derecho. Voz desde 0.75 s.
- **c19** OK. Paloma en el borde izquierdo; codo en el mostrador.
- **c20** OK. Socorro al fondo a la derecha con el codo en el mostrador.
- **c21** **Mala pronunciación**: "que no era tan egoísta me tocó" (3.38–6.06 s). Recortar a 2.4 s deja solo la primera frase. → REGENERAR.
- **c22** OK. Socorro en el borde derecho, brazos cruzados.
- **c23** OK. Socorro de espaldas en el borde derecho.
- **c24** OK. Rodrigo en el borde izquierdo (0–1.5 s), luego solo su mano.
- **c25** OK. Pancho en el sillón a la derecha; reloj en la muñeca izquierda.
- **c26** OK. Rodrigo en el borde izquierdo.
- **c27** **Cambio de ropa**: Paloma lleva pantalón negro (todo el clip). → REGENERAR.
- **c28** **Lados cambiados**: Socorro a la izquierda y Rodrigo a la derecha; en c23, c24 y c26 es al revés. → REGENERAR. (Alternativa sin regenerar: espejo horizontal, pero el reloj pasa a la muñeca derecha.)
- **c29** **Lados cambiados**: Socorro en el borde izquierdo (en c23 está a la derecha de Rodrigo). Además, camisa con bolsillo. → REGENERAR.
- **c30** OK. Un control en la mano derecha de Socorro; Pancho a la derecha riéndose, manos en la panza.
- **c31** (CTA) OK. Habla desde 0.00 s, con los labios moviéndose desde el primer frame; sonríe, se acomoda el pelo detrás de la oreja (1.5–3 s), ladea la cabeza y gesticula con la mano abierta (5–5.5 s). No señala.

## Recortes (no hace falta regenerar)
- c13 → hasta 3.9 s (quita el segundo "Yadira").
- La voz empieza tarde en c03 (1.56), c05 (1.10), c07 (0.86), c08 (1.70), c12 (1.02), c13 (1.14), c14 (0.98), c15 (0.92), c16 (0.84), c18 (0.75), c20 (1.52), c22 (1.96), c23 (1.32), c24 (1.12), c26 (1.50), c27 (1.66) y c29 (0.92); cortar ~0.1 s antes de la primera palabra.
- Avisos que se aceptan: c16 (pantalón más oscuro), bolsa de Paloma en el hombro derecho (coherente en todos), c13 (Yadira nítida al fondo, no desenfocada), c18 (small no oye "¿Doña Socorro?", medium sí).

## REGENERAR
**c09, c11, c21, c27, c28, c29**. Moví sus mp4 a `clips/old/` y corregí los prompts en `clips.py` (`python -I clips.py c09 c11 c21 c27 c28 c29`). El archivo carga y tiene 31 clips; faltan exactamente esos 6. Todos los prompts ya llevaban el ancla con `@{ASSET}` de cada personaje (también el del borde) y "No other people".
- c09: "Paloma wears exactly her reference outfit: the sage green knit top with her LIGHT GREY trousers and the thin brown belt (NOT green pants, NOT a matching knit set)"; manos vacías a los lados; Yadira en el borde DERECHO.
- c11: la blusa "in her RIGHT hand (the hand on the left side of the frame), her left hand empty"; Yadira en el borde DERECHO.
- c21: frase nueva, más fácil: "Eres una egoísta, Paloma." (en vez de "Qué nuera tan egoísta me tocó."; la versión SOFT pasa a "Eres muy difícil, Paloma."); Paloma en el borde IZQUIERDO.
- c27: "LIGHT GREY trousers and the thin brown belt (NOT black pants, NOT jeans)"; Socorro en el borde IZQUIERDO.
- c28: "Rodrigo on the LEFT side of the frame and Socorro on the RIGHT side of the frame … (Rodrigo always on the left, Socorro always on the right)"; reloj en la muñeca izquierda.
- c29: Socorro "blurred at the RIGHT edge … (Rodrigo on the left side of the frame, Socorro on the right)"; "plain pale yellow shirt without pockets".
- Al cambiar la frase de c21, actualizar `guion.md` (c21) si se quiere que coincida.

## Transcripciones (faster-whisper small; palabra@inicio-fin en segundos; dB = RMS)
small y medium coinciden en el texto salvo puntuación, "noera" (c05, small; medium: "nuera"), "Quien" y "use" sin tilde (c11 y c12, small), el "ya" de más en c20 (solo small), la "a" de "fuiste a molestar" en c23 (solo medium) y c18, donde small no oye "¿Doña Socorro?"; para c18 va la línea de medium.
- **c01** (-27 dB): ¿Mamá?@0.00-0.70 ¿Qué@1.16-1.34 hacen@1.34-1.52 todos@1.52-1.74 aquí?@1.74-2.06 ¿Y@3.64-3.78 todas@3.78-4.00 esas@4.00-4.26 maletas?@4.26-4.74
- **c02** (-26 dB): Nos@0.00-0.64 sacaron@0.64-1.06 del@1.06-1.24 departamento,@1.24-2.04 Rodrigo.@2.10-2.80 No@4.00-4.18 más@4.18-4.34 van@4.34-4.50 a@4.50-4.62 ser@4.62-4.82 unos@4.82-4.98 días.@4.98-5.38
- **c03** (-27 dB): ¿Cuñada?@1.56-2.12 ¿Qué@2.40-2.58 hay@2.58-2.72 de@2.72-2.82 cenar?@2.82-3.16
- **c04** (-24 dB): Vengo@0.00-0.54 cansada@0.54-1.08 de@1.08-1.22 la@1.22-1.32 oficina,@1.32-1.86 Pancho.@1.92-2.46 ¿Unos@3.86-4.74 días@4.74-4.98 con@4.98-5.32 tantas@5.32-5.74 maletas?@5.74-6.20
- **c05** (-26 dB): Somos@1.10-1.96 familia@1.96-2.42 Paloma,@2.42-2.88 una@3.46-3.70 buena@3.70-3.92 noera@3.92-4.32 no@4.32-4.50 pone@4.50-4.74 esas@4.74-4.94 caras.@4.94-5.46
- **c06** (-28 dB): No@0.46-0.88 más@0.88-1.06 es@1.06-1.18 en@1.18-1.32 lo@1.32-1.40 que@1.40-1.52 encuentran@1.52-1.96 algo@1.96-2.24 aguántame@2.24-4.08 tantito@4.08-4.52 mi@4.52-4.68 amor@4.68-4.92
- **c07** (-23 dB): ¿Dónde@0.86-1.46 quedó@1.46-1.72 la@1.72-1.82 comida@1.82-2.16 de@2.16-2.30 la@2.30-2.42 semana?@2.42-2.74 Ayer@4.56-4.86 compré@4.86-5.26 de@5.26-5.38 todo.@5.38-5.68
- **c08** (-25 dB): Ay,@1.70-2.14 nos@2.28-2.36 la@2.36-2.52 acabamos@2.52-2.92 anoche.@2.92-3.56
- **c09** (-25 dB): Era@0.80-1.56 para@1.56-1.78 mis@1.78-1.98 almuerzos@1.98-2.42 de@2.42-2.58 la@2.58-2.68 semana.@2.68-3.10 Ustedes@4.54-4.96 también@4.96-5.18 pueden@5.18-5.46 comprar@5.46-5.82 comida.@5.82-6.22
- **c10** (-22 dB): Ay,@0.00-1.12 pues@1.28-1.36 compras@1.36-1.90 más,@1.90-2.22 ni@3.02-3.76 que@3.76-3.92 fuera@3.92-4.12 tanto.@4.12-4.56
- **c11** (-26 dB): Quien@0.00-0.94 agarró@0.94-1.28 mi@1.28-1.38 blusa@1.38-1.68 blanca?@1.68-2.12 Es@3.42-4.06 la@4.06-4.18 de@4.18-4.28 la@4.28-4.36 oficina.@4.36-4.86
- **c12** (-23 dB): La@1.02-1.50 use@1.50-1.64 para@1.64-1.90 limpiar@1.90-2.30 el@2.30-2.40 piso,@2.40-2.78 poquito.@3.00-3.28 Ay,@5.08-5.56 pues@5.70-5.80 se@5.80-5.94 lava,@5.94-6.18 ¿no?@6.30-6.42
- **c13** (-27 dB): Hoy@1.28-1.88 tengo@1.88-2.12 una@2.12-2.28 presentación,@2.28-3.06 Yadira.@3.20-3.48 Yadira.@4.00-4.40
- **c14** (-20 dB): Antes@0.98-1.70 de@1.70-1.88 irte,@1.88-2.24 limpia@2.62-2.92 la@2.92-3.04 cocina.@3.04-3.52 Esos@4.52-4.92 trastes@4.92-5.34 no@5.34-5.60 se@5.60-5.74 lavan@5.74-6.10 solos.@6.10-6.60
- **c15** (-23 dB): Voy@0.92-1.58 tarde@1.58-1.88 por@1.88-2.10 culpa@2.10-2.34 de@2.34-2.52 Yadira.@2.52-2.90 Pancho@4.26-4.92 y@4.92-5.00 Yadira@5.00-5.36 también@5.36-5.66 viven@5.66-6.08 aquí.@6.08-6.30
- **c16** (-23 dB): Pues,@0.84-1.64 organizate.@1.78-2.46 Esos@4.00-4.36 dos@4.36-4.60 ya@4.60-5.00 tienen@5.00-5.26 sus@5.26-5.46 problemas.@5.46-5.98
- **c17** (-25 dB): Paloma,@0.00-1.74 una@2.40-2.68 señora@2.68-3.12 te@3.12-3.72 busca@3.72-3.96 en@3.96-4.10 recepción.@4.10-4.66
- **c18** (-28 dB): ¿Doña@0.00-1.24 Socorro?@1.24-1.88 ¿Qué@2.40-2.50 hace@2.50-2.68 usted@2.68-2.90 aquí?@2.90-3.26
- **c19** (-21 dB): Vine@0.00-0.64 por@0.64-0.90 el@0.90-1.02 control@1.02-1.44 de@1.44-1.60 la@1.60-1.72 cochera@1.72-2.24 quiero@2.24-3.72 entrar@3.72-4.10 y@4.10-4.28 salir@4.28-4.52 cuando@4.52-4.86 yo@4.86-5.16 quiera@5.16-5.62
- **c20** (-26 dB): Estoy@1.52-2.04 ya@2.04-2.18 en@2.18-2.22 la@2.22-2.30 oficina,@2.30-2.80 señora.@2.84-3.18 Aquí@4.42-4.92 no,@4.92-5.12 por@5.26-5.36 favor.@5.36-5.68
- **c21** (-24 dB): No@0.00-0.46 me@0.46-0.68 voy@0.68-0.96 sin@0.96-1.24 ese@1.24-1.50 control.@1.50-2.04 Que@3.38-3.94 no@3.94-4.26 era@4.26-4.44 tan@4.44-4.70 egoísta@4.70-5.48 me@5.48-5.66 tocó.@5.66-6.06
- **c22** (-27 dB): Vino@1.96-2.48 a@2.48-2.60 avergonzarme@2.60-3.36 frente@3.36-3.58 a@3.58-3.82 todos.@3.82-4.08
- **c23** (-26 dB): Mamá,@1.32-1.72 ¿fuiste@2.10-2.30 molestar@2.30-2.70 a@2.70-2.82 Paloma@2.82-3.12 a@3.12-3.24 la@3.24-3.28 oficina?@3.28-3.68 Le@4.52-4.70 pudo@4.70-4.90 ir@4.90-5.04 muy@5.04-5.22 mal@5.22-5.50 por@5.50-5.66 tu@5.66-5.80 culpa.@5.80-6.12
- **c24** (-23 dB): No@1.12-1.70 más@1.70-1.88 pedí@1.88-2.14 el@2.14-2.24 control.@2.24-2.64 ¿Ahora@4.36-4.94 la@4.94-5.08 vas@5.08-5.22 a@5.22-5.34 defender?@5.34-5.66
- **c25** (-21 dB): Pancho,@0.00-0.54 mañana@0.94-1.30 sales@1.30-1.64 a@1.64-1.82 buscar@1.82-2.02 empleo@2.02-2.74 y@2.74-3.66 si@3.66-3.78 no@3.78-3.92 respetan@3.92-4.42 nuestra@4.42-4.62 casa,@4.62-4.94 se@5.88-6.48 van.@6.48-6.68
- **c26** (-28 dB): Esta@1.50-1.86 casa@1.86-2.20 es@2.20-2.38 de@2.38-2.48 Rodrigo.@2.48-3.46 Él@4.46-4.74 no@4.74-4.88 nos@4.88-5.06 va@5.06-5.20 a@5.20-5.34 sacar.@5.34-5.48
- **c27** (-29 dB): Rodrigo@1.66-2.22 también@2.22-2.46 es@2.46-2.76 mi@2.76-2.88 esposo,@2.88-3.34 señora.@3.42-3.68
- **c28** (-28 dB): Pues@0.00-0.72 decide,@0.72-1.10 Rodrigo,@1.28-1.82 tu@2.54-3.22 madre@3.22-3.56 o@3.56-4.00 tu@4.00-4.12 esposa.@4.12-4.56
- **c29** (-29 dB): No@0.92-1.68 me@1.68-1.82 hagas@1.82-2.02 escoger,@2.02-2.40 mamá.@2.50-3.08
- **c30** (-23 dB): Entonces@0.00-0.68 nos@0.68-0.96 quedamos@0.96-1.38 todos@1.38-1.70 aquí.@1.70-2.14 Total,@3.16-4.00 Rodrigo@4.62-4.98 ya@4.98-5.12 me@5.12-5.24 dio@5.24-5.38 el@5.38-5.50 suyo.@5.50-5.92
- **c31** (-23 dB): ¿Ustedes@0.00-1.06 creen@1.06-1.38 que@1.38-1.48 Rodrigo@1.48-2.02 va@2.02-2.14 a@2.14-2.22 escoger@2.22-2.54 a@2.54-2.66 su@2.66-2.80 mamá?@2.80-3.26 Denle@4.26-4.54 me@4.54-4.66 gusta@4.66-4.96 y@4.96-5.24 compartan@5.24-5.86 para@5.86-6.10 ver@6.10-6.34 la@6.34-6.48 segunda@6.48-6.80 parte.@6.80-7.20
