# QA clips — chocolate-rancho (2026-11-04)

Método: hoja de contactos a 2 fps por clip (scratchpad `qa_choc/`), recortes ampliados de los bordes (c05, c17, c19, c25, c30, c33) y faster-whisper small (es, word timestamps, audio pasado a wav). Los clips dudosos se volvieron a escuchar con medium (c01, c09, c11, c16, c32, r2).
Pronunciación: "Prudencio" bien en todos. "Eulalia" bien (c19; en c09 small oye "Ullalia" y medium "Eulalia"). "Benavides" bien (c21). "despacito" bien (c32, medium: "Tómatelo despacito").
No hay morphs, texto quemado ni cruces con otros proyectos (mezcal, retén, gatito), salvo el garrafón de c09. Ropa constante en toda la pieza: Renata con blazer verde botella y blusa gris, Prudencio con sombrero gris, chamarra azul marino y paliacate, Eulalia con rebozo mostaza y trenza, Damián con traje azul marino y corbata mostaza, Benavides con traje gris y lentes.

## Veredicto por clip

- **c01** OK. La voz empieza en 2.0 s. Si el gancho tiene que hablar desde el frame 0, usar 1.8–8.0.
- **c02** OK. El hombro desenfocado es de Renata (blazer verde, pelo castaño).
- **c03** OK.
- **c04** OK.
- **c05** OK. Prudencio en el borde derecho (sombrero gris, bigote blanco, paliacate) coincide con su hoja todo el clip.
- **c06** OK.
- **c07** OK.
- **c08** OK.
- **c09** **Objeto ajeno en primer plano**: en lugar del hombro de Renata hay un **garrafón de vidrio verde** desenfocado en el borde izquierdo todo el clip (0–8 s). El modelo leyó "bottle-green" como una botella, y en un rancho parece mezcal. Audio OK. No se arregla recortando. → REGENERAR.
- **c10** OK. La voz va de 3.16 a 4.52; usar ~2.6–6.0.
- **c11** OK de imagen. Small oye "me tiró o tiró" (2.84–3.36) y medium lo oye limpio ("me tiró una taza"). Escucharlo.
- **c12** OK.
- **c13** OK.
- **c14** OK.
- **c15** OK.
- **c16** OK de imagen. Repite "qué grande estás" (6.46–7.24) → **recortar a 0.0–6.2**. Dice "Damián, ¿de verdad eres tú…" con otra entonación que el prompt, pero se acepta.
- **c17** **El del borde no es Prudencio**: en el primer plano izquierdo hay un hombre de **pelo negro, sin sombrero y con saco azul marino** (otro Damián), de 0 a ~4 s, y su hombro sigue en cuadro hasta el final. Audio OK. → REGENERAR.
- **r1** OK. Abrazo de tres y cada uno coincide con su hoja. Sin diálogo: el "¡Suscríbete!" que oye whisper es alucinación sobre el silencio (−51.7 dB de media).
- **c18** OK.
- **c19** En 0.0–~0.4 s asoma por el borde izquierdo una mujer de **pelo oscuro** con blusa bordada, que no tiene la trenza gris de Eulalia. La voz empieza en 0.68 → **recortar el inicio a 0.5**. El resto está OK.
- **c20** OK.
- **c21** OK.
- **c22** OK. El texto en el documento sellado es atrezo, no texto quemado.
- **c23** OK.
- **c24** OK.
- **r2** OK. Sin diálogo: el "no" que oye whisper es silencio (−48.6 dB de media).
- **c25** OK. Prudencio de espaldas (sombrero gris, pelo blanco, chamarra) recibe el sobre, y Eulalia está al lado.
- **c26** OK.
- **c27** OK.
- **c28** OK.
- **c29** OK.
- **c30** **Fallo de imagen**: arriba flota un **segundo sombrero gris duplicado** y abajo se repite una franja (manos y bancas) como un mosaico mal cosido, todo el clip (0–8 s). No se puede recortar sin un zoom de ~1.5x. Audio OK. → REGENERAR.
- **c31** OK.
- **c32** OK. Taza de talavera azul y blanca como PROP_TAZA, con vapor.
- **r3** OK. Sin diálogo ("¡Muchas gracias!" es alucinación de whisper sobre el silencio).
- **c33** OK (CTA). Damián le habla a cámara con push-in, inclinaciones de cabeza y gestos de boca naturales, sobrio y firme como pide el prompt. Atrás, desenfocados, Prudencio y Eulalia coinciden con sus hojas. Le falta algo de carisma (no sonríe ni mueve las manos), pero cumple.

## Recortes (no hace falta regenerar)
- c16 → 0.0–6.2 (quita "qué grande estás" repetido).
- c19 → 0.5–fin (quita a la mujer de pelo oscuro del borde).
- Opcional: c01 → 1.8–8.0 (que el gancho empiece con voz) y c10 → 2.6–6.0.

## REGENERAR
**c09, c17, c30**. Los mp4 se movieron a `clips/old/` y sus prompts en `clips.py` ya están corregidos:
- c09: garrafón verde en vez de Renata. Ahora Renata va nombrada con `{REN}` (ancla: pelo castaño ondulado, blazer verde botella, blusa gris) y el prompt dice "a woman, not an object; no bottles or jugs".
- c17: el del borde es un hombre de pelo negro con traje, no Prudencio. Ahora va `{PRU}` de espaldas con su ancla (pelo blanco, sombrero de fieltro gris, chamarra azul marino, paliacate) y el prompt dice "never a dark-haired man in a suit", sin otras personas.
- c30: sombrero duplicado flotando y una franja repetida. Ahora el prompt pide "one light grey cowboy hat on his head", "one single continuous image, no duplicated objects" y quita "blurred at the edges".

Opcional, baja prioridad: c11 (escuchar el posible "tiró o tiró").

## Transcripciones (faster-whisper small; palabra@inicio-fin en segundos)
Correcciones de medium: c09 "Ullalia" = "Eulalia"; c11 "tiró o tiró" = "tiró" (medium, limpio); c01 "Firmé" = "Firme"; c32 "Tómate lo" = "Tómatelo".

- **c01**: Firmé@2.0-2.44 aquí,@2.44-2.62 don@2.72-2.78 Prudencio.@2.78-3.34 La@3.76-3.84 empresa@3.84-4.08 no@4.08-4.36 va@4.36-4.46 a@4.46-4.52 esperar@4.52-4.68 más.@4.68-5.06 Este@6.1-6.28 terreno@6.28-6.66 ya@6.66-6.82 tiene@6.82-7.02 nuevo@7.02-7.24 dueño.@7.24-7.66
- **c02**: Esta@0.0-0.8 tierra@0.8-1.16 no@1.16-1.36 se@1.36-1.52 vende@1.52-1.82 señora.@1.82-2.18 Aquí@4.06-4.5 nací@4.5-5.0 y@5.0-5.84 aquí@5.84-6.02 me@6.02-6.2 voy@6.2-6.36 a@6.36-6.48 morir.@6.48-6.9
- **c03**: Las@0.0-1.08 escrituras@1.08-1.66 nunca@1.66-1.94 se@1.94-2.16 registraron,@2.16-2.9 don@2.92-3.02 Prudencio.@3.02-3.62 El@4.62-4.8 viernes@4.8-5.18 vence@5.18-5.5 el@5.5-5.62 plazo@5.62-6.06 y@6.06-6.56 el@6.56-6.66 terreno@6.66-7.02 pasa@7.02-7.38 a@7.38-7.54 la@7.54-7.62 empresa.@7.62-7.88
- **c04**: Guarde@1.02-1.7 sus@1.7-1.9 papeles,@1.9-2.4 licenciada.@2.52-3.16 Aquí@4.24-4.48 nadie@4.48-4.86 va@4.86-5.14 a@5.14-5.24 firmar@5.24-5.68 nada.@5.68-6.02
- **c05**: Entonces@0.0-1.08 vayan@1.08-1.56 haciendo@1.56-1.86 sus@1.86-2.08 maletas.@2.08-2.62 El@4.06-4.8 viernes@4.8-5.2 vengo@5.2-5.46 a@5.46-5.54 sacarlos@5.54-5.98 de@5.98-6.12 aquí.@6.12-6.34
- **c06**: 40@1.24-1.72 años@1.72-2.2 sembrando@2.2-2.72 esta@2.72-2.96 tierra,@2.96-3.38 no@4.64-5.56 se@5.56-5.72 la@5.72-5.82 voy@5.82-5.96 a@5.96-6.12 dar@6.12-6.2 a@6.2-6.3 usted.@6.3-6.52
- **c07**: Dios@0.68-1.24 está@1.24-1.58 viendo@1.58-1.86 lo@1.86-2.1 que@2.1-2.26 hace,@2.26-2.52 algún@3.54-3.86 día@3.86-4.22 le@4.22-4.74 va@4.74-4.88 a@4.88-5.12 tocar@5.12-5.12 a@5.12-5.36 usted.@5.36-5.6
- **c08**: Pues@0.0-0.88 dígale@0.88-1.22 a@1.22-1.34 Dios@1.34-1.52 que@1.52-1.7 venga@1.7-1.98 el@1.98-2.08 viernes,@2.08-3.44 a@3.44-3.74 ver@3.74-3.9 si@3.9-4.06 Él@4.06-4.22 firma@4.22-4.58 por@4.58-4.8 ustedes.@4.8-5.12
- **c09**: ¿Todo@1.12-1.74 bien@1.74-1.94 por@1.94-2.14 aquí,@2.14-2.4 don@2.56-2.66 Prudencio?@2.66-3.16 Buenas@4.42-4.82 tardes,@4.82-5.18 doña@5.26-5.42 Ullalia.@5.42-5.78
- **c10**: ¿Y@3.16-3.76 usted@3.76-3.94 quién@3.94-4.22 es?@4.22-4.52
- **c11**: Hace@1.26-1.78 veinte@1.78-2.08 años@2.08-2.4 usted@2.4-2.66 me@2.66-2.84 tiró@2.84-3.1 o@3.1-3.2 tiró@3.2-3.36 una@3.36-3.48 taza@3.48-3.8 de@3.8-3.92 chocolate@3.92-4.26 al@4.26-4.52 piso.@4.52-4.88 Yo@6.16-6.68 nada@6.68-6.82 más@6.82-7.08 le@7.08-7.18 pedí@7.18-7.44 algo@7.44-7.62 de@7.62-7.76 comer.@7.76-8.0
- **c12**: Yo@0.0-0.86 he@0.86-0.96 tirado@0.96-1.26 muchas@1.26-1.52 cosas@1.52-1.88 en@1.88-2.1 mi@2.1-2.22 vida.@2.22-2.48 ¿Tú@3.86-4.4 eres@4.4-4.56 el@4.56-4.68 muchacho@4.68-5.06 flaco@5.06-5.5 de@5.5-5.66 la@5.66-5.76 bicicleta?@5.76-6.4
- **c13**: Damián@1.36-1.92 Robles@1.92-2.32 para@2.32-2.94 servirle@2.94-3.48 y@3.48-4.7 esta@4.7-4.9 familia@4.9-5.36 me@5.36-6.1 dio@6.1-6.22 de@6.22-6.34 comer@6.34-6.56 ese@6.56-6.84 mismo@6.84-7.12 día.@7.12-7.4
- **c14**: Esto@1.06-1.72 es@1.72-1.88 un@1.88-2.0 negocio,@2.0-2.52 muchacho.@2.58-3.06 No@4.26-4.6 tiene@4.6-4.82 nada@4.82-5.14 que@5.14-5.3 ver@5.3-5.48 contigo.@5.48-6.02
- **c15**: Cuando@0.9-1.46 se@1.46-1.66 meten@1.66-2.0 con@2.0-2.14 mi@2.14-2.3 familia,@2.3-2.8 sí@3.08-4.1 tiene@4.1-4.38 que@4.38-4.52 ver@4.52-4.7 conmigo.@4.7-5.14
- **c16**: Damián,@1.28-1.88 ¿de@2.18-2.3 verdad@2.3-2.54 eres@2.54-2.78 tú,@2.78-2.98 muchacho?@3.06-3.44 Mira@4.46-4.68 nomás@4.68-5.08 qué@5.08-5.22 grande@5.22-5.58 estás,@5.58-5.94 qué@6.46-6.58 grande@6.58-6.88 estás.@6.88-7.24
- **c17**: Soy@1.14-1.82 yo,@1.82-2.08 don@2.14-2.22 Prudencio.@2.22-2.76 Perdóneme@4.2-4.88 por@4.88-5.14 tardar@5.14-5.48 tanto@5.48-5.82 en@5.82-5.96 volver.@5.96-6.18
- **r1**: ¡Suscríbete!@4.6-6.0
- **c18**: mi@0.0-1.46 muchacho,@1.46-2.1 virgencita@2.2-2.96 santa,@2.96-3.52 volviste@4.46-4.92 a@4.92-5.08 casa.@5.08-5.38
- **c19**: Nunca@0.68-1.36 los@1.36-1.5 olvidé,@1.5-2.04 doña@2.2-2.36 Eulalia,@2.36-2.76 ni@3.98-4.66 un@4.66-4.82 solo@4.82-5.04 día@5.04-5.4 de@5.4-6.34 estos@6.34-6.56 veinte@6.56-6.94 años.@6.94-7.24
- **c20**: qué@0.0-0.8 bonito@0.8-1.2 reencuentro,@1.2-2.12 pero@3.12-3.66 el@3.66-3.82 viernes@3.82-4.54 este@4.54-4.9 terreno@4.9-5.46 es@5.46-6.06 de@6.06-6.16 la@6.16-6.24 empresa.@6.24-6.6
- **c21**: Nadie@1.18-1.66 va@1.66-1.8 a@1.8-1.9 salir@1.9-2.06 de@2.06-2.24 esta@2.24-2.42 casa.@2.42-2.72 Ya@3.66-3.9 me@3.9-4.02 encargué@4.02-4.38 de@4.38-4.44 eso.@4.44-4.66 Licenciado@5.34-5.82 Benavidez,@5.82-6.26 pase@6.78-6.96 por@6.96-7.16 favor.@7.16-7.4
- **c22**: Buenas@1.24-1.84 tardes.@1.84-2.34 Aquí@3.82-4.08 están@4.08-4.3 las@4.3-4.44 escrituras@4.44-4.92 registradas@4.92-5.94 esta@5.94-6.24 mañana@6.24-6.56 a@6.56-7.16 nombre@7.16-7.36 de@7.36-7.56 don@7.56-7.66 Prudencio@7.66-8.28 y@8.28-8.54 doña@8.54-8.76 Eulalia.@8.76-9.14
- **c23**: Eso@2.14-2.82 no@2.82-3.0 puede@3.0-3.18 ser.@3.18-3.64 Mi@4.42-5.1 director@5.1-5.44 nunca@5.44-5.8 va@5.8-6.08 a@6.08-6.2 aceptar@6.2-6.54 esto.@6.54-6.8
- **c24**: Su@0.0-0.84 director@0.84-1.18 ya@1.18-1.46 lo@1.46-1.58 aceptó.@1.58-2.02 Esta@3.58-3.78 mañana@3.78-4.1 le@4.1-4.34 compré@4.34-4.68 la@4.68-4.78 empresa.@4.78-5.08 Ahora@7.4-7.62 el@7.62-7.82 dueño@7.82-8.08 soy@8.08-8.28 yo.@8.28-8.5
- **r2**: no@2.16-3.56
- **c25**: Lo@0.0-0.58 importante@0.58-1.0 no@1.0-1.28 es@1.28-1.36 la@1.36-1.44 empresa,@1.44-1.8 don@1.92-2.0 Prudencio.@2.0-2.5 Lo@3.76-3.98 importante@3.98-4.42 es@4.42-4.7 esto.@4.7-4.98 Esta@6.42-6.66 tierra@6.66-7.0 es@7.0-7.22 suya@7.22-7.62 y@7.62-8.4 nadie@8.4-8.68 se@8.68-8.86 la@8.86-8.94 va@8.94-9.08 a@9.08-9.16 quitar.@9.16-9.38
- **c26**: Damian@0.76-1.4 espera,@1.4-1.76 mi@2.46-2.66 esposo@2.66-3.0 murió@3.0-3.34 hace@3.34-3.48 un@3.48-3.66 año@3.66-3.92 y@3.92-4.38 desde@4.38-4.56 entonces@4.56-4.94 todo@4.94-5.26 se@5.26-5.46 me@5.46-5.58 vino@5.58-5.76 abajo.@5.76-6.12 Ahora@6.84-7.28 te@7.28-7.46 toca@7.46-7.7 a@7.7-7.86 ti,@7.86-7.98 quítame@8.48-8.82 todo.@8.82-9.1
- **c27**: Eso@0.78-1.18 no@1.18-1.34 lo@1.34-1.44 aprendí@1.44-1.78 en@1.78-1.86 esta@1.86-2.04 casa.@2.04-2.32 Mañana@3.4-3.8 la@3.8-3.96 espero@3.96-4.18 en@4.18-4.32 mi@4.32-4.4 oficina.@4.4-5.42
- **c28**: ¿Para@0.92-1.48 qué?@1.48-1.76 ¿Después@3.56-4.12 de@4.12-4.26 todo@4.26-4.56 lo@4.56-4.8 que@4.8-4.94 te@4.94-5.1 hice?@5.1-5.38
- **c29**: Necesito@1.04-1.6 a@1.6-1.72 alguien@1.72-1.92 que@1.92-2.1 conozca@2.1-2.58 esta@2.58-2.78 tierra.@2.78-3.14 Usted@4.8-5.08 decide@5.08-5.44 si@5.44-5.64 viene@5.64-5.92 o@5.92-6.12 no.@6.12-6.24
- **c30**: ¿Cómo@0.8-1.48 te@1.48-1.68 vamos@1.68-1.88 a@1.88-2.06 pagar@2.06-2.32 todo@2.32-2.64 esto,@2.64-2.98 muchacho?@3.06-3.54 Nosotros@4.58-5.04 no@5.04-5.2 tenemos@5.2-5.58 nada.@5.58-5.98
- **c31**: Ya@0.0-0.54 me@0.54-0.66 pagaron@0.66-1.08 don@1.08-1.22 Prudencio,@1.22-1.74 hace@2.44-2.82 veinte@2.82-3.18 años@3.18-3.56 con@3.56-4.36 una@4.36-4.54 taza@4.54-4.82 de@4.82-4.94 chocolate@4.94-5.32 y@5.32-5.64 un@5.64-5.74 pan,@5.74-6.52 sin@6.52-7.1 pedirme@7.1-7.54 nada@7.54-7.74 a@7.74-7.88 cambio.@7.88-8.1
- **c32**: Tómate@1.46-1.94 lo@1.94-2.12 despacito,@2.12-2.78 está@2.88-2.98 caliente.@2.98-3.56 En@4.6-4.8 esta@4.8-5.04 casa@5.04-5.38 siempre@5.38-5.72 va@5.72-6.1 a@6.1-6.12 haber@6.12-6.28 un@6.28-6.4 plato@6.4-6.8 para@6.8-7.04 ti.@7.04-7.3
- **r3**: ¡Muchas@4.6-6.0 gracias!@6.0-6.0
- **c33**: ¿Ustedes@1.32-1.82 creen@1.82-2.04 que@2.04-2.18 Renata@2.18-2.66 va@2.66-2.84 a@2.84-2.9 venir@2.9-3.06 mañana?@3.06-3.44 Denle@4.8-5.04 me@5.04-5.16 gusta@5.16-5.42 y@5.42-5.58 compartan@5.58-6.18 para@6.18-6.52 ver@6.52-6.7 la@6.7-6.82 segunda@6.82-7.1 parte.@7.1-7.48
