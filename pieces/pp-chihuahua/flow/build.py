# Inlines assets/*.png into src.html -> index.html
import base64, json
from pathlib import Path
D = Path(__file__).parent
assets = {p.stem: 'data:image/png;base64,' + base64.b64encode(p.read_bytes()).decode() for p in sorted((D / 'assets').glob('*.png'))}
(D / 'index.html').write_text((D / 'src.html').read_text(encoding='utf-8').replace('/*ASSETS*/', json.dumps(assets)), encoding='utf-8')
print('index.html', len(assets), 'assets')
