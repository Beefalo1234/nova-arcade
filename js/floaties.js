/* NEON UNBLOCKED — floating game-emoji layer.
   Lightweight DOM animation (no canvas). Pauses while a game is open.
   Respects prefers-reduced-motion. */
"use strict";

(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const EMOJIS = ["🎮", "👾", "🕹️", "⭐", "🚀", "🎯", "🧩", "🎲", "🏆", "🔮", "💎", "🔥", "⚡", "🏓", "🪙", "👽"];
  const layer = document.createElement("div");
  layer.id = "floaties";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  const COUNT = 16;

  function spawn() {
    // pause while a game is open (index.js sets the global `inGame`)
    if (typeof inGame !== "undefined" && inGame) return;

    const el = document.createElement("span");
    el.className = "floaty";
    el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const size = 16 + Math.random() * 22;
    el.style.fontSize = size.toFixed(0) + "px";
    el.style.left = (Math.random() * 96 + 2).toFixed(1) + "%";
    el.style.opacity = (0.18 + Math.random() * 0.35).toFixed(2);
    el.style.setProperty("--sway", (Math.random() * 60 - 30).toFixed(0) + "px");
    const dur = 14 + Math.random() * 16;
    el.style.animationDuration = dur.toFixed(1) + "s";
    el.style.animationDelay = (-Math.random() * dur).toFixed(1) + "s";
    layer.appendChild(el);

    // recycle
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); spawn(); }, dur * 1000);
  }

  for (let i = 0; i < COUNT; i++) spawn();
})();
