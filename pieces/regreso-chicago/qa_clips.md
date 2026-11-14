# QA clips — regreso-chicago (2026-11-04)

Método: los 35 clips de CLIPS están en `clips/` (ninguno falta). Hoja de contactos a 2 fps por clip (scratchpad `qa_chi/`), recortes ampliados (c03/c19 pantalones, c19 0.7–1.8 s, i1 2.5–4.0 s), faster-whisper small en todos y medium en c02, c09, c12, c14, c15, c19, c27, c31 e i1 (es, tiempos por palabra; audio pasado a wav 16 kHz con ffmpeg y cargado con numpy). c09, c14 y c19 se volvieron a transcribir recortados con los dos modelos, y c15, c14, c19, c09 e i1 se midieron por energía cada 0.05–0.1 s.
Pronunciación: "Rogelio", "Yesenia", "Ulises", "Chicago", "quincena", "huéspedes", "cazuelas", "metiche" y "amá" salen bien ("techando" se transcribe "te echando", que es lo normal). El único fallo es "llevarse" en c09.
Ropa: Rogelio (mezclilla negra, camiseta mostaza, bolso olivo, candado), Yesenia (blazer negro, blusa esmeralda, arracadas, cadena), Rebeca (platino, cebra, cárdigan burdeos) y Josefina (trenza, rebozo azul marino, blusa bordada, falda café) son constantes en todos los clips. **Ulises no**: su hoja lleva pantalón beige, y sale beige en c05, i1, c15 y c28, azul marino en c03 y c23, y de mezclilla en c18 y c19. No hay texto quemado: la hoja de c15/c16 trae texto impreso de utilería y la carpeta de c27 un sello dorado sin letras. Tampoco hay armas ni contacto brusco: la mano de i1 es suave y la maleta de i3 se deja, no se avienta.

## Veredicto por clip

- **c01** OK. Rogelio de espaldas a la derecha, con las botas al hombro, y coincide con su hoja. La voz empieza en 1.44 s.
- **c02** OK. Yesenia desenfocada al fondo a la izquierda.
- **c03** **Pantalón de Ulises azul marino** (en su hoja es beige, y en c05, i1 y c15, de la misma escena, también es beige). Se ve de cuerpo entero en 0–4.5 s y el diálogo ocupa todo el clip. → REGENERAR.
- **i1** OK si se recorta: **el reloj cambia** a los ~3.2 s (pasa de esfera blanca a un brazalete dorado más grueso). **Usar 0–3.1 s.** Pantalón beige visible en 0–1 s. Whisper small oye "¡Suscríbete!" en 4.6 s, pero es una alucinación: medium no oye nada y la energía es ambiente a −50 dB.
- **c04** OK. Ulises al fondo a la izquierda. Las botas salen de cuadro con el push-in.
- **c05** OK. Rogelio de espaldas en primer plano y Ulises con pantalón beige.
- **c06** OK, con un aviso de utilería: Rogelio ya no lleva las botas al hombro, que aparecen colgadas en la reja detrás de él. Las fotos del celular son viejas, en blanco y negro. Yesenia en el borde izquierdo.
- **c07** OK. Rogelio de espaldas a la derecha.
- **c08** OK.
- **c09** **"llevarse" mal dicho**: en 4.4–5.2 s los dos modelos oyen "llevárselarse a las cazuelas" / "llevar celarse", también con el audio recortado. La imagen está bien. → REGENERAR. Plan B: usar 0–3.4 s, solo "Cierra bien la reja, hija.", y saltar la segunda línea.
- **i2** OK. La mano con la manga de mezclilla negra y la llave en la chapa.
- **c10** OK. La voz empieza en 0.1 s, sin aire antes.
- **c11** OK. Yesenia con el celular y Rogelio de espaldas a la derecha.
- **c12** OK. Vecinos diminutos al fondo de la calle. Las botas cuelgan a la altura de la cadera. Medium no oye "¿Tu licenciado?" (0.78–2.06 en small), pero small sí.
- **c13** OK.
- **c14** OK. Rebeca al fondo a la izquierda. Small oyó "dientes nuevos dientes nuevos", pero al recortar el audio los dos modelos oyen una sola vez "dientes nuevos" (4.46–5.66, alargado). Escucharlo de todas formas.
- **c15** **"Cállate" repetido**: dice "Cállate. … Cállate, peón." Por energía, el primero va de 1.0 a 1.55 s, hay silencio de 1.6 a 2.25 s y el segundo empieza en 2.25 s. → **Recortar el inicio y usar desde 2.1 s.** Ulises con pantalón beige.
- **c16** OK. Yesenia desenfocada a la izquierda. Rogelio sostiene la hoja.
- **c17** OK.
- **c18** **Ulises con jeans azules** (hoja: beige), de cuerpo entero durante todo el clip. → REGENERAR.
- **c19** OK si se recorta: Ulises en el borde izquierdo y **sus jeans se ven hasta ~1.0 s**. La voz empieza en 1.8 s (energía). **Usar desde 1.3 s.** Small oyó "para para", pero al recortar el audio los dos modelos oyen "para el techo" una sola vez.
- **c20** OK. Gesto amplio con los brazos. La voz empieza en ~1.7 s.
- **c21** OK. Rogelio de espaldas a la derecha.
- **c22** OK. Rebeca en el borde izquierdo de 0 a ~2 s.
- **c23** **Ulises con pantalón azul marino** (hoja: beige), de cuerpo entero durante todo el clip. → REGENERAR. Al final mira el reloj: es un movimiento orgánico y está bien.
- **c24** OK. Peatones diminutos al fondo de la calle, sin rasgos.
- **i3** OK. Deja la maleta café con suavidad junto a las botas.
- **r1** **Maleta cambiada**: junto a Rogelio hay una maleta negra de rueditas, no la maleta café gastada de c23/i3, y no están las botas. Josefina y la carpeta coinciden con sus hojas. Solo salen los dos personajes. → REGENERAR (es el plano de la cama cálida y la maleta se ve todo el clip). Sin diálogo.
- **c25** OK. Rogelio en el borde derecho.
- **c26** OK. Josefina en el borde derecho.
- **c27** OK. Al abrir la carpeta se ve el interior azul con un sello dorado, sin hojas visibles y sin texto. Yesenia en el borde izquierdo. "Viejos" empieza en 0.5 s.
- **c28** OK. Ulises al fondo con pantalón beige.
- **c29** OK. Yesenia de espaldas en primer plano.
- **c30** OK. Josefina de espaldas a la izquierda. Ojos húmedos y sonrisa.
- **c31** (CTA) OK. Tiene carisma: habla a cámara, sonríe, se ajusta la correa del bolso con una mano y gesticula con la otra (~3.5–6 s). Dice las dos líneas completas.

## Recortes (no hace falta regenerar)
- c15 → usar desde 2.1 s (quita el primer "Cállate").
- c19 → usar desde 1.3 s (quita los jeans de Ulises en el borde; la voz empieza en 1.8 s).
- i1 → usar 0–3.1 s (antes de que cambie el reloj).
- c06 → aviso de utilería: las botas en la reja (se acepta).
- c14 → escuchar "dientes nuevos" (4.46–5.66).

## REGENERAR
**c03, c09, c18, c23, r1**. Los mp4 se movieron a `clips/old/` y sus prompts en `clips.py` ya están corregidos (`python -I clips.py c03 c09 c18 c23 r1`). El ancla de ULI ahora incluye "beige chino trousers, brown leather loafers".
- c03: pantalón azul marino. Ahora dice "Ulises wears beige chino trousers and brown loafers exactly as in his reference sheet, never jeans or dark trousers", pone a Yesenia "just inside the open dark green iron gate" y añade "No other people". Lleva las anclas de Yesenia y Ulises.
- c09: "llevarse" mal dicho. El tono ahora es "unhurried, every word clearly pronounced" y añade "No other people". Lleva las anclas de Rebeca y Yesenia. Plan B: 0–3.4 s.
- c18: jeans. Ahora pide el pantalón beige y "never jeans", y en el borde está @{ROGELIO} de espaldas con su ancla ("only his black denim jacket, olive crossbody strap and greying hair visible"), más "No other people".
- c23: pantalón azul marino. Ahora pide el pantalón beige y añade "No other people". Lleva las anclas de Ulises y Yesenia.
- r1: maleta negra de rueditas. Ahora dice "his old worn brown leather suitcase with leather straps (not a black rolling suitcase) and his pair of dusty tan work boots". Mantiene "Only these two characters appear… No other people". Lleva las anclas de Josefina y Rogelio.

## Transcripciones (faster-whisper small; palabra@inicio-fin en segundos)
Correcciones de medium: c02 "y Esenia" = "Yesenia" y "9" = "Nueve"; c12 "¿Tú licenciado?" = "¿Tu licenciado?"; c14 "dientes nuevos dientes nuevos" = una sola vez "dientes nuevos" (verificado con el audio recortado); c19 "para para" = "para" (verificado igual); c31 "Yecenia" = "Yesenia"; i1 "¡Suscríbete!" = alucinación (no hay voz). c09 sale mal en los dos modelos (ver el veredicto). c15 dice "Cállate" dos veces en los dos modelos. i2, i3 y r1 no tienen diálogo.

- **c01**: Quítate@1.44-1.80 de@1.80-1.98 mi@1.98-2.08 puerta,@2.08-2.40 Rogelio.@2.50-3.00 La@3.46-3.52 gente@3.52-3.72 va@3.72-3.90 a@3.90-4.00 pensar@4.00-4.24 que@4.24-4.40 contraté@4.40-6.38 otro@6.38-6.52 peón.@6.52-6.88 Aquí@7.02-7.14 ya@7.14-7.32 no@7.32-7.44 vives.@7.44-7.74
- **c02**: Con@0.00-0.88 estas@0.88-1.10 manos@1.10-1.46 te@1.46-1.66 levanté@1.66-2.08 esta@2.08-2.22 casa@2.22-2.48 desde@2.48-2.70 Chicago@2.70-3.20 y@3.20-3.40 Esenia.@3.40-3.80 9@4.28-4.80 años@4.80-5.16 te@5.16-5.36 echando@5.36-5.64 casas@5.64-6.04 ajenas.@6.04-6.40
- **c03**: ¿Ya@0.88-1.32 viste@1.32-1.60 mi@1.60-1.76 vida?@1.76-1.98 Este@2.38-2.56 pobre@2.56-2.82 diablo@2.82-3.20 se@3.20-3.36 cree@3.36-3.52 el@3.52-3.66 dueño.@3.66-4.28 Agarra@4.72-5.14 tus@5.14-5.30 botas@5.30-5.76 y@5.76-5.88 vete@5.88-6.08 a@6.08-6.16 una@6.16-6.26 casa@6.26-6.50 de@6.50-6.66 huéspedes.@6.66-7.28
- **c04**: ¿Le@0.96-1.52 dices@1.52-1.80 mi@1.80-2.00 vida@2.00-2.28 a@2.28-2.40 mi@2.40-2.48 compadre@2.48-2.96 Ulises?@2.96-3.32 ¿Aquí,@4.40-4.96 en@5.58-5.66 la@5.66-5.76 casa@5.76-5.98 que@5.98-6.16 levanté@6.16-6.58 con@6.58-6.68 mi@6.68-6.78 espalda?@6.78-7.20
- **c05**: Tu@0.00-1.08 espalda@1.08-1.56 puso@1.56-1.86 los@1.86-2.04 ladrillos,@2.04-2.66 compadre,@2.74-3.30 pero@4.36-4.52 alguien@4.52-4.80 tenía@4.80-5.10 que@5.10-5.22 cuidar@5.22-5.56 a@5.56-5.64 la@5.64-5.72 señora.@5.72-6.02
- **c06**: 9@0.00-1.42 años@1.42-1.82 mandándote@1.82-2.46 cada@2.46-2.70 quincena@2.70-3.18 por@3.18-3.40 el@3.40-3.50 celular@3.50-3.88 y@3.88-5.64 tú@5.64-5.76 me@5.76-5.90 mandabas@5.90-6.32 fotos@6.32-6.60 de@6.60-7.00 cada@7.00-7.20 cuarto@7.20-7.60
- **c07**: Lo@0.52-1.02 que@1.02-1.16 mandabas@1.16-1.66 apenas@1.66-1.90 alcanzaba@1.90-2.52 para@2.52-2.74 la@2.74-2.90 luz@2.90-3.10 y@3.10-3.22 el@3.22-3.30 mandado.@3.30-3.74 No@4.36-4.68 me@4.68-4.80 vengas@4.80-5.10 a@5.10-5.22 presumir@5.22-5.68 tus@5.68-5.80 migajas.@5.80-6.50
- **c08**: Ya@1.02-1.80 ni@1.80-2.04 llores,@2.04-2.56 compadre.@2.60-3.30
- **c09**: Cierra@1.24-1.62 bien@1.62-1.80 la@1.80-1.96 reja,@1.96-2.28 hija.@2.36-3.30 No@3.52-3.62 se@3.62-3.76 vaya@3.76-3.92 a@3.92-4.06 meter@4.06-4.26 a@4.26-4.42 llevarse@4.42-4.86 larce@4.86-5.16 las@5.16-5.30 cazuelas.@5.30-6.00
- **c10**: Cambié@0.00-0.88 las@0.88-1.02 chapas@1.02-1.44 hace@1.44-1.58 medio@1.58-1.84 año.@1.84-2.20 Para@3.36-3.96 mí@3.96-4.16 dejaste@4.16-4.58 de@4.58-4.74 existir@4.74-5.28 el@5.28-5.42 día@5.42-5.64 que@5.64-5.82 cruzaste.@5.82-6.46
- **c11**: si@0.00-0.82 a@0.82-0.92 las@0.92-1.04 siete@1.04-1.28 sigues@1.28-1.66 aquí@1.66-1.94 le@1.94-2.50 hablo@2.50-2.76 a@2.76-2.82 mi@2.82-2.88 licenciado@2.88-3.54 y@3.54-4.68 te@4.68-4.82 vas@4.82-5.00 con@5.00-5.20 todo@5.20-5.48 y@5.48-5.58 tus@5.58-5.76 botas@5.76-6.28
- **c12**: ¿Tú@0.78-1.42 licenciado@1.42-2.06 y@2.06-3.76 ya@3.76-4.26 revisaste@4.26-4.84 a@4.84-5.44 nombre@5.44-5.66 de@5.66-5.84 quién@5.84-6.04 está@6.04-6.32 esta@6.32-6.52 casa?@6.52-6.78
- **c13**: está@0.00-0.94 a@0.94-1.08 nombre@1.08-1.30 de@1.30-1.48 mi@1.48-1.64 hija@1.64-2.42 porque@2.42-3.80 tú@3.80-4.14 la@4.14-4.32 dejaste@4.32-4.78 sola@4.78-5.22 nueve@5.22-5.98 años@5.98-6.38
- **c14**: sola@0.00-0.74 con@0.74-2.78 mis@2.78-2.98 horas@2.98-3.16 extras@3.16-3.58 le@3.58-3.80 pagué@3.80-4.08 hasta@4.08-4.26 los@4.26-4.44 dientes@4.44-4.76 nuevos@4.76-5.12 dientes@5.12-5.34 nuevos@5.34-5.74 doña@5.74-6.06 rebeca@6.06-6.52
- **c15**: Cállate.@0.82-1.42 Cállate,@2.06-2.64 Peón.@2.78-3.04 Mira@4.20-4.58 estos@4.58-4.78 papeles.@4.78-5.26 Por@6.16-6.46 abandono,@6.46-7.10 la@7.50-7.68 casa@7.68-7.90 ya@7.90-8.12 está@8.12-8.30 a@8.30-8.36 mi@8.36-8.44 nombre.@8.44-8.72
- **c16**: esa@1.20-1.80 hoja@1.80-2.10 ni@2.10-2.28 sello@2.28-2.56 tiene@2.56-2.88 yesenia@2.88-3.46 y@3.46-5.22 esa@5.22-5.38 firma@5.38-5.78 no@5.78-6.06 es@6.06-6.16 mía@6.16-6.46
- **c17**: Aquí@1.24-1.80 tu@1.80-2.00 firma@2.00-2.40 vale@2.40-2.64 lo@2.64-2.80 mismo@2.80-3.14 que@3.14-3.40 tu,@3.40-3.68 compadre.@3.92-4.58
- **c18**: ¿Ves@1.18-1.76 esta@1.76-2.00 camioneta@2.00-2.52 del@2.52-2.68 año@2.68-2.90 compadre?@2.90-3.44 Me@4.44-4.68 la@4.68-4.80 compré@4.80-5.14 con@5.14-5.28 mis@5.28-5.44 negocios.@5.44-5.92
- **c19**: esa@1.20-1.92 camioneta@1.92-2.62 salió@2.62-4.30 de@4.30-4.40 lo@4.40-4.54 que@4.54-4.64 mandé@4.64-5.00 en@5.00-5.06 diciembre@5.06-5.50 para@5.50-5.78 para@5.78-6.14 el@6.14-6.26 techo@6.26-6.62
- **c20**: Yo@0.00-1.74 se@1.74-1.88 la@1.88-2.00 regalé.@2.00-2.60 ¿Y@3.04-3.52 qué?@3.52-3.68
- **c21**: Vete@1.04-1.60 a@1.60-1.72 tu@1.72-1.82 rancho@1.82-2.28 con@2.28-2.44 tu@2.44-2.58 mamá.@2.58-4.18 Que@4.52-5.08 esa@5.08-5.26 viejita@5.26-5.72 tampoco@5.72-6.00 tiene@6.00-6.42 ni@6.42-6.64 dónde@6.64-6.88 caerse.@6.88-7.56
- **c22**: A@0.86-1.34 mi@1.34-1.46 madre@1.46-1.70 no@1.70-1.90 la@1.90-2.02 mencione,@2.02-2.52 doña@2.58-2.78 Rebeca.@2.78-3.26 Gracias@4.48-4.82 a@4.82-5.08 ella@5.08-5.28 usted@5.28-5.50 come@5.50-5.86 tres@5.86-6.28 veces@6.28-6.58 al@6.58-6.82 día.@6.82-7.00
- **c23**: ya@0.86-1.52 bájale@1.52-2.02 compadre@2.02-2.66 tu@2.66-3.56 maleta@3.56-4.00 te@4.00-4.16 la@4.16-4.26 dejo@4.26-4.48 aquí@4.48-4.64 en@4.64-4.74 la@4.74-4.82 banqueta@4.82-6.30
- **c24**: Déjala@0.84-1.50 en@1.50-1.58 la@1.58-1.70 calle,@1.70-2.04 que@3.32-3.80 todo@3.80-4.08 el@4.08-4.24 barrio@4.24-4.56 vea@4.56-4.98 quién@4.98-5.38 manda@5.38-5.82 en@5.82-5.92 esta@5.92-6.14 casa.@6.14-6.48
- **c25**: No@1.08-1.76 levantes@1.76-2.30 nada@2.30-2.52 del@2.52-2.78 suelo,@2.78-3.16 mijo.@3.26-3.56 Los@4.60-4.74 que@4.74-4.92 gritan@4.92-5.28 más@5.28-5.50 fuerte@5.50-5.92 casi@5.92-6.66 nunca@6.66-7.00 son@7.00-7.32 los@7.32-7.46 dueños.@7.46-7.86
- **c26**: No@1.00-1.88 más@1.88-2.12 eso@2.12-2.32 me@2.32-2.50 faltaba.@2.50-3.04 La@4.02-4.68 suegra@4.68-5.12 metiche@5.12-5.64 con@5.64-5.92 sus@5.92-6.12 papeles@6.12-6.56 viejos.@6.56-7.06
- **c27**: viejos@0.00-0.86 no,@0.86-1.12 mija.@1.30-1.48 Tienen@3.12-3.40 sello.@3.40-3.90 Esta@4.68-5.08 casa@5.08-5.38 está@5.38-5.68 a@5.68-5.80 mi@5.80-5.90 nombre@5.90-6.24 desde@6.24-6.54 el@6.54-6.74 primer@6.74-7.08 ladrillo.@7.08-7.68
- **c28**: ¿Cómo@2.94-3.48 que@3.48-3.66 a@3.66-3.78 su@3.78-3.86 nombre?@3.86-4.22
- **c29**: Mi@0.00-0.72 hijo@0.72-0.96 me@0.96-1.12 la@1.12-1.22 puso@1.22-1.56 a@1.56-1.68 mí@1.68-1.86 por@1.86-2.70 si@2.70-2.84 algún@2.84-3.08 día@3.08-3.40 pasaba@3.40-4.16 esto@4.16-4.56 y@4.56-5.74 hoy@5.74-5.88 pasó@5.88-6.30 aquí@6.30-8.40 la@8.40-8.58 que@8.58-8.72 se@8.72-8.86 va@8.86-9.02 eres@9.02-9.22 tú@9.22-9.48
- **c30**: Gracias,@1.92-2.34 Amá.@2.34-2.76 Ya@3.88-3.96 estoy@3.96-4.14 en@4.14-4.32 mi@4.32-4.44 casa.@4.44-4.68
- **c31**: ¿Ustedes@0.58-1.06 creen@1.06-1.30 que@1.30-1.40 Yecenia@1.40-1.92 se@1.92-2.04 va@2.04-2.18 a@2.18-2.28 salir@2.28-2.44 por@2.44-2.62 las@2.62-2.80 buenas?@2.80-3.02 Denle@4.28-4.52 me@4.52-4.64 gusta@4.64-4.94 y@4.94-5.26 compartan@5.26-5.90 para@5.90-6.14 ver@6.14-6.36 la@6.36-6.48 segunda@6.48-6.80 parte.@6.80-7.22
- **i1**: ¡Suscríbete!@4.60-6.00
- **i2**: (vacío)
- **i3**: (vacío)
- **r1**: (vacío)
