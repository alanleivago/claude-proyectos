// docucollage style kit: constants measured from 4 IG reels (DIV6ZPFIx3y GOLD, DHt949poQGJ JAM, DHgssOYoF6v DK, DF0jP-vIYlk ARR; 25 fps).
// Used by pieces/*/prep/gen.py (mirrored there as Python constants). Spec: styles/docucollage/ESTILO.md, types: CATALOGO.md.
// v2 (2026-11-10, reel-1 rebuild + user feedback) overrides: see V2 below and REEL1_FRAME_ANALISIS.md
export const V2 = {
  ref: "reel 1 DIV6ZPFIx3y (YouTube 1080p alLf0hN5JsQ)", render: { fps: 24 }, graphicsFps: 12, measuredFps: 10,
  title: { cond: "Bebas Neue + 2px stroke, tracking .2em", hero: "Besley 900", color: "#FFD08D", shadow: "+0.1*size / +0.09*size #422F1A (10/9 px at cap 100)",
           wiggle: { xPx: 3, yPx: 2.1, rotDeg: 1.8, newPoseEveryStep: true, perLetter: true }, shine: { pxPerSec: 1000, bandPx: 200, angleDeg: 105, passes: 1 },
           typeFramesPerLetter: { cond: 1, hero: 2 }, newestLetterOpacity: 0.45, thDropInPx: 100, hand: "Covered By Your Grace (marks only)", numbers: "same fonts, never Montserrat" },
  caption: { fill: "#FBF5E5", h: 86, radius: 30, font: "Poppins Bold 44px", up: "#CFC8B6", done: "#1B1B1B", fill_per_word: "crossfade over the word duration (0.12-0.4 s)", y: { graphicsRun: 900, fromTalkingHead: 1384 } },
  host: { th: "assets/th_big.mp4", cutout: "assets/cutout_big.webm", crop: [654, 1164, 273, 690], scale: 1.65, never: ["tinted", "alone on a graphic background"], bottomInFrontOfScene: { y: 740 } },
  transitions: { deblurPx: 18, deblurSec: 0.26, whipOut: { blurPx: 18, dx: -100, sec: 0.16 }, dissolveToTH: "scene fades out over a constant host cutout, 0.29 s" },
  layers: { entry: "expo.out, no overshoot", parallax: { bg: 0.3, subject: 1.25, title: 1.4 }, pop: "1-frame x1.28 then ease to 1.0", hanging: "damped pendulum", burst: [1.08, 1.15, 1.21, 1.24, 1.28] },
  censor: { source: "tools/face_eyes.py (MediaPipe landmarks)", feather: "box-shadow 0 0 12px 7px", styles: ["solid", "smudge", "torn-paper (todo)"] },
  rules: ["persons complete (whole body or leaving through the bottom edge)", "never repeat an image", "every layer moves", "<40 filter/clip/radial elements"],
};
export const DOCU = {
  canvas: { w: 1080, h: 1920, renderFps: 30 },
  graphicsFps: 10,          // measured: frame-diff cadence x__x_ (3,2,3,2 at 25 fps) in every graphics/collage shot; footage 25 fps
  stepClock: "graphics tweens on tlg, seeked to floor(t*10)/10 by a driver tween on tl; TH video, host cutouts, TH push-ins and captions smooth on tl",
  safe: { top: 168, bottom: 1640, right: 940, left: 60, textBand: [168, 1330], centredTitleMaxW: 800 },
  rhythm: { shotsPerMin: 40, meanShot: 1.48, share: { talkingHead: 0.41, hostCutout: 0.20, photoCollage: 0.37, transitions: 0.02 },
            titleLead: [0.1, 0.6], eventEvery: [2, 3],
            transitions: { hardCut: 0.65, blurDissolve: 0.15, tornPaper: 0.07, slidePushCircle: 0.05, hostPop: 0.05, organic: 0.03 } },

  caption: { fill: "#FDF9ED", h: 103, radius: 16, padX: 42, centreY: 1390, font: "Poppins Bold", size: 54,
             upcoming: "#CFCAC0", current: "#3C3830", spoken: "#000000", maxWords: 4, maxChars: 22, swapLead: 0.1,
             variants: { white: { fill: "#FFFFFF", upcoming: "#A8A8A8" } }, z: "top of everything" },

  type: {
    label: { font: "Bebas Neue", tracking: "0.2em", size: [74, 96], color: ["#EFE7D8", "#EBCB86", "#F2DE2E"], charsPerStep: [2.5, 3] },
    hero: { font: "Lora Bold", case: "upper", size: [130, 236], gradient: ["#F6DA92", "#E2B566", "#B9853A"], shadow: "4px 5px 0 rgba(20,12,6,.55)",
            charsPerStep: 1, newestLetterOpacity: 0.45, variants: { cream: "#EFE7D8", yellow: "#F2DE2E", red: "#E8321F" } },
    digits: { font: "Montserrat ExtraBold", gradient: "hero", charsPerStep: 1, newestOpacity: 0.3 },
    mono: { font: "Courier Prime Bold", color: "#F2E04A", size: [56, 66], x: 84, charsPerStep: [2, 3], topGradient: { color: "rgba(10,10,10,.62)", h: 430, fadeIn: 0.3 } },
    hand: { font: "Gaegu Bold", color: "#D8232A", wipeSteps: 4 },
    behindHost: "hero line sits behind the host cutout (z 10 scene < z 20 cutout); dim the real room (.dim #08080A .72->.25) when it is busy",
  },

  photo: {
    treat: { contrast: [1.15, 1.3], halftone: { pitchPx: 6, angle: 45, mix: 0.42 },
             duotone: { bw: ["#141414", "#F0F0EE"], sepia: ["#2A1C12", "#F1E4CC"], teal: ["#13272A", "#CFE2DC"] }, faded80s: "colour, no treatment" },
    censorBar: { color: "#050505", w: "face width x ~0.95", h: "bar w x 0.18", parent: "photo layer (rides the push)", variant: "white rough brush (ARR)" },
    cutout: "rembg birefnet-general on Flow images; no outline; contact drop-shadow 0 14-22px 12-18px rgba(0,0,0,.45) on props only",
  },

  bg: {
    halftone: "radial dots rgba(0,0,0,.26) 1.4px, pitch 7px, rotated 45deg, opacity .75", vignette: "radial transparent 55% -> rgba(0,0,0,.42)", dust: "38 white specks 3-5px .25-.6",
    gradients: { maroon: ["#2E2224", "#7A5558"], docMaroon: ["#6E3A3A", "#4E2628"], navy: ["#0E2038", "#2F5B8C"], purple: ["#5547A6", "#3B2F86"],
                 dusk: ["#0E1526", "#D9722E"], blue: ["#4F6EB8", "#1F3A85"], teal: ["#1D4254", "#2C5A6B"], greyHalftone: "#BEBFC1", crimson: ["#7A2233", "#D9707F"] },
    sun: { color: "#D42A30", d: [1100, 1250], top: "behind the subject's head, y 520-760", popSteps: 1, rise: "~7 %/s" },
  },

  motion: {   // steps are 0.1 s
    cutoutRise: { steps: 5, ease: "power3.out", overshoot: 0 },
    hostPopUp: { steps: 4, scale: [1.0, 1.42], origin: "50% 100%", ease: "back.out(1.2)" },
    hostSink: { steps: [4, 5], ease: "power2.in", dy: 1100 },
    propPop: { steps: 2, scale: [0.4, 1], ease: "back.out(1.8)", onePerStep: true },
    propDrop: { steps: 2, ease: "power2.in", bounce: 16 },
    stepZoom: { steps: 4, scale: [1, 1.4], ease: "power2.inOut" },
    exitZoom: { steps: 3, scale: 1.34, ease: "power2.in" },
    push: { default: 0.04, shortStill: [0.08, 0.12] },
    blurIn: { sigma: [22, 24], steps: 2, how: "pre-blurred copy fading out (no CSS filters on footage)" },
    circleReveal: { first: "0 -> 36% in 1 step", fill: "130% in 2 steps", halftone: true },
    tornPaper: { steps: 3, frames: [[640, 1440], [-60, 1440], [-60, 1990]], rim: "#F2EEE4 7px", shadow: "0 8px 10px rgba(0,0,0,.4)", paper: "colour of the next scene bg" },
    marker: { circleSteps: 4, strokeSteps: 2, width: [9, 18], color: "#D8232A" },
    appTile: { pop: "hard (1 frame)", outline: "#C6F200 9px", traceSec: 0.7, closeSfx: "click" },
    thPush: { per: [1.0, 1.07], jumpCut: [1.08, 1.14] },
  },

  sound: {
    mix: { lufs: -14.4, lra: [1.8, 2.3], cutsWithOnset100ms: [0.88, 0.97] },
    music: "low corporate / tech-house bed, vocal chops, 'confident & cool', no clear pulse; test: Matt Wigton 'A La Mode' (user library) at 0.11",
    sfx: { pop: "element pops", whoosh: "transitions / host moves", rip: "torn paper (Freesound 170311 CC0)", key: "each typing step (kit/key 539146, 348238)",
           scribble: "marker draws (Freesound 257518 CC0)", hit: "hard cuts into photos, hero word lands (kit/hit 710368)", riser: "before a reveal", click: "tile outline closes / toggle" },
  },

  build: {
    flow: "vintage people (B&W studio photos), documents, vouchers, products (jerseys, jacket, cash), places (store front, field), family photos; refs = reel crops in pieces/docucollage-test/flow/ref",
    code: "titles, captions, halftone, gradients, sun, torn paper, censor bars, marks, tiles, toggles, all motion",
    hostCutout: "cutout.webm (raw matte); sepia version via ffmpeg colorchannelmixer -> cutout_sep.webm",
    videoLayers: "every <video> in a root-level wrapper (never inside a data-start element)",
  },

  // scene blocks used in pieces/docucollage-test (see CATALOGO.md types 1-22)
  blocks: {
    titleBehindHost: { types: [4, 7], layers: ["TH video z5", ".dim", "title z10", "cutout z20"] },
    circleToCollage: { types: [19, 8, 12], seq: "circle reveal behind host -> host drops out -> cutout rises, sun pops, digit build" },
    docZoomMark: { types: [17, 7, 5, 22, 15], seq: "torn paper -> sepia host in front of doc -> mono label -> host sinks + 4-step zoom -> typed line -> marker circle" },
    hostPopProps: { types: [8, 4, 13], seq: "host pops up over navy, title behind, props pop one per noun" },
    photoMark: { types: [9, 10, 15, 18], seq: "blur-in duotone photo, censor bar, marker ellipse on the keyword" },
    heroCard: { types: [17, 16, 15], seq: "torn paper -> big serif word, hero product drops, second word snaps up, handwritten mark" },
    colourwayGrid: { types: [13, 4], seq: "6 colourways pop one per step, gold '+$' tags one step later" },
    appTile: { types: [14], seq: "white tile over TH, emoji/toggle, lime outline trace, click" },
    listLabels: { types: [9, 12, 5, 21], seq: "one image per phrase (0.6-1.5 s) + mono label on a top gradient" },
    quoteCard: { types: [5, 7, 13], seq: "torn paper -> blue card, host cutout low, mono quote 2 chars/step, prop pop" },
  },
};
