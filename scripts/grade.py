"""One grade for every real photo of the shop, so the set reads as one shoot.

Real photos only (Drive + the shop's Facebook). Nothing is painted in or removed:
white balance, levels, a gentle curve, a little warmth and sharpening, then the same crops.
Run: python -I scripts/grade.py
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
DRIVE = ROOT / 'assets/drive/Butcher'
FB = ROOT / 'assets/fb'
OUT = ROOT / 'site/public/media/real'
OUT.mkdir(parents=True, exist_ok=True)

# (source, out name, aspect w/h, focus x, focus y, zoom)
SHOTS = [
    (DRIVE / 'IMG_5802.JPG', 'front', 16 / 9, .45, .45, 1.0),
    (DRIVE / 'IMG_5802.JPG', 'front-m', 3 / 4, .40, .50, 1.0),
    (DRIVE / 'IMG_5812.JPG', 'interior', 4 / 5, .50, .55, 1.0),
    (DRIVE / 'IMG_5806.JPG', 'aisle', 4 / 5, .50, .55, 1.0),
    (DRIVE / 'IMG_5813.JPG', 'bag', 4 / 5, .50, .46, 1.12),
    (DRIVE / 'IMG_5817.JPG', 'clock', 4 / 5, .50, .52, 1.0),
    (DRIVE / 'IMG_5818.JPG', 'boats', 4 / 5, .50, .55, 1.15),
    (DRIVE / 'IMG_5819.JPG', 'counter', 16 / 10, .50, .55, 1.0),
    (DRIVE / 'IMG_5822.JPG', 'label', 4 / 5, .52, .48, 1.0),
    (DRIVE / 'IMG_5823.JPG', 'label-hand', 4 / 5, .55, .45, 1.0),
    (DRIVE / 'IMG_5811.JPG', 'farm-box', 4 / 5, .50, .40, 1.0),
    (DRIVE / 'IMG_5805.JPG', 'shelves', 4 / 5, .55, .50, 1.0),
    # Facebook: the workshop's own products, square, same grade
    (FB / 'fb000.jpg', 'fb-loukaniko', 1, .5, .45, 1.0),
    (FB / 'fb057.jpg', 'fb-loukaniko-2', 1, .5, .5, 1.0),
    (FB / 'fb058.jpg', 'fb-loukaniko-3', 1, .5, .45, 1.0),
    (FB / 'fb059.jpg', 'fb-loukaniko-4', 1, .5, .5, 1.0),
    (FB / 'fb062.jpg', 'fb-mpifteki-feta', 1, .5, .5, 1.0),
    (FB / 'fb055.jpg', 'fb-plevra', 1, .5, .55, 1.0),
    (FB / 'fb052.jpg', 'fb-mprizoles', 1, .5, .45, 1.0),
    (FB / 'fb053.jpg', 'fb-xoirini', 1, .5, .45, 1.0),
    (FB / 'fb086.jpg', 'fb-souvlakia-provato', 1, .5, .4, 1.0),
    (FB / 'fb081.jpg', 'fb-souvlakia-kotopoulo', 1, .5, .4, 1.0),
    (FB / 'fb108.jpg', 'fb-rolo', 1, .5, .5, 1.0),
    (FB / 'fb044.jpg', 'fb-mosxari', 1, .5, .5, 1.0),
    # Facebook notices (cards, kept as they are)
    (FB / 'fb063.jpg', 'fb-kalokairi', 1.2, .5, .5, 1.0),
    (FB / 'fb074.jpg', 'fb-pasxa', 1.05, .5, .5, 1.0),
    (FB / 'fb066.jpg', 'fb-kokoretsi', 4 / 5, .5, .45, 1.0),
    (FB / 'fb070.jpg', 'fb-arnia', 4 / 5, .5, .5, 1.0),
]


def grade(im: Image.Image, notice: bool, fb: bool = False) -> Image.Image:
    im = ImageOps.exif_transpose(im).convert('RGB')
    if notice:
        return im
    a = np.asarray(im).astype(np.float32)
    # white balance: gray world at 60%
    means = a.reshape(-1, 3).mean(0)
    gain = means.mean() / means
    a *= 1 + (gain - 1) * (0.25 if fb else 0.5)
    # levels on luminance percentiles
    lum = a @ np.array([.299, .587, .114])
    lo, hi = np.percentile(lum, [.2, 99.8])
    a = a * 0.4 + ((a - lo) / max(hi - lo, 1) * 255) * 0.6
    a = np.clip(a, 0, 255) / 255
    # soft S curve
    a = a - 0.18 * np.sin(2 * np.pi * a) / (2 * np.pi)
    a = np.clip(a, 0, 1)
    # a touch of warmth
    a[..., 0] *= 1.02
    a[..., 2] *= 0.975
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    im = ImageEnhance.Color(im).enhance(1.0 if fb else 1.04)
    return im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=35 if fb else 50, threshold=3))


def crop(im: Image.Image, ratio: float, fx: float, fy: float, zoom: float) -> Image.Image:
    w, h = im.size
    if w / h > ratio:
        ch, cw = h, h * ratio
    else:
        cw, ch = w, w / ratio
    cw, ch = cw / zoom, ch / zoom
    x = min(max(fx * w - cw / 2, 0), w - cw)
    y = min(max(fy * h - ch / 2, 0), h - ch)
    return im.crop((int(x), int(y), int(x + cw), int(y + ch)))


for src, name, ratio, fx, fy, zoom in SHOTS:
    notice = name in ('fb-kalokairi', 'fb-pasxa')
    im = crop(grade(Image.open(src), notice, name.startswith('fb-')), ratio, fx, fy, zoom)
    for suffix, width in (('', 1800), ('-sm', 820)):
        out = im.copy()
        if out.width > width:
            out = out.resize((width, round(width / out.width * out.height)), Image.LANCZOS)
        out.save(OUT / f'{name}{suffix}.webp', quality=82, method=6)
    print(name, im.size)
