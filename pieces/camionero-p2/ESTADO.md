---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte2]
relatedTo: [camionero, buen-hijo-p2]
---
# camionero-p2 (El Camionero · Parte 2): estado
- Sigue en el mismo segundo del cliffhanger de camionero (Parte 1, entregada con MEXI STORIES): "El que recibía las cajas… es alguien de su familia". Payoff: era Iván, el sobrino de Leonor (camioneta gris por la puerta de atrás, cámara apagada con su usuario); confiesa que quería la dirección; Leonor lo saca y Teófilo queda de jefe de andén. Gancho nuevo: "Pregúntale a mi tío Arturo quién me dio la clave de las cámaras" (Arturo = esposo de Leonor).
- Marca: **MEXI STORIES** (la de la Parte 1, fuera de la rotación). Música y marca de agua de pieces/_marcas/MEXI (edit.py, BRAND = "MEXI", arriba a la der.).
- Archivos listos:
  - guion.md.
  - lines.json, fuente única de clips.py.
  - clips.py: 31 clips (c01–c29 + r1 e i1 mudos), 222 s de voz en bruto, 57 frases. Lleva gaze() + ONE + ALONE en todos los planos (shot()), NOSUB y END tras cada diálogo, PLAINCAP en todos los planos de Teófilo (gorra lisa), NOPROP salvo la tabla de Nayeli (c07, c16), SAFE/SOFT con \b, variant, NOREF (incluye IVAN_SOBRINO), TRIES=6, 17 s entre clips y el gatito de control. Imprime "FIN P2", acepta IDs y mueve la versión vieja a clips/old/. Probado en seco (variantes 0–5 de los 31 prompts).
  - make_sheets.py: 1 hoja nueva (IVAN_SOBRINO, nombre único comprobado) + --reupload de 7 hojas de la Parte 1 (TEOFILO_TRAILERO, LEONOR_DIRECTORA, NAYELI_MONITOREO, LALO_CHALECO, FIDEL_CARGADOR, LOC_ANDENCARGA, LOC_SALAMONITORES), control md5 DUPLICADO. Imprime "FIN HOJAS P2".
  - phr.py.
  - edit.py: EDL en borrador con índices de línea (r1/i1 ganancia 0), cálida de c21 a c27, BLACK 0.4 entre c28 y c29, salida renders/v1.mp4 (--remix -> renders/v2.mp4).
  - caption.txt.
- chars/: copia de las 10 hojas de la Parte 1 (sin chars/mal/), md5 distintos. CLEMENTE_BODEGUERO y las locaciones de pasillo/cuarto no se usan.
- Nada generado en Flow todavía.
- Siguiente (una sesión de Flow a la vez):
  1. `python -I make_sheets.py --reupload > sheets_log.txt` (Monitor sobre "^FIN HOJAS P2"); revisar que no haya DUPLICADO, FALTA ni FALLO, y que IVAN_SOBRINO no se parezca a Clemente ni a Fidel (sin barba, camisa azul cielo, sin corbata ni gafete).
  2. `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P2", Traceback e "intento 6").
  3. QA por agente (qa_clips.md). Revisar:
     - nadie en los bordes ni en primer plano (tiras de bordes a 4 fps); nadie entra caminando (r1 Iván ya en cuadro);
     - subtítulos quemados, 2.ª frase perdida, palabras repetidas;
     - gorra de Teófilo lisa, sin parche ni letras, una sola;
     - lados fijos (andén: Teófilo/Lalo izq., Fidel/Iván der., Leonor/Nayeli centro; monitores: pantallas y Nayeli izq.);
     - i1: camioneta gris DENTRO del monitor, sin placas ni texto; una sola camioneta;
     - una sola tabla (Nayeli c07/c16), los demás con manos vacías; nadie señala;
     - r1 e i1 mudos (ganancia 0);
     - c29 CTA con voz desde el inicio y gestos.
  4. Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Luego `python -I phr.py`, EDL por rangos en edit.py y `python -I edit.py` -> renders/v1.mp4.
  5. Verificación completa (sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS/pico, marca MEXI arriba a la der.). Después, Telegram: `python tools/enviar_telegram.py pieces/camionero-p2/renders/v1.mp4` (lee caption.txt).
- Riesgos: c01 (frase larga de 10 s), c19 (motivo largo), i1 (pantalla y camioneta), r1 (Iván entrando), hoja nueva IVAN_SOBRINO.
- Pronunciación: "Iván", "Arturo", "madrugadas", "proveedor", "usuario", "estacionamiento", "Teófilo".
