"""Reproducibly trim provided PNG controls using their supplied content bounds."""
import base64, hashlib, io, json
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parent
refs = root / 'refs'
manifest = json.loads((refs / 'assets.json').read_text(encoding='utf-8'))
result = {}
for key, meta in manifest['assets'].items():
    if meta.get('kind') not in ('bot', 'control'):
        continue
    raw = (refs / meta['path']).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == meta['sha256'].lower(), key
    image = Image.open(io.BytesIO(raw)).convert('RGBA')
    b = meta.get('content_bounds')
    if b:
        image = image.crop((b['x'], b['y'], b['x']+b['width'], b['y']+b['height']))
    image.thumbnail((256,256), Image.Resampling.LANCZOS)
    out = io.BytesIO()
    image.save(out, format='PNG', optimize=True)
    result[key] = base64.b64encode(out.getvalue()).decode('ascii')
(refs / 'icons.cropped.json').write_text(json.dumps(result), encoding='utf-8')
print(f'Validated and cropped {len(result)} supplied PNG icons')
