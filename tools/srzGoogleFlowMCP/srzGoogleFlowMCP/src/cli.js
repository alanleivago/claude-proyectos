#!/usr/bin/env node
// srz-google-flow-mcp CLI. Usage (from the project folder):
//   node src/cli.js chrome                            start the dedicated Flow Chrome (sign in once)
//   node src/cli.js setup --from-profile "Profile 2"  macOS: copy an existing Chrome profile once
//   node src/cli.js project new | project set <id> | project show
//   node src/cli.js upload <file> [--name avatar] [--replace]   upload a local file as a named asset
//   node src/cli.js assets                            list the project's assets by name
//   node src/cli.js "prompt with @{avatar}" [--aspect 9:16] [--count 2] [--model pro|2|lite] [--out DIR]
//   node src/cli.js --prompt-file prompt.txt [...]    same, reading a (multi-line) prompt from a file
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { ensureChrome, copyProfile, userDataDir } from './chrome.js';
import { generateImages, generateVideo, newProject, writeState, getProjectId, uploadFile, listAssets, DEFAULT_OUT } from './flow.js';

const USAGE = `Usage:
  node src/cli.js "prompt" [--aspect 1:1|16:9|9:16|4:3|3:4] [--count 1-4] [--model pro|2|lite] [--out DIR]
  node src/cli.js --prompt-file FILE [same options]
  node src/cli.js upload FILE [--name NAME] [--replace]
  node src/cli.js assets
  node src/cli.js chrome | setup --from-profile NAME | project new|set ID|show

In prompts, @{name} references the uploaded asset called "name".`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    aspect: { type: 'string', default: '1:1' },
    count: { type: 'string', default: '1' },
    model: { type: 'string', default: '2' },
    out: { type: 'string', default: DEFAULT_OUT },
    'prompt-file': { type: 'string' },
    name: { type: 'string' },
    replace: { type: 'boolean', default: false },
    'from-profile': { type: 'string' },
    json: { type: 'boolean', default: false },
    duration: { type: 'string', default: '8' },
    mode: { type: 'string', default: 'ingredients' },
  },
});

const [cmd, arg1, arg2] = positionals;

try {
  if (cmd === 'chrome') {
    const r = await ensureChrome();
    console.log(r.started ? `Chrome started (profile: ${userDataDir()}). Sign in to Google/Flow there if needed.` : 'Chrome already running.');
  } else if (cmd === 'setup') {
    if (!values['from-profile']) throw new Error('Use: node src/cli.js setup --from-profile "Profile 2"');
    console.log(`Copied profile to ${copyProfile(values['from-profile'])}`);
  } else if (cmd === 'project') {
    if (arg1 === 'new') console.log(`New project: ${await newProject()}`);
    else if (arg1 === 'set' && arg2) { writeState({ projectId: arg2 }); console.log(`Project set: ${arg2}`); }
    else console.log(getProjectId() || '(none yet, one is created on first use)');
  } else if (cmd === 'upload') {
    if (!arg1) throw new Error('Use: node src/cli.js upload FILE [--name NAME] [--replace]');
    const r = await uploadFile({ filePath: arg1, name: values.name, replace: values.replace });
    console.log(r.reused ? `"${r.name}" already exists, reused it (use --replace to upload again)` : `✓ uploaded as "${r.name}"`);
  } else if (cmd === 'video') {
    // node src/cli.js video --prompt-file p.txt [--aspect 9:16] [--duration 8] [--model omni] [--mode ingredients|frames] [--out DIR]
    const prompt = values['prompt-file'] ? fs.readFileSync(values['prompt-file'], 'utf8') : positionals.slice(1).join(' ');
    // Cuenta de créditos (Omni Flash = 10 por clip). Archivo: pieces/_creditos.json {limite, costo, gastado, clips, fallidos}
    // Una cuenta = un archivo: correoderecuperacion496 -> _creditos.json; las demás -> _creditos_<usuario>.json
    const { FLOW_ACCOUNT } = await import('./chrome.js');
    const acct = FLOW_ACCOUNT.split('@')[0];
    const LEDGER = new URL(acct === 'correoderecuperacion496' ? '../../../../pieces/_creditos.json' : `../../../../pieces/_creditos_${acct}.json`, import.meta.url);
    const led = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf8')) : { cuenta: FLOW_ACCOUNT, limite: 0, costo: 10, gastado: 0, clips: 0, fallidos: 0 };
    if (led.limite && led.gastado + led.costo > led.limite) { console.log(`LIMITE DE CREDITOS: gastado ${led.gastado} de ${led.limite}`); process.exit(3); }
    const saveLed = () => fs.writeFileSync(LEDGER, JSON.stringify(led, null, 2));
    let r;
    try {
      r = await generateVideo({ prompt, aspect: values.aspect === '1:1' ? '9:16' : values.aspect, duration: Number(values.duration),
        model: values.model === '2' ? 'omni' : values.model, mode: values.mode, count: Number(values.count), outDir: values.out });
    } catch (e) { led.fallidos++; saveLed(); throw e; }
    if (r.files.length) { led.gastado += led.costo; led.clips++; } else led.fallidos++;
    saveLed();
    console.log(`creditos: ${led.gastado}/${led.limite}`);
    console.log(`✓ ${r.files.length} video(s) in ${r.seconds}s (${r.model}, ${r.aspect}, ${r.duration}s)`); r.files.forEach((f) => console.log(f));
  } else if (cmd === 'assets') {
    (await listAssets()).forEach((a) => console.log(a.name));
  } else if (cmd || values['prompt-file']) {
    const prompt = values['prompt-file'] ? fs.readFileSync(values['prompt-file'], 'utf8') : positionals.join(' ');
    const r = await generateImages({
      prompt,
      aspect: values.aspect,
      count: Number(values.count),
      model: values.model,
      outDir: values.out,
    });
    if (values.json) console.log(JSON.stringify(r));
    else { console.log(`✓ ${r.files.length} image(s) in ${r.seconds}s (${r.model}, ${r.aspect})`); r.files.forEach((f) => console.log(f)); }
  } else {
    console.log(USAGE);
  }
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
