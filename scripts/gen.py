"""New editorial photos of the real shop, made in Google Flow (Nano Banana Pro) with the shop's own
Drive photos as the reference for each one (same place, same signs, better light, no clutter).
Sources live in ref/flow/out; this crops them for the site. Run: python -I scripts/gen.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'ref/flow/out'
OUT = ROOT / 'site/public/media/gen'
OUT.mkdir(parents=True, exist_ok=True)

# (source, out name, aspect w/h or None to keep, focus x)   reference photo in the comment
SHOTS = [
    ('tramgen-6.jpg', 'front', None, .5),        # IMG_5802 shopfront
    ('tramgen-6.jpg', 'front-m', 3 / 4, .42),
    ('tramgen-1.jpg', 'interior', None, .5),     # IMG_5812 aisle to the curved counter
    ('tramgen-1.jpg', 'interior-t', 4 / 5, .66),
    ('tramgen-1.jpg', 'interior-m', 9 / 16, .70),
    ('tramgen-4.jpg', 'counter', None, .5),      # IMG_5819 counter with the tram mural
    ('tramgen-3.jpg', 'bag', 4 / 5, .52),        # IMG_5813 the shop bag
    ('tramgen-2.jpg', 'clock', 4 / 5, .25),      # IMG_5817 the clock
    ('tramgen-0.jpg', 'farm-box', None, .5),     # IMG_5811 Farma Elassonas box
    ('tramgen-0.jpg', 'farm-box-t', 4 / 5, .26),
    ('tramgen-5.jpg', 'workshop', 4 / 5, .55),   # IMG_5810 the workshop
]

for src, name, ratio, fx in SHOTS:
    im = Image.open(SRC / src).convert('RGB')
    if ratio:
        w, h = im.size
        cw = min(w, round(h * ratio))
        x = min(max(round(fx * w - cw / 2), 0), w - cw)
        im = im.crop((x, 0, x + cw, h))
    for suffix, width in (('', 1600), ('-sm', 820)):
        out = im if im.width <= width else im.resize((width, round(width / im.width * im.height)), Image.LANCZOS)
        out.save(OUT / f'{name}{suffix}.webp', quality=84, method=6)
    print(name, im.size)
