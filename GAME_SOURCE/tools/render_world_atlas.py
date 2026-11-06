#!/usr/bin/env python3
"""เรนเดอร์ OUT_DIR/atlas.svg ด้วย Chromium แล้วบันทึกเป็น JPEG: python3 tools/render_world_atlas.py OUT_DIR OUT.jpg [N]"""
import sys, os, io
from playwright.sync_api import sync_playwright
from PIL import Image
d, out = os.path.abspath(sys.argv[1]), sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 2048
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': N, 'height': N})
    pg.goto('file://' + os.path.join(d, 'atlas.svg')); pg.wait_for_timeout(1500)
    png = pg.screenshot(clip={'x': 0, 'y': 0, 'width': N, 'height': N}); b.close()
Image.open(io.BytesIO(png)).convert('RGB').save(out, 'JPEG', quality=84, optimize=True, progressive=True)
print('saved', out, os.path.getsize(out) // 1024, 'KB')
