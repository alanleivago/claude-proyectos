---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte1, remake-transformado, humillacion-revancha, herencia, zacatecas, bolero]
relatedTo: [plata-taxco, aserrin-huamantla, baul-sanmiguel, betun-zacatecas, atrium-vista]
---
# betun-zacatecas (El Bolero de Zacatecas · Parte 1): estado

## Video base
- Remake transformado de **"Lo dejó por vender empanadas… sin saber que él heredaría todo"** de @atriumstories_ (7700349674628074783, **182K vistas**, 136 s, 53 planos). Análisis: `fuentes/atrium-vista/videos/7700349674628074783_analisis.md`.
- Por qué este: es la P1 de humillación-revancha con más vistas que no tenía pieza. Ese tipo tiene el pico más alto de la cuenta. Ver `fuentes/atrium-vista/ranking2.md`.
- Pedido del usuario (2026-11-14): más cerca de las historias de Atrium, pero sin copiar. Se conservan la historia y su ritmo emocional. Cambian el escenario y la región, el oficio, el objeto clave, los nombres, todos los diálogos, el detalle del giro y el CTA.

## Qué se cambió
- Región y escenario: la calle sin región pasa a ser la Plaza de Armas de Zacatecas, frente a la catedral de cantera rosa, más una notaría con vista al Cerro de la Bufa.
- Oficio: el vendedor de empanadas pasa a ser Apolinar, bolero.
- Objetos: el carrito de empanadas se cambia por la caja de bolear azul. Se suman la carpeta roja del divorcio y las botas vaqueras color vino de don Rosalío.
- Plazo nuevo en el gancho: "Fírmalo antes de las doce campanadas". Al final vuelve invertido: "Ahora yo decido cuándo."
- Herencia: no viene de un tío sino de un cliente viejo al que Apolinar le boleó las botas doce años. Son los Hoteles Bañuelos y no se dicen cifras.
- Giro: la firma de la carpeta roja es de la gerente del hotel de la plaza, que trabaja para él. Además, el amante Fabricio quiso comprarle los hoteles a don Rosalío.
- CTA: "¿Ustedes qué harían mañana con Noemí?"
- Nombres nuevos y únicos en pieces/: Apolinar Escamilla, Noemí Monreal, Fabricio Urquidi, Teódulo Arizpe y don Rosalío Bañuelos (no sale en pantalla).
(Detalle en guion.md, tabla "Qué cambia respecto al original".)

## Marca
**MEXI STORIES**: edit.py, BRAND = "MEXI" (kit pieces/_marcas/MEXI, con su música; la pieza no tiene carpeta music/ propia).

## Archivos
guion.md, caption.txt, lines.json (fuente única, unas 345 palabras), clips.py (39 clips: 34 hablados c01-c34, 3 insertos i01-i03 y 2 reacciones r1-r2), make_sheets.py (4 personajes + LOC_PLAZAZAC + LOC_NOTARIAZAC = 6 hojas), phr.py y edit.py (EDL vacía; música cálida de c24 a c28).
- Es copia de la plantilla plata-taxco y conserva todas sus defensas:
  - en los prompts: gaze + ONE + ALONE, PRES (un plano de presentación por personaje), NOSUB + CLEAN + END, NODOUBLE;
  - en los reintentos: SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6;
  - contra fallos de Flow: gatito como IMAGEN, control de duplicados por md5, reload_flow, new_project y la parada "LIMITE DE CREDITOS" en gen().
- make_sheets.py pide "ordinary non-famous face", controla duplicados por md5 (DUPLICADO) y acepta --reupload.
- Comprobaciones:
  - `python -m py_compile` OK en clips.py, make_sheets.py, edit.py y phr.py.
  - Los IDs de CLIPS coinciden con las claves de lines.json, en el mismo orden (leído con ast, sin importar el módulo).
  - Todos los @{ASSET} tienen hoja y no sobra ninguna hoja.
  - Las frases en español de SOFT coinciden con lines.json.

## Avance
- 2026-11-14: archivos escritos. No se generó nada en Flow. Faltan las hojas, los clips, el QA, phr.py, la EDL y el montaje.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no salga DUPLICADO, correr `md5sum chars/*.jpg` y mirar la hoja de contactos: caras comunes y distintas entre sí.
2. `python -I clips.py > clips_log.txt` y QA de cada clip. Revisar:
   - morphs y bordes del cuadro;
   - la caja azul con estribo de latón igual en todos los planos;
   - la carpeta roja en la mano izquierda de Noemí y la verde en la mano izquierda de Teódulo;
   - que Fabricio y Teódulo se distingan: traje gris claro y corbata vino contra pelo blanco y traje carbón;
   - las botas color vino con puntas de plata;
   - la pronunciación de "Apolinar", "Noemí", "Teódulo", "Bañuelos" y "Zacatecas".
3. phr.py → EDL en edit.py → montaje → verificación (sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca) → copia a LucidLink con caption.txt.
