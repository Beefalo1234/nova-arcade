# NOVA ARCADE — Spruce-Up Spec (Gray, 2026-08-13)

**Repo:** `C:\Users\Gray\Desktop\unblocked-games` (deployed Pages repo, beefalo1234.github.io/unblocked-games)
**Identity to KEEP:** dark neon-cyber arcade (hsl(223,90%,5%) bg, cyan #00f0ff accents, VGA font, animated infinity loading screen). This is the brand — polish it, don't redesign it.
**Borrow from LeadSetter-AI-site (its css/):** gold accent color (#ffb900 / #ffc96b family), gradient CTA buttons, clean rounded cards, gold SVG icon treatment (stroke=currentColor, gold).

## Changes (tasteful, specific)
1. **Meta fix** — `index.html`: description "Cool site for stuff" → "NOVA ARCADE — 134+ free unblocked games. No downloads, no signups, play at school or home." Check `og:image` (points to favicon.png; repo has favicon.ico — verify which exists, fix path).
2. **Gold accent touches** — add gold ONLY as secondary accent: "NEW" badges on a few featured games, hero accent line, footer heart/star. Keep cyan primary.
3. **Hero line** — if no hero exists, add one clean line above the grid: short, drunk-grandma clear, no jargon. E.g. "134+ games. Zero downloads. Press play."
4. **Card polish** — consistent border-radius + hover lift/glow on game cards (neon-upgrade.css may already handle — don't duplicate; unify).
5. **CTA buttons** — gradient (cyan→gold or LeadSetter-style) on the primary buttons only.

## MUST NOT (hard limits)
- Do NOT touch `ads.css` or the ad slots (#ad-top, #ad-mid, #ad-float) — ad monetization pipe.
- Do NOT modify game files, `js/config.js` game list, fonts, loading animation, or `_deploy.py`.
- Do NOT change existing navigation/settings/keyboard buttons.
- **Do NOT git push** — leave changes uncommitted for Gray's review. Publishing needs Gray.

## Verify before reporting
- Serve locally (`python -m http.server` from repo root) and confirm: page loads, game grid renders from config, no broken asset paths.
- Report: files changed, diff summary, what Gray should eyeball, screenshot path if captured.
