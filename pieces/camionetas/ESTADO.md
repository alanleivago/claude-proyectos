---
type: handoff
status: active
tags: [atrium, novelas, saga-films]
relatedTo: [canasta, encendedor, padre-veladoras, chocolate-rancho, hacienda-sangre, reten-sierra, medalla-mezcal, agua-hacienda]
---
# camionetas (Las Tres Camionetas) — estado
- Remake de DfFMbWkNdEc de @laotrahistoria29 ("La dueña se vistió humilde para probar a sus vendedores…", 2.5M vistas, 174 s). 10.º remake, marca SAGA FILMS (rotación VISTA → MAJESTIC → SAGA; el 9.º fue MAJESTIC). Archivos listos: guion.md, make_sheets.py, clips.py (36 clips: 35 hablados + r1, 310 s en bruto), edit.py (copia de canasta, EDL vacía, marca SAGA FILMS, cálida entre c24 y c34), phr.py, music/ (copia de canasta), caption.txt. Nada generado en Flow todavía.
- Assets nuevos (únicos frente a todas las pieces anteriores, sin subcadenas, y distintos de NICANOR, MAYORAL, FAUSTO, MARISOL): AMPARO, PAMELA, GONZALO, ITZEL, LOC_VITRINA, LOC_EXHIBIDOR, LOC_AGENCIA, LOC_JARDINERA.
- Atuendos: los de la ref (mosaico fps=1/6) con otros colores y ambiente mexicano: sombrero café oscuro en vez de negro, rebozo azul profundo en vez de mantón negro, flores rojas y amarillas, bolsa de palma en vez de cuero; vendedora 1 de traje rojo en vez de negro; jefe de ventas de traje azul marino y corbata verde oscuro en vez de negro y rojo; vendedora buena de beige en vez de azul marino. Cada agencia con camionetas de otro color (blancas, plateada, azul oscuro).
- Siguiente: `python -I make_sheets.py > sheets_log.txt`, revisar las hojas (md5 y que cada nombre tenga su imagen), luego `python -I clips.py > clips_log.txt`, QA por agente (bordes y ropa), regenerar malos, `python -I phr.py`, armar la EDL por frases en edit.py, `python -I edit.py`, verificación completa, Telegram con caption.txt.
- Riesgos: hoja de AMPARO (sombrero + rebozo + trenza: que no salga disfrazada ni caricatura), c04/c06/c19 (sobre el hombro: el borde tiene que ser Amparo con sombrero café y rebozo azul), c10 (dedo en el gafete), c11 (teléfono), c27/c28 (llave en la mano), r1 (de espaldas, sin morph), c35 (CTA con movimiento orgánico). Pronunciación de "Itzel", "doñita", "cotíceme", "seminuevos", "corporativo".
- Política: sin policía ni guardias, sin dinero a cuadro ni créditos ("de contado" y el precio solo dichos), sin contacto brusco, sin niños, edades numéricas.

## Entregado (2026-11-04)
- renders/v2.mp4: 2:25, -14.3 LUFS, pico -1.8, sync 0 frames. SAGA FILMS. CTA con "el gerente". Enviado a Telegram.
