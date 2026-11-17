---
type: doc
status: active
tags: [agente-davis, tiktok, gumroad, checklist-gratis, kit-familiar]
relatedTo: [gumroad, agente-davis-guiones, vmos-cloud]
---

# TikTok de Patrick: de la tarjeta roja a las guías

## Lo que hacía (videos hasta 09-07)
- Formato ganador (1.1M, 217K, 161K, 56K): pantalla dividida. Arriba un clip viral hecho con IA (ICE contra NYPD, ICE en el aeropuerto, ICE con una mesera) con subtítulos amarillos y un título gancho en caja negra ("ICE es Arrestado por NYPD… ¡NO LO VIO VENIR!"). Abajo Patrick en cámara reaccionando.
- Al final Patrick muestra la tarjeta roja en pantalla completa con flecha roja y "Obtén tu tarjeta aquí", apuntando al producto de TikTok Shop (STG Velasquez 4x6 Red Constitution Cards).
- Segundo formato: Patrick a cámara explicando (orden administrativa 538K, lugares a evitar 66K) con "Comenta DOCUMENTO y te enviaré el documento". La gente pedía "Documento" por mensaje y se les mandaba el link de la guía en tandas (15 abr, 3 may, 13 may, 4 sep).
- Etiqueta "Generado por IA" puesta en los clips.

## Lo nuevo (mismo esqueleto, otro producto)
- Mismo gancho viral arriba + Patrick abajo. En lugar de la tarjeta: Patrick muestra en pantalla las hojas del checklist o del kit (portada + checklist + tarjetas recortables) con la flecha "Lista GRATIS en mi perfil".
- TikTok no deja links en el video ni anclar productos de Gumroad: el CTA es "link en mi perfil" o "comenta LISTA y te la mando".
- Bio cambiada el 2026-11-14: link = /l/checklist-gratis, última línea "📋 Lista GRATIS para tu familia 👇".
- La lista gratis junta correos y el workflow de Gumroad ofrece el kit (GUIA30) solo.
- Cierre hablado: "Te regalo la lista de las 15 cosas que tu familia debe tener listas. Está en el link de mi perfil. Es gratis."

## Mensajes privados (revisión 2026-11-14)
- 121 chats en Principal + 22 solicitudes. La mayoría eran "Documento" ya respondidos con el link en tandas.
- OJO: uiautomator NO lee los mensajes largos. Antes de responder, mirar cada chat con captura (o por API con visión).
- Existe "IA de Agente Davis" (respuesta automática de TikTok) contestando algunos.
- Respondido: Maribel (esposo en EE. UU. que abandonó a su hija → pensión por la procuraduría de su país).

## 2026-11-15
- Script `tools/patrick_ai_inbox.py <88|90> [--max N] [--send]`: captura cada chat → Claude (créditos) → respuesta con link (prompt en prompt_dm.md) → envía a ritmo humano. Log en dm_borradores.md, ideas de producto en demandas.md.
- PELIGRO: la respuesta automática "IA de Agente Davis" de TikTok inventa promesas (a Maribel: "ya agregué estos números a tu expediente, yo me encargo"). Recomendado apagarla.
- Siguiente: comentarios con DOCUMENTO/TARJETA en los videos → responder + mandar link por DM.
- 2026-11-15: respuestas automáticas de la IA de TikTok APAGADAS (a pedido del usuario).
