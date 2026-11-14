---
type: handoff
status: active
tags: [atrium, novelas, vista-stories]
relatedTo: [canasta, encendedor, padre-veladoras, chocolate-rancho, hacienda-sangre, reten-sierra, medalla-mezcal, agua-hacienda]
---
# tele-nueva (La Tele Nueva) — estado
- Remake de 7694110464388730134 de @desdequediosamanece (la nuera le quita la pantalla nueva a su suegra de 86 años para dársela a su mamá; 2.5M vistas, 291 s). 11.º remake, marca VISTA STORIES (el 10.º fue SAGA FILMS). Archivos listos: guion.md, make_sheets.py, clips.py (32 clips hablados, 262 s brutos, 57 frases: guion compacto para 2:00-2:20), edit.py (copia de canasta, EDL vacía, marca VISTA STORIES, cálida entre c24 y c29), phr.py, music/ (copia de canasta), caption.txt. Nada generado en Flow todavía.
- Assets nuevos (únicos frente a todas las pieces con make_sheets.py, sin subcadenas): GENARO, REMEDIOS, GRISELDA, CHABELA, LOC_CASITA, LOC_RESIDENCIA.
- Atuendos: los de la ref (mosaico fps=1/12) con otros colores: camisa verde olivo en vez de vaquera azul, vestido verde oscuro y delantal blanco en vez de floreado oscuro y crema, blusa azul cobalto en vez de burdeos, blusa morada de flores blancas y pantalón crema en vez de flores rojas y beige.
- Siguiente: `python -I make_sheets.py > sheets_log.txt`, revisar hojas (md5, etnia mestiza, que cada nombre tenga su imagen), `python -I clips.py > clips_log.txt` con Monitor, QA por agente (bordes, ropa, tele vieja/nueva según el bloque), regenerar malos, `python -I phr.py`, EDL por frases en edit.py (BLACK 0.4 antes de c32), `python -I edit.py`, verificación completa, Telegram con caption.txt.
- Riesgos: c19/c22/c24/c26 (cargar la tele: manos y continuidad del aparato), c23 (Griselda con la mano en el hombro de Chabela: dos personajes), c26-c28 con la tele nueva en LOC_CASITA (la hoja trae la tele de caja), c06-c08 (solo Genaro con celular), c32 CTA mudo (el prompt pide labios desde el primer frame). Pronunciación: "Genaro", "Genarito", "Chabela", "ochenta y seis", "distinguen".
- Política: sin policías, sin armas, sin contacto brusco, sin dedo acusador, sin dinero exigido ni bancos, sin niños, edades numéricas.

## Entregado (2026-11-04)
- renders/v1.mp4: 2:13, -14.7 LUFS, sync 0 frames. VISTA STORIES. c16/c19/c22 con crop (tele doble o deformada). Enviado a Telegram.
