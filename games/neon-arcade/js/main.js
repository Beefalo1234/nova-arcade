/* NEON ARCADE — menu assembly + boot */
"use strict";

const GAME_META = [
  { id: "snake",    emoji: "🐍", name: "SNAKE",      desc: "Eat. Grow. Don't die. Classic grid action, neon style." },
  { id: "tetris",   emoji: "🧱", name: "TETRIS",     desc: "Stack, clear lines, chase the level-up speed. Ghost piece included." },
  { id: "g2048",    emoji: "🔢", name: "2048",       desc: "Slide and merge to reach the tile. Addictive by design." },
  { id: "pong",     emoji: "🏓", name: "PONG",       desc: "You vs the CPU. First to 7 wins. The paddle speeds up." },
  { id: "breakout", emoji: "🧨", name: "BREAKOUT",   desc: "Smash every brick. 3 lives. The ball does not forgive." },
  { id: "memory",   emoji: "🃏", name: "MEMORY",     desc: "Find all 8 pairs. Fewer moves = higher score." }
];

function buildMenu() {
  const grid = document.getElementById("menuGrid");
  grid.innerHTML = GAME_META.map(g => `
    <div class="card" data-game="${g.id}">
      <div class="emoji">${g.emoji}</div>
      <h3>${g.name}</h3>
      <p>${g.desc}</p>
      <div class="hs">HIGH SCORE: <span id="hs-${g.id}">${Arcade.best(g.id)}</span></div>
      <div class="play">▶ PLAY</div>
    </div>`).join("");
  grid.querySelectorAll(".card").forEach(card =>
    card.addEventListener("click", () => Arcade.show(card.dataset.game)));
}

// refresh high scores on menu return
const _origBack = Arcade.back;
Arcade.back = function () { _origBack(); GAME_META.forEach(g => { const el = document.getElementById("hs-" + g.id); if (el) el.textContent = Arcade.best(g.id); }); };

window.addEventListener("load", () => {
  buildMenu();
  Arcade.fit();
  Arcade.updateGlobalBest();
});
