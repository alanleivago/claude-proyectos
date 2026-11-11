---
name: cartoon3d-toon-chars
description: "Personajes cartoon3d = toon.js en código (v5 APROBADO 2026-11-08), nunca Flow; base para todos los videos desde ahora"
metadata:
  node_type: memory
  type: project
  originSessionId: ca3359ff-a367-4b93-9bf3-49898e4562fd
  modified: 2026-11-09T02:13:46.948Z
---

Desde 2026-11-08 los personajes de cartoon3d se hacen con `styles/cartoon3d/toon.js` (método mromidev: tarjetas Canvas2D iluminadas dentro de sets three.js), prueba en `pieces/toon-test` (v5 aprobado: "quedó muchísimo mejor... a partir de ahora lo usaremos así"). Nada de sprites Flow (c3Person) para personajes.

Claves aprobadas: cabeza casi redonda, cara centrada (kit igual en todos, sin nariz), pelo pegado al contorno y moviéndose con la cabeza, brazos de goma curvos desde el borde del torso con mano-punto, sin accesorios raros (credenciales, correas), pose a pose con snap (67 % en 4 frames) y quietud total, caras que cambian de golpe. Estudio visual en `fuentes/cartoon3d/ricks-estilo-4shorts.md`.

**Why:** el usuario sabe que Ricks Clips hace los personajes en código 2D-3D; Flow no da ese look.
**How to apply:** usar toon.js en cada video nuevo de cartoon3d (desde batch 04 #3, alquiler de cobayos). Pendientes a ir sumando: caminata (arreglo moonwalk en curso), sombreros, torsos más angostos, más atuendos y animaciones, sets más oscuros con niebla/partículas, cámara con órbitas y whip. Ver [[cartoon3d-rules-2]], [[cartoon3d-level]].

2026-11-09 (storyboard guinea-rent): cara SIEMPRE completa en perfil (2 ojos, 2 cejas, boca; nunca 1 ojo sin boca). Textos/avisos NUNCA flotantes: en documentos/carteles del mundo (sello ILLEGAL en un aviso, contrato que se escribe/firma) con plano cenital + paneo/grúa. Cámara casi nunca quieta (push-in continuo, órbitas, grúas, fundidos con movimiento). Hallazgos en fuentes/cartoon3d/ricks-documentos-camara.md.

2026-11-09 (tras guinea-rent, APROBADO y enviado): para los siguientes — sets MÁS GRANDES (más espacio para mover la cámara: órbitas, grúas, travellings como en los 3 shorts de Ricks), objetos sostenidos AGARRADOS de verdad por la mano (no flotando frente al torso), documentos sin texto cortado en el borde, caras sin quedar oscuras en sombras. Plantilla: pieces/guinea-rent (sound/ incluido).
