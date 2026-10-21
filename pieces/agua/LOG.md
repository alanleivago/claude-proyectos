# LOG — agua

## Run 1 (2026-10-18)
- New for this piece (raises the pov3d bar):
  - **People:** skinned smooth bodies (skinbody.js), with tube rings blended across joints and clothes as vertex colours. Fingered hands, soled shoes, a new walk (pelvis twist, counter-rotating shoulders, stance knee flex, lagging elbows).
  - **Grass:** 120k instanced tufts of tapered blades in the wind.
  - **Trees:** trees from dense leaf cards.
  - **Puppy:** shell fur, 18 shells.
  - **Glass:** a transmissive glass with water.
  - **Water:** a wave shader with real planar reflections (a mirrored camera into a render target), plus fbm-noise clouds.
  - **Scenery:** a terrain shore, textured facades with shutters and balconies.
  - **Small life:** sparrows, a flock, blowing leaves.
  - **The sea's return:** a plunging-breaker ribbon, spray and mist points, a flooded-promenade sheet, lens drops.
  - **Look:** a lens flare, and +32 % saturation in renderStage.
- **Bug:** scaled people (kids) were bound with a stale matrixWorld. Fixed by calling root.updateMatrixWorld(true) after adding the skinned mesh, before bind().
- **Render:** about 8 s/frame (reflection pass, fur, grass), 1752 frames in about 2.5 h over 6 chunks.
- **QA:** first run failed picture IMPACT (flash too weak) and hero body (lows masked).
  - Raised the impact flash to 0.95.
  - High-passed the rush, crash and groyne layers at 260 Hz and the return roar at 320 Hz.
  - Result: QA PASSED (sync 0 frames, -15.4 LUFS, TP -2.4).
- **Review:** story arc 5/5, text PASS. Dead-beat WARN on the static end card (as usual).
