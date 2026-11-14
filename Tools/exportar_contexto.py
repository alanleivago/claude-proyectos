"""Junta en un solo .md todo el contexto de trabajo con Claude Code (reglas, memoria,
estilos, estado de piezas, historial de instrucciones del usuario, herramientas) para
migrarlo a otro agente (Antigravity). Solo texto: nada de videos ni binarios.

Uso:  python tools/exportar_contexto.py [salida.md]
Corre igual en Windows y en la Mac (en la Mac genera el historial de sus propias sesiones).
"""
import glob, json, os, platform, re, subprocess, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOME = os.path.expanduser('~')
CL = os.path.join(HOME, '.claude')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'MIGRACION_ANTIGRAVITY.md')
INTRO = os.path.join(ROOT, 'tools', 'exportar_contexto_intro.md')

SECRET = [r'sk-ant-[A-Za-z0-9_\-]{20,}', r'sk-[A-Za-z0-9]{32,}', r'AIza[0-9A-Za-z_\-]{30,}',
          r'ghp_[A-Za-z0-9]{30,}', r'gh[ousr]_[A-Za-z0-9]{30,}', r'xox[bap]-[A-Za-z0-9\-]{20,}',
          r'(?i)((?:api[_-]?key|token|secret|password|contraseña)\s*[:=]\s*["\']?)[A-Za-z0-9_\-\.]{16,}',
          r'\b\d{9,10}:[A-Za-z0-9_\-]{30,}\b']  # token bot telegram
redacted = 0

KNOWN = re.findall(r'[A-Za-z0-9_\-]{20,}', ''.join(open(p, encoding='utf-8', errors='ignore').read()
                    for p in (os.path.join(ROOT, '.env'), os.path.join(HOME, '.freesound.json')) if os.path.exists(p)))

def clean(t):
    global redacted
    for k in KNOWN:
        redacted += t.count(k)
        t = t.replace(k, '[REDACTADO]')
    for p in SECRET:
        t, n = re.subn(p, lambda m: (m.group(1) if m.groups() else '') + '[REDACTADO]', t)
        redacted += n
    return t

def rd(p):
    try:
        with open(p, encoding='utf-8', errors='ignore') as f:
            return f.read()
    except OSError:
        return ''

def sh(cmd):
    try:
        return subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, encoding='utf-8',
                              errors='ignore', shell=isinstance(cmd, str), timeout=120).stdout
    except Exception as e:
        return f'(no se pudo: {e})'

parts = []
def sec(title, body):
    parts.append(f'\n\n---\n\n# {title}\n\n{body.strip()}\n')

def files_block(paths, level='##'):
    b = []
    for p in paths:
        t = rd(p).strip()
        if t:
            rel = os.path.relpath(p, ROOT) if p.startswith(ROOT) else p.replace(HOME, '~')
            b.append(f'{level} `{rel}`\n\n{t}\n')
    return '\n'.join(b)

# 1. Instrucciones
sec('PARTE 1 — Instrucciones permanentes (CLAUDE.md)', files_block([
    os.path.join(CL, 'CLAUDE.md'), os.path.join(ROOT, 'CLAUDE.md'), os.path.join(ROOT, 'CLAUDE.local.md'),
    os.path.join(ROOT, '13 instrucciones para ahorrar tokens en Claude y Claude Code.md')]))

# 2. Memoria
memdirs = sorted(glob.glob(os.path.join(CL, 'projects', '*', 'memory')))
mb = []
for md in memdirs:
    idx = os.path.join(md, 'MEMORY.md')
    mb.append(f'## Índice (`{os.path.basename(os.path.dirname(md))}/memory/MEMORY.md`)\n\n{rd(idx).strip()}\n')
    for p in sorted(glob.glob(os.path.join(md, '*.md'))):
        if os.path.basename(p) != 'MEMORY.md':
            mb.append(f'## memoria: `{os.path.basename(p)}`\n\n{rd(p).strip()}\n')
sec('PARTE 2 — Memoria completa (gustos, correcciones, reglas por estilo, recursos)', '\n'.join(mb))

# 3. Estilos
spec_names = ('STYLE.md', 'ESTILO.md', 'RULES.md', 'FRAMING.md', 'GUIONES.md', 'README.md', 'KIMODO_PC.md', 'ENCUADRE.md')
specs, other = [], []
for p in sorted(glob.glob(os.path.join(ROOT, 'styles', '**', '*.md'), recursive=True)):
    (specs if os.path.basename(p) in spec_names and 'analisis' not in p else other).append(p)
body = 'Especificaciones de cada estilo de video (carpeta `styles/`). Mandan junto con la memoria.\n\n'
body += files_block(specs)
body += '\n## Otros documentos de estilo (en el repo, no copiados aquí por tamaño: catálogos y análisis)\n\n'
body += '\n'.join(f'- `{os.path.relpath(p, ROOT)}` ({os.path.getsize(p)//1024} KB)' for p in other)
sec('PARTE 3 — Estilos de video (specs)', body)

# 4. Piezas
pdirs = sorted([d for d in glob.glob(os.path.join(ROOT, 'pieces', '*')) if os.path.isdir(d)],
               key=os.path.getmtime, reverse=True)
lst = []
for d in pdirs:
    mt = datetime.datetime.fromtimestamp(os.path.getmtime(d)).strftime('%Y-%m-%d')
    docs = [os.path.basename(x) for x in glob.glob(os.path.join(d, '*.md'))]
    lst.append(f'- {mt} `pieces/{os.path.basename(d)}`' + (f' — docs: {", ".join(docs)}' if docs else ''))
estados = sorted(glob.glob(os.path.join(ROOT, 'pieces', '*', 'ESTADO*.md')) +
                 glob.glob(os.path.join(ROOT, 'pieces', '*.md')), key=os.path.getmtime, reverse=True)
sec('PARTE 4 — Piezas (proyectos de video) y su estado',
    '## Todas las piezas (más reciente primero)\n\n' + '\n'.join(lst) +
    '\n\n## Archivos de estado / notas de piezas\n\n' + files_block(estados, '###'))

# 5. Historial de instrucciones del usuario
hist = []
for d in glob.glob(os.path.join(CL, 'projects', '*')):
    for f in glob.glob(os.path.join(d, '*.jsonl')):
        msgs = []
        with open(f, encoding='utf-8', errors='ignore') as fh:
            for line in fh:
                try:
                    o = json.loads(line)
                except ValueError:
                    continue
                if o.get('type') != 'user' or o.get('isMeta') or o.get('isSidechain'):
                    continue
                c = o.get('message', {}).get('content')
                t = c if isinstance(c, str) else '\n'.join(
                    x.get('text', '') for x in (c or []) if isinstance(x, dict) and x.get('type') == 'text')
                t = re.sub(r'<(system-reminder|ide_\w+)>.*?</\1>', '', t or '', flags=re.S).strip()
                if not t or t.startswith(('This session is being continued', '[Request interrupted')):
                    continue
                if t.startswith('<') and re.match(r'<(command-|local-command|task-notification|bash-)', t):
                    continue
                msgs.append((o.get('timestamp', ''), t))
        if msgs:
            hist.append((msgs[0][0], os.path.basename(d), msgs))
hist.sort()
hb = [f'Todos los mensajes que el usuario escribió en {len(hist)} sesiones de Claude Code en esta máquina '
      f'({platform.system()}), en orden cronológico. Las instrucciones más recientes mandan sobre las viejas.\n']
for ts, d, msgs in hist:
    hb.append(f'\n## Sesión {ts[:10]} — `{d[:60]}`\n')
    for t, m in msgs:
        m = m if len(m) < 4000 else m[:4000] + ' […recortado]'
        hb.append(f'- **{t[:16].replace("T", " ")}** — ' + m.replace('\n', '\n  '))
sec('PARTE 5 — Historial completo de instrucciones del usuario (todas las sesiones)', '\n'.join(hb))

# 6. Herramientas / entorno
mcp = []
try:
    cj = json.loads(rd(os.path.join(HOME, '.claude.json')) or '{}')
    servers = dict(cj.get('mcpServers', {}))
    for k, v in cj.get('projects', {}).items():
        servers.update(v.get('mcpServers', {}))
    for k, v in servers.items():
        mcp.append(f'- **{k}** — {v.get("type", "stdio")}: `{v.get("url") or (v.get("command", "") + " " + " ".join(v.get("args", [])))}`')
except ValueError:
    pass
skills = []
for base in (os.path.join(CL, 'skills'), os.path.join(ROOT, '.claude', 'skills')):
    for p in sorted(glob.glob(os.path.join(base, '*', 'SKILL.md'))):
        m = re.search(r'^description:\s*(.+)$', rd(p), re.M)
        skills.append(f'- `{p.replace(HOME, "~")}` — {(m.group(1) if m else "")[:220]}')
mine = [os.path.join(ROOT, '.claude', 'skills', 'ver-youtube', 'SKILL.md')] + \
       [os.path.join(CL, 'skills', s, 'SKILL.md') for s in ('real-sfx', 'humanizer', 'earshot')]
tools = []
for p in sorted(glob.glob(os.path.join(ROOT, 'tools', '*.py')) + glob.glob(os.path.join(ROOT, 'tools', '*.js'))):
    m = re.search(r'^\s*(?:"""|\'\'\'|//|#)\s*(.+)$', rd(p), re.M)
    tools.append(f'- `tools/{os.path.basename(p)}` — {(m.group(1) if m else "")[:160]}')
body = '## Servidores MCP configurados\n\n' + '\n'.join(mcp)
body += '\n\n## Scripts propios en `tools/`\n\n' + '\n'.join(tools)
body += '\n\n## Skills instaladas\n\n' + '\n'.join(skills)
body += '\n\n## Texto completo de las skills propias más usadas\n\n' + files_block(mine, '###')
body += '\n\n## Notas para la otra máquina (para_pc/LEEME.md)\n\n' + rd(os.path.join(ROOT, 'para_pc', 'LEEME.md'))
body += '\n\n## Grafo base (decisiones y aprendizajes registrados)\n\n' + \
        sh('base decision search --keyword a') + '\n' + sh('base recall --keyword e')
sec('PARTE 6 — Herramientas, MCP, skills y entorno', body)

# 7. Git
body = '## Remoto\n\n```\n' + sh('git remote -v') + '```\n\n## Historial de commits\n\n```\n' + \
       sh('git log --date=short --pretty=format:"%ad %h %s"') + '\n```\n\n## Cambios sin commitear al generar este archivo\n\n```\n' + \
       sh('git status --short') + '```\n\n## Estructura de primer nivel\n\n' + \
       '\n'.join(f'- `{x}`' for x in sorted(os.listdir(ROOT)) if not x.startswith('.git'))
sec('PARTE 7 — Repositorio git', body)

head = rd(INTRO).replace('{{FECHA}}', datetime.date.today().isoformat()).replace('{{MAQUINA}}', platform.system())
txt = clean(head + ''.join(parts))
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(txt)
print(f'{OUT}: {len(txt)//1024} KB, {len(hist)} sesiones, {sum(len(h[2]) for h in hist)} mensajes, {redacted} secretos redactados')
