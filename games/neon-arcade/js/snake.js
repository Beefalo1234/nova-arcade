/* Snake */
"use strict";
Arcade.register({
  id: "snake", title: "Snake", touch: true,
  init(cv) { this.cv = cv; this.ctx = cv.getContext("2d"); },
  start() {
    this.N = 20; this.cell = 640 / this.N;
    this.snake = [{ x: 10, y: 10 }]; this.dir = { x: 1, y: 0 }; this.next = this.dir;
    this.food = this.spawn(); this.score = 0; this.speed = 130; this.dead = false;
    Arcade.setScoreUI(0);
    this.loop = setInterval(() => this.tick(), this.speed);
    this.draw();
  },
  stop() { clearInterval(this.loop); },
  pause() { clearInterval(this.loop); },
  resume() { this.loop = setInterval(() => this.tick(), this.speed); },
  restart() { this.stop(); this.start(); },
  spawn() {
    while (true) {
      const f = { x: Math.floor(Math.random() * this.N), y: Math.floor(Math.random() * this.N) };
      if (!this.snake.some(s => s.x === f.x && s.y === f.y)) return f;
    }
  },
  touch(d) {
    if (this.dead) return;
    const m = { U: { x: 0, y: -1 }, D: { x: 0, y: 1 }, L: { x: -1, y: 0 }, R: { x: 1, y: 0 } }[d];
    if (!m) return;
    if (m.x === -this.dir.x && m.y === -this.dir.y) return;
    this.next = m;
  },
  tick() {
    this.dir = this.next;
    const h = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };
    if (h.x < 0 || h.y < 0 || h.x >= this.N || h.y >= this.N ||
        this.snake.some(s => s.x === h.x && s.y === h.y)) {
      Arcade.SFX.over(); this.dead = true;
      Arcade.setScore("snake", this.score);
      Arcade.showOverlay("GAME OVER", `Score ${this.score} · press R to retry`);
      this.draw(); return;
    }
    this.snake.unshift(h);
    if (h.x === this.food.x && h.y === this.food.y) {
      this.score += 10; Arcade.SFX.eat(); Arcade.setScoreUI(this.score);
      this.food = this.spawn();
      if (this.speed > 60) { this.speed -= 4; clearInterval(this.loop); this.loop = setInterval(() => this.tick(), this.speed); }
    } else this.snake.pop();
    this.draw();
  },
  draw() {
    const c = this.ctx, cell = this.cell;
    c.fillStyle = "#0e0e1c"; c.fillRect(0, 0, 640, 480);
    c.fillStyle = "#1b1b34";
    for (let y = 0; y < this.N; y++) for (let x = 0; x < this.N; x++)
      if ((x + y) % 2 === 0) c.fillRect(x * cell, y * cell, cell, cell);
    c.fillStyle = "#ff4d5e"; c.shadowColor = "#ff4d5e"; c.shadowBlur = 12;
    c.beginPath(); c.arc(this.food.x * cell + cell / 2, this.food.y * cell + cell / 2, cell * 0.32, 0, 7);
    c.fill(); c.shadowBlur = 0;
    this.snake.forEach((s, i) => {
      c.fillStyle = i === 0 ? "#a6ff3d" : "#00f0ff";
      c.shadowColor = i === 0 ? "#a6ff3d" : "#00f0ff"; c.shadowBlur = 8;
      c.fillRect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2);
      c.shadowBlur = 0;
    });
  }
});
