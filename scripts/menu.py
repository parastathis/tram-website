"""Refresh site/src/lib/menu.ts and the product photos from the shop's Orderoo menu.
Run from the project root: python -I scripts/menu.py
"""
import json, re, os, urllib.request
from PIL import Image
URL = 'https://kreopoleio-to-tram.orderoo.gr/el/peiraias/order'
os.makedirs('ref/orderoo/img', exist_ok=True); os.makedirs('site/public/media/p', exist_ok=True)
html = urllib.request.urlopen(urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8')
t = ''.join(json.loads(p) for p in re.findall(r'self\.__next_f\.push\(\[1,(".*?")\]\)</script>', html, re.S))
i = t.find('"initialData":') + len('"initialData":')
d, _ = json.JSONDecoder().raw_decode(t[i:])
json.dump(d, open('ref/orderoo/menu.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
cats = []
for c in d['categories']:
    if not c['products']: continue
    items = []
    for p in c['products']:
        img = None
        if p.get('image'):
            f = f"ref/orderoo/img/{p['id']}.webp"
            if not os.path.exists(f):
                open(f, 'wb').write(urllib.request.urlopen(urllib.request.Request(p['image'], headers={'User-Agent': 'Mozilla/5.0'})).read())
            im = Image.open(f).convert('RGB')
            im.save(f"site/public/media/p/{p['id']}.webp", quality=82, method=6)
            im.resize((640, 360), Image.LANCZOS).save(f"site/public/media/p/{p['id']}-sm.webp", quality=80, method=6)
            img = p['id']
        items.append({'id': p['id'], 'name': p['nameEl'].strip(), 'desc': (p.get('descriptionEl') or '').strip(), 'cents': p['price'], 'sale': p['saleModel'], 'perKg': p.get('perKgCents'), 'grams': p.get('nominalGrams'), 'img': img})
    cats.append({'id': c['id'], 'name': c['nameEl'].strip(), 'items': items})
ts = "// Generated from the shop's Orderoo menu (kreopoleio-to-tram.orderoo.gr). Re-run scripts/menu.py to refresh.\n"
ts += f"export const ORDEROO = '{URL}'\n"
ts += 'export type Product = { id: string; name: string; desc: string; cents: number; sale: string; perKg: number | null; grams: number | null; img: string | null }\n'
ts += 'export type Category = { id: string; name: string; items: Product[] }\n'
ts += 'export const MENU: Category[] = ' + json.dumps(cats, ensure_ascii=False, indent=1) + '\n'
open('site/src/lib/menu.ts', 'w', encoding='utf-8').write(ts)
