import sys
from PIL import Image, ImageOps
from rembg import remove, new_session

sess = new_session('isnet-general-use')
box = None
outs = {}
for n in ['5826', '5827', '5828', '5829']:
    im = ImageOps.exif_transpose(Image.open(f'assets/drive/Butcher/IMG_{n}.JPG')).convert('RGB')
    im.thumbnail((1800, 1800))
    cut = remove(im, session=sess)
    bb = cut.getbbox()
    box = bb if box is None else (min(box[0], bb[0]), min(box[1], bb[1]), max(box[2], bb[2]), max(box[3], bb[3]))
    outs[n] = cut
    print(n, im.size, bb, flush=True)
pad = 40
box = (max(0, box[0] - pad), max(0, box[1] - pad), box[2] + pad, box[3] + pad)
print('box', box, flush=True)
for n, cut in outs.items():
    c = cut.crop(box)
    c.save(f'site/public/media/ippo-{n}.webp', 'WEBP', quality=88)
    print('saved', n, c.size, flush=True)
blk = ImageOps.exif_transpose(Image.open('assets/drive/Butcher/IMG_5825.JPG')).convert('RGB')
blk.thumbnail((1800, 1800))
blk.save('site/public/media/ippokratis-block.webp', 'WEBP', quality=84)
print('block', blk.size, flush=True)
