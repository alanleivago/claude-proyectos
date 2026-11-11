---
name: api-credits-first
description: "Siempre que una tarea pueda correr por la API de Claude (créditos $200), hacerla así antes que gastar tokens del plan"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 98e21a33-27f5-4cd2-b46a-f3e7cab88585
  modified: 2026-10-29T03:29:19.074Z
---

Regla del usuario (2026-10-28): cualquier actividad que pueda usar el saldo de créditos de API ([[api-credits]]) debe usarlo primero, antes que los tokens del plan de Claude Code.

**Why:** quiere ahorrar los límites del plan Max; los créditos se pierden cada mes si no se usan.
**How to apply:** para trabajo pesado o repetitivo (ver/analizar videos y fotogramas, revisar renders, guiones en lote, títulos/SEO, transcripciones con análisis) usar un script Python con el SDK `anthropic` y la key del `.env`; el script escribe un reporte .md corto y yo leo solo el resultado. Si los créditos se acabaron (error de saldo), avisar y recién ahí hacerlo yo.
