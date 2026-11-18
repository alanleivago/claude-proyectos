---
name: atrium-reglas
description: "Correcciones del usuario al piloto agua-hacienda v1 (novelas estilo atrium, cuenta VISTA STORIES)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 31217992-d068-4929-9882-eede7428b798
  modified: 2026-11-03T22:29:54.769Z
---

Revisión v1 de pieces/agua-hacienda (2026-11-03), aplica a todas las novelas [[atrium-novelas]]:
- Cuenta: **VISTA STORIES** (marca de agua arriba al centro, como "ATRIUM STORIES").
- **Música de fondo de telenovela** siempre, como las refs (cama bajo todo el diálogo).
- **Ritmo rápido**: cortes rápidos, sin silencios; silencio solo cuando la escena lo pide (alguien revisa un documento/foto).
- **No cortar palabras bruscamente**: dejar que cada palabra termine (margen tras la última palabra, fundidos cortos de audio).
- **Pronunciación**: vigilar errores del generador ("trabayo" en vez de "trabajo"); regenerar el clip. Escribir la palabra de forma que no la deforme.
- **Morphing prohibido** (p. ej. anciano que se transforma en la niña): revisar cada clip y regenerar si pasa.
- Subtítulos quemados en algún clip: no importa si el video en general sale bien.
- **Transiciones** (fundido a negro, etc.): copiar exactamente cómo lo hacen las refs.
- **CTA final**: el protagonista en primer plano dice a cámara un CTA relacionado con la historia (verificar en refs y replicar).

**Why:** pedidos explícitos del usuario tras ver v1 ("va por muy buen camino").
**How to apply:** revisar cada punto antes de entregar cualquier versión.
- **Política de menores en Flow**: si bloquea, reintentar con varias redacciones (sin "girl/little girl/child": "daughter", "young Lupita", "the kid", plano medio con un adulto, sin sed/llanto/abuso hacia ella) antes de rendirse.
- **Inicio de la música**: todas las refs abren con un BOOM (golpe) en el frame 0 y siguen con música de suspenso; la cama cálida entra después (escena del protector).
- **Revisión v2 (2026-11-03):** empezar SIN plano abierto, con los personajes hablando de una; música más baja que v2 (cama de fondo, la voz manda); el BOOM inicial es el golpe comprimido/cinematográfico de las refs (no un hit con cuernos); fundido a negro antes del CTA; CTA tipo pregunta: "¿Creen que Ezequiel se quedará con el rancho? Denle me gusta y compartan para ver la segunda parte."; marca VISTA STORIES visible de verdad; nada de personajes que aparecen de golpe.
- **Desfase voz/labios**: concatenar partes mp4+aac con `-c copy` acumula retraso (v2 llegó a >1 s). Cortar a frames exactos y audio PCM.
- **SIEMPRE revisar antes de entregar** (el usuario lo exige): sincronía labios al inicio/medio/final, marca visible en frame a tamaño real, pops/morphs en cada corte, volumen música vs voz, boom, transiciones, CTA.
- **APROBADO: agua-hacienda v4 (2026-11-04)** = nivel mínimo y plantilla. `pieces/agua-hacienda/edit.py` es el montaje de referencia (copiarlo): partes a frames exactos (`fps=24,tpad` + `-frames:v`, audio `apad,atrim` PCM .mov), concat por FILTRO con `setpts=N/24/TB` / `asetpts=N/SR/TB` (el concat demuxer y sin setpts desfasan labios hasta 15 frames), mezcla de audio a WAV aparte y luego video, `loudnorm -14 + alimiter`.
- Marca VISTA STORIES como ATRIUM STORIES: blanca, 22 px, sin contorno, opacidad baja (alpha ~80/255, bajada desde 110 a pedido del usuario el 2026-11-04), y≈135. NO "CONTINUARÁ". Golpe inicial sutil (hit oscuro con lowpass, volumen 0.3, bajo la voz), no un boom exagerado.
- **Verificación obligatoria antes de entregar** (lo más importante para el usuario): medir desfase labios/voz en 5 puntos (offset de video y audio de cada parte contra el final), hojas de fotogramas de cada zona corregida y del final, recorte de la marca a tamaño real, earshot en el inicio y los niveles, revisar morphs/apariciones en cada clip. Nunca decir "arreglado" por duraciones; medir contra el resultado.
- Bug Flow MCP: generar varias hojas seguidas puede devolver la MISMA imagen (md5 igual) → comprobar `md5sum chars/*.jpg` y que personajes distintos no se parezcan.
- **Marca rotativa:** VISTA STORIES → MAJESTIC STORIES → MEXI STORIES → VISTA… una por video. SAGA FILMS PAUSADA por el usuario (2026-11-04) hasta que avise. Asignadas: …camionetas=SAGA, tele-nueva=VISTA, buen-hijo=MAJESTIC, recetario=MEXI, suegra=VISTA, siguiente=MAJESTIC, luego MEXI. Mismo estilo (22 px, alpha 80, y=135).
- **Ritmo de cortes como la ref** (El Retén de atrium, medido): 62 planos en 113 s, media 1.8 s, mediana 1.6 s, cuartil bajo ~1.0 s. Arranque y clímax en ~1 s por plano. Nuestro v1 de reten iba en media 2.6 / mediana 2.1: demasiado lento. Técnicas:
  - **Corte SOLO al terminar la frase** (corrección del usuario): nunca a mitad de frase, nunca la voz sonando sobre la cara del que escucha. Cada frase completa en su plano y, apenas termina, corte seco al siguiente (reacción, otro ángulo o el otro personaje). La rapidez sale de recortar el aire entre frases y de frases cortas por plano, no de L-cuts.
  - **Plano/contraplano:** alternar constantemente los planos sobre el hombro.
  - **Planos largos:** solo en las amenazas clave.
  - **Transiciones:** corte seco.
  - **Objetivo:** media ≤ 1.9 s. Medirlo con `select='gt(scene,0.3)'` antes de entregar.
- **Corrección de cortes (2026-11-04, tras ver reten v3 y hacienda v1):**
  - **Mismo personaje con varias frases seguidas:** se queda en SU plano. Se corta solo el silencio entre frases (salto dentro del mismo clip) y sigue la siguiente frase. NO se intercala la cara del otro si todavía no le toca hablar. Ej. reten 14 s: "Buenas tardes, señora." → directo a "¿Pa' dónde lleva tanto ganado?", sin la señora en medio.
  - **Reacciones mudas:** solo cuando aportan algo a la escena (ej. reten 43 s: el muchacho impotente). No como relleno de ritmo.
  - **El cambio de plano** va cuando cambia el que habla o cuando la reacción cuenta algo.
- **CTA con carisma:** como en las refs, el personaje lo dice moviéndose de forma orgánica: se toca o ajusta el sombrero, asiente, ladea la cabeza, sonríe, gesticula. Nada de busto rígido. Pedirlo así en el prompt del clip CTA.
- **Continuidad de personajes en el borde del cuadro:** en los planos sobre el hombro, quien aparece de espaldas o en el borde tiene que ser el MISMO personaje con su MISMA ropa (en reten, la abuela del borde era otra y vestida distinto). Revisarlo en el QA de cada clip y regenerarlo si no coincide. En el prompt, nombrar al personaje del borde con su `@{ASSET}` y su ropa.
- **APROBADO (2026-11-04): reten-sierra v4 + hacienda-sangre v2 = nivel y plantilla actuales** (reemplazan a agua v4 como referencia de montaje). Copiar `pieces/reten-sierra/edit.py` (o hacienda-sangre) para los nuevos.
  - **EDL por frases:** `renders/phr.json`. Entrada 0.08 s antes de cada frase y salida 0.15 s después. Admite `(cid, rango, *pre)` para recortes o crops por tramo.
  - **Mismo personaje con varias frases:** salto dentro del mismo clip. Las reacciones van solo si aportan. Ritmo de unos 1.9 s por segmento.
  - **Cierre:** CTA con carisma. Antes del CTA, BLACK de 0.4 s.
  - **Marca:** alterna VISTA y MAJESTIC, alpha 80.
  - **Audio:** `alimiter limit=0.80`, que da un pico ≤ -1 dBTP. loudnorm a -14.
- **Flujo aprobado por video:**
  1. Un agente escribe los archivos y el caption.
  2. Hojas: md5 y montaje visual.
  3. Clips con reintentos automáticos.
  4. Agente de QA, que también revisa la continuidad de los bordes y de la ropa.
  5. Regenerar los clips que fallen.
  6. Agente que monta y verifica: sincronía en 5 puntos, ritmo, LUFS/pico, transcripción por plano y hojas de contactos.
  7. Telegram con caption.txt.
  8. Actualizar ESTADO.md.
- **Pantallas (laptop, tele o celular):** la persona del video tiene que verse como imagen plana DENTRO del marco de la pantalla, nunca saliendo de ella (en encendedor c01 la cabeza de Leandro salía de la laptop, corrección del usuario). En el prompt va "2D image displayed INSIDE the screen rectangle… nothing comes out of the screen", mejor sobre el hombro de quien mira. Revisarlo en el QA.
- **Guion compacto:** los guiones de 300 s en bruto obligaron a quitar 15–27 frases en el montaje (camionetas salía en 3:16). Apuntar a unos 220–240 s de voz en bruto. El CTA solo menciona nombres que el espectador oyó en el video; si no, usar el rol ("el gerente").

## Segundas partes (2026-11-05)
Intercalar: 2 videos NUEVOS por cada 1 Parte 2 (las primeras partes se ven más; corrección 2026-11-05). El usuario autorizó hacer Parte 2 de las novelas ya entregadas, con la MISMA marca de agua de su Parte 1 (no entra en la rotación). Carpeta pieces/<pieza>-p2/, reusar chars/ de la Parte 1 (mismos personajes y ropa), caption "· Parte 2". Orden: agua-hacienda, medalla-mezcal, reten-sierra, hacienda-sangre, ...

## Marcas: música y posición (2026-11-05)
Cada marca tiene su música fija (tension, calida, revelacion, boom) y su posición de marca de agua, en pieces/_marcas/<MARCA>/ + marcas.json; edit.py las toma con `from marca import brand, brand_wm` (BRAND = "...").
- VISTA: la música original (Thriller Documentary Pack, Lament of the Vaquero); marca arriba al centro, y=135.
- MAJESTIC: arriba a la izquierda (x=36, y=210). MEXI: arriba a la derecha, alineada a la derecha (margen 36, y=210). Siempre 22 px, alfa 80.
**Why:** TikTok descalificó un video por "no original": todas las marcas sonaban y se veían igual.
**How to apply:** nunca copiar music/ de otra pieza ni dibujar la marca a mano; nunca cruzar la música de una marca con otra.

## Historias propias + Navidad (2026-11-05)
Sin referencias nuevas, escribo historias ORIGINALES inspiradas en los más virales de las cuentas de referencia (fuentes/referencias2/ranking.md) (humillación → giro de poder → payoff → gancho Parte 2). Nov-dic: IR INTRODUCIENDO la Navidad, NO todas (aprox. 1 de cada 3), tema navideño (posadas, Nochebuena, cena familiar, piñata, ponche, nacimiento) sin dinero/aguinaldo ni niños.

## Cuarta marca: SIN MARCA (2026-11-06)
Rotación ahora VISTA → MAJESTIC → MEXI → SIN MARCA (video sin marca de agua). Kit en pieces/_marcas/SINMARCA con su propia BGM de suspenso (distinta de las otras 3, misma esencia).

## Apelaciones TikTok (2026-11-06)
Cuando el usuario avise de un video descalificado: texto de apelación ≤500 caracteres (honesto: historia/guion/personajes/edición originales, sin negar uso de IA) + carpeta <pieza>/apelacion/ con guion, hoja de personajes, prompts, grilla de escenas generadas y script de edición, para que él tome las fotos.

## Qué funciona (análisis 2026-11-07, fuentes/atrium-vista/resumen.md)
- El usuario pidió: la mayoría inspiradas en @atriumstories_ (original), tipo CAPOS. Datos: figura de poder (capo/patrón/matriarca) = lo que rinde. VISTA: capos mediana 116K vs 5.6K resto (reten-sierra, medalla-mezcal). Atrium: capos 3.1x, humillación-revancha y hacienda también altas; familia/infidelidad/bondad sin poderoso < 0.5x.
- Ritmo: ≤2 s por plano de media (60-90 planos); los flojos iban a 3.5-4.3 s.
- Gancho 0-2 s visual (amenaza/gesto/camionetas) + cifra y plazo; nunca abrir con conversación estática. Castigo en P2, cierre con dilema a cámara. Sin armas ni sangre visibles (escoltas, convoyes, maletines, radios); suavizar palabras según la tabla del resumen.
- P1 pesa mucho más que P2 (P2 cae ~5x).

## Remakes transformados (usuario, 2026-11-08)
Preferir remakes de los videos de Atrium con >1M vistas (fuentes/atrium-vista/ranking.md), pero NUNCA iguales: si la historia se parece demasiado, TikTok lo descalifica por contenido no original. Mantener solo el esqueleto (humillación + plazo → llega la figura de poder → plazo invertido → giro familiar → castigo en P2) y cambiar escenario, oficio, objeto clave, nombres, diálogos, giro y CTA.

## Re-análisis 2026-11-14 (fuentes/atrium-vista/ranking2.md)
El usuario pidió enfocarse en las historias de Atrium (las que mejor funcionan). Datos de 49 posts: madrastra (mediana 336K) y padre que pone orden a los hijos (276K) superan a capos (188K, aunque capos tiene los picos 1.6M/1.1M); esas sagas sostienen la P2 (Evaristo P2 > P1). Flojos: infidelidad, bondad, humilde-dignidad. Tanda del 2026-11-14: solo VISTA, MEXI y MAJESTIC (sin SIN MARCA).

## Nunca abrir con inserto vacío (usuario, 2026-11-14)
No empezar el video con un plano donde no se ve a nadie (algo que cae, alguien rompe/tira algo, manos, pies, objetos). Atrium nunca lo hace: el primer tramo es el personaje hablando, directo en el conflicto. Insertos solo en medio.

## Velocidad 1.2x (2026-11-14)
Atrium acelera sus videos a 1.20x (rango 1.15-1.25): imagen y voz por igual, con el tono conservado (atempo), y exporta a 30 fps. Informe: fuentes/atrium-vista/velocidad.md. Desde jipi-becal, edit.py aplica después del concat `setpts=PTS/1.2,fps=30` + `atempo=1.2` y divide at() entre SPEED; la música no se acelera.
**Usuario (2026-11-14): le gusta acelerar pero un poco menos: usar SPEED = 1.15** (setpts=PTS/1.15, atempo=1.15), no 1.2.

## Encuadres con 2 personajes (usuario, 2026-11-14; fuentes/atrium-vista/encuadres.md)
Atrium: 15 % planos de 1 persona, 62 % sobre el hombro (OTS: el que habla de frente, el que escucha de espaldas desenfocado en el borde), 16 % two-shot, 6 % grupo. Nosotros hacíamos 94 % de 1 persona. Meta: ~50 % OTS, ~25 % 1 persona (CTA, llamadas, llanto), ~15 % two-shot, ~10 % grupo. La persona de espaldas va con su @{ASSET} + ropa vista de atrás (si no, Omni mete dobles); solo mueve los labios el de frente. Snippet: pieces/_encuadres_snippet.py; primera pieza: costal-cuyutlan.
Resultado costal-cuyutlan: 17/17 OTS, 6/6 two-shot y 3/3 grupo bien a la primera, sin dobles. Plantilla de encuadres = pieces/costal-cuyutlan/clips.py; usarla en TODAS las piezas nuevas.

## Flow: diálogos inventados y contaminación (2026-11-15)
- Omni a veces inventa diálogos ajenos ("No me mientas, Eduardo"). Arreglo: en talk() poner el diálogo AL INICIO del prompt: "DIALOGUE (exact Spanish words, nothing else): …". Usarlo en todas las plantillas nuevas.
- Un proyecto de Flow compartido entre piezas mete personajes de otra pieza y gatitos del test de control. Usar un proyecto Flow nuevo por pieza (o borrar los assets "Kitten playing with yarn").

- **Subtítulos quemados (desde 2026-11-16):** todo render lleva subtítulos amarillos en negrita con contorno oscuro, tercio inferior centrado, 1-2 líneas por frase, sincronizados, texto de lines.json sin errores (como la ref @alisorxomrb 7706249552289860896). No re-renderizar lo ya entregado.

- **Historias variadas (2026-11-17):** PROHIBIDO repetir la fórmula desalojo/echar a alguien con plazo ("antes de que suenen las campanas te vas"). Cada pieza con premisa distinta (identidad oculta, herencia, doble vida, traición de hermano, boda interrumpida, paternidad...) sacada de fuentes/novelas-variedad/CATALOGO.md; sin repetir estructura ni patrón de frase final.
- **Patronas y haciendas (2026-11-17):** el usuario pidió sumar historias tipo Soy tu dueña / Destilando Amor / La Patrona / Doña Bárbara / Pasión de Gavilanes: catálogo #45-#56, ~1 de cada 2 piezas nuevas; solo arquetipos, nunca tramas reales.
