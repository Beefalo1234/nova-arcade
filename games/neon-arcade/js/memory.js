/* Memory Match */
"use strict";
Arcade.register({
  id: "memory", title: "Memory", touch: true,
  init(cv) { this.cv = cv; this.ctx = cv.getContext("2d"); },
  SYMS: ["⚡", "🔥", "💎", "🍒", "🔮", "🎮", "🚀", "👾"],
  start() {
    const pairs = [...this.SYMS, ...this.SYMS];
    for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]]; }
    this.cards = pairs.map((s, i) => ({ s, i, up: false, matched: false }));
    this.first = null; this.lock = false; this.moves = 0; this.matches = 0; this.done = false;
    Arcade.setScoreUI(0);
    this.draw();
  },
  stop() {},
  pause() {},
  resume() {},
  restart() { this.start(); },
  touch(d) {
    if (d === "FIRE" && !this.first) this.moves++, Arcade.setScoreUI(this.moves);
  },
  click(x, y) {
    if (this.lock || this.done) return;
    const cols = 4, rows = 4, cw = 120, ch = 120, ox = (640 - cols * cw) / 2 + 40, oy = 40;
    const ci = Math.floor((x - ox) / cw), ri = Math.floor((y - oy) / ch);
    if (ci < 0 || ci >= cols || ri < 0 || ri >= rows) return;
    const card = this.cards[ri * cols + ci];
    if (card.up || card.matched) return;
    card.up = true; this.moves++; Arcade.setScoreUI(this.moves); Arcade.SFX.flip();
    if (!this.first) { this.first = card; }
    else {
      this.lock = true;
      if (this.first.s === card.s) {
        this.first.matched = card.matched = true; this.matches++;
        Arcade.SFX.match();
        this.first = null; this.lock = false;
        if (this.matches === 8) {
          this.done = true; Arcade.SFX.score();
          const score = Math.max(100, 1000 - this.moves * 10);
          Arcade.setScore("memory", score);
          Arcade.showOverlay("YOU WIN!", `${this.moves} moves · score ${score} · press R to replay`);
        }
      } else {
        const a = this.first, b = card;
        setTimeout(() => { a.up = b.up = false; this.first = null; this.lock = false; this.draw(); }, 550);
      }
    }
    this.draw();
  },
  draw() {
    const c = this.ctx;
    c.fillStyle = "#0e0e1c"; c.fillRect(0, 0, 640, 480);
    const cols = 4, cw = 120, ch = 120, ox = (640 - cols * cw) / 2 + 40, oy = 40;
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i], x = ox + (i % cols) * cw + 8, y = oy + Math.floor(i / cols) * ch + 8;
      if (card.matched) continue;
      c.fillStyle = card.up ? "#26355c" : "#1b1b34";
      c.strokeStyle = card.up ? "#00f0ff" : "#26264a"; c.lineWidth = 2;
      c.shadowColor = card.up ? "#00f0ff" : "transparent"; c.shadowBlur = card.up ? 12 : 0;
      c.beginPath(); c.roundRect(x, y, cw - 16, ch - 16, 12); c.fill(); c.stroke(); c.shadowBlur = 0;
      if (card.up) {
        c.fillStyle = "#eef2ff"; c.font = "52px sans-serif";
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(card.s, x + (cw - 16) / 2, y + (ch - 16) / 2);
      }
    }
  }
});
// click handling for memory
document.getElementById("gameCanvas").addEventListener("click", (e) => {
  if (document.getElementById("gameArea").classList.contains("hidden")) return;
  const g = Arcade.getCurrent ? Arcade.getCurrent() : null;
  // lightweight: memory registers a global click via arcade touch? use custom:
  const rect = document.getElementById("gameCanvas").getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width * 640, y = (e.clientY - rect.top) / rect.height * 480;
  if (Arcade.currentGame && Arcade.currentGame.id === "memory") Arcade.currentGame.click(x, y);
});
