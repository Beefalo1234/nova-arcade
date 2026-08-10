# NOVA ARCADE — Ad Space Setup

Two ad slots are live (placeholder "AD SPACE" boxes, zero external requests):

- `#ad-top` — leaderboard slot above the search bar
- `#ad-mid` — rectangle slot between the game list and settings

## How to activate (when you have a network)

1. Get approved by an ad network (see stage plan below)
2. Paste their code as `window.AD_CONFIG` — edit `index.html`:

```html
<script>window.AD_CONFIG = {
  "ad-top": { "html": "<!-- your 728x90 ad code here -->" },
  "ad-mid": { "html": "<!-- your rectangle ad code here -->" }
};</script>
```

3. Commit + push. Done — no other changes needed. (Or use `{src: "..."}` + `height` for an iframe-based network.)

## Stage-gated plan (from research, 2026-08-09)

| Stage | Sessions/mo | What to run |
|---|---|---|
| 0 → 5K | — | **AdSense** (needs ~100s of daily sessions + real content; apply early, it takes time). No network yet = keep placeholders. |
| 5K → 50K | 5K-50K | AdSense auto ads + one affiliate angle (gaming gear / gift cards) |
| 50K+ | 50K+ | **Ezoic** (revenue share, better RPM for games), keep AdSense as floor |
| 250K+ | 250K+ | Mediavine / Raptive territory |

Notes: game sites typically earn **$0.5–3 RPM** (AdSense) / **$3–8 RPM** (Ezoic tier). Unblocked-game sites often use popunder networks (Adsterra/PropellerAds — higher pay, worse UX, ad-blocker bait). Priority: AdSense application ASAP (approval lag), grow traffic, then Ezoic.
