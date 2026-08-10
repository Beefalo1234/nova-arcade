/* 2048 */
"use strict";
Arcade.register({
  id: "g2048", title: "2048", touch: true,
  init(cv) { this.cv = cv; this.ctx = cv.getContext("2d"); },
  start() {
    this.grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    this.score = 0; this.over = false; this.won = false;
    this.addTile(); this.addTile();
    Arcade.setScoreUI(0);
    this.draw();
  },
  stop() {},
  pause() {},
  resume() {},
  restart() { this.start(); },
  addTile() {
    const empty = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (!this.grid[r][c]) empty.push([r, c]);
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  },
  slide(row) {
    const vals = row.filter(v => v);
    for (let i = 0; i < vals.length - 1; i++) {
      if (vals[i] === vals[i + 1]) { vals[i] *= 2; this.score += vals[i]; vals.splice(i + 1, 1); Arcade.SFX.eat(); }
    }
    while (vals.length < 4) vals.push(0);
    return vals;
  },
  touch(d) {
    if (this.over) return;
    const before = JSON.stringify(this.grid);
    if (d === "L") this.grid = this.grid.map(r => this.slide(r));
    else if (d === "R") this.grid = this.grid.map(r => this.slide(r.slice().reverse()).reverse());
    else if (d === "U") { const g = this.grid; this.grid = g[0].map((_, i) => this.slide(g.map(r => r[i]))); this.grid = this.grid[0].map((_, i) => this.grid.map(r => r[i])); }
    else if (d === "D") { const g = this.grid.map(r => r.slice()).reverse(); g.forEach((row, ri) => { this.grid[3 - ri] = this.slide(row.slice().reverse()).reverse(); }); }
    if (JSON.stringify(this.grid) !== before) this.addTile();
    Arcade.setScoreUI(this.score);
    this.check();
    this.draw();
  },
  check() {
    const flat = this.grid.flat();
    if (flat.includes(2048) && !this.won) { this.won = true; Arcade.SFX.score(); Arcade.showOverlay("YOU WIN!", "keep going — press P to close"); }
    if (!flat.includes(0)) {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        const v = this.grid[r][c];
        if ((c < 3 && this.grid[r][c + 1] === v) || (r < 3 && this.grid[r + 1][c] === v)) return;
      }
      this.over = true; Arcade.SFX.over(); Arcade.setScore("g2048", this.score);
      Arcade.showOverlay("GAME OVER", `Score ${this.score} · press R to retry`);
    }
  },
  draw() {
    const c = this.ctx, size = 440, ox = (640 - size) / 2, oy = 20, gap = 10, cell = (size - gap * 5) / 4;
    c.fillStyle = "#0e0e1c"; c.fillRect(0, 0, 640, 480);
    c.fillStyle = "#1b1b34"; c.fillRect(ox, oy, size, size);
    const colors = { 2: "#1e2740", 4: "#26355c", 8: "#3d2c5e", 16: "#5e2c5e", 32: "#7a2458", 64: "#941d4d", 128: "#b0183f", 256: "#d1132e", 512: "#f00d1b", 1024: "#ff2ec4", 2048: "#00f0ff" };
    for (let r = 0; r < 4; r++) for (let col = 0; col < 4; col++) {
      const v = this.grid[r][col], x = ox + gap + col * (cell + gap), y = oy + gap + r * (cell + gap);
      c.fillStyle = colors[v] || "#1b1b34";
      if (v) { c.shadowColor = colors[v]; c.shadowBlur = 10; }
      c.fillRect(x, y, cell, cell); c.shadowBlur = 0;
      if (v) {
        c.fillStyle = v > 4 ? "#0a0a14" : "#eef2ff";
        c.font = v >= 1024 ? "bold 26px monospace" : "bold 34px monospace";
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(v, x + cell / 2, y + cell / 2 + 2);
      }
    }
  }
});
