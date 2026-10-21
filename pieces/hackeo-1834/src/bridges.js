// =====================================================================
//  ERAS, RESOLUTIONS, CAMERAS, (NO) BRIDGES — el primer hackeo. One era per beat, all at 270x480 (4 px pixels);
//  every era boundary is a hard cut. The world moves, not the camera.
// =====================================================================
const ERA_BG = SHOT_LIST.map(() => DOC.bar);
const ERA_RES = SHOT_LIST.map(() => DOC_RES);
const ERA_POST = SHOT_LIST.map(() => null);
function pieceCam() { return null; }
const BRIDGES = [];
