---
type: doc
status: active
tags: [mechayuki, youtube, formato-largo, expediciones, investigacion-mercado, outliers]
relatedTo: [mechayuki-rules, digger-channel]
---

# Mechayuki "Expediciones": análisis de viralidad en YouTube (largo, 8+ min)

Fecha: 2026-10-30.

## Método y límites

- **vidIQ no funcionó:** la cuenta no tiene créditos (todas las llamadas devolvieron "Not enough credits", sin cobro). No hay datos de volumen de búsqueda ni de competencia de vidIQ.
- **Lo que usé:**
  - `yt-dlp`: 25 búsquedas × 2 modos (relevancia y "este año" = 2026), 1.243 resultados, 193 canales.
  - Por canal: suscriptores y vistas de sus últimos 40 videos.
  - Autocompletado de YouTube (suggestqueries) como señal de demanda.
- **Cómo calculo el outlier:** vistas del video ÷ mediana de los últimos 40 videos largos (≥4 min) del canal. No es el "breakout score" de vidIQ, pero mide lo mismo.
- **Fechas:** los resultados en modo "year" son de 2026 (dato). Los de modo "rel" **no traen fecha**: pueden ser más viejos que 24 meses, y lo marco con [sin fecha].
- **Marcas:** **[dato]** = medido. **[inferencia]** = mi lectura.

## 1. Canales y videos con formatos parecidos

### a) Arqueólogos del futuro / aliens o robots estudiando humanos

| Canal | Subs [dato] | Mediana reciente [dato] | Video relevante | Vistas [dato] | x canal |
|---|---|---|---|---|---|
| Wizards with Guns | 1,07 M | 620 k | "3000 years in the future, The History Channel finds your room." (4 min) [sin fecha] | 3,16 M | 4,6x |
| DocuDubery | 430 k | 115 k | "How will Future Historians react to the Ruins of Disney World?" (5 min) | 238 k | ~2x |
| MalsWRLD | 485 k | 147 k | "Future Archaeologists Trying Not To Get Cancelled" | 266 k | 1,8x |
| TopTenz | 1,87 M | 10 k | "Future Archaeologists Will Find These 10 Things Very Weird" | 62 k | ~6x |
| KhAnubis | — | — | "What Will Future Archaeologists Know About Us?" (11 min) | 40 k | — |
| Wily Films | 32,6 k | 17 k | "You Eat Other Animals? Aliens Question Humans" (4 min) | 2,25 M | 132x |
| HFY (Starbound, Zenith, Xtreme Teller) | 5–170 k | 0,6–24 k | "Alien Students Learn Why Earth is called a Deathworld" / "Alien Doctor Went Silent When Humans Explained Their Immune System" | 65–406 k | 17–153x |

[inferencia]
- La premisa "alguien del futuro o de afuera mira lo cotidiano humano" funciona como **sketch de comedia corto** (Wizards with Guns, Wily Films) y como **narración HFY** (aliens asombrados por humanos, outliers enormes en canales chicos).
- Nadie la explota como **serie larga y documental** con un personaje fijo.
- Búsqueda "future archaeologists": poca oferta y de baja calidad (sleep-history, listas). El autocompletado solo da 3 variantes: **demanda de búsqueda baja**. Sirve como gancho y empaque, no como palabra clave SEO.

### b) Historia de objetos cotidianos / vida antes de X

| Canal | Subs [dato] | Mediana [dato] | Outlier destacado | Vistas [dato] | x canal |
|---|---|---|---|---|---|
| Ink Explainer | 155 k (19 videos) | 309 k | "What Did Ancient Humans Actually Do All Day?" (11 min, 2026) | 17,0 M | 55x |
| Relic Explains | 17,4 k | 3,6 k | "Why Did Humans Start Wearing Clothes?" (8 min) | 5,1 M | 1.397x |
| Relic Explains | 17,4 k | 3,6 k | "How Did Humans Invent the Toilet?" (8 min, 2026) | 264 k | 72x |
| Lore Explained | 10,7 k | 1,2 k | "What Did Ancient Humans Do For Pleasure?" (7 min, 2026) | 5,0 M | 4.206x |
| Axen | 65 k | 15 k | "What Did Ancient Humans Do all Day Before Jobs Existed?" (8 min) | 3,4 M | 228x |
| Weirdward Bound | 66,7 k | 13 k | "Why Does America Use 60 Hz While Europe Uses 50 Hz?" (27 min) | 1,5 M | 115x |
| Weirdward Bound | 66,7 k | 13 k | "Before Toilet Paper, You Only Wiped With… (If You Were Lucky)" (39 min, 2026) | 204 k | 15,7x |
| Weirdward Bound | 66,7 k | 13 k | "Before Refrigerators, Half of America Got Food Poisoning Every Summer" (20 min, 2026) | 126 k | 9,7x |
| This House | 356 k | 21 k | "How Did People Live Before Air Conditioning?" (9 min) | 1,78 M | 85x |
| This House | 356 k | 21 k | "...Before Central Heating?" (17 min) | 1,19 M | 56x |
| Weird History | 4,73 M | 71 k | "What Hygiene Was Like For Medieval Peasants" | 3,5 M | 47x |
| Weird History | 4,73 M | 71 k | "The History of Toilets" | 1,35 M | 18x |
| Weird History | 4,73 M | 71 k | "Where Did Cheese Really Come From?" | 3,2 M | 43x |
| King Rose Archives | 192 k | 1,4 k | "What Everyday Life Really Looked Like in the 1950s" (10 min) | 5,8 M | 4.135x |
| Great Big Story | 6,28 M | 46 k | "The Extraordinary Origins of Ordinary Things" [sin fecha, canal inactivo] | 9,65 M | 208x |
| Adam Ragusea | 2,61 M | 200 k | "How people kept stuff cold before refrigerators" | 1,6 M | 8x |
| Today I Found Out | 3,25 M | 67 k | "How Did People Know When To Get Up... Before Alarm Clocks?" | 792 k | 12x |
| TED-Ed | 23 M | 391 k | "A brief history of toilets" | 6,3 M | 16x |
| Simple History | 5,12 M | 199 k | "How did the Romans go to the toilet?" | 1,6 M | 8x |
| History of Simple Things | 1,04 M | 7,9 k | "Why Do Forks Have Exactly Four Tines?" (2026) | 236 k | 30x |
| Half as Interesting | 2,95 M | 388 k | (no toca el tema; techo de referencia) | 2,4 M top | 6x |

Datos clave [dato]:
- **Ola 2026 de "ancient humans":** explainers animados de 7–11 min, en canales nuevos o chicos, con outliers de 55x a 4.000x.
- **"How did people live before X":** el autocompletado lista central heating, air conditioning, electricity, phones.
- **"What did people use before X":** el autocompletado lista toilet paper, shampoo, soap, toothbrushes, anesthesia.

### c) Estética PS1 / low poly

| Canal | Subs [dato] | Mediana [dato] | Dato |
|---|---|---|---|
| Low Poly Shorts | 1,24 M | 6,8 M (shorts) | Explainers absurdos en low poly ("You've Never Touched Anything" 53 M; "Ancient 30,000 Year Old Virus" 23 M). Casi sin videos largos: 1 largo, 180 k |
| PolyAssets | 362 k | 578 k (shorts) / 10 k (largos) | "The history of chernobyl, but in low poly" 2,9 M; "Your brain explained in low poly" 851 k. Sus largos (1–2 min) rinden poco |
| Nexpo | — | — | "Into the Abyss of Haunted PS1" (96 min) 4,1 M; "The Horror Games that Haunt Me" (2026, 89 min) 3,2 M |
| emberlite | 30,3 k | 61 k | Ambientes "ps1 style" de 5 h, hasta 525 k (8,6x) |
| Bourkey | 21,2 k | 1 k | "Low Poly Horror - Why were the aesthetics of the PS1 so unnerving?" 544 k (544x) |
| Mega Man Legends (nicho) | — | — | "THE HISTORY OF ALL MEGAMAN SAGAS" 475 k; "The TRAGIC Story of Mega Man Legends" 313 k |

[inferencia]
- El low poly explicativo **ya probó viralidad masiva en Shorts** (Low Poly Shorts, PolyAssets). Es el formato del TikTok de Mechayuki y valida el estilo visual.
- En **formato largo**, estos canales casi no publican, o rinden mal: PolyAssets tiene largos de 10 k contra shorts de 578 k.
- En largo, lo PS1 funciona como nostalgia o horror (Nexpo, ambientes), no como explicador. **Hueco real, y también riesgo.**

### d) Cuerpo humano explicado

- Dominan los gigantes infantiles y educativos [dato]:
  - Kurzgesagt, "Immune System": 26 M.
  - TED-Ed, "digestive system": 14 M.
  - CrashCourse: 13 M.
  - Peekaboo Kidz, KLT, Kids Diana/Roma.
- Outliers para adultos en canales chicos [dato]:
  - The Analyst, "Every Human Organ Explained in 11 Minutes": 1,79 M (30x).
  - Human Decode, "Every Human Organ Explained Simply" (2026): 316 k (88x).
  - Dabby, "ALL OF NUTRITION SCIENCE in 13 Minutes": 2,8 M (214x).
  - The Infographics Show, "What Lethal Radiation Does to Your Body (Hour by Hour)" (2026): 2,3 M.
- HFY [dato]: "The Alien Doctor Went Silent When Humans Explained Their Immune System" logró 103x. Es exactamente el ángulo "un ser no humano estudia el cuerpo humano".

## 2. Fórmulas de título ganadoras (de los outliers ≥3x)

1. **"What Did [Ancient] Humans Actually Do [situación]?"** Fue la fórmula más explosiva de 2026 (17 M, 5 M, 3,4 M, 1,9 M). Las palabras clave son "Actually", "All Day", "When It Rained".
2. **"How Did People [verbo] Before [invento]?"** (A/C 1,78 M, calefacción 1,19 M, despertador 792 k). Responde a búsquedas reales.
3. **"Before [invento], You Only [cosa asquerosa]... (If You Were Lucky)"**. Junta asco, segunda persona y un paréntesis irónico.
4. **"Why Did Humans Start [hábito]?"** (ropa 5,1 M, toilet 264 k).
5. **"What [Everyday Life / Hygiene] Was REALLY Like in/for [época]"** (1950s 5,8 M, medieval 3,5 M).
6. **"Every [X] Explained in N Minutes"** (órganos 1,79 M, nutrición 2,8 M). Promete algo completo y acotado.
7. **POV de un observador ajeno:** "3000 years in the future, X finds your room" (3,2 M), "Aliens Question Humans" (2,25 M).

Miniaturas [inferencia, no medí CTR]: en esta familia de outliers predominan:
- un único personaje u objeto grande, con expresión exagerada;
- 0 a 3 palabras de texto;
- contraste antes/ahora.

Para Mechayuki: su cara (reacción) junto al objeto enterrado y sucio, más 2–3 palabras ("¿¿PARA QUÉ??" / "HUMANS USED THIS").

## 3. Palabras clave (demanda)

**No hay volumen ni competencia medidos:** vidIQ no tenía créditos. Abajo va la señal del autocompletado de YouTube [dato] y la competencia observada en los resultados [inferencia].

| Palabra clave | Autocompletado (demanda) | Competencia observada |
|---|---|---|
| history of everyday things / objects | Sí, ambas aparecen | **Baja calidad de oferta**: top real 388 k (Dumb History); el resto <30 k. Hueco |
| future archaeologists | Solo 3 variantes | Muy baja oferta; demanda baja. Usar como concepto, no como SEO |
| how did people live before … | Alta: central heating, A/C, electricity, phones | Media: This House 1,2–1,8 M; Ragusea |
| what did people use before toilet paper | Alta: hasta "...weird history documentary" | Media: TED-Ed, Simple History, TIFO, Weirdward Bound (2026) |
| what did people use before shampoo / soap / toothbrushes / anesthesia | Sí, aparecen | No medida; probable hueco |
| human body explained (animation) | Alta, y muy infantil | **Alta** (Kurzgesagt, TED-Ed, canales infantiles) |
| ps1 aesthetic | Sí (games, music, blender, horror) | Es comunidad de nostalgia y creadores, no búsqueda educativa |
| abandoned supermarket | Alta (Mexia, "with food") | Exploración urbana real y teorías (Food Theory 22 M) |
| 1950s house / housewife | Alta | Media: nostalgia; outliers de 5,8 M en canal chico |
| aliens discover humans / human food | Sí, aparecen | HFY de baja producción, con outliers altos |

## 4. Veredicto

### ¿Hay un competidor directo?

**No, en lo medido.**
- No encontré ningún canal de YouTube que combine **androide o personaje del futuro + low poly PS1 + expediciones a ruinas humanas con explicación de objetos** [dato: 25 búsquedas, 193 canales revisados].
- Lo más cercano está por partes: el concepto (Wizards with Guns y DocuDubery, como sketch), la estética (Low Poly Shorts y PolyAssets, solo shorts) y el tema (Weird History, Weirdward Bound, This House, Ink Explainer).
- @sinaboto y @mechayuki no existen como canales de YouTube con esos handles [dato: yt-dlp no encontró ninguno].

### Potencial viral: **7/10** [inferencia]

A favor:
- Los temas tienen demanda probada y outliers recientes de 10x a 1.000x en canales chicos. Es el nicho de 2026: vida cotidiana antigua y "antes de X".
- El estilo low poly explicativo ya demostró atracción masiva en Shorts.
- El personaje y el marco "expedición" diferencian contra una oferta de baja producción o hecha con IA.
- Encaja con el formato que gana en el nicho, que hoy dura 8–27 min.
- La marca nace en TikTok: los cortes del largo alimentan el embudo.
- El "jefe misterio" genera comentarios.

En contra (por qué no 9):
- El concepto "arqueólogo del futuro" tiene **poca búsqueda directa**: el tráfico vendrá de browse y suggested, no de SEO.
- El low poly en formato largo no tiene precedente probado como explicador.
- 10–12 artefactos más segmentos del cuerpo humano en un solo video **dispersa el tema**. Los outliers son monotemáticos: un video = una pregunta.

### Riesgos

1. **Retención 8+ min animado:**
   - Los outliers del nicho son de 7–13 min, con un hilo único y una pregunta respondida al final.
   - Con 10–12 objetos sin relación, cada transición es un punto de abandono.
   - Mitigación: una ruina = un tema (p. ej. "el baño humano") y una pregunta-gancho que se resuelve recién con el jefe.
2. **Costo de producción:**
   - 8–12 min de animación PS1 equivalen a unos 6–8 TikToks de 90 s de Mechayuki por episodio, más el escenario-mazmorra.
   - Mitigación: reutilizar la ruina como set, planos fijos de menú STATUS/ITEMS (baratos y de marca) y loops de Mechayuki.
3. **Cuerpo humano:** el nicho está saturado por gigantes y por contenido infantil. Conviene como segmento o gag ("manual del cuerpo humano" desde los ojos de una androide, ángulo HFY), no como pilar SEO.
4. **IP:** la estética MML2 es una referencia, y el modelo es del usuario según la memoria. Evitar logos y nombres de Capcom en títulos y miniaturas. El tráfico del nicho Mega Man Legends es chico (300–475 k en sus mejores videos).
5. **Cadencia:** el algoritmo premia la constancia, y el costo por episodio la limita. Una cadencia de 2 por mes es razonable.

### 5 primeras expediciones recomendadas

Todas están apoyadas en outliers o búsquedas medidas:

1. **Ruina: Baño público / casa con baño enterrado**
   - Título: "What Did Humans Use Before Toilet Paper? (An Android Digs Up the Answer)"
   - Base: autocompletado fuerte; TED-Ed 6,3 M; Weirdward Bound 2026 15,7x; Relic Explains 72x.
2. **Ruina: Casa de 1950**
   - Título: "I Excavated a 1950s House. Humans Lived Like THIS?"
   - Base: King Rose Archives 5,8 M (4.135x); "1950s house/housewife" con alta demanda.
3. **Ruina: Supermercado**
   - Título: "Excavating a Human Supermarket: What Did People Eat Before Fridges?"
   - Base: Food Theory 22 M; "abandoned supermarket" con alta demanda; refrigeradores (Ragusea 8x, Weirdward 9,7x).
4. **Ruina: Dormitorio humano**
   - Título: "3000 Years From Now, an Android Finds Your Bedroom"
   - Base: el outlier de 3,2 M de Wizards with Guns con la misma premisa; alarm clock (TIFO 12x).
5. **Ruina: Hospital**
   - Título: "What Did Humans Do Before Anesthesia? An Android Explores a Human Hospital"
   - Base: "what did people do before anesthesia" en el autocompletado; ángulo HFY del "alien doctor" (103x). Aquí entra el "manual del cuerpo humano".

Recomendaciones de formato [inferencia]:
- **Título:** "pregunta humana buscable + giro del androide", en vez de "Expedition #1: Supermarket". El nombre de la serie va en la miniatura o el playlist, no al frente del título.
- **Episodio piloto:** el #1 o el #4.
- **Duración:** 10–12 min.
- **Objetos:** 8 bien ligados al tema de la ruina, mejor que 12 sueltos.

## Fuentes

- yt-dlp: búsquedas y pestañas de canal de YouTube, extraídas el 2026-10-30. Los datos crudos (`search.json`, `channels.json`) están en el scratchpad de la sesión.
- Autocompletado de YouTube: suggestqueries.google.com (ds=yt).
- vidIQ MCP: intentado, sin créditos.
