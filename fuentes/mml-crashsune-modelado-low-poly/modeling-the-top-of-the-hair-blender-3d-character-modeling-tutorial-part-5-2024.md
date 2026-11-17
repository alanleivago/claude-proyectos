# Modeling the Top of the Hair!✨ Blender 3D Character Modeling Tutorial - Part 5 [2024]

- Link: https://www.youtube.com/watch?v=sXTDuZtjfYY
- Canal: Crashsune Academy
- Fecha: 2026-11-16
- Tema: mml crashsune modelado low poly

## De qué trata
Es un episodio de una serie de modelado low poly en Blender 4.1 donde se modela el pelo del personaje "Love-chan". Está pensado para principiantes que se traban con el pelo. El método es dividir el pelo en "chunks" (casquete superior, flequillo, púas traseras), apoyarse mucho en referencias 2D y 3D, y modelar solo la mitad con un modificador Mirror. El resultado es el casquete de la cabeza, el flequillo y las púas traseras; el pelo inferior queda para el próximo video.

## Pasos / método
1. **[00:24]** Plantear el pelo como chunks simétricos: se modela solo una mitad y el Mirror hace el resto. Se mira primero el modelo final de referencia.
2. **[01:47]** Crear un cubo (Shift+A > Mesh > Cube), entrar en Edit Mode, escalarlo y subirlo con G Z. Se activan las teclas en pantalla (screencast keys) para mostrar los atajos.
3. **[02:03]** Borrar la cara inferior del cubo (Delete > Faces), para dejarlo abierto abajo.
4. **[02:21]** Agregar un loop cut vertical en el centro desde la vista frontal. Con Alt+C se activa la transparencia/X-ray, se borra la mitad de las caras y se agrega un **Mirror modifier** **[02:40]**.
5. **[02:55]** Analizar la referencia: la cabeza es una caja con una línea de aristas central ligeramente elevada que baja hacia los lados, como planos distintos. Se agregan loop cuts extra para reproducir esa forma **[03:17]**.
6. **[03:44]** Con vertex select, mover vértices (G Z, G Y) para bajar los tres superiores y meter hacia adentro los de los lados. Se pasa a la vista lateral y se alinea el cubo con la referencia **[04:09]**.
7. **[05:00]** Afinar a ojo comparando contra la referencia, usando Alt+Z para ver en X-ray. Se corrige la vista superior para que no quede un plano plano, metiendo vértices hacia adentro **[06:21]**.
8. **[07:10]** Revisar la vista trasera y la frontal contra el modelo 3D de referencia y ajustar hasta que coincidan.
9. **[08:05]** Corregir un error de proporción: el borde inferior del casquete debe terminar donde empieza el flequillo. Se suben los vértices con G Z.
10. **[08:55]** Unir el casquete con el otro objeto (Ctrl+J, clic en uno y Shift+clic en el otro en Object Mode) para trabajar el flequillo en una sola malla.
11. **[09:26]** Subir un poco los vértices inferiores por topología, en vista frontal (Numpad 1).
12. **[10:05]** Flequillo: en edge select (2), seleccionar dos aristas y extruirlas con E. Se las empuja hacia adelante desde la vista lateral **[10:24]**.
13. **[10:33]** Extruir otra arista, M > At Center para hacer una punta triangular y moverla para darle carácter. Fusionar vértices sobrantes con M > At Last **[10:54]**.
14. **[11:38]** Agregar volumen lateral extruyendo otras aristas y fusionar los vértices que en la referencia son uno solo (triángulo, no quad) **[11:57]**.
15. **[12:46]** Rellenar huecos seleccionando 2–4 aristas y pulsando F (fill). Se hace en dos zonas: un lado del flequillo y la zona de la mandíbula **[13:18]**.
16. **[13:31]** Púas traseras: solo hay que modelar la púa A y media púa B. Se extruye una arista, luego una cara, y M > At Center **[13:52]**.
17. **[14:36]** Para la púa central, ocultar el objeto que estorba, extruir y colocar los vértices en X=0 usando el panel N > Item para que queden en el centro exacto **[15:05]**.
18. **[15:43]** Unir con M > At Last los vértices que deben ser uno, y mover todo "a gusto" comparando con la referencia **[15:58]**.

## Lo que se ve en pantalla
- **[02:15]** Herramienta Loop Cut con panel de opciones: Number of Cuts, Factor y opciones como Clamp, Mirror Editing y Correct UVs.
- **[02:32]** Se agrega Mirror desde el menú Add Modifier > Generate. Se ve la vista frontal ortográfica con la mitad de caras borradas.
- **[03:23]** Panel del Mirror modifier con el eje X activo y Merge activado (valor ≈ 0.001 m). Se muestra también en pantalla Mirror Editing activo en los transform.
- **[05:21]–[06:12]** Se mueve (G) y se guarda con Ctrl+S con frecuencia mientras se ajusta la silueta contra el plano de referencia 2D.
- **[02:49], [03:06], [04:30]** Se muestra el modelo de referencia 3D de Love-chan (pelo verde-azulado) con la textura al lado. El texto en pantalla recomienda el sitio *Models Resource* para buscar referencias low poly y estudiar su topología.
- **[11:16]** Texto superpuesto: fusionar así evita clipping y agujeros en el pelo.
- **[10:26]** Se ve el flequillo extruido (E) a ambos lados de la cara en vista frontal.
- **[15:30]–[15:47]** Panel N > Item > Vertex con X puesto en 0 para centrar vértices en el eje del espejo.
- **[00:33], [16:38]** Overlays de like/suscripción; en el final se anuncia la versión de Gumroad con una guía PDF.

## Consejos y advertencias
- Si te trabás con el pelo, es normal; usá referencias 2D y 3D y dividilo en chunks **[00:29]**.
- No hace falta seguir el tutorial al pie de la letra: el autor dice que es una forma de hacerlo y que se va "a ojo/por vibra" **[05:24]**.
- Alt+Z (X-ray) es clave para verificar la alineación con la referencia.
- Las referencias nunca coinciden 1 a 1 con el modelo; adaptá **[16:10]**.
- Mirá las vistas frontal, lateral, superior y trasera para no dejar partes planas **[06:21]**.
- Fusionar vértices que sobran (At Last) evita agujeros y clipping **[10:54]**.
- Usar triángulos en las puntas es válido en low poly **[11:57]**.
- Poner los vértices del centro en X=0 mantiene la simetría **[15:14]**.
- Guardar seguido con Ctrl+S.

## Lo que no queda claro
- El pivote exacto de los valores de loop cut y de los desplazamientos no se indica; se hace "a ojo" contra la referencia.
- No se explica cómo cargar y ubicar las imágenes de referencia en el escenario (ya vienen de episodios previos).
- El audio dice "birds" por "verts" (error de la transcripción automática); se refiere a vértices.
- Cuándo se aplica el Mirror modifier no queda claro: se menciona que algunas partes (púas) se modelan tras aplicarlo, pero el video no muestra la aplicación explícita.
- El tema indicado ("mml crashsune") no aparece mencionado en el video; se asumió que se refiere al modelado low poly de este personaje.
