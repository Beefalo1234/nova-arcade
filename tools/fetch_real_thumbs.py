#!/usr/bin/env python3
"""fetch_real_thumbs.py — replace gradient thumbnails with REAL game images.

Source: quackprep's public CDN (cdn.jsdelivr.net/gh/mathlesson/mathlesson.github.io/...)
which hosts real screenshots/teasers per game. We match our 134 games to
their images by name, download, and normalize to 320x180 JPEG (16:9 cover).

Unmatched games keep the emoji-gradient fallback already in games/thumbnails/.

Usage: PYTHONPATH= .venv/Scripts/python.exe tools/fetch_real_thumbs.py
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / "games" / "thumbnails"
LOG = Path(r"C:\Users\Gray\AppData\Local\hermes\cache\terminal-output\out-1786835369-4080-7d10.log")
CDN = "https://cdn.jsdelivr.net/gh/mathlesson/mathlesson.github.io"

from PIL import Image

W, H = 320, 180


def norm(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def load_source_pairs():
    """(name -> url) from the quackprep scrape: `![Image N: slug](URL) ### Name](link)`"""
    text = LOG.read_text(encoding="utf-8", errors="ignore")
    pairs = {}
    for m in re.finditer(
        r"\[?!\[Image \d+: ([^\]]*)\]\((https://cdn\.jsdelivr\.net/gh/mathlesson[^)]*)\)(?:\s*###\s*([^\]\n]+))?",
        text,
    ):
        slug_alt = m.group(1).strip()
        url = m.group(2)
        name = (m.group(3) or slug_alt).strip()
        pairs[norm(name)] = url
    return pairs


def match_games(pairs):
    src = (BASE / "js" / "config.js").read_text(encoding="utf-8")
    games = json.loads(src[src.index("{") : src.rindex("}") + 1])["games"]
    matched, fallback = {}, []
    for name, g in games.items():
        key = norm(name)
        url = pairs.get(key)
        if not url:
            # try the path slug
            url = pairs.get(norm(g["path"]))
        if url:
            matched[name] = (g["path"], url)
        else:
            fallback.append(name)
    return matched, fallback


def slug(path):
    return re.sub(r"[^A-Za-z0-9._-]", "_", path.replace("/", "_"))


def fetch(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    tmp = dest.with_suffix(".src")
    tmp.write_bytes(data)
    try:
        im = Image.open(tmp)
        im = im.convert("RGB")
        # 16:9 cover crop
        iw, ih = im.size
        target = W / H
        if iw / ih > target:
            nw = int(ih * target)
            x = (iw - nw) // 2
            im = im.crop((x, 0, x + nw, ih))
        else:
            nh = int(iw / target)
            y = (ih - nh) // 2
            im = im.crop((0, y, iw, y + nh))
        im = im.resize((W, H), Image.LANCZOS)
        im.save(dest, quality=85)
        return True
    except Exception as e:
        print(f"  convert fail {dest.name}: {e}")
        return False
    finally:
        tmp.unlink(missing_ok=True)


def main():
    pairs = load_source_pairs()
    print(f"source image map: {len(pairs)} entries")
    matched, fallback = match_games(pairs)
    print(f"matched: {len(matched)} / {len(matched) + len(fallback)}")
    ok = 0
    for name, (path, url) in matched.items():
        dest = OUT / f"{slug(path)}.jpg"
        if fetch(url, dest):
            ok += 1
    print(f"downloaded+converted: {ok}")
    print("fallback (keep gradient):", ", ".join(fallback[:15]), "..." if len(fallback) > 15 else "")


if __name__ == "__main__":
    sys.exit(main())
