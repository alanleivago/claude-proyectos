---
type: log
status: delivered
tags: [paraguas-auto, pov3d]
relatedTo: [pieces/paraguas-auto/brief.md]
---

# LOG — Del paraguas al auto

- Intake: ref TikTok @ruthmork1; pov3d; ES neutro; voz "scroll 2 buena español"; 9:16.
- Story: guion propio (16 líneas); el usuario pidió cambiar palabras para no copiar la ref.
- Look v1: calle colonial, paraguas rojo/crema → rechazado: misma ubicación que la ref y paraguas = misma tela que la lona. v2 aprobado; pidió pantalón que se moja (chino gris + shader de altura mojada).
- Storyboard aprobado; pidió 61 s → pausas alargadas.
- QA cuadro a cuadro: árbol y auto estacionado atravesados por la cámara (50 s), cámara dentro del auto (53 s), paraguas atravesado al entrar a la cabina (33.5 s) → arreglados y re-render.
- revisar_render (API): HUD sin lógica problema→invento, huecos y contraste de subtítulos, "cometa" sin despegar, cuesta invisible, gotas en la lente → todo arreglado, re-export completo.
- Final: 1830 frames, 0 pops (spike < 0), 1 corte intencional (43.43 s). Mix −14.0 LUFS, TP −1.72 dBTP; lo más fuerte = choque 45.5 s tras 0.5 s ≤ −40 dBFS. Texto: 0 cortes/solapes, 1 aviso de zona segura (5.6–8.8 s).
- Revisión 2 (pedido del usuario): lluvia visible (gotas 3D más gruesas/densas + capa 2D en pantalla, salvo cabina), pantalón claro que se moja visiblemente desde el ruedo (multiply 0.13, rodillas en 4.5 s, muslos en 13 s), paraguas pivota en la mano y el brazo se balancea con él, final sincronizado (mano arriba → paraguas llega → bajan juntos → mira a cámara sonriendo tras la línea), cámara 29–30 s con punto intermedio, subtítulos máx. 25 caracteres. Sonido: whoosh del paraguas volando + "ting" de la sonrisa. Re-export completo: 0 pops, un solo corte (43.43 s); master −14.0 LUFS, TP −1.72 dBTP.
