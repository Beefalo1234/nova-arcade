#!/usr/bin/env python3
"""screenshot_thumbs.py — REAL game screenshots for every game.

Launches each game (file://games/<path>/index.html) in headless Edge,
waits ~6s for it to render, screenshots the frame -> thumbnails/<slug>.jpg.
Near-blank captures (low variance) are discarded -> existing thumb kept.

Usage: PYTHONPATH= .venv/Scripts/python.exe tools/screenshot_thumbs.py
"""
import json
import re
import sys
import time
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / "games" / "thumbnails"
OUT.mkdir(parents=True, exist_ok=True)

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

W, H = 320, 180


def slug(path):
    return re.sub(r"[^A-Za-z0-9._-]", "_", path.replace("/", "_"))


def is_blank(pil_img):
    a = np.asarray(pil_img.convert("L"), dtype=np.float32)
    return a.std() < 12.0


def pop(pil_img):
    """Contrast + saturation punch so plain screens still pop at tile size."""
    from PIL import ImageEnhance
    im = ImageEnhance.Contrast(pil_img).enhance(1.15)
    im = ImageEnhance.Color(im).enhance(1.25)
    return im


def main():
    src = (BASE / "js" / "config.js").read_text(encoding="utf-8")
    games = json.loads(src[src.index("{") : src.rindex("}") + 1])["games"]

    done = blank = 0
    with sync_playwright() as p:
        b = p.chromium.launch(channel="msedge", headless=True)
        ctx = b.new_context(viewport={"width": 640, "height": 360})
        for i, (name, g) in enumerate(games.items(), 1):
            dest = OUT / f"{slug(g['path'])}.jpg"
            url = (BASE / "games" / g["path"] / "index.html").as_uri()
            try:
                pg = ctx.new_page()
                pg.goto(url, timeout=20000, wait_until="domcontentloaded")
                pg.wait_for_timeout(5000)
                # click center to dismiss "click to start" screens
                try:
                    pg.mouse.click(320, 180)
                    pg.wait_for_timeout(3500)
                except Exception:
                    pass
                shot = pg.screenshot(type="png")
                pg.close()
                im = Image.open(io.BytesIO(shot)).convert("RGB")
                im = im.resize((W, H), Image.LANCZOS)
                if is_blank(im):
                    blank += 1
                    continue  # keep existing thumb
                im = pop(im)
                im.save(dest, quality=88)
                done += 1
            except Exception as e:
                print(f"[{i}/{len(games)}] {name}: FAIL {str(e)[:60]}")
            if i % 25 == 0:
                print(f"... {i}/{len(games)} (ok={done}, blank-skip={blank})")
        b.close()
    print(f"done: {done} real screenshots, {blank} blank (kept old thumb)")


if __name__ == "__main__":
    import io  # noqa
    sys.exit(main())
