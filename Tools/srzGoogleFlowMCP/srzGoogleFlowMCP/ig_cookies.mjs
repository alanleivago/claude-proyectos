import { chromium } from 'playwright-core';
const b = await chromium.connectOverCDP('http://localhost:9333');
const cs = await b.contexts()[0].cookies('https://www.instagram.com');
console.log('# Netscape HTTP Cookie File\n' + cs.map(c => [c.domain, c.domain.startsWith('.') ? 'TRUE' : 'FALSE', c.path, c.secure ? 'TRUE' : 'FALSE', Math.floor(c.expires > 0 ? c.expires : 2e9), c.name, c.value].join('\t')).join('\n'));
process.exit(0);
