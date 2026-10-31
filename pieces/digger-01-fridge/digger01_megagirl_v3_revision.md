# Revisión de digger01_megagirl_v3.mp4

- Estilo: mechayuki
- Duración: 92.6 s

## Veredicto
**CASI (fallos menores)**: este es el listón aprobado (v3), y lo visible está en ese nivel. Medido contra las reglas posteriores a v3 (ep02/ep03), aparecen varios fallos de cara, encuadre y ubicación de props que no conviene repetir en episodios nuevos.

## Fallos
1. **[00:27–00:29]** "Gross!": en el fotograma ella está de espaldas o de perfil con el bloque de hielo sobre la cabeza, así que no se ve ninguna cara de asco. Además la transcripción deja solo ~0,1 s entre "Gross!" (hasta 28,6) y la frase siguiente (28,7) → rompe "expresiones que coincidan con la línea" y "dar espacio a las palabras de reacción con pausa + plano de reacción" → insertar una pausa de ~0,4 s y un plano frontal de ella con la celda de asco.
2. **[01:26–01:31]** El cubo verde flota en el aire sobre el puño levantado. En 01:29 hay un hueco entre puño y cubo, y en 01:30–01:31 queda claramente separado, mientras que en 00:03 y 01:22 estaba apoyado en el suelo → rompe "los props se quedan en la mano / los objetos se apoyan en superficies" → devolver el cubo al suelo o pegarlo a la mano.
3. **[01:26 vs 00:00]** El cierre es el mismo lugar que la apertura: nieve, nevera enterrada y valla. Cambia solo el encuadre → rompe "un video nunca empieza y termina en el mismo sitio" (regla de ep02, aplicable a los nuevos) → para episodios nuevos, cerrar en otra localización.
4. **[01:11–01:12]** Ella queda cortada por el borde izquierdo: solo se ven el brazo y parte del torso. También tiene el puño pegado o cortado por el borde en **[00:23–00:27]** y **[00:53–00:56]** → rompe "nunca cortada por el borde" → recentrar o abrir el encuadre.
5. **[01:10]** La transcripción dice "dumps the heat out the **bag**" y el guion/caption dice "back" → rompe "Whisper-check cada línea" → escuchar el take con earshot y regenerar si de verdad suena "bag".
6. **[00:06–00:07, 00:15–00:20, 01:12–01:15]** Varios planos clave son de perfil, con el pelo tapando la cara, o ella aparece diminuta con el hielo en la cabeza (00:20–00:22) → rompe "cara visible" → girar 3/4 o subir la cámara.
7. **[01:30–01:31]** El outro es grande: MECHAYUKI ocupa ~80 % del ancho, la barra FOLLOW es ancha, y el título tapa parcialmente el cartel de la derecha → rompe "outro pequeño" → reducir a la altura de un caption.
8. **[00:37]** El comentario del Operator empieza en ~00:37,2 de ~91 s, es decir ~41 % → pasa ligeramente el rango 35–40 % → adelantar ~1 s.
9. **[00:34–00:36, 01:01, 01:11]** Los captions y labels tapan el prop principal: "sinks."/"is"/"icebox." sobre la presa, y el label COMPRESSOR/REFRIGERANT sobre la presa en cortes → rompe "overlays/labels claros" → subir el caption o mover el label.
10. **[00:57–01:00]** La etiqueta "-26°C" se lee casi como "-2B°C" porque el 6 se cierra en la fuente pixel → rompe "fuente legible" → revisar el glifo del 6 o aumentar el tamaño.
11. **[00:15–00:17, 01:13, 01:22]** Props poco legibles: la sierra de hielo es una barra gris lisa sin dientes, el lateral de la nevera (01:13) es una losa plana con textura borrosa, y el plato con la presa (01:22) es un aro azul fino → rompe "cada acción/prop se lee claro, nada plano" → darles dientes, volumen y borde más claro.

## Cumple
- Captions de una palabra en fuente pixel, centradas y legibles en general.
- Líneas fijas de apertura y cierre ("Operator, I dug up…", "Artifact understood. Logging off.") presentes, y "Operator…" sin "!" en la transcripción.
- Sin pantalla negra final: el outro va sobre su plano de despedida, con nombre, "ARTIFACT 001" y CTA.
- Etiquetas "This is a…" con label pixel: REFRIGERATOR, ICEHOUSE, ICEBOX, REFRIGERANT, COMPRESSOR, HEAT THIEF.
- Ella animada y el mundo reacciona: arena que cae en 00:18, agujero con agua en 00:11 y 00:23, polvo y hielo que se rompe.
- FX abundantes: shiver, sparkles, vapor, burbujas, flechas de calor/frío, "!" y "?".
- Expresiones adecuadas en la mayoría de planos: shiver con lágrimas (00:50), duda con "?" (00:40) y primer plano al "can't/heat" (00:41–00:44).
- Overlays dentro de su marco: el agua dentro del círculo (00:45–00:49) y los diagramas en cutaway (icebox, nevera, bomba).
- Hook absurdo y cadena fallo→arreglo (nieve → icehouse → icebox → refrigerante → compresor), con el payoff "heat thief" y el callback.
- Duración ~91 s, dentro del rango 80–100 s.

## No verificable
- Voz: timbre, cortes dentro de palabras, entonación ascendente de "why not just make cold?" y "…leftovers?", "asks" sin recortar, energía de "Operator…" y pausa ≈0,4 s → earshot critique y `speaker_sim.py`.
- Música y mezcla: ~7 dB bajo la voz, -12 LUFS / TP ≤ -1 dBTP, sin clipping, bajo y batería → earshot timeline.
- SFX en cada acción (pala, sierra, bomba, etc.) → earshot timeline.
- Movimiento fino: manos atravesando objetos, rodillas en caminatas de perfil, props que se mantienen en la mano durante el movimiento y el pop-in de caption (0,86→1,05→0,98→1,0) → revisar el render a 30 fps frame a frame.
- Créditos CC0/CC-BY en la descripción → revisar LOG.md.
- Tabla PASS por shot (inicio/mitad/fin) → solo se ve una muestra cada ~1,1 s.
