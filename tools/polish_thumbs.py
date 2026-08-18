#!/usr/bin/env python3
"""polish_thumbs.py — kill the dark-stick look.

For every thumbnail:
  - very dark / flat (std < 18): replace with a BRIGHT emoji-gradient card
    (colorful, readable, never a black strip)
  - dark-ish: brightness+contrast+saturation boost so they pop at tile size

Usage: PYTHONPATH= .venv/Scripts/python.exe tools/polish_thumbs.py
"""
import json
import re
import hashlib
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / "games" / "thumbnails"
F_EMOJI = "C:/Windows/Fonts/seguiemj.ttf"
F_BOLD = "C:/Windows/Fonts/arialbd.ttf"

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

W, H = 320, 180
PALETTE = [
    ((14, 16, 34), (0, 240, 255)),
    ((14, 16, 34), (255, 46, 196)),
    ((20, 16, 34), (255, 210, 61)),
    ((8, 22, 40), (59, 130, 246)),
    ((26, 10, 34), (139, 92, 246)),
    ((10, 30, 24), (0, 210, 150)),
]
EMOJI_MAP = {
    "2048": "🔢", "15 puzzle": "🧩", "8 ball pool": "🎱", "among us": "🚀",
    "asteroids": "☄️", "awesome tanks": "🪖", "babel tower": "🗼",
    "basket": "🏀", "blackjack": "🃏", "bit life": "🎲", "bloons": "🎈",
    "breakout": "🧱", "brick breaker": "🧱", "bubble": "🫧", "chess": "♟️",
    "clicker": "👆", "connect four": "🔴", "cookie": "🍪", "core ball": "🔮",
    "crossy": "🐔", "dino": "🦖", "doge": "🐕", "doodle": "✏️", "drift": "🏎️",
    "drive mad": "🚗", "duck life": "🦆", "egg": "🥚", "endless": "🏃",
    "family feud": "🔔", "fireboy": "🔥", "flappy": "🐤", "fruit": "🍉",
    "getaway": "🚓", "gun spin": "🔫", "hangman": "💀", "helix": "🌀",
    "hextris": "⬡", "hook": "🪝", "idle breakout": "🧱", "incremancer": "💀",
    "lava": "🌋", "learn to fly": "🛩️", "mario": "🍄", "maze": "🌀",
    "minesweeper": "💣", "monkey": "🐒", "moto": "🏍️", "neon orbit": "🪐",
    "nova": "⭐", "ocean": "🌊", "ovo": "🟠", "particle": "⚛️", "pinball": "🎱",
    "pixel": "🏴‍☠️", "planet life": "🪐", "pong": "🏓", "progress": "📈",
    "pull of war": "🪢", "reaction": "⚡", "retro bowl": "🏈", "rift": "🌀",
    "rock paper": "✂️", "rocket league": "🚀", "rooftop": "🎯", "run 3": "🏃",
    "run": "🏃", "sandspiel": "⏳", "scuba": "🤿", "shadow fight": "🥷",
    "simon": "🔔", "sliding": "🧩", "slope": "⛷️", "smash karts": "🏎️",
    "snake": "🐍", "soccer": "⚽", "space": "👾", "speed match": "⚡",
    "stack": "🗼", "stickman hook": "🪝", "subway": "🚇", "sudoku": "🔢",
    "temple run": "🏃", "tetris": "🧱", "tictactoe": "❌", "tiny fishing": "🎣",
    "tower defense": "🏰", "tunnel": "🌀", "two ball": "🔵", "typing": "⌨️",
    "ufo": "🛸", "vex": "🧗", "volley": "🏐", "web osu": "🥁", "whack": "🔨",
    "word scramble": "🔤", "x trench": "✈️", "yohoho": "🏴‍☠️", "zombie": "🧟",
    "dune": "🏜️", "evowars": "🧬", "getaway": "🚓", "geometry": "📐",
    "golf": "⛳", "idle": "⏳", "mario": "🍄",
}
EMOJI_FALLBACK = ["🎮", "🕹️", "👾", "🚀", "⭐", "🔥", "💎", "🎯", "🧩", "⚡"]


def slug(path):
    return re.sub(r"[^A-Za-z0-9._-]", "_", path.replace("/", "_"))


def emoji_card(name):
    h = hashlib.md5(name.encode()).digest()
    c1, c2 = PALETTE[h[0] % len(PALETTE)]
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):
        t = y / H
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        for x in range(W):
            px[x, y] = (r, g, b)
    d = ImageDraw.Draw(img)
    key = name.lower()
    emoji = next((v for k, v in EMOJI_MAP.items() if k in key), None)
    if not emoji:
        emoji = EMOJI_FALLBACK[h[1] % len(EMOJI_FALLBACK)]
    try:
        f_em = ImageFont.truetype(F_EMOJI, 64)
    except Exception:
        f_em = ImageFont.load_default()
    d.text((W // 2, 74), emoji, font=f_em, anchor="mm")
    try:
        f_t = ImageFont.truetype(F_BOLD, 30)
    except Exception:
        f_t = ImageFont.load_default()
    d.text((W // 2 + 1, 131), name.upper(), font=f_t, anchor="mm", fill=(0, 0, 0))
    d.text((W // 2, 130), name.upper(), font=f_t, anchor="mm", fill=(255, 255, 255))
    return img


def main():
    src = (BASE / "js" / "config.js").read_text(encoding="utf-8")
    games = json.loads(src[src.index("{") : src.rindex("}") + 1])["games"]
    replaced = boosted = 0
    for name, g in games.items():
        dest = OUT / f"{slug(g['path'])}.jpg"
        if not dest.exists():
            continue
        im = Image.open(dest).convert("RGB")
        a = np.asarray(im.convert("L"), dtype=np.float32)
        if a.std() < 18:  # flat/black -> bright emoji card
            emoji_card(name).save(dest, quality=88)
            replaced += 1
        else:  # boost brightness/contrast/color
            im = ImageEnhance.Brightness(im).enhance(1.30)
            im = ImageEnhance.Contrast(im).enhance(1.25)
            im = ImageEnhance.Color(im).enhance(1.35)
            im.save(dest, quality=88)
            boosted += 1
    # report brightness after
    vals = []
    for f in OUT.glob("*.jpg"):
        a = np.asarray(Image.open(f).convert("L"), dtype=np.float32)
        vals.append(a.mean())
    print(f"replaced(black): {replaced} | boosted: {boosted}")
    print(f"final mean brightness: {np.mean(vals):.0f} (was ~50) | min: {np.min(vals):.0f}")


if __name__ == "__main__":
    sys.exit(main())
