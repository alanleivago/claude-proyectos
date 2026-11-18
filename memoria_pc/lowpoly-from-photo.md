---
name: lowpoly-from-photo
description: "Método PS1 low poly desde 1 foto (tutorial vlvt): script Python en Blender, loft por silueta 6-12 lados, textura 128px/32 colores, revisión al lado de la foto"
metadata:
  node_type: memory
  type: reference
  originSessionId: 3b008220-5710-444f-9064-2bac0d02be64
  modified: 2026-11-01T08:12:26.552Z
---

Tutorial que el usuario pidió aprender y aplicar a sus videos low poly (2026-11-01). Notas completas: `fuentes/blender-lowpoly/reel-ps1-lowpoly-desde-foto.md`.

Resumen del método:
- **Foto de entrada:** 1 foto frontal limpia, sobre fondo liso.
- **Malla:** Claude escribe un script que lee el ancho de la silueta por filas y hace un loft de 6 a 12 lados.
- **Textura:** UV + la misma foto proyectada.
- **Cajas:** se texturizan con la cara frontal y la lateral.
- **Personajes:** hoja T-pose de frente y espalda sobre croma, partes en bloques, rig e idle.
- **Look PS1:**
  - textura de 64 a 512 px (128 por defecto), unos 32 colores, nearest;
  - snap de vértices y warping afín;
  - render a 270 px de alto, escalado ×4 con dither 4x4.
- **Revisión:** render desde el ángulo de la foto, al lado de la foto. Primero la silueta, después la textura, un solo arreglo por vez.

**Pedido del usuario (2026-11-01):** aplicarlo en los siguientes videos, sobre todo a los OBJETOS. Los escenarios solo cuando es barato: una pared, puerta, cartel o mueble es una caja con su foto, sin rehacer el cuarto entero.

**Fotos (usuario, 2026-11-01):** se bajan de Google Imágenes sin buscar licencia, porque estos videos no se monetizan. Si no hay una foto frontal limpia de lo que se necesita, se genera con Flow ([[flow-mcp]]).

**How to apply:** props y personajes de [[zombie-channel]], [[sinaboto-style]], [[emberlite-style]] y [[mechayuki-rules]] salen de foto o T-pose con este método. El GLB resultante se importa en el motor three.js, que ya hace el snap PS1.

**Photos must be clean (user, 2026-11-02, ep5 radio):** the photo must show the object from the front and ISOLATED, as a PNG cutout with no background or scenery. A photo with background bakes the scene into the model's texture. If no clean cutout turns out well, model the object in code.
