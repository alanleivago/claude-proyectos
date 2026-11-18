// lettering sample sheet: every bubble type, both caption colours, the phone screen and loud/quiet SFX, staggered entries
window.TIMELINE = { width: W, height: H, fps: FPS, duration: 6, frames: 144 };
const ITEMS = [
  { at: 0.2, f: drawCaption, it: { kind: 'caption', text: 'Leonida Penitentiary. Lucia learned to fight before she learned to read.', x: 40, y: 36, color: 'yellow' } },
  { at: 0.5, f: drawBubble, it: { kind: 'bubble', type: 'normal', text: "You look good, Lu.", x: 330, y: 330, tx: 250, ty: 520 } },
  { at: 0.8, f: drawBubble, it: { kind: 'bubble', type: 'shout', text: "And you'd have run! You've been running since you were fifteen!", x: 1030, y: 300, tx: 980, ty: 540 } },
  { at: 1.1, f: drawBubble, it: { kind: 'bubble', type: 'whisper', text: 'Then this should be easy.', x: 1600, y: 300, tx: 1700, ty: 500 } },
  { at: 1.4, f: drawBubble, it: { kind: 'bubble', type: 'phone', text: 'First check-in, Caminos. What\'s he doing?', x: 360, y: 660, tx: 120, ty: 900 } },
  { at: 1.7, f: drawBubble, it: { kind: 'bubble', type: 'radio', text: '...confirm C.I. Caminos... C.I. Caminos...', x: 980, y: 700, tx: 900, ty: 940 } },
  { at: 2.0, f: drawBubble, it: { kind: 'bubble', type: 'thought', text: "Mamá's still waiting in that apartment.", x: 1580, y: 690, tx: 1760, ty: 950 } },
  { at: 2.3, f: drawCaption, it: { kind: 'caption', text: 'Six weeks later.', x: 1420, y: 960, color: 'pink', from: 'right' } },
  { at: 2.5, f: drawCaption, it: { kind: 'caption', type: 'phonescreen', text: 'Friday. Morning. Raul Bautista.', x: 560, y: 930 } },
  { at: 2.8, f: drawSFX, it: { kind: 'sfx', text: 'KA-CHUNK', x: 1380, y: 120, size: 140, rot: 0.08 } },
  { at: 3.1, f: drawSFX, it: { kind: 'sfx', text: 'bzzzt... bzzzt', x: 640, y: 540, rot: -0.1 } },
  { at: 3.3, f: drawSFX, it: { kind: 'sfx', text: 'BLAM BLAM', x: 1480, y: 545, size: 120, rot: -0.15, colors: ['#FFFFFF', '#FF8A3D'] } },
];
function frame(g, T) {
  g.drawImage(ASSETS['bg_motel_room.jpg'], 0, 0, W, H);
  g.fillStyle = 'rgba(30,14,40,0.35)'; g.fillRect(0, 0, W, H);
  for (const I of ITEMS) I.f(g, Object.assign({ seed: ltHash(I.it.text) }, I.it), T - I.at, 0);
}
