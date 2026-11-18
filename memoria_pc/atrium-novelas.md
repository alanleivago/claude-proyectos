---
name: atrium-novelas
description: "Nicho novelas cortas estilo @atriumstories_ (telenovela mexicana IA, Omni Flash en Flow); cuenta Flow Ultra 25k créditos, generar uno por uno"
metadata:
  node_type: memory
  type: project
  originSessionId: 31217992-d068-4929-9882-eede7428b798
  modified: 2026-11-03T14:03:36.387Z
---

Desde 2026-11-03: replicar las telenovelas cortas de TikTok @atriumstories_ (guiones, ganchos, cortes rápidos ~1,5-2 s, plano-contraplano, fotorrealista hora dorada). Análisis en fuentes/atriumstories/ (tools/analizar_novela.py por API).

- El creador hace hojas de personaje antes (ChatGPT); aquí se hacen en Flow con flow-create-character (+ --body, voz "native Mexican Spanish speaker").
- La cuenta de Flow es **Ultra con ~25.000 créditos**: generar los videos que hagan falta, pero **uno por uno** (con --wait, sin batch).

- **Flujo:** tomar los videos con más vistas (de atrium y de otras cuentas del estilo que pasará el usuario) y rehacerlos con la MISMA base (estructura, ritmo, beats) pero cambiando bastante personajes, diálogos y elementos. Piloto: pieces/agua-hacienda (remake de "vaso de leche" P1).

**Why:** el usuario lo pidió así; la extensión dice "plan free" pero eso es el conector, no los créditos de Flow.
**How to apply:** no frenar por coste de créditos en Flow; un job a la vez.
- Omni Flash: aprovechar clips de 8 y 10 s (pedido del usuario): varias líneas/planos por clip y cortar en el montaje. MCP a 720p (default de Flow es 360p).
