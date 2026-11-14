---
type: handoff
status: active
tags: [atrium, novelas, sinmarca, parte1, remake, referencias3]
relatedTo: [pedida-mano, sazon-concha, referencias3]
---
# masa-honrada (La Masa Honrada · Parte 1, video 26): estado

## La historia
- Remake de la premisa n.º 2 de fuentes/referencias3/resumen.md (ref 7682590215994690849 de @solreflection, 5.6M).
  - Mismos beats que la ref; personajes, nombres y diálogo nuevos; atuendos de la ref con otros colores.
  - La ref cierra en 100 s. Aquí se agrega un gancho: Yesenia entra a trabajar con Lupe para robarle el secreto, y Lupe ya lo sabe ("le di el nixtamal… y no la receta").
- No se cruza con "precio justo" (premisa n.º 1, que escribe otro agente en paralelo): aquí no hay tienda, presidencia, inspección ni autoridad.

## Marca
**SIN MARCA**: va sin marca de agua. La música sale de pieces/_marcas/SINMARCA (edit.py, BRAND = "SINMARCA"; brand_wm da un png transparente). No hay carpeta music/ propia.

## Archivos listos
- guion.md y caption.txt (formato Parte 1).
- lines.json: fuente única de clips.py (501 palabras, unos 235–245 s).
- clips.py, con 39 clips: c01–c34 y r1–r5. Suman 288 s de generación.
  - Todos los planos son de una persona: gaze(side) + ONE + ALONE.
  - NOSUB + CLEAN + END en cada diálogo.
  - NODOUBLE en c01, c02, c04, c06, c08, c13, c16, c17, c20, c23, c26, c27, c28, c31 y c32.
  - SAFE/SOFT, incluidas las frases fuertes del diálogo.
  - variant, NOREF (también quita las hojas de locación), TRIES=6, gatito de control y 17 s entre clips.
  - Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P1".
- make_sheets.py: 9 hojas con control md5 DUPLICADO y --reupload; imprime "FIN HOJAS".
- phr.py.
- edit.py:
  - EDL en borrador por índices de línea, con ganancia 0 en los mudos y BLACK 0.4 s antes de c34.
  - Música: suspenso hasta c22, cama cálida de c22 a c31 y suspenso de c31 al final.
  - Loudnorm en dos pasadas. Admite --remix. Salida en renders/v1.mp4.

## Hojas nuevas
Aún no se generaron. Los nombres se verificaron como únicos en pieces/*.
- Personajes: LUPE_OLVERA, YESENIA_BARRAGAN, RIGO_MOLINERO, CHAYO_ZAMUDIO, ABUNDIO_ZAMUDIO y TONA_ESPINO.
- Locaciones: LOC_PUESTOYESE, LOC_COMALLUPE y LOC_PATIOZAMUDIO. Son simples: sin letreros, precios, marcas ni botellas con etiqueta.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS").
   - Revisar que no haya DUPLICADO y correr `md5sum chars/*.jpg`.
   - Armar una hoja de contactos y comprobar estas parejas, que no deben parecerse:
     - Lupe (trenza gris, mandil granate, blusa amarilla) y Toña (pelo corto rizado, cárdigan mostaza).
     - Yesenia (chongo vino, blusa turquesa) y Chayo (pelo suelto negro, blusa coral).
     - Rigo (playera verde olivo, mandil azul) y Abundio (camisa a cuadros, pelo gris).
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
3. QA con hoja de fotogramas, tiras de la franja inferior y bordes.
4. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
5. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y correr `python -I edit.py` (o `--remix`).
6. Verificar sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS y pico, y que NO haya marca de agua.
7. Telegram con caption.txt.

## Revisar en el QA
- **Geografía:**
  - Puesto de Yesenia: Yesenia DER.; Rigo, Chayo y Lupe IZQ.
  - Carrito de Lupe: Lupe IZQ.; Toña, Chayo y Yesenia DER.
  - Patio: Chayo IZQ., Abundio DER.
- **Dobles:** ninguna segunda blusa turquesa, mandil granate, blusa coral, cárdigan mostaza ni mandil azul.
- **Bordes:** nadie en los bordes, nadie que entre caminando y sin clientes de fondo.
- **Utilería:**
  - Un solo costal, blanco y sin letras.
  - La tortilla rota en la mano DERECHA de Chayo.
  - El celular en la mano DERECHA con la pantalla de espaldas (c21).
  - El maíz en una tina azul (c31).
  - Ningún precio, letrero ni botella con etiqueta.
- **Ropa y accesorios:** sin sombreros, redes de pelo ni lentes que aparezcan. Ropa igual en todos los planos.
- **Fallos de Omni:** subtítulos quemados, frases repetidas, 2.ª frase perdida y morphs.

## Riesgos
- c03/c04/r1: la masa y el costal. Que no salga texto en el costal ni otro ayudante.
- c09: Yesenia llama "desde su puesto". Que no grite ni señale.
- c13/c15/r3: tortillas que se rompen. Que no salgan migajas raras ni un tercer comensal.
- c21: pantalla del celular a la vista.
- c27: Rigo se desata el mandil. Si sale raro, SOFT lo cambia por las manos en la mesa.
- Pronunciación: "nixtamal", "engrudo", "costal", "muélele", "recalentada", "Yesenia", "Abundio", "Toña".
