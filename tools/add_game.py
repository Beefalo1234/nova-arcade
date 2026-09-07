#!/usr/bin/env python3
"""add_game.py — register a game in nova's config.jsonc (deterministic, no comments in file).

Usage:
  python tools/add_game.py "Snake" snake "" ""
  python tools/add_game.py "Memory Match" memory-match "match,memory" "puzzle"

Does TEXT surgery (not re-parse) so the rest of config.jsonc stays byte-identical.
Then run: node build-config.js  (regenerates js/config.js from config.jsonc)
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "config.jsonc"
ANCHOR = '\n  },\n  "themes"'


def add(name, path, aliases, categories):
    text = CONFIG.read_text(encoding="utf-8")
    # already present?
    low = text.lower()
    if f'"{name.lower()}"' in low or f'"{path.lower()}"' in low:
        print(f"skip (exists): {name}")
        return False
    if ANCHOR not in text:
        print("ERROR: anchor not found — config structure changed", file=sys.stderr)
        sys.exit(2)
    entry = (
        f'    "{name}": {{\n'
        f'      "path": "{path}",\n'
        f'      "aliases": {json.dumps(aliases)},\n'
        f'      "categories": {json.dumps(categories)}\n'
        f'    }}'
    )
    # add a comma after the previous last game entry, then our entry
    text = text.replace(ANCHOR, ",\n" + entry + ANCHOR, 1)
    CONFIG.write_text(text, encoding="utf-8")
    print(f"added: {name} -> games/{path}")
    return True


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    name = sys.argv[1]
    path = sys.argv[2]
    aliases = [a.strip() for a in sys.argv[3].split(",") if a.strip()] if len(sys.argv) > 3 else []
    cats = [c.strip() for c in sys.argv[4].split(",") if c.strip()] if len(sys.argv) > 4 else []
    add(name, path, aliases, cats)
