# QA clips · agua-hacienda-p2 (2026-11-05)

Método: hoja de 4 fotogramas por clip (8/35/62/90 %) más fotogramas de detalle en los dudosos, comparados con chars/. Audio: faster-whisper large-v3 (es) sobre WAV extraído con ffmpeg, y F0 mediana por clip para el género de la voz (hombres 111–152 Hz, mujeres 193–281 Hz, todos correctos). Ningún clip congelado (movimiento mínimo entre muestras ≥ 1.4).

| clip | estado | motivo |
|---|---|---|
| c01 | REGENERAR | Borde izq.: entre 5.2 y 6.4 s el sombrero de Ezequiel flota solo, sin cabeza debajo, en plena primera frase. Audio OK. |
| c02 | OK | Lupita de espaldas en el borde der. con chongo y saco gris (coincide). Audio completo. |
| c03 | OK | Audio completo. |
| c04 | OK | Don Chuy avanza de plano entero a primer plano (sin corte). Audio completo. |
| c05 | OK | El jarrito entra por abajo al levantarlo (~4.5 s), es natural. Audio completo. |
| c06 | OK | Doña Rosa con rebozo morado y mandil. Audio completo. |
| c07 | OK | Audio completo. |
| c08 | OK | Audio completo. |
| c09 | OK | Audio completo. |
| c10 | menor | A partir de ~6 s el sombrero del borde izq. flota sin cabeza. Las frases terminan a los 5.26 s: usar solo 0–5.4 s. |
| r1 | OK | Mudo, sonrisa que se apaga. |
| c11 | OK | Beto coincide con la hoja. Audio completo. |
| c12 | OK | Audio completo. |
| c13 | REGENERAR | Audio: "…ha sido de la hacienda **a hacienda**" (palabra repetida al final, 6.4 s). |
| c14 | OK | Documento con sello, el texto chico no se lee (no molesta). Audio completo. |
| c15 | OK | Chuy y Rosa con ropa correcta. Audio completo. |
| c16 | OK | Camioneta blanca al fondo. Audio completo. |
| c17 | OK | Audio completo. |
| c18 | menor | Beto (chico en el plano abierto) tiene otra cara, la misma de c19. Una voz dice "¡Vamos a ver!" en 0–1.3 s: silenciar el audio del clip. |
| c19 | REGENERAR | Beto con otra cara (pelo y facciones distintos de la hoja y de c11/c14/c35). Audio OK. |
| c20 | OK | Agua visible aguas arriba de la compuerta (lógico). Audio completo. |
| c21 | OK | Mudo. Whisper solo oye agua o música. |
| c22 | OK | Audio completo. |
| c23 | OK | Audio completo. |
| c24 | OK | Pila seca. Audio completo. |
| c25 | OK | Audio completo. |
| c26 | OK | Mudo. Ezequiel con el sombrero en la mano, Lupita y Chuy correctos. |
| c27 | OK | Audio completo. |
| c28 | OK | Borde izq.: cabeza gris sin sombrero y saco beige (coincide). Audio completo ("de niña, Ezequiel"). |
| r2 | OK | Mudo. |
| c29 | menor | Repite "de lo que te enseñamos" en 8.0–9.1 s: cortar a los ~7.15 s. |
| c30 | REGENERAR | Ezequiel es OTRA persona: más joven, pelo negro y sin canas ni cadena. Audio OK. |
| c31 | OK | Audio completo. |
| c32 | OK | Audio completo. |
| c33 | menor | Whisper oye "Tiene**s** razón" (debería ser "Tiene razón"). Es casi imperceptible. |
| c34 | OK | Dos voces femeninas, abrazo sin deformaciones. Audio completo. |
| c35 | OK | Al anochecer, Beto coincide con la hoja. Audio completo. |
| c36 | OK | Audio completo. |
| c37 | OK | Audio completo. |
| c38 | OK | CTA con gestos (sonríe, ladea la cabeza y levanta el jarrito). Audio completo. |

## REGENERAR
- **c01**: sombrero flotante sin cabeza en el borde izq. (5.2–6.4 s).
- **c13**: "de la hacienda a hacienda" (palabra repetida).
- **c19**: Beto con otra cara.
- **c30**: Ezequiel es otra persona.

Prompts corregidos en clips.py. Para regenerar solo esos: `python -I clips.py c01 c13 c19 c30 > clips_log2.txt` (las versiones viejas pasan a clips/old/). Imprime "FIN P2" al terminar.
