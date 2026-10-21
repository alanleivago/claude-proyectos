// =====================================================================
//  ERAS, RESOLUTIONS, CAMERAS, (NO) BRIDGES — galaxia. One era per beat, all at 360x640 (3 px pixels);
//  beats are joined by pixel-mosaic zooms drawn inside the scenes.
// =====================================================================
const ERA_BG = SHOT_LIST.map(() => DOC.bar);
const ERA_RES = SHOT_LIST.map(() => SP_RES);
const ERA_POST = SHOT_LIST.map(() => null);
function pieceCam() { return null; }
const BRIDGES = [];
