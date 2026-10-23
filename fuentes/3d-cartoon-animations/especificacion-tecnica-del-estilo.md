# Especificación del estilo 3D cartoon shorts (sin Creatorize)

- Link: https://www.youtube.com/watch?v=z9XflLHoMdg
- Canal: g russ
- Fecha: 2026-10-21
- Tema: 3D cartoon animations

## 1. Análisis de referencias (cómo estudia el estilo)
* **Muestra analizada [02:37]:** 7 shorts de referencia tomados de un único canal competidor exitoso (*Ricks Clips* [00:03], con más de 26M de vistas y videos de hasta 6.9M de reproducciones).
* **Duración de las referencias [02:42]:** Videos de entre 31 y 68 segundos.
* **Extracción cuadro a cuadro [02:56]:** No se analiza a 1 fps (muestra insuficiente para animación). Se extrajeron todos los fotogramas a **30 fps exactos**, totalizando **9.140 fotogramas**.
* **Hojas de contactos (tile sheets) [03:04]:** Se crearon **433 hojas de contactos (tile sheets)** que desglosan cada movimiento, cambio facial y transición.
* **Medición de variables [03:14]:**
  * Cada toma fue desglosada y clasificada individualmente.
  * Curvas continuas de **zoom y paneo** de cámara medidas cuadro a cuadro [03:18].
  * **Transcripción de audio local [03:21]:** Tiempos alineados palabra por palabra con una precisión de **~20 ms** [03:24].
  * Registro exacto del desfase en fotogramas entre el cambio visual (gesto o rostro) y la emisión fonética de la palabra clave [03:28].
* **Consolidación de reglas [03:37]:** Unificación de las 7 referencias en un único compendio paramétrico de rangos y tolerancias.

---

## 2. Personajes (forma, proporciones, materiales, sombreado, contorno, ropa, colores, lista de expresiones faciales y cómo se dibujan)
* **Geometría base y proporciones [02:18]:**
  * Cabeza: Esfera perfecta ("ball for a head").
  * Torso: Forma de frijol/cápsula ("bean for a body").
  * Extremidades: Brazos y piernas filiformes, estilo palo ("thin stick limbs").
* **Estilo visual y sombreado [02:06]:**
  * Sombreado Toon suave (*soft toon shading*).
  * Trazado de contornos con tinta (*ink outlines*).
  * Iluminación cálida con luz clave suave y luz de borde (*soft key and rim light*) [13:28].
* **Variantes de color de piel [10:40]:**
  * **Skin tones (Tonos de piel) [10:41]:** Cada personaje posee su tono de piel humano específico.
  * **White / Classic (Caras blancas clásicas) [10:45]:** Cabeza y manos en blanco estilizado. No es pintura blanca pura plana (#FFFFFF): bajo la luz de la escena cae a gris claro. Valores medidos [11:07]: Luz (lit) = **210-219**, Medios (mid) = **179**, Sombra (shade) = **104**. El canal de sombra se mantiene en un gris frío legible (*readable cool grey*) [11:16], evitando que se quemen los blancos bajo fuentes intensas y absorbiendo tintes ambientales (neón, submarino, noche) [11:13].
* **Elenco del sistema [08:32]:**
  * **20 personajes originales** en **6 tipos de cuerpo** (desde niños hasta ancianos: Milo el hombre común, Juno, Dex el científico, Bea la niña, Otis el robusto, Nana Rose, Walt, Sam, Zed el sospechoso, etc.) [08:38].
  * **12 atuendos temáticos [08:49]:** Astronauta, buzo, traje hazmat, explorador, invierno, playa, obrero, medieval, caballero con armadura, faraón, piloto y marinero.
* **Expresiones faciales y dibujo [09:05]:**
  * **43 expresiones base** dibujadas desde una única hoja maestra (*master sheet*) para mantener coherencia familiar [09:16].
  * Rango de emociones: Neutral, smug (autosuficiente), pánico, mareado (dizzy), starstruck (deslumbrado), triste, furioso, etc. [09:08].
  * **8 elementos gráficos adicionales [09:11]:** Gotas de sudor, lágrimas acumuladas, vena de ira (*anger vein*), etc.
  * **Técnica de aplicación [09:21]:** Los rostros se simplifican mediante un script a capas transparentes (cejas, ojos y boca) y se proyectan sobre la esfera 3D como una calcomanía (*decal*).
  * **Tracking de ojos [09:28]:** Cada ojo abierto tiene coordenadas independientes para párpados (*lid*) y pupilas (*pupil*), permitiendo parpadear y dirigir la mirada exactamente hacia los objetos manipulados.

---

## 3. Caras y expresiones (reemplazo, parpadeo, timing exacto respecto a la palabra, sin lip sync)
* **Prohibición de morphing [04:48]:** Las expresiones **nunca** se interpolan ni se transforman gradualmente (*never morph*).
* **Reemplazo mediante parpadeo (Blink Swap) [04:51]:**
  * Fotograma 1: Ojo a medio cerrar (*half closed*, 1 frame) [04:54].
  * Fotograma 2: Ojo totalmente cerrado (*closed*, 1 frame) [04:55].
  * Fotograma 3: Se estampa la nueva expresión en seco (*snap*) [04:56].
* **Anticipación temporal al audio [04:58]:** La nueva cara debe aparecer exactamente **2 fotogramas antes** de la palabra enfatizada o estresada (*stressed word*).
* **Frecuencia de cambio [05:01]:** El personaje principal cambia de expresión en promedio cada **~1.2 segundos**.
* **Ausencia total de Lip-Sync [05:04]:** Las bocas **no** se sincronizan fonéticamente con el habla. El peso actoral recae en los ojos, cejas y cambios de gesto; la boca es estática o reactiva a la emoción global.

---

## 4. Poses, gestos y movimiento (timing en frames, anticipación, holds, reglas de quietud, easing)
* **Holds (Regla de inmovilidad absoluta) [04:06]:**
  * Cuando un personaje se detiene, queda completamente congelado (*dead still*): sin respiración simulada, sin balanceo de cadera (*no breathing, no swaying*) [04:09].
  * En un hold, la cabeza se mueve **menos de 0.5 píxeles por fotograma** [04:15].
  * Queda terminantemente prohibido el rebote ocioso continuo (*idle bounce*) [04:23]. La vida de la escena la aportan la cámara, los parpadeos, los swaps faciales y los props [04:19].
* **Anticipación de gestos [04:28]:**
  * Los gestos impactan antes del audio: por ejemplo, un encogimiento de hombros (*shrug*) dura **~5 fotogramas** y concluye entre **3 y 5 fotogramas antes** de que suene la palabra asociada [04:31].
* **Follow-through y desfase corporal [04:38]:**
  * El cuerpo sigue a la mano. La cabeza continúa girando entre **2 y 4 fotogramas después** de que la extremidad/mano se ha detenido [04:41]. Este micro-retraso elimina la rigidez robótica.
* **Métricas de animación física [09:41]:**
  * **Caminata enérgica (Brisk walk) [09:43]:** Da un paso cada **5 a 6 fotogramas**. El torso oscila verticalmente un **~7% de la altura de la cabeza**.
  * **Sentarse (Sit down) [09:49]:** Descenso inicial de anticipación de **3 fotogramas**, subida de **5 fotogramas**, bajada principal a lo largo de **11 fotogramas**, y rebote amortiguado al hacer contacto con el asiento.
  * **Sobresalto (Jolt) [09:55]:** El cuerpo se dispara hacia arriba un **+44.7% de la altura de la cabeza** en tan solo **2 fotogramas**.
* **Física y restricciones de rigging [10:07]:**
  * Probado sobre 54 poses en 8 cuerpos: las manos jamás deben atravesar la cabeza o el torso [10:10].
  * **Fijación de pies [10:15]:** Durante el paso de contacto en la caminata, los pies deben permanecer anclados al suelo deslizándose **menos de 0.5 mm por frame** [10:17].
  * La posición de cada fotograma debe ser una función determinista y pura del tiempo ($t$) [10:20].

---

## 5. Cámara (movimiento, velocidad, aceleración hacia cortes, lentes, encuadres, transiciones y duración)
* **Continuidad de movimiento [05:09]:** La cámara se encuentra en movimiento activo en aproximadamente el **90% de los fotogramas** de cada short [05:13].
* **Velocidad y aceleración [05:15]:**
  * Entre eventos o acciones principales, la cámara se desplaza a una velocidad residual (*creep*) de **~5% por segundo** [05:17].
  * Hacia el final de la toma, acelera progresivamente hacia la transición, alcanzando un empuje de hasta **~3.3% por fotograma** directamente en el corte [10:00].
  * La toma siguiente arranca ya con velocidad heredada en movimiento [05:21].
  * **Estabilidad [05:23]:** Cero vibración o temblor de cámara en mano (*no handheld shake*). Todos los desplazamientos son cinemáticos, limpios y fluidos.
* **Inicio del movimiento [05:26]:** Cada movimiento significativo de cámara se dispara sincronizado con el arranque de una palabra.
* **Transiciones entre tomas [05:29]:**
  * Casi no existen los cortes secos (*hard cuts*) (2 de 7 referencias no tuvieron ni un solo corte seco [05:39]).
  * **Disolvencia cruzada corta [05:32]:** Disolvencia de **6 fotogramas (0.2 segundos)**, que comienza exactamente en la primera palabra de la siguiente frase, manteniendo ambas tomas en movimiento continuo [05:35].
  * **Transiciones diegéticas de cámara [05:43]:** Vuelos continuos atravesando puertas o zooms extremos directos a la pupila del personaje.

---

## 6. Escenarios y props (densidad, estilo, iluminación, profundidad de campo, glow, viñeta, grano, paleta)
* **Densidad de props y sets [02:04]:** Escenarios pequeños pero cargados densamente de utilería y detalles de fondo. La escena nunca debe verse vacía ni empezar desde un suelo gris desierto [08:03]. Se construyeron **317 props** y **29 sets vestidos completos** [07:33].
* **Ajustes de cámara y postprocesado (Look Cinema) [10:28, 13:28]:**
  * **Profundidad de campo (Depth of Field):** Fuerte desenfoque tanto de fondo como de primer plano cercano, manteniendo nítido únicamente el plano focal del sujeto.
  * **Glow (Resplandor):** Resplandor cálido en lámparas, bombillas, monitores y superficies emisivas [02:08].
  * **Viñeta:** Viñeteado ligero en los bordes del encuadre para concentrar la atención [13:30].
  * **Film Grain (Grano de película):** Textura sutil cinematográfica superpuesta [13:30].
* **Rigs de iluminación predefinidos [07:58]:** 10 esquemas de luces maestros, incluyendo: interior cálido (*warm interior*), noche de neón (*neon*), bajo el agua (*underwater*) y espacio exterior (*space*).
* **Efectos ambientales [07:49]:** 30 tipos de efectos procedurales/animados integrados (lluvia, fuego, burbujas, rayos, escaneo de rayos X, vapor).

---

## 7. Datos como objetos (cada tipo de visualización física y cómo se anima)
* **Regla 6 fundamental: Facts are objects (Los datos son objetos físicos) [05:48, 08:09]:** Ningún número o estadística se presenta como un texto flotante superpuesto genérico. Cada número mencionado debe materializarse como un dispositivo físico tridimensional dentro del entorno [06:08].
* **Tipos de dispositivos y animación [08:10]:**
  1. **Contador LED [08:10]:** Rueda los dígitos a gran velocidad y frena bruscamente aterrizando en la cifra exacta justo en la palabra clave pronunciada.
  2. **Manómetro / Indicador de aguja (Gauge) [08:14]:** La aguja sube rápidamente, experimenta un ligero sobrepaso (*overshoot*) mecánico y se clava en el valor al oírse la cifra.
  3. **Calendario con desprendimiento de hojas [08:18]:** Las hojas se voltean físicamente hasta caer en la fecha indicada.
  4. **Reloj de manecillas [08:20]:** Las agujas barren a toda velocidad en sentido horario hasta la hora descrita.
  5. **Periódico giratorio [08:22]:** Gira desde el fondo hacia primer plano destacando el titular.
  6. **Lupa deslizante [08:24]:** Se traslada sobre un documento y se posa sobre la línea de texto exacta leída por el locutor.
  7. **Panel de botones numerados [05:57]:** Luces que se encienden secuencialmente al nombrarse cada dígito.
  8. **Gráfico de barras apiladas [06:00]:** Columnas formadas por pilas de objetos físicos reales acumulados.

---

## 8. Ritmo y tomas (tomas por cláusula, duración de tomas, cortes por segundo, estructura del short)
* **Unidad narrativa visual [02:11, 16:17]:** **Una cláusula de la narración = una toma** (*one clause, one shot*). Cada frase u oración compuesta se fragmenta en cláusulas cortas independientes.
* **Cadencia de cambio de imagen [06:14]:** Un nuevo estímulo o encuadre cada **~1.1 segundos** (aproximadamente cada **4 palabras**) [06:16].
* **Cantidad de tomas por short [16:14]:** Un video típico de 50 segundos contiene entre **25 y 30 tomas**.
* **Estructura temporal del short [06:17]:**
  * **El gancho (Hook):** Planteado en la primera frase; resuelve o muestra su primer pago visual en los primeros **2 a 3 segundos** [06:19].
  * **Cuerpo:** Desarrollo acelerado con giros y metáforas visuales.
  * **Bucle infinito (Loop) [06:20]:** La última línea del guion y su toma final encajan temática y sintácticamente de forma directa con la primera frase del video.

---

## 9. Guion (longitud, persona gramatical, ganchos, estructura, verificación de datos, ejemplos de frases)
* **Extensión y duración [11:50, 33:18]:**
  * Promedio de **~165 palabras** para un video de **50 segundos**.
* **Persona gramatical y enfoque [08:55, 11:58, 33:28]:**
  * Narrado estrictamente en **segunda persona ("Tú")**. El espectador es el protagonista de la historia ("Eres Chris Hadfield en tu primera caminata espacial..." [11:06], "Eres Robert O'Hara Burke..." [28:59]).
* **Fórmula estructural del guion [11:56]:**
  1. *Gancho directo al espectador:* "Son las doce en Boston, 1919, y una ola de melaza rueda por tu calle" [13:58, 30:15].
  2. *Planteamiento experiencial:* Describir el problema en primera persona inmersiva.
  3. *El punto de inflexión absurdo ("Here's the weird part") [12:02, 30:36]:* Transición que rompe la expectativa hacia la causa insólita del problema.
  4. *Analogía cotidiana literal [12:04]:* Explicar conceptos técnicos complejos mediante imágenes domésticas tangibles ("como llevar un globo de agua de lente de contacto" [11:20], "literalmente una clavija cuadrada en un agujero redondo" [20:08]).
  5. *Cierre en bucle:* La última frase conecta cíclicamente con el gancho inicial [12:07].
* **Verificación de datos empíricos y discrepancias de fuentes [12:10]:**
  * Cuando las fuentes históricas discrepan en cifras, el guion debe absorberlo con metáforas visuales o estimaciones prudentes:
    * *Ejemplo 1 [12:15]:* Altura de la ola de melaza (las fuentes varían entre 15, 25 y 40 pies) $\rightarrow$ El guion concluye: *"tan alta como una casa"* (*as tall as a house*) [12:21].
    * *Ejemplo 2 [12:24]:* Corrección de la Torre de Pisa (entre 38 y 48 cm) $\rightarrow$ El guion simplifica a *"unas dieciocho pulgadas"* (*about eighteen inches*) [12:28].

---

## 10. Voz (herramienta, voz, recorte de pausas, valores exactos)
* **Herramienta de generación [12:35]:** ElevenLabs (voz con estilo de narración acelerada e informativa).
* **Velocidad natural del habla [03:44]:** Promedio medido en las referencias de **~215 palabras por minuto**, de pared a pared (*wall to wall*).
* **Densidad de voz [03:48]:** El audio hablado cubre entre el **93% y el 98%** de la duración total del video.
* **Tijera de silencios (Trim silences) [12:44, 20:22]:**
  * Los motores TTS convencionales dejan pausas artificiales muy largas que destruyen la retención.
  * **Umbral de silencio:** **-40 dB** [20:28].
  * **Pausa mínima a cortar:** Pausas superiores a **350 ms** [20:28].
  * **Porcentaje de recorte:** **70%** del silencio detectado eliminado [20:29].
  * **Pausa final post-oración:** Ajustada a exactamente **~0.2 segundos (un quinto de segundo)** [03:52, 12:48]; jamás debe superar **~0.3 segundos** [12:51].
  * *Impacto en producción:* En un guion de prueba, un audio en bruto de **60.8 s** se comprimió a **49.2 s**, suprimiendo casi **12 segundos de tiempos muertos** [12:56].

---

## 11. Subtítulos (fuente, tamaño, posición, colores, palabra por palabra, resaltado, zona prohibida)
* **Formato y frecuencia de aparición [10:32]:**
  * Presentación de **dos palabras a la vez** (*two words at a time*).
  * Actualización en sincronía estricta con el flujo de la voz.
* **Estilo tipográfico y color [10:32]:**
  * Texto en **blanco negrita** (*bold white*) con **borde o contorno oscuro** (*dark outline*).
* **Posicionamiento vertical [13:32]:**
  * Los subtítulos se sitúan aproximadamente al **70% de la altura total de la pantalla** (medido desde la parte superior).
* **Franja / Zona prohibida (Layout exclusion band) [13:34]:**
  * Rango comprendido entre el **66% y el 76% de la altura** del encuadre.
  * **Regla estricta:** Ningún rostro de personaje puede ubicarse dentro de este intervalo vertical para evitar colisiones visuales entre la cara y el texto.

---

## 12. Sonido (SFX por acción, niveles LU de cada capa, música, ducking, licencias)
* **Sincronización de efectos (SFX) [27:03]:**
  * Cada efecto de sonido debe amarrarse a una acción visual discernible (abrir una puerta, impactar contra el suelo, un contador deteniéndose, etc.).
  * **Moderación en la mezcla:** Un exceso de efectos arruina el video (un primer renderizado colocó 69 SFX en 47 s; el mix refinado conservó únicamente **19 SFX principales**, alineándose al estándar de referencia de **12 a 20 SFX por minuto**) [25:45].
* **Balance de sonoridad (Loudness Units - LU) respecto a la voz (Voz = 0 LU) [27:13]:**
  * **Impactos / Golpes secos:** **-10 LU** por debajo de la voz.
  * **Whooshes (paneos/movimientos rápidos) y Pops:** **-15 LU** por debajo de la voz.
  * **Ticks / Clics mecánicos sutiles:** **-22 LU** por debajo de la voz.
* **Música de fondo (Music bed) [03:54, 27:20]:**
  * Nivel constante a **-18 LU** por debajo de la voz (medición real en mezcla: **-17.7 LU** [27:34]).
  * **Prohibición de Ducking [03:57, 27:24]:** La música **nunca** atenúa su volumen cuando entra la voz (*no ducking*); se mantiene plana e ininterrumpida a lo largo de todo el short.
* **Masterización global [27:27]:** El archivo final consolidado se procesa y masteriza a **-14 LUFS**.
* **Licenciamiento [28:02]:** Música comercial libre de reclamos de Content ID (por ejemplo, Epidemic Sound) para evitar penalizaciones en el canal.

---

## 13. Render y export (resolución, fps, códec, reescalado)
* **Resolución base vertical [19:30]:** **1080 x 1920 píxeles** (relación de aspecto **9:16**, optimizado para YouTube Shorts, Instagram Reels y TikTok).
* **Opción horizontal secundaria [13:46, 34:27]:** Compatible en **1920 x 1080 píxeles** (**16:9**).
* **Frecuencia de cuadros (Frame rate) [02:59, 19:30]:** **30 fps**.
* **Códec de exportación [19:30]:** **H.264 (GPU accelerated)**.
* **Exportación 4K opcional [19:31]:** Reescalado nítido (*upscale*) a **2160 x 3840 píxeles**, lo que fuerza a YouTube a asignar un bitrate mucho más elevado, preservando la nitidez del grano de película y los textos.
* **Metadatos auxiliares [19:37]:** Exportación paralela obligatoria del archivo de subtítulos cronometrado (.srt) junto al contenedor de video.

---

## 14. Control de calidad (qué revisa, errores típicos y cómo los corrige)
* **Las 5 preguntas de oro por toma (Five questions check) [18:38]:**
  1. *¿La imagen muestra exactamente lo que dicen las palabras en el instante preciso en que lo dicen?* [18:40]
  2. *¿El rostro del personaje es perfectamente legible, está bien iluminado y fuera del área de subtítulos?* [18:43]
  3. *¿Hay objetos o partes del cuerpo flotando, patinando o atravesando superficies/props?* [18:47]
  4. *¿Cada número mencionado aterriza físicamente como un objeto en su fotograma exacto?* [18:51]
  5. *¿El escenario se siente habitado y lleno, sin esquinas vacías desatendidas?* [18:54]
* **Defectos detectados en el desarrollo y sus parches algorítmicos [25:19, 26:17]:**
  * *Cuadrados negros en el render:* Geometrías rotas en props manchadas por el shader de glow $\rightarrow$ Validación previa de mallas antes del pase de iluminación [25:22].
  * *Personajes hundidos en sillones:* Error por cálculo de distancia fija $\rightarrow$ Medición física referenciada al borde frontal del asiento [25:30].
  * *Personajes ocultos tras muebles:* Falsos positivos de visualización $\rightarrow$ Trazado de rayos (*raycasting*) desde el lente de la cámara hacia el centro de la cara [25:39].
  * *Planos cerrados que cortan los ojos:* Tomas en plano corto que reencuadran mal $\rightarrow$ Regla de corte: el plano cerrado puede cortar la coronilla de la cabeza, pero **jamás los ojos** [26:01].
  * *Barbas que ocluyen el perfil:* Barbas que tapan la expresión $\rightarrow$ Las barbas deben restringirse por debajo del pómulo [26:29].
  * *Humo tapando caras:* Emisores de partículas $\rightarrow$ Desplazamiento de emisores hacia los costados o detrás de los personajes [26:31].

---

## 15. Lo que el autor deja implícito o no explica
1. **Motor de render y stack 3D subyacente:** No revela qué motor utiliza internamente bajo el código (si compila escenas hacia Three.js/WebGL en un entorno headless de Electron/Node, o si maneja un bridge con Blender mediante scripts de Python). Los archivos mostrados tienen extensiones `.js` (como `p1_lifeboat.js`, `handshake.js`), lo que sugiere fuertemente un pipeline en JavaScript/Node/Three.js o WebGPU ejecutado en la app de escritorio.
2. **Topología y esqueletos (Rigging):** Aunque muestra la geometría básica (cabeza esférica, cuerpo cápsula y extremidades de palo) y habla de "54 poses en 8 cuerpos", no especifica la cinemática inversa (IK) empleada para que las extremidades de palo doblen articulaciones sin perder grosor ni generar distorsiones de malla.
3. **Shader Toon e Ink Outlines:** No detalla el código del sombreador toon (número de bandas de iluminación, si el outline es por pase de caras invertidas con extrusión de normales o un filtro Sobel en postprocesado de pantalla).
4. **Tratamiento fonético de transcripción a 20 ms:** Menciona que usa modelos locales como Parakeet/Whisper para la alineación temporal forzada (*forced alignment*), pero omite el algoritmo que mapea una palabra polisilábica con la sílaba tónica exacta que activa la anticipación de 2 frames del parpadeo.
5. **Generación procedural vs. modelos 3D precargados:** Afirma que los "317 props fueron creados en código", pero no aclara qué porcentaje corresponde a primitivas combinadas algorítmicamente en tiempo real frente a una librería de modelos GLTF/OBJ premodelados cargados mediante scripts.
