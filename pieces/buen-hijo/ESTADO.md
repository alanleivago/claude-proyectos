---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories]
relatedTo: [tele-nueva, canasta, encendedor, padre-veladoras, chocolate-rancho, hacienda-sangre, reten-sierra, medalla-mezcal, agua-hacienda]
---
# buen-hijo (El Buen Hijo) — estado
- Remake de 7700288645638425870 de @relatosinolvidables10 (el padre corre al hijo por llegar tarde tras ayudar a una anciana y le deja todo al hermano; 2.0M vistas, 173 s). 12.º remake, marca MAJESTIC STORIES (el 11.º, tele-nueva, fue VISTA). Archivos listos: guion.md, make_sheets.py, clips.py (32 clips hablados, 260 s brutos, 61 frases: guion compacto para 2:00-2:30), edit.py (copia de tele-nueva, EDL vacía, marca MAJESTIC STORIES, cálida entre c27 y c30), phr.py, music/ (copia de tele-nueva), caption.txt. Nada generado en Flow todavía.
- Assets nuevos (únicos frente a todas las pieces con make_sheets.py, sin subcadenas en ningún sentido): ABUNDIO, TADEO, ROMAN, PETRA, AURELIA, LOC_SALON, LOC_AVENIDA, LOC_PERSIANA, LOC_ZAGUAN, LOC_FOGON.
- Atuendos: los de la ref (mosaico fps=1/7) con otros colores: padre camisa beige y pantalón café en vez de blanca y gris; Tadeo camisa verde salvia y chinos gris claro en vez de azul claro y beige; Román azul marino en vez de granate; Petra blusa rosa bordada, falda café y rebozo gris en vez de lila y azul marino; nana delantal turquesa en vez de mostaza.
- Siguiente: `python -I make_sheets.py > sheets_log.txt`, revisar hojas (md5, etnia mestiza, que cada nombre tenga su imagen), `python -I clips.py > clips_log.txt` con Monitor, QA por agente (bordes, ropa, bolsita de Petra, maleta/llaves de Tadeo, carpeta de Román, pantalla del celular en c26), regenerar malos, `python -I phr.py`, EDL por frases en edit.py (BLACK 0.4 antes de c32), `python -I edit.py`, verificación completa, Telegram con caption.txt.
- Riesgos: c03/c06/c07 (dos personajes del brazo, la bolsita siempre en la izquierda de Petra), c19 (mano en el hombro de Román), c22 (llaves en la mesa: manos), c25/c26 (cartones de noche; SOFT los cambia por cobija), c26 (contenido del celular dentro de la pantalla), c29 (Aurelia sirve café), c32 CTA mudo (el prompt pide labios desde el primer frame). Pronunciación: "Abundio", "Tadeo", "Aurelia", "samaritano", "inventario".
- Política: sin policías, sin armas, sin contacto brusco, sin dedo acusador, sin dinero exigido ni bancos (sin tarjeta ni monedas de la ref), sin niños, edades numéricas.

## Entregado (2026-11-04)
- renders/v1.mp4: 2:23, -14.9 LUFS, pico -1.6, sync 0/-1 frames. MAJESTIC STORIES. Enviado a Telegram.
