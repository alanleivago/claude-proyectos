# QA clips — tele-nueva (La Tele Nueva · Parte 1) (2026-11-04)

Método: los 32 clips de CLIPS (c01–c32) estaban en `clips/`; no faltaba ninguno y ffmpeg leyó todos (video 720x1280 y audio). Hice una hoja de contactos a 2 fps por clip (scratchpad `qa_tele/`) y fotogramas ampliados de c06 (0.5 s), c08 (0.3 y 7.3 s), c16 (2 y 8 s, la tele), c19 (4.5 y 7.6 s), c23 (0.4–1.4 s a 8 fps) y c26 (4.5 s). Transcribí todo con faster-whisper small y medium (es, tiempos por palabra; wav 16 kHz cargado con numpy). Comparé contra las hojas GENARO, REMEDIOS, GRISELDA, CHABELA, LOC_CASITA y LOC_RESIDENCIA.
Ropa: Genaro (camisa verde olivo arremangada, jeans, cinturón café, botas cafés, bigote) se mantiene en todos sus clips. Chabela (blusa morada con flores blancas, pantalón crema, collar dorado, zapatos beige) también. Remedios lleva en todos los clips un delantal de crochet **de peto** (en la hoja es de cintura); es igual en todos sus clips, así que se acepta. **Griselda lleva cola de caballo en c07 y el pelo suelto en c10, c11, c17, c19, c20, c23, c29 y c31**; c07 es el único distinto.
Tele: la vieja es una CRT gris en LOC_CASITA (c01–c09, c25) y la nueva es una pantalla plana negra de marco delgado en LOC_RESIDENCIA y en LOC_CASITA desde c26. **Hay dos teles a la vez en c19 y c22**, la tele de c16 se deforma y **en c24 la tele plana se convierte en la CRT** al final. En c07 la imagen de la tele queda dentro de la pantalla.
Ningún clip trae texto quemado. Contacto: Griselda le pone la mano en el hombro a Chabela en c23 y Genaro abraza a su mamá por los hombros en c28, los dos con suavidad. Nadie señala con el dedo.
Pronunciación: "Genaro", "Genarito", "Griselda", "Chabela", "ochenta y seis", "distinguen" y "pobrecita" se oyen bien (small escribe "Gennaro", "Jenarito" o "generito", pero medium los oye bien). **En c12 los dos modelos oyen "para que vieras" en lugar de "para que viera"**.

## Veredicto por clip

- **c01** OK. Remedios en el borde izquierdo y la CRT al fondo. La voz empieza en 1.34 s (el prompt pedía desde el primer segundo); usar desde 1.2 s.
- **c02** OK. Genaro en el borde derecho.
- **c03** OK. Remedios en el borde izquierdo hasta 1.5 s; sale de cuadro por el paneo, no desaparece de golpe.
- **c04** OK, con un aviso: a los 5.0 s hay un corte de cámara dentro del clip (plano más cerrado de Remedios y Genaro sale del borde). El audio sigue sin cortes, así que sirve como corte de montaje.
- **c05** OK. Genaro se levanta del sofá y Remedios está de espaldas en primer plano.
- **c06** OK. Remedios de pie en el borde izquierdo; solo Genaro tiene celular.
- **c07** **Griselda lleva cola de caballo**; en los otros 8 clips en los que sale tiene el pelo suelto. Es la misma sala y el mismo día, así que el cambio se nota. No se arregla recortando. → REGENERAR.
- **c08** OK. Remedios de pie en el borde izquierdo (delantal de crochet).
- **c09** OK. Genaro en el borde derecho.
- **c10** OK. Griselda sentada y Genaro de pie, con la tele plana al fondo.
- **c11** OK. Genaro en el borde izquierdo.
- **c12** **Línea mal dicha**: "Yo se la compré para que **vieras** sus novelas" (small y medium coinciden). Está en la última frase, de 6.2 a 9.0 s; recortarla quita la línea. → REGENERAR con una frase más fácil.
- **c13** OK. Genaro (jeans y botas) en el borde izquierdo.
- **c14** OK. Chabela en el borde derecho.
- **c15** OK. Chabela abraza un cojín desde 1.5 s, como pide el prompt.
- **c16** **La tele se deforma**: sobre la pantalla hay una mancha negra que cambia de forma y sale por arriba del marco, bajo la mano de Genaro (ampliado: 2 y 8 s). Dura todo el clip. → REGENERAR.
- **c17** OK. Genaro en el borde izquierdo.
- **c18** OK. Griselda en el borde derecho.
- **c19** **Tele duplicada**: Genaro carga una tele y otra sigue en el mueble detrás de él (ampliado: 4.5 y 7.6 s). La línea va de 4.0 a 5.7 s, con la tele ya en brazos. → REGENERAR.
- **c20** OK. Genaro con la tele en el borde derecho.
- **c21** OK, con un aviso de continuidad: el Genaro desenfocado del borde derecho está sentado y sin la tele, cuando en c20 y c22 la carga. Está muy desenfocado; se acepta.
- **c22** **Tele duplicada y no es el prompt**: el mueble tenía que estar vacío y Genaro con la tele en brazos desde el inicio. En el clip la toma del mueble a los 1.5 s y en el mueble queda otra tele hasta el final. → REGENERAR.
- **c23** OK. Griselda entra caminando por la derecha a 0.9 s (ampliado a 8 fps; no aparece de golpe) y se sienta junto a Chabela.
- **c24** **Morph de la tele**: a los 6.3 s, al dejarla en el mueble, la tele plana se convierte en la CRT vieja. La línea va de 2.46 a 4.54 s → usar **0–6.0 s** (o desde 2.3 s). No hace falta regenerar.
- **c25** OK. Genaro en el borde derecho y la CRT al fondo, porque todavía no instala la nueva.
- **c26** OK. Genaro pone la tele plana en la mesa de madera; Remedios de espaldas en el borde izquierdo.
- **c27** OK. Remedios con el control y Genaro en el borde derecho.
- **c28** OK. Genaro la abraza por los hombros con suavidad, con la tele plana al fondo.
- **c29** OK. Griselda en la puerta y Genaro de espaldas en primer plano.
- **c30** OK. Griselda en el borde derecho y la tele plana al fondo.
- **c31** OK. Genaro en el borde izquierdo.
- **c32** (CTA) OK. Habla desde 0.00 s, sonríe, asiente y ladea la cabeza. No hace el gesto de la mano hacia la tele, pero tiene carisma. No señala con el índice.

## Recortes (no hace falta regenerar)
- c24 → 0–6.0 s (la tele se vuelve CRT a 6.3 s).
- c01 → desde 1.2 s. La voz también empieza tarde en c03 (1.30 s), c05 (1.38 s), c06 (1.30 s), c10 (0.92 s), c11 (1.24 s), c13 (1.14 s), c14 (1.16 s), c26 (1.46 s), c27 (2.02 s), c29 (1.18 s) y c30 (1.28 s); si hace falta ritmo, cortar unos 0.1 s antes de la primera palabra.
- Avisos que se aceptan: c04 (corte de cámara a 5.0 s), c21 (Genaro sentado en el borde) y el delantal de peto de Remedios en todos sus clips.

## REGENERAR
**c07, c12, c16, c19, c22**. Moví los mp4 a `clips/old/` y corregí los prompts en `clips.py` (`python -I clips.py c07 c12 c16 c19 c22`). El archivo carga y tiene 32 clips. Todos los prompts ya llevaban el ancla con `@{ASSET}` de cada personaje, también el del borde, y "No other people".
- c07: "her long straight black hair worn loose over her shoulders (no ponytail…)", "its picture stays inside the screen" y "Nobody else in the room".
- c12: la última frase pasa a "Yo se la compré a ella, para sus novelas." (sin "viera"). Si `guion.md` se usa para los subtítulos, hay que cambiarla también ahí.
- c16: la tele está "switched off: a plain flat black screen with a thin black frame, the same shape from the first to the last frame, nothing on or around it", y Chabela queda "seen from behind and blurred in the foreground".
- c19: "There is only one television in the room: once Genaro lifts it, the carved wooden TV cabinet stays empty, no second television anywhere"; Griselda "stays at that edge the whole shot".
- c22: Genaro "already holds the … television in both arms from the first frame … It is the only television in the room: the carved wooden TV cabinet behind him is empty from the first to the last frame"; Chabela de espaldas en primer plano.

## Transcripciones (faster-whisper small; palabra@inicio-fin en segundos)
Uso small porque medium se salta frases enteras en c09 ("por mi culpa"), c13 ("Tu mamá entendió perfecto") y c27 ("Que Dios te bendiga siempre"), y small sí las oye. En el resto, el texto de los dos coincide salvo en la puntuación y los nombres (medium escribe bien "Genaro" y "Genarito"). En c05, small oye "ser menos" y medium "hacer menos", que es lo correcto. El "vieras" de c12 sale en los dos.

- **c01** (-21 dB): Mamá,@1.34-1.74 ¿qué@2.04-2.24 haces@2.24-2.44 viendo@2.44-2.66 la@2.66-2.86 tele@2.86-3.10 en@3.10-3.26 ese@3.26-3.38 aparato@3.38-3.80 tan@3.80-3.98 antiguo?@3.98-4.98 ¿Y@5.16-5.36 la@5.36-5.48 tele@5.48-5.68 nueva@5.68-5.92 que@5.92-6.14 te@6.14-6.26 regalé?@6.26-6.68
- **c02** (-24 dB): Vino@0.90-1.38 tu@1.38-1.56 esposa@1.56-2.06 esta@2.06-2.32 mañana@2.32-2.76 a@2.76-2.98 mi@2.98-3.04 rey.@3.04-4.16 Dice@4.16-4.64 que@4.64-4.78 su@4.78-4.94 mamá@4.94-5.34 la@5.34-5.36 necesita@5.36-5.88 más@5.88-6.30 que@6.30-6.50 yo.@6.50-6.72
- **c03** (-24 dB): ¿Griselda?@1.38-1.90 ¿Cómo@2.76-2.90 que@2.90-3.08 te@3.08-3.18 la@3.18-3.32 quitó?@3.32-3.66
- **c04** (-25 dB): me@0.84-1.34 dice@1.34-1.64 que@1.64-1.88 yo@1.88-2.08 ya@2.08-2.26 estoy@2.26-2.52 muy@2.52-2.76 grande,@2.76-3.30 que@4.22-4.72 a@4.72-4.82 mis@4.82-4.94 86@4.94-5.72 años@5.72-6.14 ni@6.14-6.36 le@6.36-6.48 entiendo@6.48-6.92 a@6.92-7.04 esas@7.04-7.20 teles@7.20-7.76 modernas.@7.76-8.01
- **c05** (-25 dB): Eso@1.38-1.74 sí@1.74-1.92 que@1.92-2.08 no,@2.08-2.24 mamá.@2.34-2.80 Nadie@3.68-4.02 te@4.02-4.18 va@4.18-4.30 a@4.30-4.36 ser@4.36-4.50 menos@4.50-4.76 por@4.76-5.00 tu@5.00-5.14 edad.@5.14-5.44
- **c06** (-22 dB): Griselda,@1.40-1.88 ¿dónde@1.92-2.14 estás?@2.14-2.38
- **c07** (-25 dB): En@1.02-1.86 casa@1.86-2.06 de@2.06-2.26 mi@2.26-2.40 mamá@2.40-3.02 viendo@3.02-3.40 su@3.40-3.64 programa.@3.64-4.14 ¿Por@5.10-5.56 qué?@5.56-5.76
- **c08** (-24 dB): No@0.00-0.84 te@0.84-1.04 muevas@1.04-1.36 de@1.36-1.48 ahí,@1.48-1.64 voy@2.56-4.08 en@4.08-4.24 camino.@4.24-4.54
- **c09** (-29 dB): Vé@0.66-1.30 con@1.30-1.46 calma,@1.46-1.98 mi@2.00-2.16 rey.@2.16-2.56 No@3.44-3.68 quiero@3.68-3.94 que@3.94-4.12 se@4.12-4.28 peleen@4.28-4.76 por@4.76-5.26 mi@5.26-5.44 culpa.@5.44-5.82
- **c10** (-23 dB): Griselda,@0.92-1.40 ¿cómo@2.44-2.78 está@2.78-3.04 eso@3.04-3.30 de@3.30-3.44 que@3.44-3.54 le@3.54-3.66 quitaste@3.66-4.02 la@4.02-4.20 tele@4.20-4.38 a@4.38-4.50 mi@4.50-4.60 mamá?@4.60-5.22 Esa@6.56-6.82 tele@6.82-7.04 yo@7.04-7.20 se@7.20-7.34 la@7.34-7.46 regalé.@7.46-7.92
- **c11** (-24 dB): Ay,@1.24-1.78 Gennaro,@1.92-2.30 no@2.34-2.46 exageres.@2.46-3.44 Tu@4.26-4.52 mamá@4.52-4.80 ya@4.80-4.90 está@4.90-5.10 grande,@5.10-5.56 ni@5.98-6.18 cuenta@6.18-6.54 se@6.54-6.74 da.@6.74-6.90
- **c12** (-23 dB): ¿Que@0.88-1.28 no@1.28-1.40 se@1.40-1.52 da@1.52-1.66 cuenta?@1.66-1.92 En@2.86-3.02 ese@3.02-3.18 aparato@3.18-3.62 no@3.62-3.78 se@3.78-3.90 distinguen@3.90-4.44 ni@4.44-4.60 las@4.60-4.82 caras.@4.82-5.38 Yo@6.16-6.34 se@6.34-6.48 la@6.48-6.58 compré@6.58-7.02 para@7.02-7.48 que@7.48-7.64 vieras@7.64-7.90 sus@7.90-8.04 novelas@8.04-8.48 a@8.48-8.58 gusto.@8.58-8.84
- **c13** (-27 dB): Ay,@1.14-1.84 Jenarito,@2.02-2.64 no@2.70-2.84 te@2.84-2.98 pongas@2.98-3.36 así.@3.36-3.74 Tu@4.52-4.74 mamá@4.74-5.06 entendió@5.06-5.56 perfecto.@5.56-6.50
- **c14** (-26 dB): pues@1.16-1.64 cómo@1.64-1.86 quiere@1.86-2.12 que@2.12-2.28 me@2.28-2.42 ponga@2.42-2.76 suegra?@2.76-3.14 No@4.10-4.58 se@4.58-4.72 vale@4.72-4.92 que@4.92-5.08 se@5.08-5.18 aprovechen@5.18-5.66 de@5.66-5.78 mi@5.78-5.90 mamá.@5.90-6.28
- **c15** (-24 dB): No,@0.00-0.60 no,@0.80-0.92 no.@1.02-1.22 Griselda@2.90-3.30 me@3.30-3.46 la@3.46-3.58 regaló.@3.58-4.12 Tú@4.78-4.94 no@4.94-5.06 me@5.06-5.18 la@5.18-5.28 puedes@5.28-5.50 quitar,@5.50-6.00 generito.@6.12-6.64
- **c16** (-26 dB): Claro@0.88-1.36 que@1.36-1.54 puedo,@1.54-1.86 yo@2.30-2.42 la@2.42-2.54 compré.@2.54-2.92 ¿Usted@4.34-4.66 tiene@4.66-4.92 a@4.92-5.00 sus@5.00-5.10 muchachos@5.10-5.58 para@5.58-5.78 que@5.78-5.90 le@5.90-6.02 compren@6.02-6.34 una@6.34-6.52 igual?@6.52-6.74
- **c17** (-24 dB): Mis@0.00-0.70 hermanos@0.70-1.20 andan@1.20-1.46 muy@1.46-1.68 apretados,@1.68-2.34 Génaro.@2.54-2.84 Pagan@4.12-4.74 escuelas@4.74-5.26 privadas.@5.26-5.86
- **c18** (-23 dB): y@0.00-0.52 yo@0.52-0.70 no@0.70-0.84 hago@0.84-1.66 turnos@1.66-2.10 dobles@2.10-2.38 en@2.38-2.54 la@2.54-2.66 obra@2.66-2.92 de@2.92-3.40 sol@3.40-3.62 a@3.62-3.76 sol@3.76-4.06 y@4.06-5.38 lo@5.38-5.50 hago@5.50-5.68 con@5.68-5.86 gusto@5.86-6.22 porque@6.22-7.58 mi@7.58-7.78 mamá@7.78-8.12 se@8.12-8.20 lo@8.20-8.32 merece@8.32-8.78
- **c19** (-28 dB): Con@4.26-4.98 permiso,@4.98-5.34 suegra.@5.38-5.68
- **c20** (-22 dB): ¿De@0.00-0.54 verdad@0.54-0.86 le@0.86-1.02 vas@1.02-1.16 a@1.16-1.26 hacer@1.26-1.44 esto@1.44-1.64 a@1.64-1.74 mi@1.74-1.82 mamá?@1.82-2.26 ¡Mira@3.26-3.66 la@3.66-3.84 pobrecita!@3.84-4.60
- **c21** (-24 dB): Ay,@0.84-1.40 pobre@1.58-1.90 de@1.90-2.14 mí,@2.14-2.42 me@3.34-3.62 voy@3.62-3.80 a@3.80-3.92 quedar@3.92-4.20 sin@4.20-4.48 mis@4.48-4.74 programas.@4.74-5.92
- **c22** (-22 dB): Lo@1.94-2.50 siento,@2.50-2.76 suegra.@2.90-3.20 Usted@4.38-4.62 que@4.62-4.78 se@4.78-4.90 siente@4.90-5.16 tan@5.16-5.36 moderna,@5.36-5.90 póngase@6.86-7.42 a@7.42-7.52 ahorrar@7.52-7.88 y@7.88-8.28 comprese@8.28-8.64 una@8.64-8.82 nueva.@8.82-9.08
- **c23** (-27 dB): ¡Ay,@2.08-2.56 Griselda!@2.56-3.04 ¿Y@3.28-3.40 ahora@3.40-3.58 qué@3.58-3.80 voy@3.80-3.98 a@3.98-4.16 ver?@4.16-4.44
- **c24** (-23 dB): ¡Mamá!@2.56-3.28 ¡Mira@3.38-3.56 quién@3.56-3.72 regresó!@3.72-4.26
- **c25** (-23 dB): ¡Mi@0.00-1.32 rey!@1.32-2.02 ¿Me@2.68-2.94 regresaste@2.94-3.60 mi@3.60-3.84 tele?@3.84-4.18
- **c26** (-21 dB): Claro@1.46-2.14 que@2.14-2.36 sí@2.36-2.56 mamá@2.56-3.32 es@3.32-3.66 tuya@3.66-4.08 y@4.08-4.18 de@4.18-4.28 nadie@4.28-4.48 más@4.48-4.86 ese@4.86-6.16 aparato@6.16-6.60 antiguo@6.60-7.40 se@7.40-7.64 va@7.64-7.78 para@7.78-7.98 afuera@7.98-8.34
- **c27** (-26 dB): Ay,@2.02-2.50 mi@2.66-2.76 rey,@2.76-3.20 se@3.28-3.36 ve@3.36-3.50 todo@3.50-3.74 a@3.74-3.96 colores,@3.96-4.58 que@5.04-5.58 Dios@5.58-5.80 te@5.80-5.98 bendiga@5.98-6.46 siempre.@6.46-7.02
- **c28** (-22 dB): te@0.00-0.94 mereces@0.94-1.42 eso@1.42-1.82 y@1.82-1.98 más@1.98-2.22 mamá@2.22-2.96 mientras@2.96-3.76 yo@3.76-4.10 viva@4.10-4.44 nadie@4.44-5.58 te@5.58-5.78 va@5.78-5.90 a@5.90-5.98 faltar@5.98-6.30 al@6.30-6.40 respeto@6.40-6.94
- **c29** (-31 dB): Genaro,@1.18-2.22 vine@2.94-3.70 a@3.70-3.82 hablar@3.82-3.98 contigo.@3.98-4.50
- **c30** (-24 dB): Si@1.28-1.84 vienes@1.84-2.16 por@2.16-2.30 la@2.30-2.44 tele,@2.44-2.70 ni@3.00-3.20 lo@3.20-3.34 intentes.@3.34-3.82
- **c31** (-28 dB): No@0.00-1.06 vengo@1.06-1.28 por@1.28-1.52 la@1.52-1.66 tele.@1.66-1.96 Es@3.34-3.92 mi@3.92-4.06 mamá,@4.06-4.50 Gennaro.@4.56-4.84
- **c32** (-20 dB): ¿Qué@0.00-0.90 creen@0.90-1.14 que@1.14-1.24 le@1.24-1.36 pasó@1.36-1.64 a@1.64-1.78 doña@1.78-1.96 Chabela?@1.96-2.44 Denle@3.54-3.88 me@3.88-4.00 gusta@4.00-4.32 y@4.32-4.80 compartan@4.80-5.52 para@5.52-5.92 ver@5.92-6.12 la@6.12-6.24 segunda@6.24-6.52 parte.@6.52-6.92
