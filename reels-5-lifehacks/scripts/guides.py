"""Contact sheet of out/stills/*.png with Reels UI zones shaded red (top 250 px, bottom 400 px, right action rail).
Usage: python3 scripts/guides.py [out/stills] -> out/stills/_contact_sheet.png"""
import sys, glob, os
from PIL import Image, ImageDraw

d = sys.argv[1] if len(sys.argv) > 1 else 'out/stills'
files = sorted(f for f in glob.glob(os.path.join(d, '*.png')) if not os.path.basename(f).startswith('_'))
thumbs = []
for f in files:
    im = Image.open(f).convert('RGBA')
    ov = Image.new('RGBA', im.size, (0, 0, 0, 0))
    g = ImageDraw.Draw(ov)
    W, H = im.size
    g.rectangle([0, 0, W, 250], fill=(255, 0, 0, 70))
    g.rectangle([0, H - 400, W, H], fill=(255, 0, 0, 70))
    g.rectangle([W - 130, H - 900, W, H - 400], fill=(255, 0, 0, 50))
    g.line([0, 250, W, 250], fill=(255, 0, 0, 255), width=4)
    g.line([0, H - 400, W, H - 400], fill=(255, 0, 0, 255), width=4)
    thumbs.append(Image.alpha_composite(im, ov).convert('RGB').resize((W // 2, H // 2)))
cols = min(4, len(thumbs))
rows = (len(thumbs) + cols - 1) // cols
sheet = Image.new('RGB', (cols * 540 + (cols + 1) * 20, rows * 960 + (rows + 1) * 20), (40, 40, 40))
for i, t in enumerate(thumbs):
    sheet.paste(t, (20 + (i % cols) * 560, 20 + (i // cols) * 980))
out = os.path.join(d, '_contact_sheet.png')
sheet.save(out)
print(out)
