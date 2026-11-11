# How to Animate a 3D Cartoon in 60 Seconds

- Link: https://www.youtube.com/watch?v=w2AM1ltiers
- Canal: g russ
- Fecha: 2026-11-08
- Tema: cartoon3d

## De qué trata
El video explica cinco reglas de animación para que un corto de dibujos animados en 3D se vea profesional: pose nueva en cada fotograma, arranque rápido con asentamiento lento, quietud total cuando el personaje se detiene, cambios de cara instantáneos y cortes sincronizados con la palabra. Está dirigido a creadores de contenido vertical (shorts, 9:16) con voz en off. Cierra con la alternativa de saltarse todo eso usando Creatorize, que genera el corto completo desde un chat. Los ejemplos salen de un corto de 1.159 fotogramas.

## Pasos / método
1. **[00:04]** Regla 1: poné una pose nueva en cada fotograma y no uses desenfoque de movimiento. Se muestran los fotogramas consecutivos f219–f224, todos distintos.
2. **[00:08]** Verificá la regla contando: en el corto de ejemplo hay 1.159 fotogramas y ninguno se repite.
3. **[00:12]** Regla 2, "el chasquido": entre el 60 y el 70 % de un movimiento debe ocurrir en los primeros 4–5 fotogramas.
4. **[00:14]** Después dejá que el movimiento se asiente despacio. En la curva, ~70 % se alcanza en el fotograma 5 y llega a 100 % hacia el 10. Es la lógica de "rápido al entrar, lento al asentarse".
5. **[00:18]** Regla 3, quietud absoluta: cuando el personaje se detiene, nada se mueve (sin respiración ni balanceo).
6. **[00:20]** Ejemplo: la misma pose se mantiene 2 segundos (f262 a f320) sin variación.
7. **[00:24]** El movimiento medido por fotograma cae a cero en f262 ("stopped: f262") y queda plano.
8. **[00:26]** Regla 4: las caras cambian de golpe, sin transición. En f257 la cara es una y en f258 es otra, con 0 fotogramas intermedios.
9. **[00:32]** En el código, la cara se anima por pasos (step), no con un fundido.
10. **[00:34]** Regla 5: cortá en la palabra. La imagen nueva entra junto con la palabra nueva del audio.
11. **[00:38]** Referencia medida: en 8 cambios de plano, la mediana cae a unos 39 ms (≈1 fotograma) del inicio de la palabra.
12. **[00:42]** Atajo: en Creatorize elegí "3D Cartoon Shorts", subí tu voz en off y pedile a Berserk que haga el video de punta a punta.

## Lo que se ve en pantalla
- **[00:00–00:04]** Tarjetas de fotogramas numerados (f219–f224) y una tira de película que remite a "60 segundos".
- **[00:08]** Contador: 1.159 frames en el corto.
- **[00:12–00:14]** Superposición de poses con "60–70 % del movimiento" y gráfico de curva: eje X 0–10 fotogramas, eje Y 0–100, punto "~70 %" en el fotograma 5.
- **[00:20]** Cuatro fotogramas (f262, f280, f300, f320) con "misma pose, 2 segundos".
- **[00:22–00:24]** Gráfico "medido: cambio por fotograma, este clip" con una línea que cae a plano en f262.
- **[00:26–00:30]** Línea de tiempo f255–f260; f257 y f258 con "0 frames between".
- **[00:32]** Código: `char.face(t, { eyes, brow, mouth })`, comentario "steps, 0 transition frames", `ease: 'step'` ("= a snap") y "drawings never tween".
- **[00:34–00:36]** Forma de onda de audio con palabras marcadas ("She", "pulled", "the string", "dad", "looked up", "went pale") y marca "CUT".
- **[00:38]** Gráfico de 8 cambios de plano entre −150 ms y +150 ms respecto al inicio de la palabra.
- **[00:40]** "39 ms, mediana: aprox. 1 fotograma".
- **[00:44]** Menú de Creatorize con la opción "3D Cartoon Shorts (New)": personajes de dibujos animados con caras dibujadas en sets 3D con cámara real.
- **[00:46]** Mensaje al chat: "make me a video from this, end to end", con un audio .wav adjunto.
- **[00:48]** Resultado: un MP4 exportado en 9:16 con un resumen de lo que hizo cada pasada (build, camera, etc.).
- **[00:54–00:56]** Botón "Get Creatorize" y "Link in bio".

## Consejos y advertencias
- **[00:04]** Sin desenfoque de movimiento: cada fotograma es una imagen nítida y distinta.
- **[00:16]** Patrón de timing: rápido al entrar, lento al asentarse.
- **[00:20]** No agregues respiración ni balanceo cuando el personaje queda quieto; la quietud total es parte del estilo.
- **[00:26]** Las expresiones faciales no se interpolan: cambian de un fotograma al siguiente.
- **[00:34]** Sincronizá el cambio de imagen con el inicio de la palabra (±1 fotograma aprox.).
- **[00:50]** El autor dice que entrenar tu propio estilo probablemente no se vea así de bien (afirmación promocional).

## Lo que no queda claro
- No se muestra cómo implementar estas reglas manualmente en un software 3D concreto; el código es solo un fragmento ilustrativo y no se nombra el motor ni la herramienta.
- Los "60 segundos" del título parecen referirse a la duración del video, no al tiempo real de animar.
- No se explica el funcionamiento de Berserk ni los detalles del flujo de Creatorize más allá de la demo; precios y requisitos no se mencionan.
- Que el corto "nunca repite poses" con 1.159 fotogramas es una afirmación del autor y no se puede verificar en el video.
