// f1motion style kit: constants measured from the reference reel (IG DdolSnYt_iX, 1080x1920, 24 fps)
// and the user's 16 screenshots. Used by pieces/*/prep/gen.py (mirrored there as Python constants).
export const F1M = {
  canvas: { w: 1080, h: 1920, fps: 24 },
  graphicsFps: 12,       // FINAL: 12 fps on graphics, zooms and transitions (8 was tested and rejected). Style APPROVED (v4 + 12 fps)
  status: "approved",
  broll: { share: 0.32, lineScreen: { orientation: "vertical", periodPx: 8, profile: "sine", amp: 0.10, static: true },
           contrast: 1.3, grain: 7, blurInFrames: 2, setsar: 1, objectFit: "cover",
           caption: { font: "Poppins SemiBold", size: 110, x: 114, y: 1110, color: "#FFFFFF", shadow: "0 3px 18px rgba(0,0,0,.6)", fadeFrames: 3 } },
  assets: "objects (vehicles, jerseys, sneakers, ball, box, house, coin, chevrons, emoji hands) come from Google Flow with reel crops as style refs; pixel sprites = Flow art mosaicked (NEAREST, ~26 blocks)",
  faces: { grayscale: true, heldOnTwos: true, onBody: "inside the gold octagon; jersey hangs from its bottom vertex" },
  shadowEllipse: ["#3FAE8A", "#7FCFB3", "#C9EDE0"],
  // vertical safe zones: IG/TikTok UI covers the bottom ~280 px and the right ~140 px; top 168 px = status bar
  safe: { top: 168, bottom: 1640, right: 940, left: 60, textBand: [168, 1330] },

  color: {
    bg: "#FDFDFB",            // flat off-white of every graphic scene
    ink: "#111111",           // display type
    thin: "#222222",          // thin lead-in type
    ghost: "#C9C9C9",         // words before they are spoken (reel: #9A9A9A-#BBBBBB)
    teal: "#76BBAB", tealDeep: "#3E9D86", tealLight: "#CDEDE4", tealDot: "#5FB39C",
    tealFloor: ["#D6EFE8", "#A9DACD"],     // halftone floor gradient (sampled #ABDACF -> #72BFA9)
    gold: ["#F1DEA8", "#E6C470", "#DDB75A"], // pill gradient (sampled #E6D198 / #E1BE5B)
    goldLane: ["#F3E8C0", "#D9B968"],
    cream: "#FBF3E1", creamDot: "#EED9A9",  // list halftone bars
    red: "#EA2C26",                         // red full-screen scene (sampled #EB2D25)
    redDark: ["#B81D1A", "#8E1512"],        // corner parallelograms
    stickyRed: ["#F3413D", "#F07C88"], stickyGold: ["#E3C675", "#D7B159"], stickyTeal: ["#8FD0BF", "#4AAB90"],
    marker: "#E8312B",                      // hand-drawn circles / strikes
    card: "#151515", cardRow: "#E6E3E6", click: "#3E9D86",
    pillInk: "#3D3A3F",
  },

  font: {
    // reel display face = extended futuristic unicase caps (notched n/d). Closest local/free: Turret Road ExtraBold
    // stretched scaleX(1.30) + 2 px text-stroke for weight.
    display: { family: "Turret Road ExtraBold", file: "TurretRoad-ExtraBold.ttf", scaleX: 1.30, stroke: 2 },
    thin: { family: "Poppins Light", file: "Poppins-Light.ttf" },       // "let's do a", "everyone is"
    label: { family: "Poppins Medium", file: "Poppins-Medium.ttf" },    // gold pill text
    caption: { family: "Poppins Regular", file: "Poppins-Regular.ttf" },// talking-head captions
    script: { family: "Photograph Signature", file: "signature.ttf" },  // "Carlos" style script over a name
  },

  size: {               // font-size px at 1080 wide
    thinLead: [50, 64],  // cap ~35-45 px
    hero: [110, 190],    // display hero; auto-fit to <= 900 px wide after the 1.3 stretch
    stackLine: 104,      // red-scene outline stack
    caption: 50,         // TH captions, white, y = 420 (below the Stimulus neon), hard swap
    pill: [300, 104],    // w x h, text 34 px, 2 lines
    tab: [900, 320],     // teal notched tab behind 2 display lines
  },

  calendar: { cell: 600, sticky: 596, tilt: -14, peel: { kind: "curved page curl (svg path + clipPath, highlight band, drop shadow)", from: 640, to: 78, dur: 0.5, ease: "power2.out", scaleFrom: 1.18, breathe: [78, 96] } },
  walker: { octagon: ["#EBD49A", "#D4AE55"], outline: "#3A3A3A", legGradient: ["#6F6F6F", "#E2E2E2"], legWidth: 13, armGradient: ["#5E5E5E", "#DCDCDC"], armWidth: 11, shadesDropOnce: true,
            text: { right: 930, thin: 44, hero: 112, second: 78 } },
  layout: {
    titleTop: [190, 520],  // thin line top, display lines 80-140 px below it
    floorTop: 1250,        // halftone floor horizon (reel y = 61-65 %)
    walkerTextRight: 1000, // right-aligned word stack beside a walker (x 57-92 %)
  },

  ease: {
    arrive: "power3.out", leave: "power3.in", pop: "back.out(2.2)", peel: "back.out(1.6)",
    pan: "power2.inOut", bob: "sine.inOut", push: "none",
  },

  motion: {             // seconds (all tweens snapped to the 1/12 s grid)
    wordReveal: 0.17,    // ghost -> ink (4 frames), thin words also rise 6 px
    pillPop: 0.21,       // scale .4 -> 1 with overshoot
    tabWipe: 0.25,       // clip-path from centre
    vehicleIn: 0.42, vehicleOut: 0.20,
    settle: { from: 1.32, blur: 12, dur: 0.30 },   // zoom-out settle with defocus on scene entry
    push: 0.04,          // +4-6 % slow push over a shot
    bob: { amp: 9, period: 1 / 3 },                 // face bob ±8-10 px; half-cycle 1/6 s = 2 steps at 12 fps
    wing: { deg: 8, period: 1 / 3 },                // chevron flap (Flow chevron PNG)
    strokeDraw: 0.42, peel: 0.30, rowCascade: 0.09, cursorGlide: 0.45,
    shot: { median: 1.75, max: 3.5 },
  },

  sfx: {   // per event, volume under a -15 LUFS voice
    pop: 0.25, whoosh: 0.30, car: 0.40, sticker: 0.45, marker: 0.40, click: 0.55, coin: 0.35, riser: 0.10,
    musicBed: 0.13, musicOutro: 0.30, music: "user library: Dr Delight - Feel It (instrumental), from 4 s",
  },

  scenes: [
    "name-on-vehicle", "jersey-callout", "walker", "calendar-stickers", "red-stack", "face-on-kit",
    "pill-tab-pixel-road", "top-down-lane", "manga-burst", "pixel-delivery", "talking-head", "ui-card-cursor",
    "pixel-to-real", "strip-list", "close-up-stack", "cta-button",
  ],
  // ---- building blocks learned from the 4 extra reels (styles/f1motion/CATALOGO.md) ----
  blocks: {
    selectionSweep: { color: ["#1A56DB", "#2F6FEB"], text: "#FFFFFF", wordsPerStep: [2, 3], stepFrames: 6, punch: 2.2, punchFrames: [2, 4],
                      pageScroll: [0.12, 0.25], push: [1.15, 1.25], darkPage: "#0E0E18" },
    flashBurst: { cutFrames: [2, 6], tailFrames: [1, 2], holdFrames: [6, 8], stutterZoomOut: { cuts: 4, frames: 4 } },
    zoomThrough: { scale: [1.4, 3.5], ease: "power3.in" },
    nodeGraph: { node: "#E0566A", nodeWidth: 0.25, connector: "#E3CB85", connectorPx: 6 },
    speechBubble: { colors: ["#52C39B", "#E8CB6C", "#B9CEDD", "#E04A5E", "#5DC9A3"], pop: "back.out(2)", settleRotation: [-6, 0] },
    stamp: { wash: ["#7A0000", "#4A0000"], base: ["#2B2B2B", "#3A3A3A"] },
    retroPhone: { header: "#4DB992", highlight: "#F5EBCB" },
    bw: { black: "#0B0B0B", mid: "#7A7A7A", high: "#E8E8E8" },
  },
  catalog: [  // scene types (CATALOGO.md numbering); ref frames in styles/f1motion/ref_frames/<reel>/
    "talking-head", "bw-broll", "meme-caption", "flash-burst", "walker", "vehicle", "name-stack-card", "pill-tab",
    "hero-prop", "album-sleeve", "face-pop-orbit", "node-graph", "timeline-rail", "strip-list", "article-sweep",
    "ui-card", "phone-ui", "speech-bubble", "pixel-to-real", "map-polaroid", "photo-card-dark", "quote-silhouette",
    "kinetic-type", "top-down", "lower-third", "logo-sticker-peel", "puzzle-snap", "detail-crop", "ui-tour-canceled", "zoom-through",
    "camera-chain", "silhouette-match-cut", "glitch-brand-reveal",   // added by the 12 fps shot-level pass
  ],
};
