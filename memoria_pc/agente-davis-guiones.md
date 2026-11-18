---
name: agente-davis-guiones
description: Desde 2026-10-24 yo escribo los guiones del canal Agente Davis (mejorando sus videos ganadores) y genero su voz en VoiceStudio; carpeta agente-davis/
metadata:
  node_type: memory
  type: project
  originSessionId: 4acbbdf7-be55-457b-a4ba-363c0a2f0599
  modified: 2026-10-31T05:29:44.833Z
---

**Entrega de video (pedido 2026-10-29):** SIEMPRE que entregue un video renderizado, incluir en el mensaje su TÍTULO (y el texto de la miniatura). Guardar el título elegido en la cabecera del guion (`guiones/NN-*.md`) para no perderlo.
- 02-telefono (video03_telefono.mp4): "Si ICE te pide tu TELÉFONO, di ESTO (Solo UNA palabra)" · miniatura "NO LO DESBLOQUEES".
- 03-carro (voz/03): "Si ICE te pregunta "¿A dónde vas?" en el carro, di ESTO" · miniatura "NO LE CONTESTES".
- 04-carta-residentes (voz/04, aviso para comparecer/NTA a residentes): "Si eres RESIDENTE y te llega ESTA carta, NO la ignores" · miniatura "¿TE LLEGÓ ESTA CARTA?".
- 05-puerta (voz/05, video v06): "Si ICE toca tu puerta y pregunta "¿Está…?", di ESTO" · miniatura "¿PUEDEN ENTRAR?".
- 06-congreso-ice (voz/06, noticia: demócratas ganan el Congreso 3-nov-2026): "Trump PERDIÓ el Congreso… ¿y ahora qué pasa con ICE?" · miniatura "¿ICE SE DETIENE?".
- **Corrección 2026-11-13: YA NO mencionar la tarjeta roja** (externa, casi no deja ganancia). El bloque de mitad de video pasa a ser el Kit Plan de Emergencia Familiar de Gumroad (agentpatrickdavis.gumroad.com/l/kit-familiar), ver [[gumroad]]. Instagram de Patrick ya no existe.
- **Corrección 2026-11-07:** variar también el FORMATO del título/tema: no siempre "Si ICE hace X, haz/di ESTO"; usar noticias del momento (elecciones, leyes, cortes) cuando tengan potencial. Elegir temas por OUTLIERS (vistas ÷ mediana del canal), no por vistas brutas. Canales a revisar cada vez: los de ideas.md + @AngelLealLawyer, @LaHoraDelInmigrante, @abogadaerikajurado. vidIQ puede quedarse sin créditos: usar `yt-dlp --flat-playlist -J --playlist-end 80 <canal>/videos` y dividir por la mediana. Datos de noticias SIEMPRE verificados con fuentes, pero Patrick NUNCA las cita en el guion (nada de "según AP/NBC/un estudio"): él lo explica todo como propio (corrección 2026-11-07) y nombres en inglés añadidos a SAY en gen_voice.py.
- **Corrección 2026-11-05 (2):** texto de miniatura CORTO (2-3 palabras, ej. "¿PUEDEN ENTRAR?"), no cabe más. En la edición NUNCA repetir una imagen dentro del mismo video (cada imagen distinta). Y para estos videos NO mandar storyboard: editar y renderizar directo (sigue habiendo QA propio de cada frame).
- **Corrección 2026-11-05 (desde guion 05):**
  - Duración: guiones de ≥15 min de voz (~2.700-2.900 palabras) y voz más lenta (gen_voice.SPEED = 0.9).
  - Patrick está del lado de la gente: NUNCA contar en primera persona cosas que él hacía como agente de ICE que caigan mal ("cuando yo tocaba puertas…"). Decirlo en tercera persona ("cuando un agente toca una puerta…"); su experiencia solo sirve para saber cómo funciona por dentro.
  - Texto de miniatura: NUNCA la solución del video (mal: "PÁSELA POR DEBAJO"); poner algo que dé curiosidad y obligue a ver el video para descubrir la respuesta.
- **Variar (corrección 2026-11-02):** los guiones 01-04 abrían todos con "Imagina que…" y las miniaturas siempre con "NO + verbo" (NO LO DESBLOQUEES, NO LE CONTESTES…): le cansa. Cada guion abre de forma distinta (dato, pregunta directa, frase citada, confesión del agente, cuenta regresiva…) y la miniatura cambia de patrón (pregunta, peligro, número, frase citada…). Revisar los anteriores antes de escribir.
- Palabras en inglés como "Notice to Appear" la voz las destroza: decirlas en español.
- QA de voz: `python qa_voice.py guiones/X.md voz/NN` (Whisper por párrafo); retomas con otra seed vía `gen_voice.SEED` + `gen_voice.tts`, originales en voz/NN/retake/.

El usuario me pidió escribir los guiones y generar su voz (VoiceStudio, perfil **"Agente davis" `d31aa86f`**); él graba el video raw con esa voz y luego yo lo edito con el estilo [[yt-agente-style]].
- Carpeta: `F:\Claude Proyectos\agente-davis\` (guiones/, voz/, ideas.md con el estudio de canales y temas priorizados, gen_voice.py).
- Voz: REST `/v1/audio/speech` model omnivoice, voice d31aa86f, language es, num_step 32, wav, seed 7, párrafo a párrafo (~6 s de generación por s de audio → 14 min ≈ 1,5 h, correr en segundo plano). Números escritos en letras. **"ICE" se pronuncia "ais"**: gen_voice.py lo sustituye solo para la voz (tabla SAY); vigilar otras siglas que la voz pueda leer mal. El guion 01 (aeropuerto) salió aprobado ("bastante bien"). Ver [[voicestudio]].
- Guiones: fórmula de sus ganadores ("Si ICE te pregunta X, di/no digas Y"), tono orgánico de sus videos marcados como humanos, incluir siempre "Soy el agente Patrick Davis y…" (dispara la intro en la edición) y cerrar con "Aquí les dejaré otro video que estoy seguro de que les aportará mucho más valor… Así que nos vemos allí."
- **Desde el guion 02, en cada guion (pedido 2026-10-24):**
  - Hacia la mitad, un bloque de la **tarjeta roja "Conoce tus derechos"** (variar las palabras cada vez; ideas obligatorias: la recomiendo, es la tarjeta que protege tus derechos si ais te detiene, parece pequeña pero he visto muchas paradas resolverse solo con mostrarla, cuando los nervios atacan dices lo que no debes y la tarjeta hace el trabajo por ti dejando al agente sin opciones, viene en inglés y español, "haz clic aquí abajo"; cerrar con "ahora bien, continuando con el video…"). Texto base del usuario: "Y antes de continuar, quiero recomendarte la tarjeta roja de conoce tus derechos… Ahora bien, continuando con el video".
  - Terminar SIEMPRE con (variando levemente): "Aquí les dejaré otro video que estoy seguro de que les aportará mucho más valor en cuanto a cómo pueden mantenerse protegidos. Así que nos vemos allí."
- **Entregar la voz también en 2 partes** (él graba el raw en 2 partes): cortar en la pausa entre párrafos más cercana a la mitad, nunca dentro de una palabra (01: parte1 5:36 / parte2 5:13, corte tras el bloque del ebook).
- Fuentes de temas: sus 9 videos ganadores, canales de referencia < 250k subs con videos largos > 50k vistas y del mismo tema, y vidIQ (outliers/tendencias). Temas permitidos: ICE, visas, green card, aeropuertos, países para emigrar, qué hacer si ICE te detiene.
**Why:** quiere delegar guion + voz para solo grabar.
**How to apply:** datos legales exactos y prudentes (es su credibilidad); entregar el guion limpio + el WAV.
