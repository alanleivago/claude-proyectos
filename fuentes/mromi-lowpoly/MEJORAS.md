---
type: plan
status: in_progress
tags: [zawdog, mromi, low-poly, mocap, expressions, kit-v3]
relatedTo: [fuentes/mromi-lowpoly/DENSO.md, fuentes/mromi-lowpoly/how-to-make-low-poly-shorts-using-claude-full-workflow.md, styles/zawdog/STYLE.md]
---
# Mejoras para Doggo Poly Shorts sacadas del tutorial de Mr omi

Fuentes: [notas](how-to-make-low-poly-shorts-using-claude-full-workflow.md), [pasada densa 1 fps](DENSO.md) y las notas por ventana en `denso/`.

## Qué hace él y qué nos falta
| Técnica | Mr omi | Nosotros hoy | Mejora |
|---|---|---|---|
| Personajes | Pack de más de 100 humanos low poly con rig y cara de foto. El rig usa nombres de MakeHuman (`upperarm01`, `lowerarm01`, `finger1-1.L`, `spine02`). | Photo-humans de Flow, con poses hechas por código | Cuerpos rigados de MakeHuman/MPFB2 (gratis, salida CC0), reducidos a low poly, con la cara y la ropa de Flow mapeadas encima |
| Movimiento | Kimodo, que genera el movimiento desde una frase (mocap real), más una librería de clips agrupados por emoción | Keyframes hechos por código, rígidos | Mocap real con licencia comercial (CMU BVH y 100STYLE CC-BY), retargeteado sin interfaz al rig de MakeHuman. Librería por emoción: HAPPY, SAD, SCARED, PAIN, RUDE, IDLE, WALK. Kimodo queda como experimento con kimodo.cpp en CPU, o en Colab. |
| Caras | 6 fotos de expresión de la misma cara (neutral, sonrisa, sorpresa, llanto, risa, miedo), cambiadas en seco según el plano | Una sola cara fija | Generar 6 variantes en Flow por persona y cambiarlas según el beat, incluso a mitad de plano |
| Planos | 1 corte cada 1 a 1.4 s, de 3 a 8 locaciones, cada beat con su set, su prop-chiste y otro tamaño de plano. Primeros planos de cara en los beats emocionales, ángulos extremos de escala, cenitales, y alrededor de 1/3 de fondos "infográficos" de ruido de color | Unos 2.5 s por plano | Más cortes, primeros planos de cara humana al cambiar de expresión, planos de escala y fondos-concepto. Mantener la regla de la cámara siempre en movimiento. |
| Props y sets | Geometría simple más modelos 3D reales descargados (árboles reales en lugar de manchas). Cada escena se renderiza, se revisa y se corrige en 4 rondas. | Low poly desde fotos de Flow | Sumar modelos CC0 de Poly Haven donde ayuden: árboles, mobiliario urbano. Ya hacemos la revisión por rondas. |
| Sonido | Un SFX cada 1 a 2 s, con prompts literales (`sfx_list.json`: `nombre: {prompt, seconds}`). **Grito humano real y sutil cuando una cara pasa a miedo, 2 o 3 por short.** | SFX reales CC0 verificados con earshot (mejor que el Gemini de él, que inventa sonidos) | Agregar la regla del grito sutil, y para el perro un yelp o gemido. Densidad de 1 cue cada 1 a 2 s. Lista de cues en JSON. |
| Subtítulos | Amarillos chicos con contorno oscuro, de 2 a 5 palabras, centrados sobre el cuerpo | Courier amarillo | Ya coincide |

## Orden de trabajo
1. Kit v3, prueba: humano MPFB2 low poly con cara de Flow, 3 clips de mocap (caminar, susto, encogerse de hombros), cambio de 6 caras y grito sutil. Render de una prueba de unos 8 s en un set del kit.
2. Si el usuario la aprueba, pasa a [STYLE.md](../../styles/zawdog/STYLE.md) y se aplica desde el video 6.
3. Opcional: Kimodo con kimodo.cpp en CPU, sin CUDA, o por Colab, que necesita acceso a Llama-3 en Hugging Face.

Licencias: CMU es libre para cualquier uso. 100STYLE es CC BY 4.0, así que hay que acreditarlo. Bandai Namco y el mocap de perros de AI4Animation son no comerciales: **no usar**. El perro sigue animado a mano o por código.
