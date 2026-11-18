import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const b = await chromium.launch(), p = await b.newPage(); p.on('pageerror', (e) => console.error(e.message)); await p.goto(pathToFileURL(path.resolve('index.html')).href + '?export=1'); await p.waitForFunction(() => window.TIMELINE && window.renderFrame);
console.log(await p.evaluate((code) => eval(code), process.argv[2])); await b.close();
