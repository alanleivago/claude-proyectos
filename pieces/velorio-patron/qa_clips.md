# QA clips · velorio-patron Parte 1 (MAJESTIC, 2026-11-08)

Método (el de pedida-mano): hoja de 4 fotogramas por clip (2/35/62/92 %) contra chars/ y la geografía de clips.py (qa/sheet0-5.png); tiras de bordes a 2.5 fps en los dudosos (qa/edges1-2.png, z_c2122.png); franja inferior (40 %) a 1 fps en los 32 hablados (qa/bottom1-2.png); md5 de todos los clips; faster-whisper large-v3 (lv3.py, renders/lv3.json) contra lines.json; LUFS por clip (ebur128).

## Hallazgo principal: Flow devolvió el video ANTERIOR (md5 idéntico)
Seis pares con el mismo md5: el genuino se quedó y el otro se regeneró. c05 no tenía el mismo md5, pero era otra reacción muda de Leonel sin diálogo.
| copia (mal) | genuino | qué traía |
|---|---|---|
| c06 | r1 | Leonel mudo en vez de Ivonne hablando |
| c07 | r2 | Nazario mudo |
| c09 | c12 | las frases de c12 |
| i04 | c10 | el licenciado leyendo, en vez del anillo en la palma |
| c25 | c24 | Efrén en vez de Nati |
| c31 | r6 | Leonel mudo en vez de Efrén con el sobre |
| c05 | — | Leonel mudo (−48.6 LUFS), sin sus dos frases |

**Arreglo en clips.py:** si el video descargado tiene el md5 de otro clip, se descarta como "DUPLICADO" y se reintenta.

## Faltantes y fallos
- **i06**: 6+4 rechazos por políticas. Tanto "12 hombres de negro con gafas oscuras + no weapons" como "mourners + caja" fallaron. v3 (hombres de traje gris en dos filas que asienten hacia una puerta, sin velorio ni caja) salió al 1.er intento. Aviso: varias caras parecidas en las filas; en el montaje dura 1.0 s.
- **c04** (salió en el intento 6 con el prompt mínimo): faltaba "Ustedes no vinieron ni una sola vez." Los fallos fueron de Flow ("actividad inusual"), no del prompt. Se regeneró con el prompt completo: OK, las dos frases.

## Regenerados (clips_log2.txt / clips_log3.txt), todos OK al 1.er o 2.º intento, sin duplicados
c06 (Ivonne: "La escolta ahora es nuestra. | Nazario, acompáñenla a la puerta." versión SOFT), c07, c09 ("Léala rápido" se oye/transcribe "Lea la rápido"), c25 (Nati), c31 (Efrén con el sobre de lacre), i04 (anillo en la palma), i06, c04, c05.

## Resto
- Caras y ropa correctas en todos. Leonel: lentes dorados, bigote, traje negro. Ivonne: caoba, perlas, vestido negro. Nati: trenza, mandil, vestido azul marino. Efrén: calvo, traje café. Nazario: barba blanca, camisa negra.
- Sin subtítulos ni texto en pantalla (franjas inferiores limpias en los 32).
- Sin armas. La caja siempre cerrada, sin foto.
- Mudos r1–r6 e i*: Whisper alucina "¡Suscríbete!" / "Gracias por ver el video" → ganancia 0 en el montaje.
- Bordes, arreglados con crop `540:960:180:0` en la 1.ª frase:
  - Figura u hombro ajeno en el borde IZQ. los primeros 0.4–1.2 s: c01, c06, c11, c17, c19, c20, c26, c28.
  - Encaje negro ajeno a la IZQ. hasta ~2 s: c21.
  - Forma oscura abajo hasta ~1.5 s: c22.
  - c27 lleva crop centrado `540:960:90:0` en la 1.ª frase (figura blanca en el borde DER.).
- **i05** fuera del montaje: el anillo lo pone una mano envejecida y la de Nati lleva manga larga azul (su vestido es de manga corta).
- i02: Leonel delante de la escolta (no solo la escolta). Sirve como plano de poder.
- Avisos de pronunciación (Whisper; posibles, no confirmados de oído):
  - c01: "para alargarte" (por "largarte").
  - c25: "nada al licenciado" (por "nada, licenciado").
  - c28: "¿Lo sacamos…?" (por "Los").
- c32 CTA: muy bien (carisma, sonrisa, gestos a la altura del pecho, nunca señala a cámara). Lleva anillos en las DOS manos (la historia tiene uno solo).
