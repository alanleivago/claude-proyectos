# QA clips — mecanico (El Mecánico · Parte 1) (2026-11-04)

Método: los 31 clips de CLIPS (c01–c31) estaban en `clips/`. ffmpeg los decodificó todos sin errores (6 u 8 s, como pide el prompt). Hice una hoja de contactos a 2 fps por clip (scratchpad `qa_mec/`), con ampliaciones de c05 (4 fps, 0–1.5 s), c23 (3–7 s), c26 (3 s), c27 (0–2 s) y c31. Detección de cortes internos (scene > 0.12): ninguno. Transcribí con faster-whisper small y medium (es, tiempos por palabra; wav 16 kHz cargado con numpy, CPU int8) y medí el RMS cada 0.25 s en c10, c17 y c21. Comparé contra EVARISTO, PATRONTALLER, OSVALDO, CELSO, las 3 LOC y PROP_CAJAROJA.

Ropa: Fermín sale en todos sus clips (c01, c03, c05, c11, c18, c21, c28, c30 y en los bordes) con la chamarra guinda, la camisa azul claro, el pantalón gris oscuro y el reloj dorado en la muñeca izquierda; **nunca sale vestido de mecánico**. Osvaldo (overol gris claro, playera negra), Celso (gorra beige, chaleco verde acolchado, franela roja y azul marino, jeans) y Evaristo (overol verde olivo con grasa, playera gris, bigote) se mantienen en todos sus clips, también de espaldas.
**Trapo de Evaristo:** en los planos de espaldas (c01, c05, c06, c24) y en c09 y c26 está en el hombro IZQUIERDO, como en la hoja; en los planos de frente c02, c04, c07, c23, c25 y c31 está en el DERECHO (el modelo lo espeja). Dentro de cada plano no se mueve, solo cambia de un plano a otro; se acepta como aviso (en los dos que regenero pedí el hombro izquierdo).
Gente: nadie ajeno ni duplicado en ningún clip. Nadie aparece de golpe (en c05 Evaristo da un paso en el borde izquierdo a 0.3 s; ya estaba en el frame 0).
Objetos: UNA sola caja roja en c06–c09 y c23–c25, sin deformarse (c22 no la muestra; se ve otra parte del banco). **c07: Evaristo lleva la caja en la mano IZQUIERDA** (0–1.5 s, luego sale de cuadro); en c06, c08 y c09 va en la DERECHA. Un solo cable en c26 (gris oscuro, ~40 cm, terminales verdes, mano derecha). **c27: del cable de Evaristo cuelga un cable ROJO largo hasta el suelo** (0–1.5 s); en c26 es gris y corto. Props que no piden los prompts: Osvaldo con un llavero negro en c06 (3.5–8 s) y Evaristo con un objeto negro pequeño (control o llave) en la mano izquierda en el CTA c31 (0.5–8 s); se aceptan.
Lados: despido (Evaristo izquierda, Fermín derecha), sobrino (Evaristo izquierda, Osvaldo derecha), Celso–Fermín (Celso izquierda), Celso–Osvaldo (Celso izquierda), cochera (Evaristo izquierda, Celso derecha) y c28–c29 (Osvaldo izquierda, Fermín derecha) son coherentes en todos los clips.
Texto quemado: **c25 trae subtítulos quemados** ("Acepto, pero no como favor." 2–4 s y "Me lo voy a ganar." 5–6.5 s, a la altura del pecho). El letrero "TALLER MECÁNICO" de LOC_PECERA se asoma por el cristal en c20 (0–1 s, "LER M") y c29 ("TALLE"); es parte de la locación, se acepta.
Contacto: ninguno. Nadie señala con el dedo (Evaristo abre las manos en c02, Celso gesticula con la palma en c17).
Pronunciación: "Evaristo", "Fermín", "Osvaldo", "sulfatado", "refacciones" y "camionetas" se oyen bien. **c21 dice "Elzo" en vez de "Celso"** (small y medium) y medium oye "a pedirme nada" repetido (5.50–6.34 s; hay voz a -24 dB en 5.5–6.0 s). **c10 repite "¿Dónde está Evaristo?"** (1.0–2.3 y 3.75–4.6 s). c17: entre las dos frases hay un "¿Ah?" corto (3.75–4.0 s; small "¿Ay?", medium "¿Ahí?"); se acepta. c04: small "tuvo", medium "tuve"; se acepta. c18: medium no oye "Evaristo", small sí (0–1.8 s). c03: medium no oye "Ya no rindes", small sí.

## Veredicto por clip
- **c01** OK. Fermín habla desde 0.96 s, manos sobre el escritorio; Evaristo de espaldas a la izquierda.
- **c02** OK (aviso trapo). Fermín al borde derecho.
- **c03** OK. Fermín de brazos cruzados; Evaristo de espaldas a la izquierda.
- **c04** OK (aviso trapo). Fermín de brazos cruzados a la derecha.
- **c05** OK. Fermín se sienta y toma un papel; Evaristo a la izquierda.
- **c06** OK. Caja en la mano derecha de Evaristo (borde izquierdo); Osvaldo con un llavero negro desde 3.5 s.
- **c07** **Mano cambiada**: la caja va en la mano IZQUIERDA (0–1.5 s); en c06, c08 y c09, en la derecha. La voz empieza a 0.0 s, no se puede recortar. → REGENERAR.
- **c08** OK. Evaristo a la izquierda con la caja en la derecha.
- **c09** OK. Caja en la derecha, trapo en el hombro izquierdo; Osvaldo a la derecha.
- **c10** OK, con recorte: repite "¿Dónde está Evaristo?" → usar **3.6–7.2 s** (queda "¿Dónde está Evaristo? Él siempre atiende mis camionetas."). Fermín al borde derecho; camioneta blanca y una con el cofre abierto al fondo.
- **c11** OK. Celso de espaldas a la izquierda; Fermín con sonrisa falsa.
- **c12** OK. Celso de brazos cruzados; Fermín al borde derecho.
- **c13** OK. Celso entra caminando y mira el reloj; Osvaldo a la derecha.
- **c14** OK. Cofre abierto detrás de Osvaldo; Celso a la izquierda.
- **c15** OK. Osvaldo a la derecha.
- **c16** OK. Celso a la izquierda (0–2 s); luego sale de cuadro por el push-in.
- **c17** OK, con aviso: "¿Ah?" corto entre frases (3.75–4.0 s). Fermín al borde derecho.
- **c18** OK. Fermín de brazos cruzados, reloj visible; Celso a la izquierda.
- **c19** OK. Fermín a la derecha.
- **c20** OK. Celso se acomoda la gorra con la mano derecha; letrero del taller al fondo (0–1 s).
- **c21** **Mala pronunciación**: "Haz lo que quieras, Elzo" (1.70–1.98 s) y repite "a pedirme nada" (5.50–6.34 s, medium). Recortar a 3.3–5.2 s deja solo la segunda frase. → REGENERAR.
- **c22** OK. Evaristo de espaldas a la izquierda; la caja no se ve.
- **c23** OK (aviso trapo). Una caja en el banco; Celso a la derecha.
- **c24** OK. Evaristo de espaldas a la izquierda; una caja en el banco.
- **c25** **Texto quemado**: subtítulos "Acepto, pero no como favor." y "Me lo voy a ganar." → REGENERAR.
- **c26** OK. Cable en la mano derecha; trapo en el hombro izquierdo; cofre abierto; Celso a la derecha.
- **c27** **Cable cambiado**: de la mano de Evaristo cuelga un cable rojo largo hasta el suelo (0–1.5 s); en c26 es gris y corto. La voz empieza a 0.0 s. → REGENERAR.
- **c28** OK. Osvaldo de espaldas a la izquierda; Fermín con las manos en el escritorio.
- **c29** OK. Fermín al borde derecho; letrero "TALLE" al fondo.
- **c30** OK. Fermín solo junto al ventanal, manos en los bolsillos, sonrisa lenta.
- **c31** (CTA) OK, con recorte: la voz empieza a 0.54 s → cortar desde 0.45 s. Habla a cámara con carisma: se acomoda el trapo (0.5–1.5 s), gesticula con la mano abierta (4.5–5.5 s) y sonríe al final. No señala. Aviso: lleva un objeto negro pequeño en la mano izquierda.

## Recortes (no hace falta regenerar)
- c10 → 3.6–7.2 s (quita el primer "¿Dónde está Evaristo?").
- c31 → desde 0.45 s.
- La voz empieza tarde en c01 (0.96), c02 (0.94), c04 (0.68), c05 (1.50), c08 (1.08), c09 (1.26), c11 (0.98), c16 (0.90), c17 (0.62), c20 (0.94), c22 (0.94) y c23 (0.84); cortar ~0.1 s antes de la primera palabra.
- Avisos que se aceptan: trapo en el hombro derecho en los planos de frente (c02, c04, c23, c31), "¿Ah?" en c17, props negros en c06 y c31, letrero del taller en c20 y c29.

## REGENERAR
**c07, c21, c25, c27**. Moví sus mp4 a `clips/old/` y corregí los prompts en `clips.py` (`python -I clips.py c07 c21 c25 c27`). El archivo carga y tiene 31 clips; faltan exactamente esos 4. Todos los prompts ya llevaban el ancla con `@{ASSET}` de cada personaje (también el del borde) y "No other people".
- c07: "he holds the red toolbox by its handle in his RIGHT hand, which is on the LEFT side of the frame, his left hand empty; the checkered rag hangs over his LEFT shoulder, on the RIGHT side of the frame"; "(Evaristo on the left side of the frame, Osvaldo on the right)".
- c21: frase nueva sin el nombre: "Haz lo que quieras." (en vez de "Haz lo que quieras, Celso."), tono "saying each line only once"; "(Celso on the left side of the frame, Fermín on the right)".
- c25: "No subtitles, no captions, no words written anywhere on the image."; trapo en el hombro izquierdo; "(Evaristo on the left side of the frame, Celso on the right)".
- c27: Celso con la mano derecha en la camioneta; Evaristo con el cable en la mano DERECHA, "the same cable as before: about 40 cm long, dark grey insulation, a green crusted terminal at each end; no red wires, no jumper cables, nothing hanging down to the floor"; "(Evaristo on the left side of the frame, Celso on the right)".
- Al cambiar la frase de c21, actualizar `guion.md` (c21) si se quiere que coincida.

## Transcripciones (faster-whisper; palabra@inicio-fin en segundos; dB = RMS)
### small
- **c01** (-29 dB): Evaristo,@0.96-1.56 a@2.16-2.24 partir@2.24-2.50 de@2.50-2.70 hoy@2.70-2.92 ya@2.92-3.38 no@3.38-3.52 te@3.52-3.62 necesito.@3.62-4.24 Recoge@5.26-5.70 tus@5.70-5.84 cosas.@5.84-6.14
- **c02** (-25 dB): como@0.94-1.46 que@1.46-1.66 ya@1.66-1.82 no@1.82-1.94 me@1.94-2.06 necesita.@2.06-2.66 Faltan@4.04-4.54 tres@4.54-4.76 días@4.76-5.00 para@5.00-5.28 el@5.28-5.42 bono,@5.42-5.86 don@5.86-5.96 Fermín.@5.96-6.40
- **c03** (-30 dB): Ya@0.00-1.30 no@1.30-1.46 rindes@1.46-1.86 como@1.86-2.04 antes.@2.04-2.44 Necesito@3.76-4.56 gente@4.56-4.84 nueva@4.84-5.10 aquí.@5.10-5.42
- **c04** (-23 dB): 20@0.68-1.32 años@1.32-1.70 aquí@1.70-2.04 y@2.04-2.76 nunca@2.76-2.96 tuvo@2.96-3.28 un@3.28-3.40 reclamo@3.40-3.88 de@3.88-3.96 mí@3.96-4.16 y@4.16-5.36 lo@5.36-5.48 que@5.48-5.58 me@5.58-5.70 tocaba@5.70-6.06 del@6.06-6.22 bono@6.22-6.62
- **c05** (-29 dB): El@1.50-1.86 bono@1.86-2.18 es@2.18-2.30 para@2.30-2.48 los@2.48-2.64 que@2.64-2.78 se@2.78-2.88 quedan.@2.88-3.28
- **c06** (-24 dB): Don@0.00-0.80 Evaristo,@0.80-1.24 perdóneme.@1.58-2.12 Mi@3.38-3.62 tío@3.62-3.84 me@3.84-3.96 dio@3.96-4.10 supuesto@4.10-4.46 ayer.@4.46-4.86
- **c07** (-22 dB): ¿Tu@0.00-0.66 tío?@0.66-0.96 Entonces@1.92-2.28 por@2.28-2.60 eso@2.60-2.72 me@2.72-2.88 sacó@2.88-3.22 3@4.04-4.68 días@4.68-4.92 antes@4.92-5.24 del@5.24-5.48 bono@5.48-5.90
- **c08** (-26 dB): Yo@1.08-1.68 no@1.68-1.80 sabía@1.80-2.10 nada,@2.10-2.40 se@3.32-3.56 lo@3.56-3.68 prometo.@3.68-4.18
- **c09** (-27 dB): No@1.26-1.94 es@1.94-2.06 tu@2.06-2.14 culpa@2.14-2.48 muchacho,@2.48-2.98 nomás@4.06-4.60 aprende@4.60-5.02 a@5.02-5.12 hacer@5.12-5.60 las@5.60-5.72 cosas@5.72-5.98 bien.@5.98-6.32
- **c10** (-25 dB): ¿Dónde@0.00-1.42 está@1.42-1.62 Evaristo?@1.62-2.10 ¿Dónde@3.46-3.88 está@3.88-4.04 Evaristo?@4.04-4.52 Él@5.32-5.46 siempre@5.46-5.82 atiende@5.82-6.20 mis@6.20-6.40 camionetas.@6.40-6.96
- **c11** (-21 dB): Evaristo@0.98-1.84 ya@1.84-2.04 no@2.04-2.18 daba@2.18-2.42 resultados.@2.42-2.86 Ahora@4.46-4.90 te@4.90-5.10 atiende@5.10-5.42 mi@5.42-5.58 sobrino,@5.58-6.06 Osvaldo.@6.48-7.00
- **c12** (-25 dB): Qué@0.00-0.66 raro.@0.66-1.02 ¿Nunca@2.06-2.56 tuve@2.56-2.84 un@2.84-2.94 reclamo@2.94-3.42 de@3.42-3.52 él?@3.52-3.68
- **c13** (-23 dB): Ya@0.00-0.60 van@0.60-0.78 dos@0.78-0.98 horas@0.98-1.22 muchacho@1.22-1.72 y@1.72-2.74 la@2.74-2.88 camioneta@2.88-3.36 sigue@3.36-3.64 perdiendo@3.64-4.12 fuerza.@4.12-4.42
- **c14** (-23 dB): No@0.00-0.72 le@0.72-0.82 encuentro@0.82-1.16 el@1.16-1.24 problema@1.24-1.62 señor,@1.62-1.94 don@3.78-4.24 Evaristo@4.24-4.76 ya@4.76-5.46 lo@5.46-5.58 hubiera@5.58-5.74 encontrado.@5.74-6.32
- **c15** (-27 dB): Dime@0.00-0.92 la@0.92-1.06 verdad@1.06-1.32 Osvaldo,@1.32-1.96 ¿Evaristo@2.76-3.98 hacía@3.98-4.26 mal@4.26-4.46 las@4.46-4.64 cosas?@4.64-4.92
- **c16** (-25 dB): No@0.90-1.38 señor,@1.38-1.64 nadie@2.10-2.38 aquí@2.38-2.60 sabe@2.60-2.82 más@2.82-3.06 que@3.06-3.22 él.@3.22-3.38 Mi@4.20-4.68 tío@4.68-4.84 lo@4.84-4.98 sacó@4.98-5.30 tres@5.30-5.52 días@5.52-5.72 antes@5.72-6.00 del@6.00-6.22 bono.@6.22-6.54
- **c17** (-27 dB): ¿Sacaste@0.62-1.14 de@1.14-1.26 baristo@1.26-1.62 tres@1.62-1.90 días@1.90-2.14 antes@2.14-2.40 del@2.40-2.62 bono?@2.62-3.22 ¿Ay?@3.56-3.94 ¿No@5.14-5.30 más@5.30-5.46 para@5.46-5.64 poner@5.64-5.94 a@5.94-6.06 tu@6.06-6.18 sobrino?@6.18-6.60
- **c18** (-29 dB): Evaristo@0.00-1.80 ya@1.80-2.60 no@2.60-2.74 daba@2.74-2.98 resultados.@2.98-3.36
- **c19** (-22 dB): Tu@0.00-1.50 sobrino@1.50-1.98 ni@1.98-2.18 encontró@2.18-2.64 el@2.64-2.72 problema.@2.72-3.20 Ya@4.42-4.74 escuché@4.74-5.12 suficiente,@5.12-5.68 Fermín.@5.80-6.16
- **c20** (-26 dB): Mis@0.94-1.78 ocho@1.78-2.10 camionetas@2.10-2.68 se@2.68-3.26 van@3.26-3.44 con@3.44-3.60 Evaristo.@3.60-4.12
- **c21** (-25 dB): Haz@0.00-0.90 lo@0.90-1.04 que@1.04-1.16 quieras,@1.16-1.62 Elzo.@1.70-1.98 Luego@3.36-3.62 no@3.62-3.84 vengas@3.84-4.16 a@4.16-4.26 pedirme@4.26-4.64 nada,@4.64-4.92
- **c22** (-24 dB): Evaristo,@0.94-1.70 quiero@2.44-2.74 que@2.74-2.94 tú@2.94-3.16 atiendas@3.16-3.78 mis@3.78-4.00 ocho@4.00-4.34 camionetas.@4.34-4.88
- **c23** (-25 dB): Ya@0.84-1.42 no@1.42-1.60 tengo@1.60-1.84 local,@1.84-2.24 don@2.40-2.50 Celso.@2.50-2.88 Nomás@4.76-5.06 me@5.06-5.18 quedan@5.18-5.48 mis@5.48-5.62 herramientas.@5.62-6.30
- **c24** (-21 dB): Pues@0.00-0.56 empieza@0.56-0.94 aquí@0.94-1.26 mismo,@1.26-1.64 en@2.02-2.22 tu@2.22-2.34 casa.@2.34-2.64 Mañana@4.26-5.02 te@5.02-5.54 traigo@5.54-5.82 la@5.82-5.96 primera.@5.96-6.30
- **c25** (-25 dB): Acepto@2.26-2.80 pero@2.80-3.22 no@3.22-3.40 como@3.40-3.60 favor,@3.60-3.94 me@4.42-5.34 lo@5.34-5.48 voy@5.48-5.62 a@5.62-5.72 ganar.@5.72-6.18
- **c26** (-24 dB): Aquí@0.00-1.20 está@1.20-1.36 el@1.36-1.46 problema@1.46-1.84 don@1.84-2.06 Celso.@2.06-2.46 Este@3.24-3.86 cable@3.86-4.16 de@4.16-4.32 tierra@4.32-4.70 está@4.70-5.24 sulfatado.@5.24-5.96
- **c27** (-21 dB): confirmín@0.00-1.44 me@1.44-1.58 aseguraron@1.58-2.14 que@2.14-2.34 era@2.34-2.46 normal@2.46-2.90 las@2.90-4.36 otras@4.36-4.60 siete@4.60-5.00 también@5.00-5.38 son@5.38-5.64 tuyas@5.64-6.14
- **c28** (-26 dB): ¿Tú@0.00-0.78 le@0.78-0.90 contaste@0.90-1.36 a@1.36-1.46 Celso?@1.46-1.80 Me@3.12-3.32 hiciste@3.32-3.70 quedar@3.70-3.98 como@3.98-4.32 mentiroso.@4.32-5.42
- **c29** (-23 dB): No@0.00-0.86 más@0.86-1.00 le@1.00-1.12 conté@1.12-1.40 la@1.40-1.50 verdad@1.50-1.76 tío,@1.76-2.66 yo@3.72-4.12 nunca@4.12-4.34 le@4.34-4.50 pedí@4.50-4.78 que@4.78-4.88 sacara@4.88-5.24 a@5.24-5.34 don@5.34-5.42 Evaristo.@5.42-5.90
- **c30** (-22 dB): Si@0.00-0.62 Evaristo@0.62-1.04 quiere@1.04-1.30 competir@1.30-1.90 conmigo,@1.90-2.64 que@2.90-2.92 lo@2.92-3.04 intente.@3.04-3.54 Mañana@4.52-4.98 hablo@4.98-5.74 con@5.74-5.88 el@5.88-6.00 proveedor@6.00-6.50 de@6.50-6.60 refacciones.@6.60-7.24
- **c31** (-21 dB): ¿Ustedes@0.54-1.02 creen@1.02-1.22 que@1.22-1.34 Fermín@1.34-1.78 se@1.78-1.94 va@1.94-2.06 a@2.06-2.16 salir@2.16-2.32 con@2.32-2.52 la@2.52-2.66 suya?@2.66-3.06 Denle@4.36-4.60 me@4.60-4.72 gusta@4.72-5.02 y@5.02-5.38 compartan@5.38-6.02 para@6.02-6.26 ver@6.26-6.46 la@6.46-6.58 segunda@6.58-6.88 parte.@6.88-7.30

### medium
- **c01** (-29 dB): Evaristo,@1.18-1.86 a@2.26-2.36 partir@2.36-2.62 de@2.62-2.82 hoy@2.82-3.16 ya@3.16-3.46 no@3.46-3.62 te@3.62-3.86 necesito.@3.86-4.46 Recoge@5.36-5.76 tus@5.76-5.96 cosas.@5.96-6.32
- **c02** (-25 dB): Como@0.98-1.50 que@1.50-1.76 ya@1.76-1.90 no@1.90-2.08 me@2.08-2.34 necesita.@2.34-2.82 Faltan@4.28-4.64 tres@4.64-4.88 días@4.88-5.12 para@5.12-5.36 el@5.36-5.58 bono,@5.58-5.90
- **c03** (-30 dB): como@0.00-2.06 antes.@2.06-2.68 Necesito@4.10-4.62 gente@4.62-4.96 nueva@4.96-5.24 aquí.@5.24-5.92
- **c04** (-23 dB): Veinte@1.02-1.58 años@1.58-1.88 aquí@1.88-2.34 y@2.34-2.88 nunca@2.88-3.16 tuve@3.16-3.36 un@3.36-3.56 reclamo@3.56-3.94 de@3.94-4.10 mí.@4.10-4.36 ¿Y@5.32-5.42 lo@5.42-5.58 que@5.58-5.64 me@5.64-5.86 tocaba@5.86-6.14 del@6.14-6.32 bono?@6.32-6.66
- **c05** (-29 dB): El@1.50-1.94 bono@1.94-2.24 es@2.24-2.44 para@2.44-2.58 los@2.58-2.72 que@2.72-2.84 se@2.84-3.06 quedan.@3.06-3.80
- **c06** (-24 dB): Don@0.00-0.86 Evaristo,@0.86-1.44 perdóneme.@1.90-2.40 Mi@3.56-3.74 tío@3.74-3.90 me@3.90-4.08 dio@4.08-4.18 su@4.18-4.38 puesto@4.38-4.64 ayer.@4.64-5.08
- **c07** (-22 dB): Tu@0.00-0.74 tío?@0.74-1.36 Entonces@2.24-2.46 por@2.46-2.70 eso@2.70-2.78 me@2.78-2.98 sacó?@2.98-4.26 Tres@4.66-4.82 días@4.82-5.04 antes@5.04-5.34 del@5.34-5.54 bono?@5.54-5.96
- **c08** (-26 dB): Yo@0.00-1.74 no@1.74-1.92 sabía@1.92-2.20 nada,@2.20-2.74 se@3.54-3.66 lo@3.66-3.88 prometo.@3.88-4.76
- **c09** (-27 dB): No@1.32-1.96 es@1.96-2.14 tu@2.14-2.30 culpa@2.30-2.56 muchacho,@2.56-4.02 nomás@4.46-4.70 aprende@4.70-5.12 a@5.12-5.46 hacer@5.46-5.64 las@5.64-5.84 cosas@5.84-6.14 bien.@6.14-6.50
- **c10** (-25 dB): ¿Dónde@0.00-1.56 está@1.56-1.68 Evaristo?@1.68-2.34 ¿Dónde@3.76-3.96 está@3.96-4.06 Evaristo?@4.06-4.78 Él@5.36-5.56 siempre@5.56-5.92 atiende@5.92-6.28 mis@6.28-6.48 camionetas.@6.48-7.20
- **c11** (-21 dB): Evaristo@1.40-1.92 ya@1.92-2.14 no@2.14-2.32 daba@2.32-2.56 resultados,@2.56-3.32 ahora@4.84-4.98 te@4.98-5.20 atiende@5.20-5.48 mi@5.48-5.70 sobrino,@5.70-6.40 Osvaldo.@6.64-7.24
- **c12** (-25 dB): ¡Qué@0.00-0.80 raro!@0.80-1.30 ¿Nunca@2.28-2.66 tuve@2.66-2.86 un@2.86-3.06 reclamo@3.06-3.52 de@3.52-3.60 él?@3.60-3.80
- **c13** (-23 dB): Ya@0.00-0.66 van@0.66-0.82 dos@0.82-1.06 horas@1.06-1.30 muchacho@1.30-2.34 y@2.34-2.82 la@2.82-3.00 camioneta@3.00-3.46 sigue@3.46-3.72 perdiendo@3.72-4.18 fuerza.@4.18-4.60
- **c14** (-23 dB): No@0.00-0.74 le@0.74-0.96 encuentro@0.96-1.20 el@1.20-1.40 problema,@1.40-1.72 señor.@2.54-2.54 Don@4.20-4.34 Evaristo@4.34-5.02 ya@5.02-5.54 lo@5.54-5.68 hubiera@5.68-5.88 encontrado.@5.88-6.50
- **c15** (-27 dB): Dime@0.00-1.02 la@1.02-1.16 verdad@1.16-1.46 Osvaldo,@1.46-3.24 ¿Evaristo@3.54-4.06 hacía@4.06-4.36 malas@4.36-4.82 cosas?@4.82-5.10
- **c16** (-25 dB): No@1.00-1.46 señor,@1.46-1.90 nadie@2.32-2.46 aquí@2.46-2.68 sabe@2.68-2.92 más@2.92-3.12 que@3.12-3.30 él,@3.30-4.28 mi@4.64-4.76 tío@4.76-4.92 lo@4.92-5.10 sacó@5.10-5.42 tres@5.42-5.62 días@5.62-5.82 antes@5.82-6.10 del@6.10-6.28 bono.@6.28-6.98
- **c17** (-27 dB): ¿Sacaste@0.62-1.18 a@1.18-1.38 Evaristo@1.38-1.72 tres@1.72-2.00 días@2.00-2.28 antes@2.28-2.52 del@2.52-2.70 bono?@2.70-3.00 ¿Ahí?@4.50-5.06 ¿Nomás@5.24-5.54 para@5.54-5.76 poner@5.76-6.00 a@6.00-6.16 tu@6.16-6.26 sobrino?@6.26-6.76
- **c18** (-29 dB): ya@1.32-2.60 no@2.60-2.88 daba@2.88-3.14 resultados.@3.14-3.78
- **c19** (-22 dB): Tu@0.00-1.62 sobrino@1.62-2.08 ni@2.08-2.34 encontró@2.34-2.70 el@2.70-2.90 problema.@2.90-3.46 Ya@4.70-4.86 escuché@4.86-5.20 suficiente,@5.20-5.74 Fermín.@5.98-6.42
- **c20** (-26 dB): Mis@0.00-1.86 ocho@1.86-2.26 camionetas@2.26-2.96 se@2.96-3.38 van@3.38-3.48 con@3.48-3.70 Evaristo.@3.70-4.24
- **c21** (-25 dB): Haz@0.00-0.94 lo@0.94-1.14 que@1.14-1.34 quieras,@1.34-1.70 Elzo.@1.84-2.42 Luego@3.54-3.72 no@3.72-3.94 vengas@3.94-4.24 a@4.24-4.42 pedirme@4.42-4.80 nada.@4.80-5.04 A@5.50-5.62 pedirme@5.62-6.06 nada.@6.06-6.34
- **c22** (-24 dB): Evaristo,@1.16-2.08 quiero@2.78-2.82 que@2.82-3.02 tú@3.02-3.28 atiendas@3.28-3.94 mis@3.94-4.12 ocho@4.12-4.50 camionetas.@4.50-5.04
- **c23** (-25 dB): Ya@1.06-1.50 no@1.50-1.72 tengo@1.72-1.92 local,@1.92-2.38 don@2.48-2.58 Celso.@2.58-3.40 Nomás@4.90-5.10 me@5.10-5.32 quedan@5.32-5.54 mis@5.54-5.74 herramientas.@5.74-6.66
- **c24** (-21 dB): pues@0.00-0.72 empieza@0.72-1.10 aquí@1.10-1.40 mismo@1.40-1.80 en@1.80-2.32 tu@2.32-2.44 casa@2.44-3.98 mañana@3.98-5.16 te@5.16-5.66 traigo@5.66-5.88 la@5.88-6.14 primera@6.14-6.42
- **c25** (-25 dB): Acepto,@2.70-3.10 pero@3.18-3.30 no@3.30-3.52 como@3.52-3.72 favor.@3.72-4.16 Me@5.30-5.46 lo@5.46-5.58 voy@5.58-5.72 a@5.72-5.82 ganar.@5.82-6.44
- **c26** (-24 dB): Aquí@0.00-1.24 está@1.24-1.42 el@1.42-1.60 problema,@1.60-1.94 don@2.06-2.16 Celso.@2.16-2.96 Este@3.80-3.96 cable@3.96-4.26 de@4.26-4.52 tierra@4.52-4.84 está@4.84-5.32 sulfatado.@5.32-6.10
- **c27** (-21 dB): Con@0.00-1.14 Fermín@1.14-1.48 me@1.48-1.72 aseguraron@1.72-2.24 que@2.24-2.40 era@2.40-2.54 normal.@2.54-3.12 Las@4.34-4.52 otras@4.52-4.76 siete@4.76-5.14 también@5.14-5.52 son@5.52-5.84 tuyas.@5.84-6.36
- **c28** (-26 dB): Tú@0.00-0.80 le@0.80-1.12 contaste@1.12-1.40 a@1.40-1.58 Celso,@1.58-2.12 me@3.24-3.42 hiciste@3.42-3.78 quedar@3.78-4.10 como@4.10-4.80 mentiroso.@4.80-5.70
- **c29** (-23 dB): No@0.50-0.94 más@0.94-1.04 le@1.04-1.22 conté@1.22-1.48 la@1.48-1.62 verdad@1.62-1.92 tío,@1.92-3.36 yo@4.14-4.22 nunca@4.22-4.42 le@4.42-4.64 pedí@4.64-4.86 que@4.86-5.00 sacara@5.00-5.32 a@5.32-5.40 don@5.40-5.50 Evaristo.@5.50-6.06
- **c30** (-22 dB): Si@0.00-0.68 Evaristo@0.68-1.14 quiere@1.14-1.40 competir@1.40-2.00 conmigo,@2.00-2.70 que@2.94-2.98 lo@2.98-3.26 intente.@3.26-4.38 Mañana@4.80-5.26 hablo@5.26-5.78 con@5.78-5.96 el@5.96-6.20 proveedor@6.20-6.54 de@6.54-6.76 refacciones.@6.76-7.40
- **c31** (-21 dB): ¿Ustedes@0.62-1.16 creen@1.16-1.32 que@1.32-1.48 Fermín@1.48-1.86 se@1.86-2.02 va@2.02-2.16 a@2.16-2.16 salir@2.16-2.44 con@2.44-2.62 la@2.62-2.82 suya?@2.82-3.26 Denle@4.46-4.72 me@4.72-4.84 gusta@4.84-5.16 y@5.16-5.66 compartan@5.66-6.12 para@6.12-6.32 ver@6.32-6.56 la@6.56-6.76 segunda@6.76-7.06 parte.@7.06-7.44
