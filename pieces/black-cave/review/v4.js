window.VIEWS = [];
const out = []; const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
for (let t = 0; t < 4.5; t += 0.25) { window.renderFrame(t, c); const W = world(); W.craw.arms[0].f.forEach((F, i) => { const tp = F.tip, lx = tp.x - CH.x, d = tp.z - (CH.z + chWallZ(lx, tp.y)); if (vcR(lx, tp.y) > 1.2 && d < -0.012 && t > 1.3) out.push(t + ' f' + i + ' ' + d.toFixed(3)); if (d > 0.06 && t > 2.2) out.push(t + ' f' + i + ' floating ' + d.toFixed(3)); }); }
console.log('HOOKCHK ' + JSON.stringify(out));
