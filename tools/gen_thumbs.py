#!/usr/bin/env python3
"""Generate NOVA ARCADE game thumbnails v2 (PIL, emoji icons).

quackprep-style image-first tiles: duotone gradient + big emoji icon +
bold wrapped title + scrim for legibility + play badge. 320x180, offline,
no copyrighted assets. Re-runnable.

Usage: PYTHONPATH= .venv/Scripts/python.exe tools/gen_thumbs.py
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

from PIL import Image, ImageDraw, ImageFont

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
    "golf": "⛳", "crossy": "🐔", "idle": "⏳", "mario": "🍄",
}
EMOJI_FALLBACK = ["🎮", "🕹️", "👾", "🚀", "⭐", "🔥", "💎", "🎯", "🧩", "⚡"]


def slug(path):
    return re.sub(r"[^A-Za-z0-9._-]", "_", path.replace("/", "_"))


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines[:2]


def gen(name, path):
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

    # bottom scrim for text legibility
    for y in range(int(H * 0.52), H):
        a = int(150 * ((y - H * 0.52) / (H * 0.48)))
        for x in range(W):
            pr, pg, pb = px[x, y]
            px[x, y] = (pr * (255 - a) // 255, pg * (255 - a) // 255, pb * (255 - a) // 255)

    # emoji icon
    key = name.lower()
    emoji = next((v for k, v in EMOJI_MAP.items() if k in key), None)
    if not emoji:
        emoji = EMOJI_FALLBACK[h[1] % len(EMOJI_FALLBACK)]
    try:
        f_em = ImageFont.truetype(F_EMOJI, 64)
    except Exception:
        f_em = ImageFont.load_default()
    d.text((W // 2, 74), emoji, font=f_em, anchor="mm")

    # title (bold, wrapped, shadowed)
    try:
        f_t = ImageFont.truetype(F_BOLD, 30)
    except Exception:
        f_t = ImageFont.load_default()
    lines = wrap(d, name.upper(), f_t, W - 24)
    ty = 150 - ((len(lines) - 1) * 16)
    for i, ln in enumerate(lines):
        d.text((W // 2 + 1, ty + 1 + i * 16), ln, font=f_t, anchor="mm", fill=(0, 0, 0))
        d.text((W // 2, ty + i * 16), ln, font=f_t, anchor="mm", fill=(255, 255, 255))

    # play badge (white circle + triangle, top-right)
    cx, cy, r = W - 34, 34, 15
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 255, 255))
    d.polygon([(cx - 5, cy - 9), (cx - 5, cy + 9), (cx + 11, cy)], fill=(0, 0, 0))

    OUT.mkdir(parents=True, exist_ok=True)
    img.save(OUT / f"{slug(path)}.jpg", quality=85)


def main():
    src = (BASE / "js" / "config.js").read_text(encoding="utf-8")
    games = json.loads(src[src.index("{") : src.rindex("}") + 1])["games"]
    for name, g in games.items():
        gen(name, g["path"])
    print(f"generated {len(games)} v2 thumbnails -> games/thumbnails/")


if __name__ == "__main__":
    sys.exit(main())
