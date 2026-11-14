---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte2]
relatedTo: [regreso-20, camionero-p2]
---
# regreso-20-p2 (El Regreso · Parte 2): estado
- Sigue en el mismo segundo del gancho de regreso-20 (Parte 1, entregada con VISTA STORIES): "Ahora sí, tu hija va a saber la verdad." Payoff: Bernardo era compadre de Julián y guarda la copia del testamento (el rancho era de Leonor; Clemencia escondió el original). Trampa: "faltaba una firma". Giro: Clemencia se delata ("Si yo lo quemé hace veinte años"). Castigo: Joaquín nomás vino por el rancho y la deja. Justicia: Leonor dueña, le da un cuarto a su mamá pero ahora manda ella. CTA de opinión, sin Parte 3.
- Marca: **VISTA STORIES** (la de la Parte 1, fuera de la rotación). Música y marca de agua de pieces/_marcas/VISTA (edit.py, BRAND = "VISTA", arriba al centro).
- Archivos listos:
  - guion.md (pasado por humanizer).
  - lines.json, fuente única de clips.py.
  - clips.py: 32 clips (c01–c29 + i1, r1, r2 mudos), 379 palabras, 56 frases, 228 s brutos (~2:10 montado). Lleva gaze() + ONE + ALONE + NODOUBLE en todos los planos (shot()), NOSUB + CLEAN + END tras cada diálogo, nadie con sombrero, LETTER (c03, c15) y BAG (r1, c13, c22) con un solo objeto, NOPROP en el resto, SAFE/SOFT con \b, variant, NOREF, TRIES=6, 17 s entre clips y el gatito de control. Imprime "FIN P2", acepta IDs y mueve la versión vieja a clips/old/. Probado en seco (variantes 0–5 de los 32 prompts).
  - make_sheets.py: 0 hojas nuevas; --reupload de las 6 de la Parte 1 (CLEMENCIA, LEONOR, JOAQUIN, BERNARDO, LOC_ADOBE, LOC_TEJABAN), control md5 DUPLICADO (comprobado: ninguna coincide con otra pieza). Imprime "FIN HOJAS P2".
  - phr.py.
  - edit.py: EDL en borrador con índices de línea (i1/r1/r2 ganancia 0), música suspenso 0→c09, cálida c09→c13, suspenso c13→c23, cálida c23→fin; BLACK 0.4 entre c28 y c29; salida renders/v1.mp4 (--remix -> v2.mp4).
  - caption.txt.
- chars/: copia de las 6 hojas de regreso-20.
- Nada generado en Flow todavía.
- Siguiente (una sesión de Flow a la vez):
  1. `python -I make_sheets.py --reupload > sheets_log.txt` (Monitor sobre "^FIN HOJAS P2"); revisar que no haya DUPLICADO, FALTA ni FALLO.
  2. `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P2", Traceback e "intento 6").
  3. QA por agente (qa_clips.md). Revisar:
     - nadie en los bordes ni en primer plano (tiras de bordes a 4 fps); nadie entra caminando (c01 Leonor y r1 Joaquín ya en cuadro);
     - subtítulos quemados, 2.ª frase perdida, palabras repetidas;
     - lados fijos (cocina: Leonor izq. en la puerta, Bernardo der. sentado; portal: Leonor/Bernardo izq., Clemencia/Joaquín der.); sin sombreros;
     - una sola hoja (c03, i1, c15), sin sobre ni carpeta; una sola maleta (r1, c13, c22, r2); un solo retrato en la cocina, que no cobre vida;
     - r2: Joaquín solo, de espaldas, nadie más en el camino ni en el portal;
     - i1, r1, r2 mudos (ganancia 0);
     - c29 CTA con voz desde el inicio y gestos.
  4. Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Luego `python -I phr.py`, EDL por rangos en edit.py y `python -I edit.py` -> renders/v1.mp4.
  5. Verificación completa (sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS/pico, marca VISTA arriba al centro). Después, Telegram: `python tools/enviar_telegram.py pieces/regreso-20-p2/renders/v1.mp4` (lee caption.txt).
- Riesgos: c16 (Clemencia se delata: tono "shocked" que SOFT suaviza), c22 (mano en la maleta, que no aparezca otra), r2 (caminata de espaldas), i1 (manos y hoja), c29 CTA.
- Pronunciación: "Bernardo", "Julián", "Joaquín", "testamento", "entierro", "jefecita", "nomás", "Arréglense", "merecido".
