# QA clips · fonda-chela-p2 Parte 2 (VISTA, 2026-11-08)

Método (el de pedida-mano): hoja de 7 fotogramas por clip (0, 0.4, 0.9 s y 30/55/80/97 %) comparada con chars/ (CHELA_VILLEGAS, TAVO_VILLEGAS2, SAUL_BETANCOURT2, ROLANDO_GUERO2, MACARIO_LEDESMA2, LOC_FONDACHELA, LOC_CALLEFONDA) y con la geografía de clips.py. Tiras de cuadro completo cada 0.25 s de 0 a 2.25 s en los 18 dudosos (bordes, entradas). Cortes internos con scene > 0.3 (solo i06). LUFS por clip (ebur128). Silencios internos con envolvente RMS (floor+7) para los saltos dentro del clip. earshot describe en i07. Audio: faster-whisper large-v3 (es, CPU, int8) con lv3.py → renders/lv3.json, contra lines.json. Nada se regeneró en Flow.

Resultado general: caras y ropa correctas en todos (Chela: canas recogidas, blusa lila, mandil blanco. Tavo: camisa blanca de manga corta, pantalón negro, libreta. Saúl: pelo negro peinado atrás, barba, traje gris carbón y camisa negra. El Güero: rubio rapado, chivo, chamarra de piel negra, playera negra. Macario: sombrero gris, bigote blanco, guayabera crema, anillo). Ningún subtítulo ni texto en pantalla. Sin armas ni sangre. Maletín cerrado hasta i08 (ahí vacío). Campanario sin reloj ni letras; reloj de i06 sin números. Geografía respetada. Transcripción = lines.json en los 34 diálogos (salvo variaciones menores: c19 "aprendas", c24 "tienes", c27 "¿Qué mes…"). Fallo repetido de Omni: **figuras en el borde los primeros 0.5–1.25 s**; se arregla con el arranque o un crop.

| clip | estado | motivo |
|---|---|---|
| i01 | OK | Mano de Macario deja el jarro junto al maletín cerrado. Mudo (alucina "¡Vamos a ver!"): silenciar. Tramo 0.50–1.45 (gancho). |
| c01 | OK con crop | Manga blanca en el borde IZQ. hasta ~1.1 s; voz 0.67–3.05 / 3.97–5.86. `crop=600:1067:120:0` hasta 1.25. −23.6 LUFS. |
| r1 | OK con tramo | Hombro oscuro abajo a la IZQ. hasta ~1.5 s: usar 2.0–3.2. Mudo. |
| c02 | OK | Voz 0.28–4.41, silencio 2.26–2.81 (salto). |
| c03 | OK con crop | Hombro oscuro en el borde DER. hasta ~1.0 s; voz desde 0.61. `crop=600:1067:0:0` hasta 1.0. |
| c04 | OK | Voz 0.77–5.18, silencio 2.50–3.65 (salto). |
| i02 | OK | Campanario sin reloj. Mudo. |
| c05 | OK | Voz 0.10–4.54, silencio 2.12–2.90. |
| c06 | OK con crop | **Hombro con camisa a cuadros** (nadie la lleva) abajo a la IZQ. de 0 a ~2.2 s; voz 0.79–3.67 / 4.81–6.57. `crop=576:1024:144:0` hasta 2.4. |
| i03 | OK | Tres llaves junto al maletín cerrado (mano de chamarra de piel). Tramo 3.0–4.3. |
| c07 | OK | Voz 0.56–2.26 / 3.18–5.06. |
| r2 | OK | Mudo (alucina "Bienvenidos a mi canal…" a −50 LUFS): silenciar. |
| c08 | OK | Voz 0.61–2.48 / 3.68–4.54. |
| c09 | OK | Voz 0.53–4.61, silencio 2.16–2.65. |
| i04 | OK (aviso) | Pedido aéreo, salió a ras de calle: Saúl camina con el maletín, dos camionetas detrás. Mudo. |
| c10 | OK | Voz 0.21–2.40 / 3.02–4.61. Libreta en la mano derecha (aviso, la hoja no fija mano). |
| i05 | OK | Sobre cerrado a la mano de la señora. Mudo. |
| c11 | OK con crop | Camisa blanca (Tavo) en el borde IZQ. hasta ~1.1 s; voz desde 0.44. `crop=540:960:180:0` hasta 1.25. |
| c12 | OK | Voz 0.62–2.42 / 4.25–5.48. |
| i06 | OK con tramo | **Tiene 3 cortes internos** (1.46, 2.96, 4.42 s): solo 1.46–2.96 es el reloj; el resto son otras personas (pareja ajena, mujer de verde). Usar 1.55–2.90, mudo. |
| c13 | **REGENERADO** | v1 (intento 5, sin hoja) era otra cara: más delgada, barba larga, canas, saco a cuadros (lo marcó también la revisión API). Prompt nuevo con la cara y ropa de Saúl descritas; con hoja vuelve a dar "políticas" 4 veces y sale en el intento 5 sin hoja: pelo negro peinado atrás, barba, traje gris carbón y camisa negra, sin canas ni cuadros (cara algo más angulosa, aviso). Voz 0.10–2.02 / 2.90–4.46. Viejo en clips/old/c13_v1.mp4. La revisión API v2 aún lo ve algo distinto: 3.er intento con el diálogo suavizado ("Échame la mano con la mitad", SOFT) → otra vez políticas con hoja y sale sin hoja (clips/old/c13_v3.mp4) con una figura oscura en el borde IZQ. todo el clip y sin pausa entre frases: se queda la v2 (clips/c13.mp4 = c13_v2). |
| c14 | OK | Voz 0.81–5.12, silencio 2.50–3.13. |
| c15 | OK | Voz 0.53–4.51, silencio 1.83–2.59. |
| c16 | OK con crop | Forma beige en el borde IZQ. hasta ~0.8 s; voz desde 0.46. `crop=600:1067:120:0` hasta 1.0. |
| r3 | OK | Sonrisa de Macario 4.4–5.6. Mudo. |
| c17 | OK | Seca un jarro con trapo. Voz 0.74–5.45 (pausa corta: un solo tramo con punch-in). |
| c18 | OK con crop | "Tía." va de 0.10 a 1.17 (whisper con el clip entero lo ponía en 1.3; verificado por tramos) y "¿Por qué no lo corrió?" desde 2.18: tres saltos. Borde IZQ. hasta ~0.8 s: `crop=600:1067:120:0` en el 1.er tramo. |
| c19 | OK | Voz 0.64–5.42, silencio 2.05–2.83. |
| c20 | OK | Voz 1.14–3.55 / 4.77–6.19. |
| i07 | OK | Campanas reales (earshot: church bells z 4.3, AudioSet 0.71): se deja a −6 dB. |
| c21 | OK | Figura en el borde IZQ. hasta ~1.0 s; voz desde 1.29 → arrancar en 1.21 (limpio). |
| i08 | OK con tramo | El maletín se abre, se cierra y se vuelve a abrir (0.9–2.5 s): usar 3.2–4.4 (abierto y vacío). |
| c22 | OK | Voz 0.41–2.00 / 2.67–4.24. |
| c23 | OK con crop | Forma blanca abajo a la IZQ. hasta ~1.0 s; voz desde 0.10. `crop=600:1067:120:0` hasta 1.25. |
| c24 | OK | Chela le da el mandil (doblado, negro). Voz 0.83–2.33 / 3.20–5.17. |
| c25 | OK | −15.3 LUFS (fuerte). Voz 0.84–2.20 / 3.21–4.51. |
| c26 | OK con crop | Cuadros abajo a la IZQ. hasta ~0.8 s; voz desde 0.69. `crop=600:1067:120:0` hasta 1.0. |
| r4 | OK | Saúl cierra los ojos 3.0–4.2. Mudo. |
| c27 | OK con recorte | **Omni repite "Atiendo primero."** (3.68–4.36 s): salir en 3.58. |
| c28 | OK | Sirve café de olla. Voz 0.46–1.90 / 2.67–5.46. |
| c29 | OK | −25.3 LUFS (bajo, +6 dB). Voz 0.86–2.76 / 3.77–5.46. |
| c30 | OK con crop | Forma blanca abajo a la IZQ. hasta ~0.8 s; voz desde 0.52. `crop=600:1067:120:0` hasta 1.0. |
| c31 | OK | Voz 0.50–4.32, silencio 2.03–2.71. |
| r5 | OK con tramo | Cuadros abajo a la IZQ. hasta ~2 s: usar 3.3–4.5. Mudo (alucina "Bienvenidos…"). |
| c32 | OK | Voz 0.71–5.55, silencio 2.15–3.35. |
| r6 | OK | Saúl de pie con el jarro (ya de mesero). Mudo. |
| c33 | OK | Voz 0.84–5.18. |
| c34 | OK | CTA de Chela, sonríe y asiente. Voz 0.94–3.50 / 4.62–8.09. |

## REGENERAR
- **c13**: cara distinta de Saúl (ver tabla). Regenerado 2026-11-08.
Todo lo demás se arregla en la edición (tramos, crops y el corte de c27).
